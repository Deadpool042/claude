import {
  CATEGORY_MAINTENANCE,
  CONSTRAINT_MIN_CATEGORY_INDEX,
  FAMILY_BASE_PRICING,
  MODULE_CATALOG,
  categoryIndex,
  computeCI,
  estimateCIAxes,
  getBackendMultiplier,
  getDeployCost,
  getStackProfileFromLegacy,
  indexToCategory,
  maxCategory,
  normalizeModuleIds,
  type CIAxes,
  type CIResult,
  type Category,
  type DeployTarget,
  type LegacyTechStack as TechStack,
  type MaintenanceCat,
  type ModuleDef,
  type ProjectConstraints,
  type ProjectType,
} from "@/lib/referential";
import {
  resolveModuleMonthly,
  resolveModulePrice,
  resolveModuleRequalification,
} from "@/lib/module-pricing";

export type { DeployTarget, TechStack };

export type BillingMode = "SOLO" | "SOUS_TRAITANT";

export interface ModuleCatSelection {
  setupCatId?: string;
  subCatId?: string;
}

export interface QualificationInput {
  projectType: ProjectType;
  techStack: TechStack;
  selectedModuleIds: string[];
  billingMode: BillingMode;
  deployTarget: DeployTarget;
  wpHeadless: boolean;
  catSelections?: Record<string, ModuleCatSelection>;
  constraints?: Partial<ProjectConstraints>;
  ciAxes?: CIAxes;
}

export interface QualificationResult {
  initialCategory: Category;
  finalCategory: Category;
  wasRequalified: boolean;
  modules: ModuleDef[];
  requalifyingModules: ModuleDef[];
  maintenance: MaintenanceCat;
  ci?: CIResult | null;
  budget: {
    base: number;
    modulesTotal: number;
    deployCost: number;
    monthlyTotal: number;
    grandTotal: number;
  };
  billingMode: BillingMode;
  splits: {
    baseSplitPrestataire: number;
    baseSplitAgence: number;
    modulesSplitPrestataire: number;
    modulesSplitAgence: number;
  } | null;
}

const INITIAL_CATEGORY: Record<ProjectType, Category> = {
  BLOG: "CAT0",
  VITRINE: "CAT0",
  ECOM: "CAT2",
  APP: "CAT2",
};

const SPLIT_SOUS_TRAITANT: Record<
  Category,
  { prestataire: number; agence: number }
> = {
  CAT0: { prestataire: 70, agence: 30 },
  CAT1: { prestataire: 70, agence: 30 },
  CAT2: { prestataire: 70, agence: 30 },
  CAT3: { prestataire: 70, agence: 30 },
  CAT4: { prestataire: 60, agence: 40 },
};

