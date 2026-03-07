import { CMS_IDS } from "../../../logic/spec-constants";
import type { JsonValue, PluginItem } from "../../../logic/spec-types";

export interface PluginFilters {
  cmsTab: string;
  filter: string;
  modeFilter: string;
}

export interface PluginCostSummary {
  monthlyMin: number;
  monthlyMax: number;
  annualTotal: number;
  oneShotTotal: number;
}

export function countPluginsByCms(plugins: PluginItem[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const cmsId of CMS_IDS) {
    counts[cmsId] = 0;
  }

  for (const plugin of plugins) {
    for (const cmsId of plugin.cmsIds) {
      counts[cmsId] = (counts[cmsId] ?? 0) + 1;
    }
  }

  return counts;
}

export function filterPlugins(
  plugins: PluginItem[],
  { cmsTab, filter, modeFilter }: PluginFilters,
): PluginItem[] {
  let items = plugins;

  if (cmsTab !== "all") {
    items = items.filter((plugin) => plugin.cmsIds.includes(cmsTab));
  }

  if (filter) {
    const query = filter.toLowerCase();
    items = items.filter((plugin) =>
      plugin.label.toLowerCase().includes(query)
      || plugin.id.toLowerCase().includes(query)
      || (plugin.vendor?.toLowerCase().includes(query) ?? false)
      || plugin.featureIds.some((featureId) => featureId.toLowerCase().includes(query)),
    );
  }

  if (modeFilter !== "all") {
    items = items.filter((plugin) => plugin.pricingMode === modeFilter);
  }

  return items;
}

export function summarizePluginCosts(plugins: PluginItem[]): PluginCostSummary {
  let monthlyMin = 0;
  let monthlyMax = 0;
  let annualTotal = 0;
  let oneShotTotal = 0;

  for (const plugin of plugins) {
    if (plugin.pricingMode === "FREE") {
      continue;
    }

    if (
      plugin.billingCycle === "ANNUAL"
      && typeof plugin.priceAnnual === "number"
      && plugin.priceAnnual > 0
    ) {
      if (plugin.amortization === "ONE_SHOT") {
        oneShotTotal += plugin.priceAnnual;
      } else {
        annualTotal += plugin.priceAnnual;
      }
      continue;
    }

    if (
      plugin.billingCycle === "ONE_TIME"
      && typeof plugin.priceAnnual === "number"
    ) {
      oneShotTotal += plugin.priceAnnual;
      continue;
    }

    monthlyMin += plugin.priceMonthlyMin ?? 0;
    monthlyMax += plugin.priceMonthlyMax ?? 0;
  }

  return {
    monthlyMin,
    monthlyMax,
    annualTotal,
    oneShotTotal,
  };
}

export function updatePluginField(
  plugins: PluginItem[],
  pluginId: string,
  field: keyof PluginItem,
  value: JsonValue,
): PluginItem[] {
  return plugins.map((plugin) =>
    plugin.id === pluginId
      ? ({ ...plugin, [field]: value } as PluginItem)
      : plugin,
  );
}
