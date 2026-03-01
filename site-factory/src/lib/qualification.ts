/**
 * Moteur de qualification — Flux décisionnel (multi-stack)
 *
 * ═══════════════════════════════════════════════════════════════════════
 * REFACTORÉ v2 — Toutes les données viennent de @/lib/referential
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Ce fichier maintient la compatibilité API avec les consommateurs existants
 * mais délègue intégralement au référentiel unifié.
 *
 * Principe fondamental : Stack ≠ Catégorie.
 * La catégorie est déterminée par la complexité fonctionnelle, pas par le stack.
 */

import {
  // ── Maintenance & Catégories (source unique) ─────────────────────
  type Category as RefCategory,
  type MaintenanceTier as RefMaintenanceTier,
  CATEGORY_ORDER as REF_CATEGORY_ORDER,
  CATEGORY_LABELS as REF_CATEGORY_LABELS,
  CATEGORY_SHORT as REF_CATEGORY_SHORT,
  CATEGORY_COLORS as REF_CATEGORY_COLORS,
  CATEGORY_MAINTENANCE as REF_CATEGORY_MAINTENANCE,
  MAINTENANCE_LABELS as REF_MAINTENANCE_LABELS,
  MAINTENANCE_PRICES as REF_MAINTENANCE_PRICES,
  categoryIndex as refCategoryIndex,
  maxCategory as refMaxCategory,
  tierIndexToCategory,

  // ── Modules (source unique) ──────────────────────────────────────
  type ModuleDef as RefModuleDef,
  MODULE_CATALOG as REF_MODULE_CATALOG,
  MODULE_GROUPS as REF_MODULE_GROUPS,
  normalizeModuleId as refNormalizeModuleId,
  normalizeModuleIds as refNormalizeModuleIds,

  // ── Complexity Index ──────────────────────────────────────────────
  type CIAxes,
  type CIResult,
  computeCI,
  estimateCIAxes,

  // ── Stack Profiles ───────────────────────────────────────────────
  type LegacyTechStack,
  getStackProfileFromLegacy,
  getComplexityFactor,
  FAMILY_BASE_PRICING,

  // ── Deploy ───────────────────────────────────────────────────────
  type DeployTarget as RefDeployTarget,
  DEPLOY_TARGET_LABELS as REF_DEPLOY_TARGET_LABELS,
  DEPLOY_FEES,
  DEPLOY_FEES_HEADLESS,
  HOSTING_COSTS as REF_HOSTING_COSTS,
  HOSTING_COSTS_HEADLESS,
  getDeployCost,
  getAllowedDeployTargets as refGetAllowedDeployTargets,
  type ProjectConstraints,
  CONSTRAINT_TIER_IMPACTS,
  getBackendMultiplier,
} from "@/lib/referential";

// ── Types (rétro-compatibles) ────────────────────────────────────────
//
// MaintenanceLevel passe de 4 à 5 niveaux :
//   Ancien : STANDARD | ADVANCED | BUSINESS | CUSTOM
//   Nouveau : MINIMAL | STANDARD | ADVANCED | BUSINESS | PREMIUM
//

export type Category = RefCategory;
export type MaintenanceLevel = RefMaintenanceTier;
export type BillingMode = "SOLO" | "SOUS_TRAITANT";
export type ProjectType = "STARTER" | "BLOG" | "VITRINE" | "ECOM" | "APP";
export type TechStack = LegacyTechStack;
export type DeployTarget = RefDeployTarget;

export type ModuleDef = RefModuleDef;

export interface ModuleTierSelection {
  setupTierId?: string;
  subTierId?: string;
}

// ── Constantes (déléguées au référentiel) ────────────────────────────

export const CATEGORY_ORDER: Category[] = REF_CATEGORY_ORDER;
export const CATEGORY_LABELS: Record<Category, string> = REF_CATEGORY_LABELS;
export const CATEGORY_SHORT: Record<Category, string> = REF_CATEGORY_SHORT;
export const CATEGORY_COLORS: Record<Category, string> = REF_CATEGORY_COLORS;

/** Labels pour les types fonctionnels de projet */
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  STARTER: "Starter",
  BLOG: "Blog",
  VITRINE: "Site vitrine",
  ECOM: "E-commerce",
  APP: "Application",
};

/** Labels pour les stacks techniques */
export const TECH_STACK_LABELS: Record<TechStack, string> = {
  WORDPRESS: "WordPress",
  NEXTJS: "Next.js",
  NUXT: "Nuxt",
  ASTRO: "Astro",
};

// ── Maintenance (5 niveaux, nouveaux tarifs) ─────────────────────────

