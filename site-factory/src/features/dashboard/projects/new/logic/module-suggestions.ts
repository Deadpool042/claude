import { MODULE_CATALOG } from "@/lib/referential";

export type SuggestionProjectType = "BLOG" | "VITRINE" | "ECOM" | "APP";
export type SuggestionPrimaryGoal =
  | "PRESENCE"
  | "GENERATE_LEADS"
  | "PUBLISH_CONTENT"
  | "SELL_ONLINE"
  | "DIGITIZE_PROCESS"
  | "TO_CONFIRM";
export type SuggestionAmbition =
  | "KEEP_SIMPLE"
  | "GROW_FEATURES"
  | "SCALE_TRAFFIC"
  | "PREPARE_PLATFORM"
  | "TO_CONFIRM";
export type SuggestionBudget =
  | "UNDER_1200"
  | "UP_TO_1800"
  | "UP_TO_3500"
  | "UP_TO_7000"
  | "OVER_7000"
  | "TO_CONFIRM";

export type SuggestionCommerceModel = "SAAS" | "SELF_HOSTED" | "HEADLESS";
export type SuggestionTrafficLevel = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
export type SuggestionDataSensitivity = "STANDARD" | "SENSITIVE" | "REGULATED";
export type SuggestionScalability = "FIXED" | "GROWING" | "ELASTIC";

export interface SuggestModulesInput {
  projectType: SuggestionProjectType | null;
  primaryGoal: SuggestionPrimaryGoal;
  ambitionLevel: SuggestionAmbition;
  budgetBand: SuggestionBudget;
  needsEditing: boolean;
  editingMode: "BACKOFFICE" | "GIT_MDX" | "TO_CONFIRM";
  commerceModel: SuggestionCommerceModel;
  trafficLevel: SuggestionTrafficLevel;
  dataSensitivity: SuggestionDataSensitivity;
  scalabilityLevel: SuggestionScalability;
}

