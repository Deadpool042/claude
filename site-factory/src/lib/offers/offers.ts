//src/lib/offers/offers.ts
/**
 * Module Offres / Pricing — Refactoré v2
 *
 * ═══════════════════════════════════════════════════════════════════════
 * REFACTORÉ v2 — Source unique : @/lib/referential
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Ce fichier maintient la compatibilité API avec les consommateurs existants
 * mais délègue au référentiel unifié pour toutes les données.
 *
 * Les anciennes constantes hardcodées (BASE_PRICES, MODULES, MAINTENANCE_PRICES,
 * STACK_PRICE_MULTIPLIER, etc.) sont remplacées par des imports du référentiel.
 */

import {
  type MaintenanceCat,
  type ProjectType as ReferentialProjectType,
  type LegacyTechStack as ReferentialTechStack,
  type ModuleDef as RefModuleDef,
  CATEGORY_LABELS as REF_CATEGORY_LABELS,
  CATEGORY_MAINTENANCE,
  MAINTENANCE_LABELS as REF_MAINTENANCE_LABELS,
  MAINTENANCE_PRICES as REF_MAINTENANCE_PRICES,
  MODULE_CATALOG,
  FAMILY_BASE_PRICING,
  DEPLOY_FEES,
  DEPLOY_FEES_HEADLESS,
  categoryIndex,
} from "@/lib/referential";
import { qualifyProject } from "@/lib/qualification-runtime";

// ══════════════════════════════════════════════════════════════════════
// TYPES (rétro-compatibles)
// ══════════════════════════════════════════════════════════════════════

export type OfferCategory =
  | "VITRINE_BLOG"
  | "ECOMMERCE"
  | "APP_CUSTOM";

/** Alias de compatibilité: Use OfferCategory */
export type ProjectType = OfferCategory;

export type ProjectCategory = 0 | 1 | 2 | 3 | 4;

export type MaintenanceCat2 = MaintenanceCat;
export { type MaintenanceCat };

export type Stack =
  | "WORDPRESS"
  | "NEXTJS"
  | "NUXT"
  | "ASTRO"
  | "WORDPRESS_HEADLESS"
  | "WOOCOMMERCE"
  | "WOOCOMMERCE_HEADLESS";

export type PriceRange = {
  priceFrom: number;
  priceTo?: number;
};

export type ModuleSubscription = {
  id: string;
  label: string;
  priceMonthly: number;
};

export type ModuleCategory =
  | "ux"
  | "seo"
  | "commerce"
  | "marketing"
  | "security"
  | "ops"
  | "architecture"
  | "performance"
  | "data"
  | "metier";

export type ModulePricing = {
  kind: "byStack";
  prices: Record<Stack, PriceRange>;
};

export const MODULE_IDS = MODULE_CATALOG.map((m) => m.id) as readonly string[];

export type ModuleId = string;

export type ModuleDef = {
  id: ModuleId;
  label: string;
  description: string;
  details: string[];
  categories: ModuleCategory[];
  compatibleWith: Stack[] | "ALL";
  pricing: ModulePricing;
  complexity: {
    byStack: Record<Stack, number>;
  };
  mandatoryFor?: Partial<Record<OfferCategory, Stack[]>>;
  includedByDefault?: boolean;
  subscriptions?: ModuleSubscription[];
};

// ══════════════════════════════════════════════════════════════════════
// CATEGORY (v2 — 5 niveaux)
// ══════════════════════════════════════════════════════════════════════

export const CATEGORY_BY_OFFER: Record<OfferCategory, ProjectCategory> = {
  VITRINE_BLOG: 1,
  ECOMMERCE: 2,
  APP_CUSTOM: 4,
};

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  0: REF_CATEGORY_LABELS.CAT0,
  1: REF_CATEGORY_LABELS.CAT1,
  2: REF_CATEGORY_LABELS.CAT2,
  3: REF_CATEGORY_LABELS.CAT3,
  4: REF_CATEGORY_LABELS.CAT4,
};