export const CATEGORY_MAINTENANCE: Record<Category, MaintenanceLevel> =
  REF_CATEGORY_MAINTENANCE;

export const MAINTENANCE_LABELS: Record<MaintenanceLevel, string> =
  REF_MAINTENANCE_LABELS;

export const MAINTENANCE_PRICES: Record<MaintenanceLevel, string> =
  REF_MAINTENANCE_PRICES;

// ── Modules (source unique : referential/modules.ts) ─────────────────

export const MODULE_CATALOG: ModuleDef[] = REF_MODULE_CATALOG;

export const MODULE_GROUPS: Record<string, string> = REF_MODULE_GROUPS;

export function normalizeModuleId(id: string): string | null {
  return refNormalizeModuleId(id);
}

export function normalizeModuleIds(ids: string[]): string[] {
  return refNormalizeModuleIds(ids);
}

// ── Catégorie initiale ───────────────────────────────────────────────

const INITIAL_CATEGORY: Record<ProjectType, Category> = {
  STARTER: "CAT0",
  BLOG: "CAT1",
  VITRINE: "CAT1",
  ECOM: "CAT2",
  APP: "CAT4",
};

// ── Stacks autorisées ────────────────────────────────────────────────

export const ALLOWED_STACKS: Record<ProjectType, TechStack[]> = {
  STARTER: ["WORDPRESS", "ASTRO"],
  BLOG: ["WORDPRESS", "NEXTJS", "NUXT", "ASTRO"],
  VITRINE: ["WORDPRESS", "NEXTJS", "NUXT", "ASTRO"],
  ECOM: ["WORDPRESS", "NEXTJS", "NUXT", "ASTRO"],
  APP: ["NEXTJS", "NUXT", "ASTRO"],
};

// ── Déploiement ──────────────────────────────────────────────────────

export const DEPLOY_TARGET_LABELS: Record<DeployTarget, string> =
  REF_DEPLOY_TARGET_LABELS;

export const ALLOWED_DEPLOY_TARGETS: Record<TechStack, DeployTarget[]> = {
  WORDPRESS: ["DOCKER", "SHARED_HOSTING"],
  NEXTJS: ["DOCKER", "VERCEL"],
  NUXT: ["DOCKER", "VERCEL"],
  ASTRO: ["DOCKER", "VERCEL"],
};

export function getAllowedDeployTargets(
  techStack: TechStack,
  wpHeadless: boolean,
): DeployTarget[] {
  return refGetAllowedDeployTargets(techStack, wpHeadless);
}

export const ALLOWED_STACKS_FOR_DEPLOY: Record<DeployTarget, TechStack[]> = {
  DOCKER: ["WORDPRESS", "NEXTJS", "NUXT", "ASTRO"],
  VERCEL: ["NEXTJS", "NUXT", "ASTRO"],
  SHARED_HOSTING: ["WORDPRESS"],
};

export const HOSTING_COSTS: Record<
  DeployTarget,
  { label: string; range: string }
> = REF_HOSTING_COSTS;

export const HOSTING_COST_WP_HEADLESS: Record<
  DeployTarget,
  { label: string; range: string }
> = HOSTING_COSTS_HEADLESS;

export const DEPLOY_SETUP_COST: Record<DeployTarget, number> = {
  SHARED_HOSTING: DEPLOY_FEES.SHARED_HOSTING.cost,
  VERCEL: DEPLOY_FEES.VERCEL.cost,
  DOCKER: DEPLOY_FEES.DOCKER.cost,
};

export const DEPLOY_SETUP_COST_WP_HEADLESS: Record<
  DeployTarget,
  { cost: number; label: string }
> = Object.fromEntries(
  DEPLOY_FEES_HEADLESS.map((f) => [f.deployTarget, { cost: f.cost, label: f.label }]),
) as Record<DeployTarget, { cost: number; label: string }>;

// ── Splits ───────────────────────────────────────────────────────────

export const SPLIT_SOUS_TRAITANT: Record<
  Category,
  { prestataire: number; agence: number }
> = {
  CAT0: { prestataire: 70, agence: 30 },
  CAT1: { prestataire: 70, agence: 30 },
  CAT2: { prestataire: 70, agence: 30 },
  CAT3: { prestataire: 70, agence: 30 },
  CAT4: { prestataire: 60, agence: 40 },
};

export const BILLING_MODE_LABELS: Record<BillingMode, string> = {
  SOLO: "Solo (100 %)",
  SOUS_TRAITANT: "Sous-traitant",
};

// ── Pricing modules ──────────────────────────────────────────────────

/**
 * Calcule le coefficient stack v2 (via StackProfile).
 */
