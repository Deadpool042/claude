import { getSpec } from "@/lib/referential/spec";

export interface PluginSubscriptionEstimateInput {
  cmsId: string;
  featureIds: string[];
}

export interface PluginSubscriptionEstimate {
  plugins: Array<{
    id: string;
    label: string;
    pricingMode: "FREE" | "PAID" | "MIXED" | "UNKNOWN";
    priceMonthlyMin?: number;
    priceMonthlyMax?: number;
    billingNotes?: string;
  }>;
  paidOrMixedCount: number;
  unknownPricingCount: number;
  monthlyMin: number;
  monthlyMax: number;
}

export function estimatePluginSubscriptions(
  input: PluginSubscriptionEstimateInput,
): PluginSubscriptionEstimate {
  const spec = getSpec();
  const featureIdSet = new Set(input.featureIds);

  const pluginIds = new Set<string>();
  for (const entry of spec.decisionRules.matrix) {
    if (!featureIdSet.has(entry.featureId)) continue;
    const row = entry.rows.find((item) => item.cmsId === input.cmsId);
    if (!row?.recommendedPluginIds?.length) continue;
    for (const pluginId of row.recommendedPluginIds) {
      pluginIds.add(pluginId);
    }
  }

  const pluginCatalog = new Map(spec.plugins.plugins.map((plugin) => [plugin.id, plugin]));
  const plugins = Array.from(pluginIds)
    .map((id) => pluginCatalog.get(id))
    .filter((plugin): plugin is NonNullable<typeof plugin> => Boolean(plugin))
    .map((plugin) => ({
      id: plugin.id,
      label: plugin.label,
      pricingMode: plugin.pricingMode ?? "UNKNOWN",
      ...(typeof plugin.priceMonthlyMin === "number"
        ? { priceMonthlyMin: plugin.priceMonthlyMin }
        : {}),
      ...(typeof plugin.priceMonthlyMax === "number"
        ? { priceMonthlyMax: plugin.priceMonthlyMax }
        : {}),
      ...(plugin.billingNotes ? { billingNotes: plugin.billingNotes } : {}),
    }));

  let paidOrMixedCount = 0;
  let unknownPricingCount = 0;
  let monthlyMin = 0;
  let monthlyMax = 0;

  for (const plugin of plugins) {
    const paidLike = plugin.pricingMode === "PAID" || plugin.pricingMode === "MIXED";
    if (paidLike) paidOrMixedCount += 1;

    const hasRange =
      typeof plugin.priceMonthlyMin === "number" &&
      typeof plugin.priceMonthlyMax === "number";

    if (hasRange) {
      monthlyMin += plugin.priceMonthlyMin ?? 0;
      monthlyMax += plugin.priceMonthlyMax ?? 0;
    } else if (paidLike || plugin.pricingMode === "UNKNOWN") {
      unknownPricingCount += 1;
    }
  }

  return {
    plugins,
    paidOrMixedCount,
    unknownPricingCount,
    monthlyMin,
    monthlyMax,
  };
}