export const MAINTENANCE_BY_CATEGORY: Record<ProjectCategory, MaintenanceCat> = {
  0: CATEGORY_MAINTENANCE.CAT0,
  1: CATEGORY_MAINTENANCE.CAT1,
  2: CATEGORY_MAINTENANCE.CAT2,
  3: CATEGORY_MAINTENANCE.CAT3,
  4: CATEGORY_MAINTENANCE.CAT4,
};

export const MAINTENANCE_LABELS: Record<MaintenanceCat, string> =
  REF_MAINTENANCE_LABELS;

export const MAINTENANCE_PRICES: Record<MaintenanceCat, string> =
  REF_MAINTENANCE_PRICES;

// ══════════════════════════════════════════════════════════════════════
// BASE PRICES (v2 — via famille × coefficient stack)
// ══════════════════════════════════════════════════════════════════════

function computeBasePrice(family: string, complexityFactor: number): PriceRange {
  const base = FAMILY_BASE_PRICING[family as keyof typeof FAMILY_BASE_PRICING];
  if (!base) return { priceFrom: 1800 };
  return { priceFrom: Math.round(base.from * complexityFactor) };
}

export const BASE_PRICES: Record<OfferCategory, Partial<Record<Stack, PriceRange>>> = {
  VITRINE_BLOG: {
    WORDPRESS: computeBasePrice("CMS_ADVANCED", 1.0),
    ASTRO: computeBasePrice("SSG_JAMSTACK", 1.2),
    NEXTJS: computeBasePrice("SSR_FRAMEWORK", 1.3),
    NUXT: computeBasePrice("SSR_FRAMEWORK", 1.3),
    WORDPRESS_HEADLESS: computeBasePrice("HEADLESS_INTEGRATION", 1.6),
  },
  ECOMMERCE: {
    WOOCOMMERCE: computeBasePrice("ECOMMERCE_STANDARD", 1.0),
    WOOCOMMERCE_HEADLESS: computeBasePrice("ECOMMERCE_HEADLESS", 1.8),
    ASTRO: computeBasePrice("ECOMMERCE_HEADLESS", 1.2),
    NEXTJS: computeBasePrice("ECOMMERCE_HEADLESS", 1.3),
    NUXT: computeBasePrice("ECOMMERCE_HEADLESS", 1.3),
  },
  APP_CUSTOM: {
    NEXTJS: computeBasePrice("APP_CUSTOM", 1.3),
    NUXT: computeBasePrice("APP_CUSTOM", 1.3),
    ASTRO: computeBasePrice("APP_CUSTOM", 1.2),
  },
};

// ══════════════════════════════════════════════════════════════════════
// LABELS & STACKS
// ══════════════════════════════════════════════════════════════════════

export const OFFER_CATEGORY_ORDER: OfferCategory[] = [
  "VITRINE_BLOG",
  "ECOMMERCE",
  "APP_CUSTOM",
];

export const OFFER_CATEGORY_LABELS: Record<OfferCategory, string> = {
  VITRINE_BLOG: "Vitrine / Blog",
  ECOMMERCE: "E-commerce",
  APP_CUSTOM: "App custom",
};

export const STACK_LABELS: Record<Stack, string> = {
  WORDPRESS: "WordPress",
  NEXTJS: "Next.js",
  NUXT: "Nuxt",
  ASTRO: "Astro",
  WORDPRESS_HEADLESS: "WordPress headless",
  WOOCOMMERCE: "WooCommerce",
  WOOCOMMERCE_HEADLESS: "WooCommerce headless",
};

export const MODULE_CATEGORY_LABELS: Record<ModuleCategory, string> = {
  ux: "UX",
  seo: "SEO",
  commerce: "Commerce",
  marketing: "Marketing",
  security: "Securite",
  ops: "Ops",
  architecture: "Architecture",
  performance: "Performance",
  data: "Data",
  metier: "Metier",
};

export const STACK_PRICING_NOTES: Record<
  Stack,
  { label: string; summary: string; details: string[] }
