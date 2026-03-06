"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronRight, Search, Container } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { Tip } from "@/shared/components/Tip";
import { FieldSelect } from "@/shared/components/FieldSelect";
import type {
  JsonValue,
  SpecRendererProps,
  InfraServiceUIItem,
  InfraServiceCategoryUI,
} from "../../logic/spec-types";
import { LABELS } from "../../logic/spec-labels";

const CAT_OPTIONS = ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"].map((c) => ({
  value: c,
  label: c,
}));

// ── Category colors ──
const CATEGORY_COLORS: Record<string, string> = {
  MONITORING: "border-amber-500/30 text-amber-400",
  CACHE: "border-emerald-500/30 text-emerald-400",
  DB_TOOLS: "border-sky-500/30 text-sky-400",
  DEV_TOOLS: "border-violet-500/30 text-violet-400",
  SEARCH: "border-pink-500/30 text-pink-400",
};

const CAT_EMOJI: Record<string, string> = {
  CAT0: "🟢",
  CAT1: "🔵",
  CAT2: "🟡",
  CAT3: "🟠",
  CAT4: "🔴",
};

// ── Service card ──

function ServiceCard({
  service,
  onUpdate,
}: {
  service: InfraServiceUIItem;
  onUpdate: (field: string, value: JsonValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const catColor = CATEGORY_COLORS[service.category] ?? "border-border text-muted-foreground";

  return (
    <Card className="overflow-hidden border-border/30 bg-card/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/20 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        )}
        <Badge variant="outline" className={cn("text-[10px] shrink-0", catColor)}>
          {service.category}
        </Badge>
        <span className="text-xs font-medium flex-1 truncate">{service.label}</span>
        <div className="flex items-center gap-2 shrink-0">
          {service.monthlyCost > 0 && (
            <span className="text-[10px] text-muted-foreground/60">
              {service.monthlyCost} €/mois
            </span>
          )}
          <span className="text-xs font-mono font-semibold text-emerald-400">
            {service.setupCost} €
          </span>
          <Badge variant="outline" className="text-[9px] h-4 px-1 gap-0.5">
            <Container className="h-2.5 w-2.5" />
            {service.containers.length}
          </Badge>
        </div>
      </button>

      {open && (
        <CardContent className="pt-0 px-3 pb-3 space-y-2 border-t border-border/30">
          {/* Label */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2 pt-2">
            <Label className="text-[10px] text-muted-foreground/50">Label</Label>
            <Input
              value={service.label}
              onChange={(e) => onUpdate("label", e.target.value)}
              className="h-7 text-xs"
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-[120px_1fr] items-start gap-2">
            <Label className="text-[10px] text-muted-foreground/50 mt-1.5">
              {LABELS.infraServices.description}
            </Label>
            <textarea
              value={service.description}
              onChange={(e) => onUpdate("description", e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-8"
            />
          </div>

          {/* Costs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">
                {LABELS.infraServices.setupCost}
              </Label>
              <Input
                type="number"
                value={service.setupCost}
                onChange={(e) => onUpdate("setupCost", Number(e.target.value))}
                className="h-7 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">
                {LABELS.infraServices.monthlyCost}
              </Label>
              <Input
                type="number"
                value={service.monthlyCost}
                onChange={(e) => onUpdate("monthlyCost", Number(e.target.value))}
                className="h-7 text-xs font-mono"
              />
            </div>
          </div>

          {/* Constraints */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">
                <Tip content={LABELS.infraServices.minMaintenanceHint}>
                  {LABELS.infraServices.minMaintenance}
                </Tip>
              </Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{CAT_EMOJI[service.minMaintenanceCat] ?? "⚪"}</span>
                <FieldSelect
                  value={service.minMaintenanceCat}
                  onChange={(v) => onUpdate("minMaintenanceCat", v)}
                  options={CAT_OPTIONS}
                  size="sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">
                <Tip content={LABELS.infraServices.hostingImpactHint}>
                  {LABELS.infraServices.ramMb}
                </Tip>
              </Label>
              <Input
                type="number"
                value={service.hostingImpact.ramMb}
                onChange={(e) =>
                  onUpdate("hostingImpact", {
                    ...service.hostingImpact,
                    ramMb: Number(e.target.value),
                  })
                }
                className="h-7 text-xs font-mono"
              />
            </div>
          </div>

          {/* Hosting impact note */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label className="text-[10px] text-muted-foreground/50">
              {LABELS.infraServices.hostingImpact}
            </Label>
            <Input
              value={service.hostingImpact.note}
              onChange={(e) =>
                onUpdate("hostingImpact", {
                  ...service.hostingImpact,
                  note: e.target.value,
                })
              }
              className="h-7 text-xs"
            />
          </div>

          {/* Containers */}
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground/50">
              {LABELS.infraServices.containers}
            </Label>
            <div className="flex flex-wrap gap-1">
              {service.containers.map((c) => (
                <Badge
                  key={c}
                  variant="outline"
                  className="text-[9px] h-5 px-1.5 border-sky-500/30 text-sky-400 font-mono"
                >
                  {c}
                </Badge>
              ))}
            </div>
          </div>

          {/* Docker badge */}
          {service.requiresDocker && (
            <div className="flex items-center gap-1.5 pt-1">
              <Badge variant="outline" className="text-[9px] border-orange-500/30 text-orange-400">
                🐳 Docker requis
              </Badge>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ── Main renderer ──

export function InfraServicesRenderer({ value, onChange }: SpecRendererProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("__all__");

  const root = value as Record<string, JsonValue>;
  const categories = (root.categories ?? []) as unknown as InfraServiceCategoryUI[];
  const services = (root.services ?? []) as unknown as InfraServiceUIItem[];

  const categoryIds = useMemo(() => categories.map((c) => c.id), [categories]);

  // ── Filtered services ──
  const filtered = useMemo(() => {
    let list = services;
    if (categoryFilter !== "__all__") {
      list = list.filter((s) => s.category === categoryFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.label.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.containers.some((c) => c.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [services, categoryFilter, search]);

  // ── Totals ──
  const totals = useMemo(() => {
    const setup = filtered.reduce((sum, s) => sum + s.setupCost, 0);
    const monthly = filtered.reduce((sum, s) => sum + s.monthlyCost, 0);
    const ram = filtered.reduce((sum, s) => sum + s.hostingImpact.ramMb, 0);
    return { setup, monthly, ram };
  }, [filtered]);

  // ── Update helper ──
  const updateService = useCallback(
    (serviceId: string, field: string, val: JsonValue) => {
      const arr = root.services as JsonValue[];
      const next = arr.map((s) => {
        const svc = s as Record<string, JsonValue>;
        if (svc.id === serviceId) return { ...svc, [field]: val };
        return svc;
      });
      onChange({ ...root, services: next });
    },
    [root, onChange],
  );

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Tabs = category filter */}
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
          <TabsList className="w-full flex flex-wrap">
            <TabsTrigger value="__all__" className="text-xs">
              {LABELS.infraServices.allCategories}
              <Badge variant="secondary" className="ml-1.5 text-[9px] px-1.5 py-0">
                {services.length}
              </Badge>
            </TabsTrigger>
            {categories.map((cat) => {
              const count = services.filter((s) => s.category === cat.id).length;
              return (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                  {cat.label}
                  <Badge variant="secondary" className="ml-1.5 text-[9px] px-1.5 py-0">
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
          <Input
            placeholder={LABELS.infraServices.filterPlaceholder(services.length)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        {/* Totals bar */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-muted/20 text-xs text-muted-foreground">
          <span>
            {filtered.length} service{filtered.length > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-4">
            <span>
              {LABELS.infraServices.totalSetup}:{" "}
              <span className="font-mono font-semibold text-emerald-400">{totals.setup} €</span>
            </span>
            <span>
              {LABELS.infraServices.totalMonthly}:{" "}
              <span className="font-mono font-semibold text-amber-400">{totals.monthly} €/mois</span>
            </span>
            <span>
              {LABELS.infraServices.totalRam}:{" "}
              <span className="font-mono font-semibold text-sky-400">{totals.ram} Mo</span>
            </span>
          </div>
        </div>

        {/* Service list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground/50 py-8">
              {LABELS.infraServices.noService}
            </p>
          ) : (
            filtered.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                onUpdate={(field, val) => updateService(svc.id, field, val)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <p className="text-[10px] text-center text-muted-foreground/40 pt-2">
          {LABELS.infraServices.footer(services.length, categoryIds.length)}
        </p>
      </div>
    </TooltipProvider>
  );
}
