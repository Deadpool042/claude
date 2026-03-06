"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { Tip } from "@/shared/components/Tip";
import type { JsonValue, SpecRendererProps, ModuleItem } from "../../logic/spec-types";
import { ModuleForm } from "../../components/forms/ModuleForm";
import { mapFormValuesToSpecPayload } from "../../lib/spec-form-helpers";
import {
  MODULE_GROUPS,
  MODULE_GROUP_LABELS,
  MODULE_GROUP_COLORS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "../../logic/spec-constants";
import { LABELS } from "../../logic/spec-labels";

// ── Sub-component ──

function ModuleCard({
  mod,
  index,
  onUpdate,
}: {
  mod: ModuleItem;
  index: number;
  onUpdate: (idx: number, field: string, value: JsonValue) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const L = LABELS.modules;
  const pluginInsufficiencyRationale = (
    mod as { pluginInsufficiencyRationale?: string }
  ).pluginInsufficiencyRationale;

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
                {mod.label}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] shrink-0",
                  MODULE_GROUP_COLORS[mod.group] ?? "",
                )}
              >
                {MODULE_GROUP_LABELS[mod.group] ?? mod.group}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] shrink-0",
                  CATEGORY_COLORS[mod.targetCategory] ?? "",
                )}
              >
                {mod.targetCategory}
              </Badge>
              {mod.isStructurant && (
                <Tip content={L.structurantHint}>
                  <Badge
                    variant="outline"
                    className="text-[9px] bg-orange-500/10 text-orange-400 border-orange-500/20 shrink-0"
                  >
                    Structurant
                  </Badge>
                </Tip>
              )}
            </div>
            {mod.description && (
              <div className="text-[10px] text-muted-foreground/60 mt-0.5 line-clamp-1">
                {mod.description}
              </div>
            )}
          </div>

          {/* Pricing quick view */}
          <div className="flex items-center gap-2 shrink-0">
            <Tip content={`Setup : ${mod.priceSetupMin}–${mod.priceSetupMax} € | Mensuel : ${mod.priceMonthlyMin}–${mod.priceMonthlyMax} €`}>
              <div className="flex items-center gap-1 text-xs font-mono">
                <span className="text-foreground/80">{mod.priceSetupMin}–{mod.priceSetupMax}</span>
                <span className="text-muted-foreground/50 text-[10px]">€</span>
              </div>
            </Tip>
          </div>
        </div>

        {expanded && (
          <div className="px-4 py-3 space-y-3 border-t border-border/30">
            <ModuleForm
              module={mod}
              onUpdate={(field, value) => onUpdate(index, field, value)}
            />

            {/* Why not plugin */}
            {pluginInsufficiencyRationale && (
              <div className="grid grid-cols-[140px_1fr] items-start gap-2">
                <Tip content="Justification de pourquoi un plugin existant ne suffit pas pour cette feature">
                  <Label className="text-xs text-muted-foreground cursor-help mt-1.5">
                    {L.whyNotPlugin}
                  </Label>
                </Tip>
                <p className="text-[10px] text-amber-400/80 bg-amber-500/5 rounded px-2 py-1.5 border border-amber-500/10">
                  {pluginInsufficiencyRationale}
                </p>
              </div>
            )}

            {/* Pricing / categories / details now in ModuleForm */}

            {/* CI Impact */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-2">
              <Tip content="Points de complexité ajoutés sur les axes SA (architecture), DE (dev effort), CB (code base), SD (security/data)">
                <Label className="text-xs text-muted-foreground cursor-help">
                  {L.ciImpact}
                </Label>
              </Tip>
              <div className="flex gap-2">
                {Object.entries(mod.ciImpact).map(([axis, val]) => (
                  <Badge key={axis} variant="outline" className="text-[9px]">
                    {axis.toUpperCase()} +{val}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Setup Tiers */}
            {mod.setupTiers && mod.setupTiers.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-muted-foreground font-medium">{L.tiers} — Setup</span>
                <div className="grid gap-1.5">
                  {mod.setupTiers.map((tier) => (
                    <div key={tier.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/20 text-[10px]">
                      <span className="font-medium min-w-20">{tier.name}</span>
                      <span className="text-muted-foreground/60 flex-1">{tier.description}</span>
                      <span className="font-mono">{tier.priceSetup} €</span>
                      {tier.requalifiesTo ? (
                        <Badge
                          variant="outline"
                          className={cn("text-[8px]", CATEGORY_COLORS[tier.requalifiesTo])}
                        >
                          → {tier.requalifiesTo}
                        </Badge>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subscription Tiers */}
            {mod.subscriptionTiers && mod.subscriptionTiers.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-muted-foreground font-medium">{L.tiers} — Abonnement</span>
                <div className="grid gap-1.5">
                  {mod.subscriptionTiers.map((tier) => (
                    <div key={tier.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/20 text-[10px]">
                      <span className="font-medium min-w-20">{tier.name}</span>
                      <span className="text-muted-foreground/60 flex-1">{tier.description}</span>
                      <span className="font-mono">{tier.priceMonthly} €/mois</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feature IDs now in ModuleForm */}

            {/* ID (read-only) */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-2">
              <Label className="text-xs text-muted-foreground">Identifiant</Label>
              <code className="text-[10px] text-muted-foreground/60 font-mono">
                {mod.id}
              </code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main renderer ──

export function ModulesRenderer({ value, onChange }: SpecRendererProps) {
  const [filter, setFilter] = useState("");
  const [groupTab, setGroupTab] = useState<string>("all");

  const root = value as Record<string, JsonValue>;
  const modules = (root.modules ?? []) as unknown as ModuleItem[];

  const countByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of MODULE_GROUPS) counts[g] = 0;
    for (const m of modules) {
      counts[m.group] = (counts[m.group] ?? 0) + 1;
    }
    return counts;
  }, [modules]);

  const activeGroupTabs = useMemo(
    () => MODULE_GROUPS.filter((g) => (countByGroup[g] ?? 0) > 0),
    [countByGroup],
  );

  const filtered = useMemo(() => {
    let items = modules;
    if (groupTab !== "all") {
      items = items.filter((m) => m.group === groupTab);
    }
    if (filter) {
      const q = filter.toLowerCase();
      items = items.filter(
        (m) =>
          m.label.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q),
      );
    }
    return items;
  }, [modules, groupTab, filter]);

  const handleUpdate = (idx: number, field: string, val: JsonValue) => {
    const realIdx = modules.indexOf(filtered[idx]);
    const newModules = [...modules];
    const nextModule = {
      ...newModules[realIdx],
      [field]: val,
    } as unknown as ModuleItem;
    newModules[realIdx] = mapFormValuesToSpecPayload(
      "modules",
      nextModule
    ) as ModuleItem;
    onChange({ ...root, modules: newModules as unknown as JsonValue });
  };

  const structurantCount = useMemo(
    () => modules.filter((m) => m.isStructurant).length,
    [modules],
  );

  const totalSetupRange = useMemo(() => {
    const items = groupTab === "all" ? modules : modules.filter((m) => m.group === groupTab);
    const min = items.reduce((s, m) => s + m.priceSetupMin, 0);
    const max = items.reduce((s, m) => s + m.priceSetupMax, 0);
    return { min, max };
  }, [modules, groupTab]);

  const L = LABELS.modules;

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Group Tabs */}
        <Tabs value={groupTab} onValueChange={setGroupTab}>
          <TabsList className="h-8 w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="text-xs h-7 px-3">
              {LABELS.all}
              <Badge variant="outline" className="ml-1.5 text-[9px] h-4 px-1">
                {modules.length}
              </Badge>
            </TabsTrigger>
            {activeGroupTabs.map((g) => (
              <TabsTrigger key={g} value={g} className="text-xs h-7 px-3">
                {MODULE_GROUP_LABELS[g]}
                <Badge variant="outline" className="ml-1.5 text-[9px] h-4 px-1">
                  {countByGroup[g]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filter */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-muted-foreground/40" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={L.filterPlaceholder(filtered.length)}
            className="h-7 pl-8 text-xs"
          />
        </div>

        {/* Stats summary */}
        <div className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-md bg-muted/30 text-[11px]">
          {activeGroupTabs.map((g) => (
            <Badge
              key={g}
              variant="outline"
              className={cn("text-[9px] cursor-default", MODULE_GROUP_COLORS[g])}
            >
              {MODULE_GROUP_LABELS[g]} {countByGroup[g]}
            </Badge>
          ))}
          <span className="text-muted-foreground/50 ml-auto font-mono text-[10px]">
            Setup total : {totalSetupRange.min.toLocaleString("fr")}–{totalSetupRange.max.toLocaleString("fr")} €
          </span>
        </div>

        {/* Module cards */}
        <div className="grid gap-2">
          {filtered.map((mod, idx) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              index={idx}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground/50">
            {L.noModule}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground/50">
          {L.footer(modules.length, structurantCount)}
        </p>
      </div>
    </TooltipProvider>
  );
}
