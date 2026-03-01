/**
 * Moteur de qualification v2 — Référentiel unifié
 *
 * Remplace la logique dupliquée de qualification.ts et offers/offers.ts
 * par un moteur unique basé sur :
 *  1. Le Complexity Index (CI) pour la pré-qualification
 *  2. Les contraintes métier pour affiner la catégorie
 *  3. Les modules structurants pour la requalification
 *  4. Les StackProfiles pour le pricing extensible
 *  5. Les familles techniques pour le prix de base
 *
 * Toutes les données viennent de @/lib/referential (source unique de vérité).
 */

import {
  type Category,
  type MaintenanceTier,
  type ModuleDef,
  type DeployTarget,
  type LegacyTechStack,
  type ProjectConstraints,
  CATEGORY_MAINTENANCE,
  MAINTENANCE_TIER_BY_CATEGORY,
  categoryIndex,
  maxCategory,
  tierIndexToCategory,
  MODULE_BY_ID,
  normalizeModuleIds,
  getStackProfileFromLegacy,
  getComplexityFactor,
  getDeployCost,
  FAMILY_BASE_PRICING,
  CONSTRAINT_TIER_IMPACTS,
  computeCI,
  estimateCIAxes,
  type CIAxes,
  type CIResult,
} from "@/lib/referential";

// ── Types ────────────────────────────────────────────────────────────

/** Type fonctionnel du projet (aligné Prisma) */
export type ProjectType = "STARTER" | "BLOG" | "VITRINE" | "ECOM" | "APP";

/** Mode de facturation */
export type BillingMode = "SOLO" | "SOUS_TRAITANT";

/** Sélection de tier pour un module */
export interface ModuleTierSelection {
  setupTierId?: string;
  subTierId?: string;
}

/** Entrée du moteur de qualification v2 */
export interface QualificationInputV2 {
  projectType: ProjectType;
  techStack: LegacyTechStack;
  selectedModuleIds: string[];
  billingMode: BillingMode;
  deployTarget: DeployTarget;
  wpHeadless: boolean;
  /** Sélections de tiers par module */
  tierSelections?: Record<string, ModuleTierSelection>;
  /** Contraintes métier (optionnelles — enrichit la qualification) */
  constraints?: Partial<ProjectConstraints>;
  /** Axes CI manuels (optionnels — sinon estimés automatiquement) */
  ciAxes?: CIAxes;
}

/** Résultat du moteur de qualification v2 */
export interface QualificationResultV2 {
  /** Catégorie initiale (type fonctionnel seul) */
  initialCategory: Category;
  /** Catégorie finale (après toutes les requalifications) */
  finalCategory: Category;
  /** La catégorie a-t-elle changé ? */
  wasRequalified: boolean;
  /** Modules sélectionnés avec détail */
  modules: ModuleDef[];
  /** Modules qui ont provoqué une requalification */
  requalifyingModules: ModuleDef[];
  /** Maintenance alignée */
  maintenance: MaintenanceTier;
  /** Budget estimé */
  budget: {
    base: number;
    modulesTotal: number;
    deployCost: number;
    monthlyTotal: number;
    grandTotal: number;
  };
  /** Mode de facturation */
  billingMode: BillingMode;
  /** Répartition financière (null en mode Solo) */
  splits: {
    baseSplitPrestataire: number;
    baseSplitAgence: number;
    modulesSplitPrestataire: number;
    modulesSplitAgence: number;
  } | null;
  /** Complexity Index (si calculé) */
  ci: CIResult | null;
  /** Sources de requalification (pour le debug / UI) */
  requalificationSources: string[];
}

// ── Constantes ───────────────────────────────────────────────────────

/** Catégorie initiale par type fonctionnel */
const INITIAL_CATEGORY: Record<ProjectType, Category> = {
  STARTER: "CAT0",
  BLOG: "CAT1",
  VITRINE: "CAT1",
  ECOM: "CAT2",
  APP: "CAT4",
};

/** Stacks autorisées par type fonctionnel */
export const ALLOWED_STACKS: Record<ProjectType, LegacyTechStack[]> = {
  STARTER: ["WORDPRESS", "ASTRO"],
  BLOG: ["WORDPRESS", "NEXTJS", "NUXT", "ASTRO"],
  VITRINE: ["WORDPRESS", "NEXTJS", "NUXT", "ASTRO"],
  ECOM: ["WORDPRESS", "NEXTJS", "NUXT", "ASTRO"],
  APP: ["NEXTJS", "NUXT", "ASTRO"],
};

/** Split création en mode sous-traitant */
const SPLIT_SOUS_TRAITANT: Record<Category, { prestataire: number; agence: number }> = {
  CAT0: { prestataire: 70, agence: 30 },
  CAT1: { prestataire: 70, agence: 30 },
  CAT2: { prestataire: 70, agence: 30 },
  CAT3: { prestataire: 70, agence: 30 },
  CAT4: { prestataire: 60, agence: 40 },
};

// ── Labels (rétro-compatibilité) ─────────────────────────────────────

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  STARTER: "Starter",
  BLOG: "Blog",
  VITRINE: "Site vitrine",
  ECOM: "E-commerce",
  APP: "Application",
};

