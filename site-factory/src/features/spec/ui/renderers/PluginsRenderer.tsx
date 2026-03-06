"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Search } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { Tip } from "@/shared/components/Tip";
import { FieldSelect, type SelectOption } from "@/shared/components/FieldSelect";
import type { JsonValue, SpecRendererProps, PluginItem } from "../../logic/spec-types";
import {
  CMS_IDS,
  CMS_SHORT,
  PRICING_MODES,
  PRICING_COLORS,
  BILLING_CYCLES,
  BILLING_CYCLE_LABELS,
  AMORTIZATION_MODES,
  AMORTIZATION_LABELS,
} from "../../logic/spec-constants";
import { LABELS } from "../../logic/spec-labels";

const PRICING_MODE_OPTIONS: SelectOption[] = PRICING_MODES.map((m) => ({
  value: m,
  label: m === "FREE" ? LABELS.plugins.free : m === "PAID" ? LABELS.plugins.paid : LABELS.plugins.mixed,
  render: () => (
    <>
      <Badge variant="outline" className={cn("text-[10px] mr-1", PRICING_COLORS[m])}>{m}</Badge>
      {m === "FREE" ? LABELS.plugins.free : m === "PAID" ? LABELS.plugins.paid : LABELS.plugins.mixed}
    </>
  ),
}));

const BILLING_CYCLE_OPTIONS: SelectOption[] = BILLING_CYCLES.map((c) => ({
  value: c,
  label: BILLING_CYCLE_LABELS[c],
}));

const AMORTIZATION_OPTIONS: SelectOption[] = AMORTIZATION_MODES.map((m) => ({
  value: m,
  label: AMORTIZATION_LABELS[m],
}));

const MODE_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", label: LABELS.allModes },
  ...PRICING_MODES.map((m) => ({ value: m, label: m })),
];

// ── Sub-component ──