export function qualifyProject(input: QualificationInput): QualificationResult {
  let initialCategory = INITIAL_CATEGORY[input.projectType];

  if (input.projectType === "ECOM" && input.techStack !== "WORDPRESS") {
    initialCategory = maxCategory(initialCategory, "CAT3");
  }

  const normalizedIds = normalizeModuleIds(input.selectedModuleIds);
  const catSelections = input.catSelections ?? {};
  const ciAxes =
    input.ciAxes ??
    estimateCIAxes({
      projectType: input.projectType,
      moduleIds: normalizedIds,
    });
  const ci = computeCI(ciAxes);
  const backendMultiplier =
    input.projectType === "APP"
      ? getBackendMultiplier(
          input.constraints?.backendFamily,
          input.constraints?.backendOpsHeavy,
        )
      : 1;

  const modules = normalizedIds
    .map((id) => MODULE_CATALOG.find((m) => m.id === id))
    .filter((m): m is ModuleDef => m != null);

  let finalCategory = initialCategory;
  finalCategory = maxCategory(finalCategory, ci.category);

  if (input.projectType === "ECOM") {
    finalCategory = maxCategory(finalCategory, "CAT2");
  }
  if (input.projectType === "APP") {
    finalCategory = maxCategory(finalCategory, "CAT2");
  }

  const requalifyingModules: ModuleDef[] = [];

  if (input.techStack === "WORDPRESS" && input.wpHeadless) {
    finalCategory = maxCategory(finalCategory, "CAT3");
  }

  if (input.constraints) {
    const constraints = input.constraints;

    if (constraints.trafficLevel) {
      const minTier = CONSTRAINT_MIN_CATEGORY_INDEX.trafficLevel[constraints.trafficLevel];
      const minCat = indexToCategory(minTier);
      if (categoryIndex(minCat) > categoryIndex(finalCategory)) {
        finalCategory = minCat;
      }
    }

    if (constraints.productCount) {
      const minTier = CONSTRAINT_MIN_CATEGORY_INDEX.productCount[constraints.productCount];
      const minCat = indexToCategory(minTier);
      if (categoryIndex(minCat) > categoryIndex(finalCategory)) {
        finalCategory = minCat;
      }
    }

    if (constraints.dataSensitivity) {
      const minTier = CONSTRAINT_MIN_CATEGORY_INDEX.dataSensitivity[constraints.dataSensitivity];
      const minCat = indexToCategory(minTier);
      if (categoryIndex(minCat) > categoryIndex(finalCategory)) {
        finalCategory = minCat;
      }
    }

    if (constraints.scalabilityLevel) {
      const minTier = CONSTRAINT_MIN_CATEGORY_INDEX.scalabilityLevel[constraints.scalabilityLevel];
      const minCat = indexToCategory(minTier);
      if (categoryIndex(minCat) > categoryIndex(finalCategory)) {
        finalCategory = minCat;
      }
    }
  }

  const stackProfile = getStackProfileFromLegacy(
    input.techStack,
    input.projectType,
    input.wpHeadless,
  );
  const stackFloorCat =
    (["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"] as Category[])[
      Math.min(stackProfile.maintenanceFloorIndex, 4)
    ];
  if (categoryIndex(stackFloorCat) > categoryIndex(finalCategory)) {
    finalCategory = stackFloorCat;
  }

  for (const mod of modules) {
    if (!mod.isStructurant) continue;
    const tierSel = catSelections[mod.id];
    const requalTo = resolveModuleRequalification(mod, tierSel);
    if (!requalTo) continue;
    const newCat = maxCategory(finalCategory, requalTo);
    if (newCat !== finalCategory) {
      requalifyingModules.push(mod);
      finalCategory = newCat;
    }
  }

  const wasRequalified = finalCategory !== initialCategory;
  const maintenance = CATEGORY_MAINTENANCE[finalCategory];

  const familyBasePrice = FAMILY_BASE_PRICING[stackProfile.family]?.from ?? 1800;
  const base = Math.round(familyBasePrice * stackProfile.complexityFactor);

  const isWpHeadless = input.techStack === "WORDPRESS" && input.wpHeadless;
  const deployCost = getDeployCost(input.deployTarget, isWpHeadless);

  let modulesTotal = 0;
  let monthlyTotal = 0;

  for (const mod of modules) {
    const tierSel = catSelections[mod.id];
    const resolved = resolveModulePrice(
      mod,
      input.projectType,
      input.techStack,
      input.wpHeadless,
      tierSel,
      backendMultiplier,
    );
    modulesTotal += resolved.setup;
    monthlyTotal += resolveModuleMonthly(mod, tierSel);
  }

  let splits: QualificationResult["splits"] = null;
  if (input.billingMode === "SOUS_TRAITANT") {
    const baseSplit = SPLIT_SOUS_TRAITANT[finalCategory];
    let modulesSplitPrestataire = 0;
    let modulesSplitAgence = 0;

    for (const mod of modules) {
      const tierSel = catSelections[mod.id];
      const resolved = resolveModulePrice(
        mod,
        input.projectType,
        input.techStack,
        input.wpHeadless,
        tierSel,
        backendMultiplier,
      );
      modulesSplitPrestataire +=
        resolved.setup * (mod.splitPrestataireSetup / 100);
      modulesSplitAgence +=
        resolved.setup * ((100 - mod.splitPrestataireSetup) / 100);
    }

    splits = {
      baseSplitPrestataire: baseSplit.prestataire,
      baseSplitAgence: baseSplit.agence,
      modulesSplitPrestataire,
      modulesSplitAgence,
    };
  }

  return {
    initialCategory,
    finalCategory,
    wasRequalified,
    modules,
    requalifyingModules,
    maintenance,
    ci,
    billingMode: input.billingMode,
    budget: {
      base,
      modulesTotal,
      deployCost,
      monthlyTotal,
      grandTotal: base + modulesTotal + deployCost,
    },
    splits,
  };
}

export function getOfferStackForProject(
  projectType: QualificationInput["projectType"],
  techStack: TechStack,
  wpHeadless: boolean,
): string {
  if (techStack === "WORDPRESS") {
    if (wpHeadless) {
      return projectType === "ECOM"
        ? "WOOCOMMERCE_HEADLESS"
        : "WORDPRESS_HEADLESS";
    }
    return projectType === "ECOM" ? "WOOCOMMERCE" : "WORDPRESS";
  }
  return techStack;
}