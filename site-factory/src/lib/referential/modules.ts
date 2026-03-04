import type { Category } from "./maintenance-cat";

export type ModuleGroup = "ecommerce" | "contenu" | "technique" | "metier" | "premium";

export interface ModuleSetupLevel {
  id: string;
  name: string;
  description: string;
  priceSetup: number;
  requalifiesTo?: Category;
}

export interface ModuleSubscriptionLevel {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
}

export interface ModuleDef {
  id: string;
  name: string;
  description: string;
  details: string[];
  minCategory: Category;
  requalifiesTo: Category | null;
  isStructurant: boolean;
  priceSetup: number;
  priceSetupMax: number | null;
  jsMultiplier: number;
  priceMonthly: number;
  splitPrestataireSetup: number;
  splitPrestataireMonthly: number;
  group: ModuleGroup;
  icon: string;
  wpNote: string;
  setupCats?: ModuleSetupLevel[];
  subscriptionCats?: ModuleSubscriptionLevel[];
}

export const MODULE_CATALOG: ModuleDef[] = [
  {
    id: "module.B2B_COMMERCE",
    name: "B2B Commerce",
    description: "Règles B2B, comptes pro et workflow de commande.",
    details: ["Tarifs pro", "Process commande B2B", "Comptes entreprises"],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 1900,
    priceSetupMax: 2900,
    jsMultiplier: 1.2,
    priceMonthly: 39,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 70,
    group: "ecommerce",
    icon: "ShoppingCart",
    wpNote: "Module métier spécifique",
  },
  {
    id: "module.MARKETPLACE",
    name: "Marketplace",
    description: "Gestion vendeurs, commissions et catalogues multi-acteurs.",
    details: ["Onboarding vendeurs", "Commissions", "Flux marketplace"],
    minCategory: "CAT3",
    requalifiesTo: "CAT3",
    isStructurant: true,
    priceSetup: 2900,
    priceSetupMax: 4900,
    jsMultiplier: 1.2,
    priceMonthly: 79,
    splitPrestataireSetup: 70,
    splitPrestataireMonthly: 70,
    group: "ecommerce",
    icon: "Store",
    wpNote: "Architecture marketplace avancée",
  },
  {
    id: "module.LOGISTICS_ORCHESTRATION",
    name: "Logistics orchestration",
    description: "Orchestration transporteurs, préparation et fulfillment.",
    details: ["Règles de livraison", "Orchestration transporteurs", "Suivi flux"],
    minCategory: "CAT3",
    requalifiesTo: "CAT3",
    isStructurant: true,
    priceSetup: 2600,
    priceSetupMax: 4300,
    jsMultiplier: 1.2,
    priceMonthly: 59,
    splitPrestataireSetup: 70,
    splitPrestataireMonthly: 70,
    group: "ecommerce",
    icon: "Truck",
    wpNote: "Intégration logistique multi-canaux",
  },
  {
    id: "module.ADVANCED_PRICING",
    name: "Advanced pricing",
    description: "Tarification conditionnelle et règles de pricing avancées.",
    details: ["Règles de prix", "Segmentation", "Calculs avancés"],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 1500,
    priceSetupMax: 2600,
    jsMultiplier: 1.1,
    priceMonthly: 29,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 70,
    group: "metier",
    icon: "Calculator",
    wpNote: "Règles métier custom",
  },
  {
    id: "module.MARKETING_AUTOMATION",
    name: "Marketing automation",
    description: "Scénarios marketing automatisés et segmentation.",
    details: ["Automations", "Segmentation", "Tracking campagnes"],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 1300,
    priceSetupMax: 2400,
    jsMultiplier: 1.1,
    priceMonthly: 29,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 70,
    group: "contenu",
    icon: "Target",
    wpNote: "Intégration CRM/marketing",
    setupCats: [
      {
        id: "automation-standard",
        name: "Standard",
        description: "Workflows de base et segmentation simple",
        priceSetup: 1300,
        requalifiesTo: "CAT2",
      },
      {
        id: "automation-avance",
        name: "Avancé",
        description: "Scénarios cross-canal et scoring",
        priceSetup: 2400,
        requalifiesTo: "CAT3",
      },
    ],
    subscriptionCats: [
      {
        id: "automation-starter",
        name: "Starter",
        description: "Scénarios basiques",
        priceMonthly: 29,
      },
      {
        id: "automation-business",
        name: "Business",
        description: "Segmentation enrichie",
        priceMonthly: 79,
      },
      {
        id: "automation-premium",
        name: "Premium",
        description: "Orchestration multi-journeys",
        priceMonthly: 160,
      },
    ],
  },
  {
    id: "module.PRODUCT_RECOMMENDATION",
    name: "Product recommendation",
    description: "Recommandations produits personnalisées.",
    details: ["Cross-sell", "Upsell", "Recommandation contextuelle"],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 1700,
    priceSetupMax: 2900,
    jsMultiplier: 1.1,
    priceMonthly: 35,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 70,
    group: "ecommerce",
    icon: "Sparkles",
    wpNote: "Moteur de reco produit",
  },
  {
    id: "module.BUSINESS_ANALYTICS",
    name: "Business analytics",
    description: "Tableaux de bord et indicateurs business avancés.",
    details: ["KPIs", "Dashboards", "Exports"],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 1600,
    priceSetupMax: 2800,
    jsMultiplier: 1.1,
    priceMonthly: 39,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 70,
    group: "metier",
    icon: "BarChart3",
    wpNote: "Reporting métier",
  },
  {
    id: "module.ERP_INTEGRATIONS",
    name: "ERP integrations",
    description: "Synchronisation ERP/CRM et intégrations SI.",
    details: ["Connecteurs ERP", "Synchronisation", "Résilience des flux"],
    minCategory: "CAT3",
    requalifiesTo: "CAT3",
    isStructurant: true,
    priceSetup: 2800,
    priceSetupMax: 5200,
    jsMultiplier: 1.1,
    priceMonthly: 89,
    splitPrestataireSetup: 70,
    splitPrestataireMonthly: 70,
    group: "technique",
    icon: "Plug",
    wpNote: "Intégrations SI avancées",
  },
  {
    id: "module.MULTI_CATALOG",
    name: "Multi catalog",
    description: "Gestion de catalogues multiples et variantes.",
    details: ["Catalogues distincts", "Règles d’affichage", "Pilotage catalogue"],
    minCategory: "CAT3",
    requalifiesTo: "CAT3",
    isStructurant: true,
    priceSetup: 2300,
    priceSetupMax: 4100,
    jsMultiplier: 1.1,
    priceMonthly: 49,
    splitPrestataireSetup: 70,
    splitPrestataireMonthly: 70,
    group: "ecommerce",
    icon: "Layers",
    wpNote: "Structuration multi-catalogues",
  },
  {
    id: "module.MULTI_STORE_ORCHESTRATION",
    name: "Multi-store orchestration",
    description: "Pilotage de plusieurs boutiques et opérations centralisées.",
    details: ["Multi-boutiques", "Opérations centralisées", "Synchronisation"],
    minCategory: "CAT3",
    requalifiesTo: "CAT3",
    isStructurant: true,
    priceSetup: 2400,
    priceSetupMax: 4300,
    jsMultiplier: 1.1,
    priceMonthly: 59,
    splitPrestataireSetup: 70,
    splitPrestataireMonthly: 70,
    group: "ecommerce",
    icon: "Layers3",
    wpNote: "Orchestration retail multi-store",
  },
  {
    id: "module.CMS_AUGMENTATION",
    name: "CMS augmentation",
    description: "Extension avancée de l’expérience éditoriale CMS.",
    details: ["Blocs avancés", "Workflows éditoriaux", "Optimisations contenu"],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 1100,
    priceSetupMax: 2100,
    jsMultiplier: 1.0,
    priceMonthly: 19,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 70,
    group: "contenu",
    icon: "BookOpen",
    wpNote: "Augmentation CMS orientée contenu",
  },
  {
    id: "module.IDENTITY_SSO",
    name: "Identity and SSO",
    description: "Gestion d’identité et authentification SSO.",
    details: ["SSO", "Gestion rôles", "Sécurisation accès"],
    minCategory: "CAT3",
    requalifiesTo: "CAT3",
    isStructurant: true,
    priceSetup: 1900,
    priceSetupMax: 3600,
    jsMultiplier: 1.1,
    priceMonthly: 29,
    splitPrestataireSetup: 70,
    splitPrestataireMonthly: 70,
    group: "technique",
    icon: "Shield",
    wpNote: "IAM / SSO entreprise",
  },
];