function PluginCard({
  plugin,
  index,
  onUpdate,
}: {
  plugin: PluginItem;
  index: number;
  onUpdate: (idx: number, field: string, value: JsonValue) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/10">
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">
                {plugin.label}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] shrink-0",
                  PRICING_COLORS[plugin.pricingMode] ?? "",
                )}
              >
                {plugin.pricingMode}
              </Badge>
            </div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
              {plugin.description && (
                <span className="line-clamp-1 mr-2">{plugin.description}</span>
              )}
              {plugin.vendor}
              {plugin.url && (
                <a
                  href={plugin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1.5 inline-flex items-center gap-0.5 text-primary/60 hover:text-primary"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </div>

          {/* Pricing quick view */}
          <div className="flex items-center gap-2 shrink-0">
            {plugin.billingCycle && (
              <Badge variant="outline" className="text-[9px]">
                {BILLING_CYCLE_LABELS[plugin.billingCycle] ?? plugin.billingCycle}
              </Badge>
            )}
            {plugin.priceAnnual !== undefined && plugin.priceAnnual > 0 && (
              <Tip content={`Licence ${plugin.billingCycle === "ONE_TIME" ? "achat unique" : "annuelle"} : ${plugin.priceAnnual} €${plugin.renewalDiscountPercent ? ` (−${plugin.renewalDiscountPercent}% sur 2 ans → ${Math.round(plugin.priceAnnual * (1 - (plugin.renewalDiscountPercent ?? 0) / 100))} €/an)` : ""}. ${plugin.amortization === "ONE_SHOT" ? "Inclus dans le coût projet." : `Équiv. ${(plugin.priceAnnual / 12).toFixed(1)} €/mois.`}`}>
                <div className="flex items-center gap-1 text-xs font-mono">
                  <span className="text-foreground/80">{plugin.priceAnnual}</span>
                  <span className="text-muted-foreground/50 text-[10px]">€/an</span>
                  {plugin.amortization === "MONTHLY_SPREAD" && (
                    <span className="text-muted-foreground/40 text-[10px] ml-1">
                      ≈ {(plugin.priceAnnual / 12).toFixed(0)} €/mois
                    </span>
                  )}
                </div>
              </Tip>
            )}
            {plugin.priceAnnual === undefined && (plugin.priceMonthlyMin !== undefined ||
              plugin.priceMonthlyMax !== undefined) && (
              <Tip content="Fourchette de coût mensuel récurrent du plugin">
                <div className="flex items-center gap-1 text-xs font-mono">
                  <span className="text-muted-foreground/60">
                    {plugin.priceMonthlyMin ?? 0}
                  </span>
                  <span className="text-muted-foreground/30">–</span>
                  <span className="text-foreground/80">
                    {plugin.priceMonthlyMax ?? "?"}
                  </span>
                  <span className="text-muted-foreground/50 text-[10px]">
                    €/mois
                  </span>
                </div>
              </Tip>
            )}
          </div>
        </div>

        {expanded && (
          <div className="px-4 py-3 space-y-3 border-t border-border/30">
            {/* Description */}
            <div className="grid grid-cols-[120px_1fr] items-start gap-2">
              <Tip content="Description courte du plugin — affichée dans les devis et la documentation">
                <Label className="text-xs text-muted-foreground cursor-help mt-1.5">
                  Description
                </Label>
              </Tip>
              <textarea
                value={plugin.description ?? ""}
                onChange={(e) => onUpdate(index, "description", e.target.value)}
                rows={2}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-8"
              />
            </div>

            {/* Pricing mode */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <Tip content="Mode de facturation du plugin : gratuit, payant, ou mixte (freemium)">
                <Label className="text-xs text-muted-foreground cursor-help">
                  {LABELS.plugins.pricingMode}
                </Label>
              </Tip>
              <FieldSelect
                value={plugin.pricingMode}
                onChange={(v) => onUpdate(index, "pricingMode", v)}
                options={PRICING_MODE_OPTIONS}
                size="sm"
              />
            </div>

            {/* Billing cycle */}
            {plugin.pricingMode !== "FREE" && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <Tip content={LABELS.plugins.billingCycleHint}>
                  <Label className="text-xs text-muted-foreground cursor-help">
                    {LABELS.plugins.billingCycle}
                  </Label>
                </Tip>
                <FieldSelect
                  value={plugin.billingCycle ?? ""}
                  onChange={(v) => onUpdate(index, "billingCycle", v)}
                  options={BILLING_CYCLE_OPTIONS}
                  placeholder="Non défini"
                  size="sm"
                />
              </div>
            )}

            {/* Annual price */}
            {plugin.pricingMode !== "FREE" && (plugin.billingCycle === "ANNUAL" || plugin.billingCycle === "ONE_TIME") && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <Tip content={plugin.billingCycle === "ONE_TIME" ? "Prix d'achat unique du plugin/module." : "Prix de la licence annuelle. L'engine calcule l'équivalent mensuel (÷12) pour le devis."}>
                  <Label className="text-xs text-muted-foreground cursor-help">
                    {plugin.billingCycle === "ONE_TIME" ? LABELS.plugins.priceOneTimeLabel : LABELS.plugins.priceAnnualLabel}
                  </Label>
                </Tip>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={plugin.priceAnnual ?? 0}
                    onChange={(e) => onUpdate(index, "priceAnnual", Number(e.target.value))}
                    className="h-7 w-24 text-xs font-mono"
                    min={0}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {plugin.billingCycle === "ONE_TIME" ? "€" : "€/an"}
                  </span>
                  {plugin.billingCycle === "ANNUAL" && typeof plugin.priceAnnual === "number" && plugin.priceAnnual > 0 && (
                    <span className="text-[10px] text-muted-foreground/60 ml-1">
                      ≈ {(plugin.priceAnnual / 12).toFixed(1)} €/mois
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Renewal discount */}
            {plugin.billingCycle === "ANNUAL" && plugin.pricingMode !== "FREE" && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <Tip content="Réduction accordée pour un engagement multi-année (ex: plan 2 ans). Typiquement 20% chez WooCommerce.com.">
                  <Label className="text-xs text-muted-foreground cursor-help">
                    {LABELS.plugins.renewalDiscount}
                  </Label>
                </Tip>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={plugin.renewalDiscountPercent ?? 0}
                    onChange={(e) => onUpdate(index, "renewalDiscountPercent", Number(e.target.value))}
                    className="h-7 w-20 text-xs font-mono"
                    min={0}
                    max={100}
                  />
                  <span className="text-[10px] text-muted-foreground">%</span>
                  {typeof plugin.priceAnnual === "number" && plugin.priceAnnual > 0 && (plugin.renewalDiscountPercent ?? 0) > 0 && (
                    <span className="text-[10px] text-muted-foreground/60 ml-1">
                      → {Math.round(plugin.priceAnnual * (1 - (plugin.renewalDiscountPercent ?? 0) / 100))} €/an
                      {" ≈ "}{(plugin.priceAnnual * (1 - (plugin.renewalDiscountPercent ?? 0) / 100) / 12).toFixed(1)} €/mois
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Amortization strategy */}
            {plugin.pricingMode !== "FREE" && (plugin.billingCycle === "ANNUAL" || plugin.billingCycle === "ONE_TIME") && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <Tip content="Comment présenter ce coût au client : inclus dans le coût projet (one-shot) ou lissé dans l'abonnement mensuel.">
                  <Label className="text-xs text-muted-foreground cursor-help">
                    {LABELS.plugins.amortization}
                  </Label>
                </Tip>
                <FieldSelect
                  value={plugin.amortization ?? "MONTHLY_SPREAD"}
                  onChange={(v) => onUpdate(index, "amortization", v)}
                  options={AMORTIZATION_OPTIONS}
                  size="sm"
                />
              </div>
            )}

            {/* Monthly range (for monthly-billed plugins) */}
            {plugin.pricingMode !== "FREE" && (plugin.billingCycle === "MONTHLY" || plugin.billingCycle === "USAGE_BASED" || !plugin.billingCycle) && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <Tip content="Coût mensuel estimé du plugin/app. Utilisé pour l'estimation des charges récurrentes dans le devis.">
                  <Label className="text-xs text-muted-foreground cursor-help">
                    {LABELS.plugins.monthlyCost}
                  </Label>
                </Tip>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={plugin.priceMonthlyMin ?? 0}
                    onChange={(e) =>
                      onUpdate(
                        index,
                        "priceMonthlyMin",
                        Number(e.target.value),
                      )
                    }
                    className="h-7 w-20 text-xs font-mono"
                    min={0}
                  />
                  <span className="text-muted-foreground/40">–</span>
                  <Input
                    type="number"
                    value={plugin.priceMonthlyMax ?? 0}
                    onChange={(e) =>
                      onUpdate(
                        index,
                        "priceMonthlyMax",
                        Number(e.target.value),
                      )
                    }
                    className="h-7 w-20 text-xs font-mono"
                    min={0}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    €/mois
                  </span>
                </div>
              </div>
            )}

            {/* Billing notes */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <Tip content="Notes sur la politique de facturation, affichées dans le devis">
                <Label className="text-xs text-muted-foreground cursor-help">
                  {LABELS.plugins.billingNotes}
                </Label>
              </Tip>
              <Input
                value={plugin.billingNotes ?? ""}
                onChange={(e) =>
                  onUpdate(index, "billingNotes", e.target.value || null)
                }
                className="h-7 text-xs"
                placeholder="Optionnel…"
              />
            </div>

            {/* CMS compat */}
            <div className="grid grid-cols-[120px_1fr] items-start gap-2">
              <Tip content="CMS compatibles avec ce plugin (utilisé par le moteur de décision pour le matching)">
                <Label className="text-xs text-muted-foreground cursor-help pt-1">
                  {LABELS.plugins.cmsCompat}
                </Label>
              </Tip>
              <div className="flex flex-wrap gap-1.5">
                {CMS_IDS.map((cmsId) => {
                  const active = plugin.cmsIds.includes(cmsId);
                  return (
                    <Button
                      key={cmsId}
                      variant={active ? "default" : "outline"}
                      size="xs"
                      className={cn(
                        "text-[10px] h-6",
                        !active && "opacity-40",
                      )}
                      onClick={() => {
                        const newIds = active
                          ? plugin.cmsIds.filter((c) => c !== cmsId)
                          : [...plugin.cmsIds, cmsId];
                        onUpdate(index, "cmsIds", newIds);
                      }}
                    >
                      {CMS_SHORT[cmsId]}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-[120px_1fr] items-start gap-2">
              <Tip content="Features couvertes par ce plugin (utilisé dans la matrice de capacité)">
                <Label className="text-xs text-muted-foreground cursor-help pt-1">
                  {LABELS.plugins.features}
                </Label>
              </Tip>
              <div className="flex flex-wrap gap-1">
                {plugin.featureIds.map((fid) => (
                  <Badge
                    key={fid}
                    variant="secondary"
                    className="text-[10px]"
                  >
                    {fid.replace("feature.", "")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main renderer ──

export function PluginsRenderer({ value, onChange }: SpecRendererProps) {
  const [filter, setFilter] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [cmsTab, setCmsTab] = useState<string>("all");

  const root = value as Record<string, JsonValue>;
  const plugins = (root.plugins ?? []) as unknown as PluginItem[];

  const countByCms = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cmsId of CMS_IDS) counts[cmsId] = 0;
    for (const p of plugins) {
      for (const cmsId of p.cmsIds) {
        counts[cmsId] = (counts[cmsId] ?? 0) + 1;
      }
    }
    return counts;
  }, [plugins]);

  const activeCmsTabs = useMemo(
    () => CMS_IDS.filter((cmsId) => (countByCms[cmsId] ?? 0) > 0),
    [countByCms],
  );

  const filtered = useMemo(() => {
    let items = plugins;
    if (cmsTab !== "all") {
      items = items.filter((p) => p.cmsIds.includes(cmsTab));
    }
    if (filter) {
      const f = filter.toLowerCase();
      items = items.filter(
        (p) =>
          p.label.toLowerCase().includes(f) ||
          p.id.toLowerCase().includes(f) ||
          p.vendor?.toLowerCase().includes(f) ||
          p.featureIds.some((fid) => fid.toLowerCase().includes(f)),
      );
    }
    if (modeFilter !== "all") {
      items = items.filter((p) => p.pricingMode === modeFilter);
    }
    return items;
  }, [plugins, cmsTab, filter, modeFilter]);

  const handleUpdate = (
    idx: number,
    field: string,
    val: JsonValue,
  ) => {
    const realIdx = plugins.indexOf(filtered[idx]);
    const newPlugins = [...plugins];
    newPlugins[realIdx] = {
      ...newPlugins[realIdx],
      [field]: val,
    } as unknown as PluginItem;
    onChange({ ...root, plugins: newPlugins as unknown as JsonValue });
  };

  const tabSummary = useMemo(() => {
    const tabPlugins = cmsTab === "all" ? filtered : filtered;
    let monthlyMin = 0, monthlyMax = 0, annualTotal = 0, oneShotTotal = 0;
    for (const p of tabPlugins) {
      if (p.pricingMode === "FREE") continue;
      if (p.billingCycle === "ANNUAL" && typeof p.priceAnnual === "number" && p.priceAnnual > 0) {
        if (p.amortization === "ONE_SHOT") oneShotTotal += p.priceAnnual;
        else annualTotal += p.priceAnnual;
      } else if (p.billingCycle === "ONE_TIME" && typeof p.priceAnnual === "number") {
        oneShotTotal += p.priceAnnual;
      } else {
        monthlyMin += p.priceMonthlyMin ?? 0;
        monthlyMax += p.priceMonthlyMax ?? 0;
      }
    }
    return { monthlyMin, monthlyMax, annualTotal, oneShotTotal };
  }, [filtered, cmsTab]);

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* CMS Tabs */}
        <Tabs value={cmsTab} onValueChange={setCmsTab}>
          <TabsList className="h-8 w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="text-xs h-7 px-3">
              {LABELS.all}
              <Badge variant="outline" className="ml-1.5 text-[9px] h-4 px-1">
                {plugins.length}
              </Badge>
            </TabsTrigger>
            {activeCmsTabs.map((cmsId) => (
              <TabsTrigger key={cmsId} value={cmsId} className="text-xs h-7 px-3">
                {CMS_SHORT[cmsId]}
                <Badge variant="outline" className="ml-1.5 text-[9px] h-4 px-1">
                  {countByCms[cmsId]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Filters bar */}
          <div className="flex items-center gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-muted-foreground/40" />
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={LABELS.plugins.filterPlaceholder(filtered.length)}
                className="h-7 pl-8 text-xs"
              />
            </div>
            <FieldSelect
              value={modeFilter}
              onChange={setModeFilter}
              options={MODE_FILTER_OPTIONS}
              size="sm"
              triggerClassName="w-32"
            />
          </div>

          {/* Cost summary bar */}
          {(tabSummary.monthlyMin > 0 || tabSummary.monthlyMax > 0 || tabSummary.annualTotal > 0 || tabSummary.oneShotTotal > 0) && (
            <div className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-md bg-muted/30 text-[11px]">
              <span className="text-muted-foreground font-medium">
                {cmsTab === "all" ? LABELS.plugins.total : CMS_SHORT[cmsTab]} :
              </span>
              {(tabSummary.monthlyMin > 0 || tabSummary.monthlyMax > 0) && (
                <span className="font-mono">
                  {tabSummary.monthlyMin}–{tabSummary.monthlyMax} <span className="text-muted-foreground">€/mois</span>
                </span>
              )}
              {tabSummary.annualTotal > 0 && (
                <span className="font-mono">
                  {tabSummary.annualTotal} <span className="text-muted-foreground">€/an</span>
                  <span className="text-muted-foreground/50 ml-1">≈ {(tabSummary.annualTotal / 12).toFixed(0)} €/mois</span>
                </span>
              )}
              {tabSummary.oneShotTotal > 0 && (
                <span className="font-mono">
                  {tabSummary.oneShotTotal} <span className="text-muted-foreground">€ one-shot</span>
                </span>
              )}
            </div>
          )}

          {/* Plugin cards */}
          <div className="grid gap-2 mt-1">
            {filtered.map((plugin, idx) => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                index={idx}
                onUpdate={handleUpdate}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground/50">
              {LABELS.plugins.noPlugin}{cmsTab !== "all" ? ` pour ${CMS_SHORT[cmsTab]}` : ""}
            </div>
          )}
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