export interface ModuleRecommendation {
  id: string;
  score: number;
  estimatedSetup: number;
  reasons: string[];
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function suggestModuleRecommendationsFromDiscovery(
  input: SuggestModulesInput
): ModuleRecommendation[] {
  const {
    projectType,
    primaryGoal,
    ambitionLevel,
    budgetBand,
    needsEditing,
    editingMode,
    commerceModel,
    trafficLevel,
    dataSensitivity,
    scalabilityLevel,
  } = input;

  if (!projectType) return [];

  const scoreById = new Map<string, number>();
  const reasonById = new Map<string, Set<string>>();

  const add = (id: string, score: number, reason?: string) => {
    scoreById.set(id, (scoreById.get(id) ?? 0) + score);
    if (!reason) return;
    const reasons = reasonById.get(id) ?? new Set<string>();
    reasons.add(reason);
    reasonById.set(id, reasons);
  };

  const isLowTraffic = trafficLevel === "LOW";
  const needsHighScale = scalabilityLevel === "ELASTIC";
  const isStrictData = dataSensitivity === "REGULATED";

  const nativeModules = new Set<string>();
  if (projectType === "ECOM") {
    if (commerceModel === "SELF_HOSTED") {
      nativeModules.add("module.B2B_COMMERCE");
      nativeModules.add("module.LOGISTICS_ORCHESTRATION");
    }
    if (commerceModel === "SAAS") {
      nativeModules.add("module.B2B_COMMERCE");
      nativeModules.add("module.LOGISTICS_ORCHESTRATION");
      nativeModules.add("module.IDENTITY_SSO");
      nativeModules.add("module.BUSINESS_ANALYTICS");
    }
  }

  if (projectType === "VITRINE" || projectType === "BLOG") {
    add("module.CMS_AUGMENTATION", 30, "Socle utile pour visibilité vitrine/blog");
    add("module.MARKETING_AUTOMATION", 25, "Socle utile pour visibilité vitrine/blog");
  }
  if (projectType === "ECOM") {
    add("module.B2B_COMMERCE", 28, "Aligné avec un parcours e-commerce");
    add("module.LOGISTICS_ORCHESTRATION", 26, "Aligné avec un parcours e-commerce");
    add("module.PRODUCT_RECOMMENDATION", 22, "Aligné avec un parcours e-commerce");
  }
  if (projectType === "APP") {
    add("module.BUSINESS_ANALYTICS", 28, "Aligné avec un besoin applicatif métier");
    add("module.ERP_INTEGRATIONS", 24, "Aligné avec un besoin applicatif métier");
  }

  switch (primaryGoal) {
    case "GENERATE_LEADS":
      add("module.PRODUCT_RECOMMENDATION", 35, "Contribue à l’objectif de génération de leads");
      add("module.MARKETING_AUTOMATION", 30, "Contribue à l’objectif de génération de leads");
      add("module.CMS_AUGMENTATION", 24, "Contribue à l’objectif de génération de leads");
      break;
    case "PUBLISH_CONTENT":
      add("module.CMS_AUGMENTATION", 34, "Contribue à l’objectif de publication");
      add("module.MULTI_CATALOG", 22, "Contribue à l’objectif de publication");
      add("module.MARKETING_AUTOMATION", 26, "Contribue à l’objectif de publication");
      break;
    case "SELL_ONLINE":
      add("module.B2B_COMMERCE", 35, "Contribue à l’objectif de vente en ligne");
      add("module.LOGISTICS_ORCHESTRATION", 32, "Contribue à l’objectif de vente en ligne");
      add("module.IDENTITY_SSO", 22, "Contribue à l’objectif de vente en ligne");
      break;
    case "DIGITIZE_PROCESS":
      add("module.BUSINESS_ANALYTICS", 34, "Contribue à la digitalisation des processus");
      add("module.ERP_INTEGRATIONS", 30, "Contribue à la digitalisation des processus");
      add("module.ADVANCED_PRICING", 24, "Contribue à la digitalisation des processus");
      break;
    case "PRESENCE":
      add("module.CMS_AUGMENTATION", 26, "Contribue à l’objectif de présence en ligne");
      add("module.MARKETING_AUTOMATION", 22, "Contribue à l’objectif de présence en ligne");
      break;
    default:
      break;
  }

  switch (ambitionLevel) {
    case "GROW_FEATURES":
      add("module.ERP_INTEGRATIONS", 22, "Aligné avec l’ambition d’évolution fonctionnelle");
      add("module.BUSINESS_ANALYTICS", 24, "Aligné avec l’ambition d’évolution fonctionnelle");
      break;
    case "SCALE_TRAFFIC":
      add("module.MULTI_STORE_ORCHESTRATION", 34, "Aligné avec l’ambition de montée en trafic");
      add("module.MARKETING_AUTOMATION", 24, "Aligné avec l’ambition de montée en trafic");
      add("module.BUSINESS_ANALYTICS", 22, "Aligné avec l’ambition de montée en trafic");
      break;
    case "PREPARE_PLATFORM":
      add("module.MARKETPLACE", 34, "Aligné avec une ambition plateforme");
      add("module.ERP_INTEGRATIONS", 26, "Aligné avec une ambition plateforme");
      add("module.IDENTITY_SSO", 16, "Aligné avec une ambition plateforme");
      break;
    default:
      break;
  }

  if (needsEditing && editingMode === "GIT_MDX") {
    add("module.CMS_AUGMENTATION", 18, "Compatible avec un mode éditorial Git/MDX");
    add("module.MULTI_CATALOG", 14, "Compatible avec un mode éditorial Git/MDX");
  }

  if (isLowTraffic) {
    add("module.MULTI_STORE_ORCHESTRATION", -20);
  }
  if (!needsHighScale) {
    add("module.MARKETPLACE", -18);
  }
  if (isStrictData) {
    add("module.MARKETING_AUTOMATION", -15);
  }

  for (const moduleId of nativeModules) {
    add(moduleId, -100);
  }

  const sortedCandidates = Array.from(scoreById.entries())
    .filter(([, score]) => score > 0)
    .sort((left, right) => right[1] - left[1])
    .map(([id]) => id);

  const deduped = unique(sortedCandidates);

  const maxByBudget: Record<SuggestionBudget, number> = {
    UNDER_1200: 1,
    UP_TO_1800: 2,
    UP_TO_3500: 3,
    UP_TO_7000: 4,
    OVER_7000: 6,
    TO_CONFIRM: 4,
  };

  const moduleBudgetCap: Record<SuggestionBudget, number> = {
    UNDER_1200: 300,
    UP_TO_1800: 600,
    UP_TO_3500: 1200,
    UP_TO_7000: 2200,
    OVER_7000: 4200,
    TO_CONFIRM: 1800,
  };

  const maxSuggestions = maxByBudget[budgetBand];
  const cap = moduleBudgetCap[budgetBand];

  const selected: string[] = [];
  let totalSetup = 0;

  const recommendations: ModuleRecommendation[] = [];

  for (const id of deduped) {
    if (selected.length >= maxSuggestions) break;

    const moduleDef = MODULE_CATALOG.find((module) => module.id === id);
    if (!moduleDef) continue;

    const moduleSetup = moduleDef.priceSetup;
    if (selected.length > 0 && totalSetup + moduleSetup > cap) {
      continue;
    }

    selected.push(id);
    totalSetup += moduleSetup;
    const baseReasons = Array.from(reasonById.get(id) ?? []);
    baseReasons.push(`Compatible avec l’enveloppe modules (${moduleSetup} € setup)`);
    recommendations.push({
      id,
      score: scoreById.get(id) ?? 0,
      estimatedSetup: moduleSetup,
      reasons: unique(baseReasons),
    });
  }

  if (selected.length === 0 && deduped.length > 0) {
    const fallbackId = deduped[0];
    const fallbackModule = MODULE_CATALOG.find((module) => module.id === fallbackId);
    if (fallbackModule) {
      recommendations.push({
        id: fallbackId,
        score: scoreById.get(fallbackId) ?? 0,
        estimatedSetup: fallbackModule.priceSetup,
        reasons: [
          ...Array.from(reasonById.get(fallbackId) ?? []),
          "Meilleure option disponible, budget modules à confirmer",
        ],
      });
    }
  }

  return recommendations;
}

export function suggestModuleIdsFromDiscovery(
  input: SuggestModulesInput
): string[] {
  return suggestModuleRecommendationsFromDiscovery(input).map((item) => item.id);
}
