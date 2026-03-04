import { getSpec } from "@/lib/referential/spec";
import type { Category, ModuleSpecItem } from "@/lib/referential/spec/types";

const CATEGORY_ORDER: Category[] = ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"];

function categoryIndex(category: Category): number {
  return CATEGORY_ORDER.indexOf(category);
}

function toRange(entry: { type: "FROM"; from: number } | { type: "RANGE"; min: number; max: number }) {
  return entry.type === "FROM"
    ? { min: entry.from, max: entry.from }
    : { min: entry.min, max: entry.max };
}

function isModuleEligibleForCategory(moduleItem: ModuleSpecItem, category: Category): boolean {
  if (moduleItem.targetCategory) {
    return categoryIndex(category) >= categoryIndex(moduleItem.targetCategory);
  }
  if (moduleItem.minCategory) {
    return categoryIndex(category) >= categoryIndex(moduleItem.minCategory);
  }
  return true;
}

export interface QuoteEstimateInput {
  category: Category;
  moduleIds?: string[];
}

export interface QuoteEstimate {
  category: Category;
  marketPositioningLabel: string;
  baseSetup: { min: number; max: number };
  maintenance: { monthly: number; scopeSummary: string };
  modules: Array<{
    id: string;
    label: string;
    setup: { min: number; max: number };
    monthly?: { min: number; max: number };
    pricingMode: "FIXED" | "RANGE" | "QUOTE_REQUIRED";
  }>;
  annexFees: {
    deploymentSetupFee: { oneTime: number; scopeSummary: string };
    domainCostRange: { yearlyMin: number; yearlyMax: number };
    hostingCostRange: { monthlyMin: number; monthlyMax: number };
    emailProviderCostRange: { monthlyMin: number; monthlyMax: number };
    storageCostRange: { monthlyMin: number; monthlyMax: number };
  };
  totalSetup: { min: number; max: number };
  totalMonthly: { min: number; max: number };
  unknownModuleIds: string[];
}

export function estimateQuoteFromSpec(input: QuoteEstimateInput): QuoteEstimate {
  const spec = getSpec();
  const categoryPricing = spec.decisionRules.economicRules.basePricingByCategory[input.category];
  const maintenancePricing = spec.decisionRules.economicRules.maintenancePricingByCategory[input.category];

  if (!categoryPricing) {
    throw new Error(`Base pricing introuvable pour ${input.category}`);
  }
  if (!maintenancePricing) {
    throw new Error(`Maintenance pricing introuvable pour ${input.category}`);
  }

  const baseSetup = toRange(categoryPricing);
  const selectedIds = input.moduleIds ?? [];

  const moduleById = new Map(spec.modules.modules.map((moduleItem) => [moduleItem.id, moduleItem]));
  const modules: QuoteEstimate["modules"] = [];
  const unknownModuleIds: string[] = [];

  for (const moduleId of selectedIds) {
    const moduleItem = moduleById.get(moduleId);
    if (!moduleItem) {
      unknownModuleIds.push(moduleId);
      continue;
    }
    if (!isModuleEligibleForCategory(moduleItem, input.category)) {
      continue;
    }

    modules.push({
      id: moduleItem.id,
      label: moduleItem.label,
      setup: {
        min: moduleItem.priceSetupMin,
        max: moduleItem.priceSetupMax,
      },
      ...(typeof moduleItem.priceMonthlyMin === "number" && typeof moduleItem.priceMonthlyMax === "number"
        ? {
            monthly: {
              min: moduleItem.priceMonthlyMin,
              max: moduleItem.priceMonthlyMax,
            },
          }
        : {}),
      pricingMode: moduleItem.pricingMode,
    });
  }

  const annexFees = spec.decisionRules.economicRules.annexFees;

  let totalSetupMin = baseSetup.min + annexFees.deploymentSetupFee.oneTime;
  let totalSetupMax = baseSetup.max + annexFees.deploymentSetupFee.oneTime;

  let modulesMonthlyMin = 0;
  let modulesMonthlyMax = 0;

  for (const moduleItem of modules) {
    totalSetupMin += moduleItem.setup.min;
    totalSetupMax += moduleItem.setup.max;

    if (moduleItem.monthly) {
      modulesMonthlyMin += moduleItem.monthly.min;
      modulesMonthlyMax += moduleItem.monthly.max;
    }
  }

  const totalMonthlyMin =
    maintenancePricing.monthly +
    modulesMonthlyMin +
    annexFees.hostingCostRange.monthlyMin +
    annexFees.emailProviderCostRange.monthlyMin +
    annexFees.storageCostRange.monthlyMin;

  const totalMonthlyMax =
    maintenancePricing.monthly +
    modulesMonthlyMax +
    annexFees.hostingCostRange.monthlyMax +
    annexFees.emailProviderCostRange.monthlyMax +
    annexFees.storageCostRange.monthlyMax;

  return {
    category: input.category,
    marketPositioningLabel: spec.decisionRules.economicRules.marketPositioning.label,
    baseSetup,
    maintenance: {
      monthly: maintenancePricing.monthly,
      scopeSummary: maintenancePricing.scopeSummary,
    },
    modules,
    annexFees,
    totalSetup: {
      min: totalSetupMin,
      max: totalSetupMax,
    },
    totalMonthly: {
      min: totalMonthlyMin,
      max: totalMonthlyMax,
    },
    unknownModuleIds,
  };
}
