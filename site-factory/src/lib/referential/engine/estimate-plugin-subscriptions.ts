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
    billingCycle?: "MONTHLY" | "ANNUAL" | "ONE_TIME" | "USAGE_BASED";
    priceMonthlyMin?: number;
    priceMonthlyMax?: number;
    priceAnnual?: number;
    renewalDiscountPercent?: number;
    amortization?: "ONE_SHOT" | "MONTHLY_SPREAD";
    /** Monthly equivalent computed from annual price (priceAnnual / 12) */
    monthlyEquivalent?: number;
    /** Monthly equivalent with multi-year discount applied */
    monthlyEquivalentDiscounted?: number;
    billingNotes?: string;
  }>;
  paidOrMixedCount: number;
  unknownPricingCount: number;
  /** Total monthly recurring (from plugins billed monthly) */
  monthlyMin: number;
  monthlyMax: number;
  /** Total monthly equivalent from annual licenses (spread over 12 months) */
  annualLicenseMonthlyTotal: number;
  /** Total one-shot license costs (annual plugins set to ONE_SHOT amortization) */
  oneShotTotal: number;
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
    .map((plugin) => {
      const monthlyEquivalent =
        typeof plugin.priceAnnual === "number" && plugin.priceAnnual > 0
          ? Math.round((plugin.priceAnnual / 12) * 100) / 100
          : undefined;

      const discountPct = plugin.renewalDiscountPercent ?? 0;
      const monthlyEquivalentDiscounted =
        monthlyEquivalent !== undefined && discountPct > 0
          ? Math.round((monthlyEquivalent * (1 - discountPct / 100)) * 100) / 100
          : undefined;

      return {
        id: plugin.id,
        label: plugin.label,
        pricingMode: plugin.pricingMode ?? "UNKNOWN",
        ...(plugin.billingCycle ? { billingCycle: plugin.billingCycle } : {}),
        ...(typeof plugin.priceMonthlyMin === "number"
          ? { priceMonthlyMin: plugin.priceMonthlyMin }
          : {}),
        ...(typeof plugin.priceMonthlyMax === "number"
          ? { priceMonthlyMax: plugin.priceMonthlyMax }
          : {}),
        ...(typeof plugin.priceAnnual === "number"
          ? { priceAnnual: plugin.priceAnnual }
          : {}),
        ...(discountPct > 0 ? { renewalDiscountPercent: discountPct } : {}),
        ...(plugin.amortization ? { amortization: plugin.amortization } : {}),
        ...(monthlyEquivalent !== undefined ? { monthlyEquivalent } : {}),
        ...(monthlyEquivalentDiscounted !== undefined
          ? { monthlyEquivalentDiscounted }
          : {}),
        ...(plugin.billingNotes ? { billingNotes: plugin.billingNotes } : {}),
      };
    });

  let paidOrMixedCount = 0;
  let unknownPricingCount = 0;
  let monthlyMin = 0;
  let monthlyMax = 0;
  let annualLicenseMonthlyTotal = 0;
  let oneShotTotal = 0;

  for (const plugin of plugins) {
    const paidLike = plugin.pricingMode === "PAID" || plugin.pricingMode === "MIXED";
    if (paidLike) paidOrMixedCount += 1;

    // Annual license → either spread monthly or one-shot
    if (plugin.billingCycle === "ANNUAL" && typeof plugin.priceAnnual === "number" && plugin.priceAnnual > 0) {
      if (plugin.amortization === "ONE_SHOT") {
        oneShotTotal += plugin.priceAnnual;
      } else {
        // MONTHLY_SPREAD (default for annual)
        annualLicenseMonthlyTotal += plugin.monthlyEquivalent ?? 0;
      }
      continue;
    }

    // One-time purchase (PrestaShop modules, etc.)
    if (plugin.billingCycle === "ONE_TIME" && typeof plugin.priceAnnual === "number") {
      oneShotTotal += plugin.priceAnnual;
      continue;
    }

    // Monthly billed plugins
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
    annualLicenseMonthlyTotal,
    oneShotTotal,
  };
}