export function computeStackMultiplier(
  projectType: ProjectType,
  techStack: TechStack,
  wpHeadless = false,
): number {
  return getComplexityFactor(techStack, projectType, wpHeadless);
}

/** Label du coefficient pour affichage UI */
export function getMultiplierLabel(
  projectType: ProjectType,
  techStack: TechStack,
  wpHeadless = false,
): string {
  const multiplier = computeStackMultiplier(projectType, techStack, wpHeadless);
  if (multiplier === 1) return "";
  return `×${multiplier
    .toFixed(multiplier % 1 === 0 ? 1 : 3)
    .replace(/\.?0+$/, "")}`;
}

/**
 * Résout le prix setup d'un module selon le stack.
 * v2 : utilise jsMultiplier × priceSetup (plus simple, source unique).
 */
export function resolveModulePrice(
  mod: ModuleDef,
  _projectType: ProjectType,
  techStack: TechStack,
  wpHeadless: boolean,
  tierSelection?: ModuleTierSelection,
  backendMultiplier = 1,
): { setup: number; setupMax: number | null; isCustom: boolean } {
  const isWP = techStack === "WORDPRESS" && !wpHeadless;
  const multiplier = (isWP ? 1.0 : mod.jsMultiplier) * backendMultiplier;

  if (tierSelection?.setupTierId && mod.setupTiers) {
    const tier = mod.setupTiers.find((t) => t.id === tierSelection.setupTierId);
    if (tier) {
      return {
        setup: Math.round(tier.priceSetup * multiplier),
        setupMax: null,
        isCustom: false,
      };
    }
  }

  return {
    setup: Math.round(mod.priceSetup * multiplier),
    setupMax:
      mod.priceSetupMax != null
        ? Math.round(mod.priceSetupMax * multiplier)
        : null,
    isCustom: false,
  };
}

export function resolveModuleMonthly(
  mod: ModuleDef,
  tierSelection?: ModuleTierSelection,
): number {
  if (tierSelection?.subTierId && mod.subscriptionTiers) {
    const tier = mod.subscriptionTiers.find(
      (t) => t.id === tierSelection.subTierId,
    );
    if (tier) return tier.priceMonthly;
  }
  return mod.priceMonthly;
}

export function resolveModuleRequalification(
  mod: ModuleDef,
  tierSelection?: ModuleTierSelection,
): Category | null {
  if (tierSelection?.setupTierId && mod.setupTiers) {
    const tier = mod.setupTiers.find((t) => t.id === tierSelection.setupTierId);
    if (tier) return (tier.requalifiesTo as Category) ?? mod.requalifiesTo;
  }
  return mod.requalifiesTo;
}

// ── Moteur de qualification ──────────────────────────────────────────

export interface QualificationInput {
  projectType: ProjectType;
  techStack: TechStack;
  selectedModuleIds: string[];
  billingMode: BillingMode;
  deployTarget: DeployTarget;
  wpHeadless: boolean;
  tierSelections?: Record<string, ModuleTierSelection>;
  constraints?: Partial<ProjectConstraints>;
  ciAxes?: CIAxes;
}