> = {
  WORDPRESS: {
    label: "WordPress",
    summary: "Implementation basee sur plugins + configuration.",
    details: [
      "Plugins disponibles (gratuits/premium)",
      "Configuration et integration rapide",
      "Meme module = cout reference",
    ],
  },
  WOOCOMMERCE: {
    label: "WooCommerce",
    summary: "E-commerce WordPress avec plugins specialises.",
    details: [
      "Plugins Woo disponibles",
      "Parametrage checkout/produits",
      "Cout proche de WordPress",
    ],
  },
  ASTRO: {
    label: "Astro",
    summary: "Dev custom mais stack plus legere (SSG).",
    details: [
      "Developpement custom",
      "Moins de complexite runtime",
      "Surcout modere",
    ],
  },
  NEXTJS: {
    label: "Next.js",
    summary: "Dev custom complet (routing, SEO, composants).",
    details: [
      "Pas de plugins equivalents",
      "Developpement front/back custom",
      "Surcout notable",
    ],
  },
  NUXT: {
    label: "Nuxt",
    summary: "Dev custom complet (routing, SEO, composants).",
    details: [
      "Pas de plugins equivalents",
      "Developpement front/back custom",
      "Surcout notable",
    ],
  },
  WORDPRESS_HEADLESS: {
    label: "WordPress headless",
    summary: "Coordination API WP + front JS.",
    details: [
      "Decouplage front/back",
      "API, auth, CORS, cache",
      "Surcout coordination",
    ],
  },
  WOOCOMMERCE_HEADLESS: {
    label: "WooCommerce headless",
    summary: "E-commerce headless, logique checkout custom.",
    details: [
      "Checkout et panier custom",
      "API Woo + front JS",
      "Surcout le plus eleve",
    ],
  },
};

export const OFFER_CATEGORY_STACKS: Record<OfferCategory, Stack[]> = {
  VITRINE_BLOG: [
    "WORDPRESS",
    "ASTRO",
    "NEXTJS",
    "NUXT",
    "WORDPRESS_HEADLESS",
  ],
  ECOMMERCE: [
    "WOOCOMMERCE",
    "WOOCOMMERCE_HEADLESS",
    "ASTRO",
    "NEXTJS",
    "NUXT",
  ],
  APP_CUSTOM: ["NEXTJS", "NUXT", "ASTRO"],
};

export const DEFAULT_STACK_BY_OFFER: Record<OfferCategory, Stack> = {
  VITRINE_BLOG: "WORDPRESS",
  ECOMMERCE: "WOOCOMMERCE",
  APP_CUSTOM: "NEXTJS",
};

// ══════════════════════════════════════════════════════════════════════
// DEPLOYMENT & DISCLAIMERS
// ══════════════════════════════════════════════════════════════════════

export type DeploymentFee = {
  id: string;
  label: string;
  price: PriceRange;
};

export const DEPLOYMENT_FEES: DeploymentFee[] = [
  {
    id: "shared",
    label: "Mutualise (o2switch, OVH...)",
    price: { priceFrom: DEPLOY_FEES.SHARED_HOSTING.cost },
  },
  {
    id: "vercel",
    label: "Vercel / Cloud",
    price: { priceFrom: DEPLOY_FEES.VERCEL.cost },
  },
  {
    id: "docker_vps",
    label: "Docker / VPS",
    price: { priceFrom: DEPLOY_FEES.DOCKER.cost },
  },
  ...DEPLOY_FEES_HEADLESS.map((f) => ({
    id: f.id,
    label: f.label,
    price: { priceFrom: f.cost } as PriceRange,
  })),
];

export const DEPLOYMENT_NOTES: string[] = [
  "En Docker/VPS, deux environnements sont maintenus: dev et prod-like.",
];

export const SOCLE_TECHNIQUE_ITEMS: string[] = [
  "Securite standard",
  "RGPD & consentement",
  "Performance standard",
  "Structure de base (pages, SEO de base)",
];

export const PRICE_DRIVERS: string[] = [
  "Niveau de personnalisation (design, UX, branding)",
  "Volume et qualite des contenus a integrer (textes, produits, medias)",
  "Complexite SEO (structure, pages, migration)",
  "Performances attendues (LCP, TTFB, cache, CDN)",
  "Integrations externes (CRM, ERP, paiement, logistique)",
  "Migrations (site existant, donnees, SEO)",
  "Multi-langue / multi-pays / multi-devises",
  "Contraintes metier et reglementaires (fiscalite, securite, RGPD, accessibilite)",
];