export const MODULE_IDS = MODULE_CATALOG.map((m) => m.id);

export const MODULE_BY_ID: Record<string, ModuleDef> = Object.fromEntries(
  MODULE_CATALOG.map((m) => [m.id, m]),
);

export const MODULE_GROUPS: Record<ModuleGroup, string> = {
  ecommerce: "E-Commerce",
  contenu: "Contenu & Marketing",
  technique: "Technique",
  metier: "Métier / Réglementé",
  premium: "Premium",
};

export function getModuleById(id: string): ModuleDef | null {
  return MODULE_BY_ID[id] ?? null;
}

export function getModulesByGroup(): Record<ModuleGroup, ModuleDef[]> {
  const groups: Record<ModuleGroup, ModuleDef[]> = {
    ecommerce: [],
    contenu: [],
    technique: [],
    metier: [],
    premium: [],
  };
  for (const mod of MODULE_CATALOG) {
    groups[mod.group].push(mod);
  }
  return groups;
}

export function getStructurantModules(): ModuleDef[] {
  return MODULE_CATALOG.filter((m) => m.isStructurant);
}

export function normalizeModuleId(id: string): string | null {
  return MODULE_BY_ID[id] ? id : null;
}

export function normalizeModuleIds(ids: string[]): string[] {
  const normalized: string[] = [];
  for (const id of ids) {
    const next = normalizeModuleId(id);
    if (next && !normalized.includes(next)) {
      normalized.push(next);
    }
  }
  return normalized;
}

export function normalizeCanonicalModuleIds(ids: string[]): string[] {
  return normalizeModuleIds(ids);
}
