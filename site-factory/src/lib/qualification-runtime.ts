import {
  CATEGORY_MAINTENANCE,
  FAMILY_BASE_PRICING,
  MODULE_CATALOG,
  computeCI,
  estimateCIAxes,
  getBackendMultiplier,
  getDeployCost,
  getStackProfileFromLegacy,
  maxCategory,
  normalizeModuleIds,
  type CIAxes,
  type CIResult,
  type CanonicalDecisionOutput,
  type Category,
  type CommercialProfile,
  type DeployTarget,
  type DeliveryModel,
  type ImplementationStrategy,
  type LegacyTechStack as TechStack,
  type MaintenanceCat,
  type ModuleDef,
  type MutualizationLevel,
  type ProjectConstraints,
  type ProjectType,
  type SolutionFamily,
  type TechnicalProfile,
} from "@/lib/referential";
import {
  resolveModuleMonthly,
  resolveModulePrice,
  resolveModuleRequalification,
} from "@/lib/module-pricing";
import { resolveBaseCategoryRules } from "@/lib/services/qualification/category-rules";

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
  splits:
    | {
        baseSplitPrestataire: number;
        baseSplitAgence: number;
        modulesSplitPrestataire: number;
        modulesSplitAgence: number;
      }
    | null;
  decision: CanonicalDecisionOutput;
}

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

function mapSolutionFamily(input: QualificationInput): SolutionFamily {
  switch (input.projectType) {
    case "BLOG":
      return "CONTENT_PLATFORM";
    case "VITRINE":
      return "BUSINESS_SITE";
    case "ECOM":
      return "ECOMMERCE";
    case "APP":
      return "BUSINESS_APP";
    default: {
      const _exhaustive: never = input.projectType;
      return _exhaustive;
    }
  }
}

function mapDeliveryModel(input: QualificationInput): DeliveryModel {
  if (input.billingMode === "SOUS_TRAITANT") {
    return "MANAGED_CUSTOM";
  }

  if (input.deployTarget === "VERCEL") {
    return "MANAGED_CUSTOM";
  }

  return "DELIVERED_CUSTOM";
}

function mapMutualizationLevel(
  input: QualificationInput,
  finalCategory: Category,
): MutualizationLevel {
  if (input.billingMode === "SOUS_TRAITANT") {
    return "SHARED_SOCLE";
  }

  if (
    input.techStack === "WORDPRESS" &&
    !input.wpHeadless &&
    finalCategory !== "CAT4"
  ) {
    return "SHARED_SOCLE";
  }

  return "DEDICATED";
}

function mapImplementationStrategy(
  input: QualificationInput,
): ImplementationStrategy {
  if (input.projectType === "APP") {
    return "CUSTOM_WEB_APP";
  }

  if (input.techStack === "WORDPRESS" && input.wpHeadless) {
    return "HEADLESS_CONTENT_SITE";
  }

  if (input.projectType === "ECOM" && input.techStack === "WORDPRESS") {
    return "CMS_EXTENDED";
  }

  if (input.techStack === "WORDPRESS") {
    return "CMS_CONFIGURED";
  }

  if (
    input.techStack === "NEXTJS" ||
    input.techStack === "ASTRO" ||
    input.techStack === "NUXT"
  ) {
    return "HEADLESS_CONTENT_SITE";
  }

  return "HYBRID_STACK";
}

function mapTechnicalProfile(input: QualificationInput): TechnicalProfile {
  if (input.projectType === "APP") {
    return "CUSTOM_APP_MANAGED";
  }

  if (
    input.projectType === "ECOM" &&
    input.techStack === "WORDPRESS" &&
    !input.wpHeadless
  ) {
    return "WOOCOMMERCE_STANDARD";
  }

  if (input.techStack === "WORDPRESS" && input.wpHeadless) {
    return "HEADLESS_WP";
  }

  if (input.techStack === "WORDPRESS") {
    return input.projectType === "VITRINE"
      ? "WP_BUSINESS_EXTENDED"
      : "WP_EDITORIAL_STANDARD";
  }

  if (input.techStack === "NEXTJS") {
    return "NEXT_MDX_EDITORIAL";
  }

  return "JAMSTACK_CONTENT_SITE";
}

function mapCommercialProfile(
  input: QualificationInput,
  deliveryModel: DeliveryModel,
): CommercialProfile {
  if (deliveryModel === "OPERATED_PRODUCT") {
    return "OPERATED_SUBSCRIPTION";
  }

  if (deliveryModel === "MANAGED_STANDARDIZED") {
    return "STANDARDIZED_MONTHLY_PLAN";
  }

  if (deliveryModel === "MANAGED_CUSTOM") {
    return "SETUP_PLUS_MANAGED_RETAINER";
  }

  return input.billingMode === "SOUS_TRAITANT"
    ? "SETUP_PLUS_MANAGED_RETAINER"
    : "ONE_SHOT_DELIVERY";
}

function buildDecisionOutput(
  input: QualificationInput,
  finalCategory: Category,
): CanonicalDecisionOutput {
  const solutionFamily = mapSolutionFamily(input);
  const deliveryModel = mapDeliveryModel(input);
  const mutualizationLevel = mapMutualizationLevel(input, finalCategory);
  const implementationStrategy = mapImplementationStrategy(input);
  const technicalProfile = mapTechnicalProfile(input);
  const commercialProfile = mapCommercialProfile(input, deliveryModel);

  const notes: string[] = [];

  if (input.techStack === "WORDPRESS" && input.wpHeadless) {
    notes.push(
      "Legacy mapping: WordPress headless currently biases the decision toward HEADLESS_CONTENT_SITE.",
    );
  }

  if (input.billingMode === "SOUS_TRAITANT") {
    notes.push(
      "Legacy mapping: billing mode SOUS_TRAITANT currently biases the decision toward MANAGED_CUSTOM.",
    );
  }

  if (input.projectType === "APP") {
    notes.push(
      "Legacy mapping: projectType APP currently biases the decision toward CUSTOM_WEB_APP.",
    );
  }

  return {
    solutionFamily,
    deliveryModel,
    mutualizationLevel,
    implementationStrategy,
    technicalProfile,
    commercialProfile,
    notes,
    legacyMapping: {
      projectType: input.projectType,
      finalCategory,
      techStack: input.techStack,
      deployTarget: input.deployTarget,
      wpHeadless: input.wpHeadless,
    },
  };
}

export function qualifyProject(input: QualificationInput): QualificationResult {
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

  const categoryRules = resolveBaseCategoryRules({
    projectType: input.projectType,
    techStack: input.techStack,
    wpHeadless: input.wpHeadless,
    constraints: input.constraints,
  });

  const initialCategory = categoryRules.initialCategory;
  let finalCategory = maxCategory(
    categoryRules.finalCategoryBeforeModules,
    ci.category,
  );

  const requalifyingModules: ModuleDef[] = [];

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

  const stackProfile = getStackProfileFromLegacy(
    input.techStack,
    input.projectType,
    input.wpHeadless,
  );

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
      modulesSplitPrestataire += resolved.setup * (mod.splitPrestataireSetup / 100);
      modulesSplitAgence += resolved.setup * ((100 - mod.splitPrestataireSetup) / 100);
    }

    splits = {
      baseSplitPrestataire: baseSplit.prestataire,
      baseSplitAgence: baseSplit.agence,
      modulesSplitPrestataire,
      modulesSplitAgence,
    };
  }

  const decision = buildDecisionOutput(input, finalCategory);

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
    decision,
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