export const PRICING_DISCLAIMER =
  "Prix deterministe: base + modules + mise en production.";

export const PRICING_CTA = {
  label: "Creer un devis",
  href: "/dashboard/projects/new",
};

// ══════════════════════════════════════════════════════════════════════
// STACK COEFFICIENTS (v2 — harmonisés)
// ══════════════════════════════════════════════════════════════════════

const ALL_STACKS: Stack[] = [
  "WORDPRESS",
  "NEXTJS",
  "NUXT",
  "ASTRO",
  "WORDPRESS_HEADLESS",
  "WOOCOMMERCE",
  "WOOCOMMERCE_HEADLESS",
];

const STACK_PRICE_MULTIPLIER: Record<Stack, number> = {
  WORDPRESS: 1,
  WOOCOMMERCE: 1,
  ASTRO: 1.2,
  NEXTJS: 1.3,
  NUXT: 1.3,
  WORDPRESS_HEADLESS: 1.6,
  WOOCOMMERCE_HEADLESS: 1.8,
};

const STACK_COMPLEXITY_MULTIPLIER: Record<Stack, number> = {
  ...STACK_PRICE_MULTIPLIER,
};

function multiplyPriceRange(
  range: PriceRange,
  multiplier: number,
): PriceRange {
  const next: PriceRange = {
    priceFrom: Math.round(range.priceFrom * multiplier),
  };
  if (range.priceTo != null) {
    next.priceTo = Math.round(range.priceTo * multiplier);
  }
  return next;
}

function buildByStackPricing(base: PriceRange): Record<Stack, PriceRange> {
  return ALL_STACKS.reduce<Record<Stack, PriceRange>>(
    (acc, stack) => {
      acc[stack] = multiplyPriceRange(base, STACK_PRICE_MULTIPLIER[stack]);
      return acc;
    },
    {} as Record<Stack, PriceRange>,
  );
}

function buildByStackComplexity(base: number): Record<Stack, number> {
  return ALL_STACKS.reduce<Record<Stack, number>>(
    (acc, stack) => {
      const weight = base * STACK_COMPLEXITY_MULTIPLIER[stack];
      acc[stack] = Number(weight.toFixed(2));
      return acc;
    },
    {} as Record<Stack, number>,
  );
}

// ══════════════════════════════════════════════════════════════════════
// MODULES (générés depuis le référentiel)
// ══════════════════════════════════════════════════════════════════════

/** Mapping module group → module categories */
const GROUP_TO_CATEGORIES: Record<string, ModuleCategory[]> = {
  ecommerce: ["commerce"],
  contenu: ["marketing"],
  technique: ["ops"],
  metier: ["metier"],
  premium: ["architecture", "performance"],
};

function refModuleToOfferModule(mod: RefModuleDef): ModuleDef {
  const categories: ModuleCategory[] =
    GROUP_TO_CATEGORIES[mod.group] ?? ["ops"];

  const compatibleWith: Stack[] | "ALL" =
    mod.group === "ecommerce"
      ? ["WOOCOMMERCE", "WOOCOMMERCE_HEADLESS", "ASTRO", "NEXTJS", "NUXT"]
      : "ALL";

  const subscriptions = mod.subscriptionCats?.map((t) => ({
    id: t.id,
    label: t.name,
    priceMonthly: t.priceMonthly,
  }));

  const basePricing: PriceRange = { priceFrom: mod.priceSetup };
  if (mod.priceSetupMax != null) {
    basePricing.priceTo = mod.priceSetupMax;
  }

  const moduleDef: ModuleDef = {
    id: mod.id,
    label: mod.name,
    description: mod.description,
    details: mod.details,
    categories,
    compatibleWith,
    pricing: {
      kind: "byStack",
      prices: buildByStackPricing(basePricing),
    },
    complexity: {
      byStack: buildByStackComplexity(mod.jsMultiplier),
    },
  };

  if (subscriptions) {
    moduleDef.subscriptions = subscriptions;
  }

  return moduleDef;
}