export const TECH_STACK_LABELS: Record<LegacyTechStack, string> = {
  WORDPRESS: "WordPress",
  NEXTJS: "Next.js",
  NUXT: "Nuxt",
  ASTRO: "Astro",
};

export const BILLING_MODE_LABELS: Record<BillingMode, string> = {
  SOLO: "Solo (100 %)",
  SOUS_TRAITANT: "Sous-traitant",
};

// ── Pricing (module) ─────────────────────────────────────────────────

/**
 * Résout le prix setup d'un module selon le stack et les tiers sélectionnés.
 */
export function resolveModulePrice(
  mod: ModuleDef,
  _projectType: ProjectType,
  techStack: LegacyTechStack,
  wpHeadless: boolean,
  tierSelection?: ModuleTierSelection,
): { setup: number; setupMax: number | null; isCustom: boolean } {
  // Résoudre le coefficient du stack (source unique v2)
  const complexityFactor = getComplexityFactor(techStack, _projectType, wpHeadless);

  // Si un setupTier est sélectionné, utiliser son prix
  if (tierSelection?.setupTierId && mod.setupTiers) {
    const tier = mod.setupTiers.find((t) => t.id === tierSelection.setupTierId);
    if (tier) {
      return {
        setup: Math.round(tier.priceSetup * complexityFactor),
        setupMax: null,
        isCustom: false,
      };
    }
  }

  // Prix standard : base × complexityFactor (stack profile)

  return {
    setup: Math.round(mod.priceSetup * complexityFactor),
    setupMax:
      mod.priceSetupMax != null
        ? Math.round(mod.priceSetupMax * complexityFactor)
        : null,
    isCustom: false,
  };
}

/**
 * Résout le prix mensuel d'un module.
 */
export function resolveModuleMonthly(
  mod: ModuleDef,
  tierSelection?: ModuleTierSelection,
): number {
  if (tierSelection?.subTierId && mod.subscriptionTiers) {
    const tier = mod.subscriptionTiers.find((t) => t.id === tierSelection.subTierId);
    if (tier) return tier.priceMonthly;
  }
  return mod.priceMonthly;
}

/**
 * Résout la requalification d'un module selon le tier sélectionné.
 */
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

// ── Moteur v2 ────────────────────────────────────────────────────────

/**
 * Qualifie un projet selon le référentiel v2.
 *
 * Flux :
 *  1. Catégorie initiale via type fonctionnel
 *  2. CI (si axes fournis ou estimés) → requalification vers le haut
 *  3. Contraintes métier → requalification vers le haut
 *  4. Plancher stack → requalification vers le haut
 *  5. Modules structurants → requalification vers le haut
 *  6. Catégorie finale = max de toutes les sources
 *  7. Maintenance alignée sur la catégorie
 *  8. Budget = base famille × coefficient stack + modules + déploiement
 */