export interface QualificationResult {
  initialCategory: Category;
  finalCategory: Category;
  wasRequalified: boolean;
  modules: ModuleDef[];
  requalifyingModules: ModuleDef[];
  maintenance: MaintenanceLevel;
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

/**
 * Qualifie un projet en appliquant le flux décisionnel v2.
 *
 * Données : @/lib/referential (source unique de vérité).
 */
export function qualifyProject(input: QualificationInput): QualificationResult {
  let initialCategory = INITIAL_CATEGORY[input.projectType];

  // E-commerce non-WP → CAT3 minimum
  if (input.projectType === "ECOM" && input.techStack !== "WORDPRESS") {
    initialCategory = refMaxCategory(initialCategory, "CAT3");
  }

  const isStarter = input.projectType === "STARTER";
  const normalizedIds = isStarter
    ? []
    : refNormalizeModuleIds(input.selectedModuleIds);
  const tierSelections = isStarter ? {} : (input.tierSelections ?? {});
  const ciAxes =
    input.ciAxes ?? estimateCIAxes({ projectType: input.projectType, moduleIds: normalizedIds });
  const ci = computeCI(ciAxes);
  const backendMultiplier =
    input.projectType === "APP"
      ? getBackendMultiplier(input.constraints?.backendFamily, input.constraints?.backendOpsHeavy)
      : 1;

  // Résoudre les modules
  const modules = normalizedIds
    .map((id) => MODULE_CATALOG.find((m) => m.id === id))
    .filter((m): m is ModuleDef => m != null);

  let finalCategory = initialCategory;
  const requalifyingModules: ModuleDef[] = [];

  // WP headless → CAT3 minimum
  if (input.techStack === "WORDPRESS" && input.wpHeadless) {
    finalCategory = refMaxCategory(finalCategory, "CAT3");
  }

  // Contraintes métier → requalification par tier minimum
  if (input.constraints) {
    const c = input.constraints;

    if (c.trafficLevel) {
      const minTier = CONSTRAINT_TIER_IMPACTS.trafficLevel[c.trafficLevel];
      const minCat = tierIndexToCategory(minTier);
      if (refCategoryIndex(minCat) > refCategoryIndex(finalCategory)) {
        finalCategory = minCat;
      }
    }

    if (c.productCount) {
      const minTier = CONSTRAINT_TIER_IMPACTS.productCount[c.productCount];
      const minCat = tierIndexToCategory(minTier);
      if (refCategoryIndex(minCat) > refCategoryIndex(finalCategory)) {
        finalCategory = minCat;
      }
    }

    if (c.dataSensitivity) {
      const minTier = CONSTRAINT_TIER_IMPACTS.dataSensitivity[c.dataSensitivity];
      const minCat = tierIndexToCategory(minTier);
      if (refCategoryIndex(minCat) > refCategoryIndex(finalCategory)) {
        finalCategory = minCat;
      }
    }

    if (c.scalabilityLevel) {
      const minTier = CONSTRAINT_TIER_IMPACTS.scalabilityLevel[c.scalabilityLevel];
      const minCat = tierIndexToCategory(minTier);
      if (refCategoryIndex(minCat) > refCategoryIndex(finalCategory)) {
        finalCategory = minCat;
      }
    }
  }

  // Plancher stack
  const stackProfile = getStackProfileFromLegacy(
    input.techStack,
    input.projectType,
    input.wpHeadless,
  );
  const stackFloorCat = (
    ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"] as Category[]
  )[Math.min(stackProfile.maintenanceFloorTier, 4)];
  if (refCategoryIndex(stackFloorCat) > refCategoryIndex(finalCategory)) {
    finalCategory = stackFloorCat;
  }

  // Requalification par modules structurants
  for (const mod of modules) {
    if (mod.isStructurant) {
      const tierSel = tierSelections[mod.id];
      const requalTo = resolveModuleRequalification(mod, tierSel);
      if (requalTo) {
        const newCat = refMaxCategory(finalCategory, requalTo);
        if (newCat !== finalCategory) {
          requalifyingModules.push(mod);
          finalCategory = newCat;
        }
      }
    }
  }

  const wasRequalified = finalCategory !== initialCategory;
  const maintenance = CATEGORY_MAINTENANCE[finalCategory];

  // Budget v2 : base = famille × coefficient stack
  const familyBasePrice =
    FAMILY_BASE_PRICING[stackProfile.family]?.from ?? 1800;
  const base = Math.round(familyBasePrice * stackProfile.complexityFactor);

  // Déploiement
  const isWpH = input.techStack === "WORDPRESS" && input.wpHeadless;
  const deployCost = getDeployCost(input.deployTarget, isWpH);

  let modulesTotal = 0;
  let monthlyTotal = 0;

  for (const mod of modules) {
    const tierSel = tierSelections[mod.id];
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

  // Splits
  let splits: QualificationResult["splits"] = null;

  if (input.billingMode === "SOUS_TRAITANT") {
    const baseSplit = SPLIT_SOUS_TRAITANT[finalCategory];
    let modulesSplitPrestataire = 0;
    let modulesSplitAgence = 0;

    for (const mod of modules) {
      const tierSel = tierSelections[mod.id];
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

/**
 * Groupe les modules par catégorie de groupe pour l'affichage.
 */
export function groupModules(
  modules: ModuleDef[],
): Record<string, ModuleDef[]> {
  const groups: Partial<Record<string, ModuleDef[]>> = {};
  for (const mod of modules) {
    const key = mod.group;
    if (!groups[key]) groups[key] = [];
    groups[key].push(mod);
  }
  return groups as Record<string, ModuleDef[]>;
}

// ── Exports legacy (rétro-compatibilité offers bridge) ───────────────

/**
 * @deprecated Utilisé par les anciens composants qui importent depuis offers.ts.
 * Les nouveaux composants devraient importer directement depuis @/lib/referential.
 */
export function getOfferProjectType(
  projectType: ProjectType,
): string {
  const map: Record<ProjectType, string> = {
    STARTER: "STARTER",
    BLOG: "VITRINE_BLOG",
    VITRINE: "VITRINE_BLOG",
    ECOM: "ECOMMERCE",
    APP: "APP_CUSTOM",
  };
  return map[projectType];
}

export function getOfferStackForProject(
  projectType: ProjectType,
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