export const MODULES: ModuleDef[] = MODULE_CATALOG.map(refModuleToOfferModule);

// ══════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════

export function getBasePrice(
  projectType: OfferCategory,
  stack: Stack,
): PriceRange | null {
  return BASE_PRICES[projectType]?.[stack] ?? null;
}

export function getModuleById(id: ModuleId): ModuleDef {
  const mod = MODULES.find((m) => m.id === id);
  if (!mod) throw new Error(`Unknown module: ${id}`);
  return mod;
}

const OFFER_TO_QUALIFICATION_TYPE: Record<OfferCategory, ReferentialProjectType> = {
  VITRINE_BLOG: "VITRINE",
  ECOMMERCE: "ECOM",
  APP_CUSTOM: "APP",
};

function resolveQualificationStack(
  stack: Stack,
): { techStack: ReferentialTechStack; wpHeadless: boolean } {
  if (stack === "WORDPRESS_HEADLESS") {
    return { techStack: "WORDPRESS", wpHeadless: true };
  }
  if (stack === "WOOCOMMERCE_HEADLESS") {
    return { techStack: "WORDPRESS", wpHeadless: true };
  }
  if (stack === "WOOCOMMERCE") {
    return { techStack: "WORDPRESS", wpHeadless: false };
  }
  return { techStack: stack as ReferentialTechStack, wpHeadless: false };
}

function computeCategoryWithQualification(
  projectType: OfferCategory,
  stack: Stack,
  moduleIds: ModuleId[],
): ProjectCategory {
  const mappedType = OFFER_TO_QUALIFICATION_TYPE[projectType];
  const { techStack, wpHeadless } = resolveQualificationStack(stack);
  const result = qualifyProject({
    projectType: mappedType,
    techStack,
    wpHeadless,
    deployTarget: "DOCKER",
    billingMode: "SOLO",
    selectedModuleIds: moduleIds,
    catSelections: {},
  });
  return categoryIndex(result.finalCategory) as ProjectCategory;
}

export function computeCategoryBase(projectType: OfferCategory): ProjectCategory {
  const defaultStack = DEFAULT_STACK_BY_OFFER[projectType];
  return computeCategoryWithQualification(projectType, defaultStack, []);
}

export function computeCategoryEstimated(
  projectType: OfferCategory,
  stack: Stack,
  moduleIds: ModuleId[],
): ProjectCategory {
  const uniqueIds = Array.from(new Set(moduleIds));
  const compatibleIds = uniqueIds.filter((id) =>
    isModuleCompatible(id, stack, projectType),
  );
  return computeCategoryWithQualification(projectType, stack, compatibleIds);
}

export function getOfferCategory(
  projectType: OfferCategory,
  stack: Stack,
  moduleIds: ModuleId[],
): ProjectCategory {
  return computeCategoryEstimated(projectType, stack, moduleIds);
}

function sumPriceRanges(ranges: PriceRange[]): {
  totalFrom: number;
  totalTo: number;
} {
  return ranges.reduce(
    (acc, range) => {
      acc.totalFrom += range.priceFrom;
      acc.totalTo += range.priceTo ?? range.priceFrom;
      return acc;
    },
    { totalFrom: 0, totalTo: 0 },
  );
}