export function qualifyProjectV2(input: QualificationInputV2): QualificationResultV2 {
  const requalificationSources: string[] = [];

  // ── 1. Catégorie initiale ────────────────────────────────────────
  const initialCategory = INITIAL_CATEGORY[input.projectType];

  let finalCategory = initialCategory;

  // ── 2. Complexity Index ──────────────────────────────────────────
  let ciResult: CIResult | null = null;
  const ciAxes = input.ciAxes ?? estimateCIAxes({
    projectType: input.projectType,
    moduleIds: input.selectedModuleIds,
  });
  ciResult = computeCI(ciAxes);
  const ciCategory = ciResult.category;
  if (categoryIndex(ciCategory) > categoryIndex(finalCategory)) {
    finalCategory = ciCategory;
    requalificationSources.push(`CI (score ${ciResult.score} → ${ciCategory})`);
  }

  // ── 3. Contraintes métier ────────────────────────────────────────
  if (input.constraints) {
    const c = input.constraints;

    if (c.trafficLevel) {
      const minTier = CONSTRAINT_TIER_IMPACTS.trafficLevel[c.trafficLevel];
      const minCat = tierIndexToCategory(minTier);
      if (categoryIndex(minCat) > categoryIndex(finalCategory)) {
        finalCategory = minCat;
        requalificationSources.push(`Trafic ${c.trafficLevel} → ${minCat}`);
      }
    }

    if (c.productCount) {
      const minTier = CONSTRAINT_TIER_IMPACTS.productCount[c.productCount];
      const minCat = tierIndexToCategory(minTier);
      if (categoryIndex(minCat) > categoryIndex(finalCategory)) {
        finalCategory = minCat;
        requalificationSources.push(`Produits ${c.productCount} → ${minCat}`);
      }
    }

    if (c.dataSensitivity) {
      const minTier = CONSTRAINT_TIER_IMPACTS.dataSensitivity[c.dataSensitivity];
      const minCat = tierIndexToCategory(minTier);
      if (categoryIndex(minCat) > categoryIndex(finalCategory)) {
        finalCategory = minCat;
        requalificationSources.push(`Sensibilité ${c.dataSensitivity} → ${minCat}`);
      }
    }

    if (c.scalabilityLevel) {
      const minTier = CONSTRAINT_TIER_IMPACTS.scalabilityLevel[c.scalabilityLevel];
      const minCat = tierIndexToCategory(minTier);
      if (categoryIndex(minCat) > categoryIndex(finalCategory)) {
        finalCategory = minCat;
        requalificationSources.push(`Scalabilité ${c.scalabilityLevel} → ${minCat}`);
      }
    }
  }

  // ── 4. Plancher stack ────────────────────────────────────────────
  const stackProfile = getStackProfileFromLegacy(
    input.techStack,
    input.projectType,
    input.wpHeadless,
  );
  const stackFloorCat = tierIndexToCategory(stackProfile.maintenanceFloorTier);
  if (categoryIndex(stackFloorCat) > categoryIndex(finalCategory)) {
    finalCategory = stackFloorCat;
    requalificationSources.push(`Plancher stack ${stackProfile.label} → ${stackFloorCat}`);
  }

  // Architecture headless → CAT4 minimum
  const isHeadless =
    input.wpHeadless ||
    input.constraints?.headlessRequired ||
    input.constraints?.commerceModel === "HEADLESS";
  if (isHeadless) {
    const headlessCat: Category = "CAT4";
    if (categoryIndex(headlessCat) > categoryIndex(finalCategory)) {
      finalCategory = headlessCat;
      requalificationSources.push("Architecture headless → CAT4");
    }
  }

  // ── 5. Modules structurants ──────────────────────────────────────
  const isStarter = input.projectType === "STARTER";
  const normalizedIds = isStarter ? [] : normalizeModuleIds(input.selectedModuleIds);
  const tierSelections = isStarter ? {} : (input.tierSelections ?? {});

  const modules = normalizedIds
    .map((id) => MODULE_BY_ID[id])
    .filter((m): m is ModuleDef => m != null);

  const requalifyingModules: ModuleDef[] = [];

  for (const mod of modules) {
    if (mod.isStructurant) {
      const tierSel = tierSelections[mod.id];
      const requalTo = resolveModuleRequalification(mod, tierSel);
      if (requalTo) {
        const newCat = maxCategory(finalCategory, requalTo);
        if (newCat !== finalCategory) {
          requalifyingModules.push(mod);
          finalCategory = newCat;
          requalificationSources.push(`Module ${mod.name} → ${requalTo}`);
        }
      }
    }
  }

  const wasRequalified = finalCategory !== initialCategory;

  // ── 6. Maintenance ───────────────────────────────────────────────
  const maintenance = CATEGORY_MAINTENANCE[finalCategory];

  // ── 7. Budget ────────────────────────────────────────────────────

  // Base = prix famille × coefficient stack
  const familyBasePrice = FAMILY_BASE_PRICING[stackProfile.family]?.from ?? 1800;
  const base = Math.round(familyBasePrice * stackProfile.complexityFactor);

  // Déploiement
  const isWpH = input.techStack === "WORDPRESS" && input.wpHeadless;
  const deployCost = getDeployCost(input.deployTarget, isWpH);

  // Modules
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
    );
    modulesTotal += resolved.setup;
    monthlyTotal += resolveModuleMonthly(mod, tierSel);
  }

  // ── 8. Splits ────────────────────────────────────────────────────
  let splits: QualificationResultV2["splits"] = null;

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

  // Mensuel maintenance
  const maintenanceMonthly = MAINTENANCE_TIER_BY_CATEGORY[finalCategory].priceMonthly;
  monthlyTotal += maintenanceMonthly;

  return {
    initialCategory,
    finalCategory,
    wasRequalified,
    modules,
    requalifyingModules,
    maintenance,
    billingMode: input.billingMode,
    budget: {
      base,
      modulesTotal,
      deployCost,
      monthlyTotal,
      grandTotal: base + modulesTotal + deployCost,
    },
    splits,
    ci: ciResult,
    requalificationSources,
  };
}

// ── Helpers rétro-compatibles ────────────────────────────────────────

/**
 * Groupe les modules par catégorie de groupe (rétro-compatible).
 */
export function groupModules(modules: ModuleDef[]): Record<string, ModuleDef[]> {
  const groups: Partial<Record<string, ModuleDef[]>> = {};
  for (const mod of modules) {
    const key = mod.group;
    if (!groups[key]) groups[key] = [];
    groups[key].push(mod);
  }
  return groups as Record<string, ModuleDef[]>;
}

/**
 * Calcule le coefficient de complexité stack (rétro-compatible).
 */
export function computeStackMultiplier(
  projectType: ProjectType,
  techStack: LegacyTechStack,
  wpHeadless = false,
): number {
  return getComplexityFactor(techStack, projectType, wpHeadless);
}

/**
 * Label du coefficient (rétro-compatible).
 */
export function getMultiplierLabel(
  projectType: ProjectType,
  techStack: LegacyTechStack,
  wpHeadless = false,
): string {
  const multiplier = computeStackMultiplier(projectType, techStack, wpHeadless);
  if (multiplier === 1) return "";
  return `×${multiplier.toFixed(multiplier % 1 === 0 ? 1 : 3).replace(/\.?0+$/, "")}`;
}