export function computeEstimate(
  projectType: OfferCategory,
  stack: Stack,
  moduleIds: ModuleId[],
  deploymentFeeId: string,
): {
  basePrice: PriceRange | null;
  modules: Array<{ id: ModuleId; price: PriceRange }>;
  modulesTotal: PriceRange;
  deploymentFee: PriceRange | null;
  total: PriceRange | null;
  catBase: ProjectCategory;
  catEstimated: ProjectCategory;
  isRequalified: boolean;
} {
  const basePrice = getBasePrice(projectType, stack);
  const mandatoryIds = getMandatoryModules(projectType, stack);
  const includedIds = getIncludedModules(projectType, stack);
  const selectedIds = Array.from(
    new Set([...mandatoryIds, ...moduleIds]),
  ).filter((id) => isModuleCompatible(id, stack, projectType));

  const moduleEntries = selectedIds
    .filter((id) => !includedIds.includes(id))
    .map((id) => ({
      id,
      price: getModulePriceForStack(id, stack),
    }));

  const modulesTotal = sumPriceRanges(
    moduleEntries.map((entry) => entry.price),
  );
  const deploymentFee =
    DEPLOYMENT_FEES.find((fee) => fee.id === deploymentFeeId)?.price ?? null;

  const total =
    basePrice && deploymentFee
      ? {
          priceFrom:
            basePrice.priceFrom +
            modulesTotal.totalFrom +
            deploymentFee.priceFrom,
          priceTo:
            (basePrice.priceTo ?? basePrice.priceFrom) +
            modulesTotal.totalTo +
            (deploymentFee.priceTo ?? deploymentFee.priceFrom),
        }
      : null;

  const catBase = computeCategoryBase(projectType);
  const catEstimated = computeCategoryEstimated(projectType, stack, [
    ...selectedIds,
    ...includedIds,
  ]);

  return {
    basePrice,
    modules: moduleEntries,
    modulesTotal: {
      priceFrom: modulesTotal.totalFrom,
      priceTo: modulesTotal.totalTo,
    },
    deploymentFee,
    total,
    catBase,
    catEstimated,
    isRequalified: catEstimated > catBase,
  };
}

export function getTotalEstimate(
  projectType: OfferCategory,
  stack: Stack,
  moduleIds: ModuleId[],
  deploymentFeeId: string,
) {
  return computeEstimate(projectType, stack, moduleIds, deploymentFeeId);
}

export function getIncludedModules(
  projectType: OfferCategory,
  stack: Stack,
): ModuleId[] {
  return MODULES.filter((mod) =>
    mod.includedByDefault
      ? isModuleCompatible(mod.id, stack, projectType)
      : false,
  ).map((mod) => mod.id);
}

export function getMandatoryModules(
  projectType: OfferCategory,
  stack: Stack,
): ModuleId[] {
  return MODULES.filter((mod) => {
    const mandatory = mod.mandatoryFor?.[projectType] ?? [];
    return mandatory.includes(stack);
  }).map((mod) => mod.id);
}

export function isModuleCompatible(
  moduleId: ModuleId,
  stack: Stack,
  projectType?: OfferCategory,
): boolean {
  const mod = MODULES.find((m) => m.id === moduleId);
  if (!mod) return false;
  const compatible =
    mod.compatibleWith === "ALL" || mod.compatibleWith.includes(stack);
  if (!compatible) return false;

  const allowsCommerce =
    !projectType || projectType === "ECOMMERCE" || projectType === "VITRINE_BLOG";

  if (!allowsCommerce && mod.categories.includes("commerce")) {
    return false;
  }

  return true;
}

export function getCompatibleModules(
  projectType: OfferCategory,
  stack: Stack,
): ModuleDef[] {
  return MODULES.filter((module) =>
    isModuleCompatible(module.id, stack, projectType),
  );
}

export function isModuleMandatory(
  module: ModuleDef,
  projectType: OfferCategory,
  stack: Stack,
): boolean {
  if (!module.mandatoryFor) return false;
  const stacks = module.mandatoryFor[projectType];
  if (!stacks) return false;
  return stacks.includes(stack);
}

export function getModulePriceForStack(
  moduleId: ModuleId,
  stack: Stack,
): PriceRange;
export function getModulePriceForStack(
  moduleId: ModuleId,
  _projectType: OfferCategory,
  stack: Stack,
): PriceRange;
export function getModulePriceForStack(
  moduleId: ModuleId,
  stackOrProjectType: OfferCategory | Stack,
  maybeStack?: Stack,
): PriceRange {
  const stack = maybeStack ?? (stackOrProjectType as Stack);
  const mod = MODULES.find((m) => m.id === moduleId);
  if (!mod) throw new Error(`Unknown module: ${moduleId}`);
  return mod.pricing.prices[stack];
}

export function formatPriceEUR(value: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
