"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { Tip } from "@/shared/components/Tip";
import { FieldSelect, type SelectOption } from "@/shared/components/FieldSelect";
import type { JsonValue, SpecRendererProps, FeatureItem } from "../../logic/spec-types";
import { FeatureForm } from "../../components/forms/FeatureForm";
import { buildSelectOptions, mapFormValuesToSpecPayload } from "../../lib/spec-form-helpers";
import {
  FEATURE_DOMAINS,
  DOMAIN_LABELS,
  DOMAIN_COLORS,
  FEATURE_TYPES,
  FEATURE_TYPE_LABELS,
} from "../../logic/spec-constants";
import { LABELS } from "../../logic/spec-labels";

const TYPE_OPTIONS: SelectOption[] = FEATURE_TYPES.map((t) => ({
  value: t,
  label: FEATURE_TYPE_LABELS[t],
}));

const TYPE_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", label: LABELS.features.allTypes },
  ...TYPE_OPTIONS,
];

// ── Sub-component ──

function FeatureCard({
  feature,
  index,
  onUpdate,
  dependencyOptions,
}: {
  feature: FeatureItem;
  index: number;
  onUpdate: (idx: number, field: string, value: JsonValue) => void;
  dependencyOptions: SelectOption[];
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
                {feature.label}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] shrink-0",
                  DOMAIN_COLORS[feature.domain] ?? "",
                )}
              >
                {DOMAIN_LABELS[feature.domain] ?? feature.domain}
              </Badge>
              {feature.uiOnly && (
                <Tip content={LABELS.features.uiOnlyHint}>
                  <Badge
                    variant="outline"
                    className="text-[9px] bg-pink-500/10 text-pink-400 border-pink-500/20 shrink-0"
                  >
                    UI
                  </Badge>
                </Tip>
              )}
            </div>
            {feature.description && (
              <div className="text-[10px] text-muted-foreground/60 mt-0.5 line-clamp-1">
                {feature.description}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-[9px]">
              {FEATURE_TYPE_LABELS[feature.type] ?? feature.type}
            </Badge>
          </div>
        </div>

        {expanded && (
          <div className="px-4 py-3 space-y-3 border-t border-border/30">
            <FeatureForm
              feature={feature}
              onUpdate={(field, value) => onUpdate(index, field, value)}
              dependencyOptions={dependencyOptions}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main renderer ──

export function FeaturesRenderer({ value, onChange }: SpecRendererProps) {
  const [filter, setFilter] = useState("");
  const [domainTab, setDomainTab] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const root = value as Record<string, JsonValue>;
  const features = (root.features ?? []) as unknown as FeatureItem[];

  const countByDomain = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of FEATURE_DOMAINS) counts[d] = 0;
    for (const f of features) {
      counts[f.domain] = (counts[f.domain] ?? 0) + 1;
    }
    return counts;
  }, [features]);

  const activeDomainTabs = useMemo(
    () => FEATURE_DOMAINS.filter((d) => (countByDomain[d] ?? 0) > 0),
    [countByDomain],
  );

  const filtered = useMemo(() => {
    let items = features;
    if (domainTab !== "all") {
      items = items.filter((f) => f.domain === domainTab);
    }
    if (filter) {
      const q = filter.toLowerCase();
      items = items.filter(
        (f) =>
          f.label.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q) ||
          f.domain.toLowerCase().includes(q),
      );
    }
    if (typeFilter !== "all") {
      items = items.filter((f) => f.type === typeFilter);
    }
    return items;
  }, [features, domainTab, filter, typeFilter]);

  const handleUpdate = (idx: number, field: string, val: JsonValue) => {
    const realIdx = features.indexOf(filtered[idx]);
    const newFeatures = [...features];
    const nextFeature = {
      ...newFeatures[realIdx],
      [field]: val,
    } as unknown as FeatureItem;
    newFeatures[realIdx] = mapFormValuesToSpecPayload(
      "features",
      nextFeature
    ) as FeatureItem;
    onChange({ ...root, features: newFeatures as unknown as JsonValue });
  };

  const uiOnlyCount = useMemo(
    () => features.filter((f) => f.uiOnly).length,
    [features],
  );

  const dependencyOptions = useMemo(
    () => buildSelectOptions(features),
    [features],
  );

  const L = LABELS.features;

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Domain Tabs */}
        <Tabs value={domainTab} onValueChange={setDomainTab}>
          <TabsList className="h-8 w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="text-xs h-7 px-3">
              {LABELS.all}
              <Badge variant="outline" className="ml-1.5 text-[9px] h-4 px-1">
                {features.length}
              </Badge>
            </TabsTrigger>
            {activeDomainTabs.map((d) => (
              <TabsTrigger key={d} value={d} className="text-xs h-7 px-3">
                {DOMAIN_LABELS[d]}
                <Badge variant="outline" className="ml-1.5 text-[9px] h-4 px-1">
                  {countByDomain[d]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filters bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-muted-foreground/40" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={L.filterPlaceholder(filtered.length)}
              className="h-7 pl-8 text-xs"
            />
          </div>
          <FieldSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={TYPE_FILTER_OPTIONS}
            size="sm"
            triggerClassName="w-36"
          />
        </div>

        {/* Stats summary */}
        <div className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-md bg-muted/30 text-[11px]">
          <span className="text-muted-foreground font-medium">
            {domainTab === "all" ? LABELS.plugins.total : DOMAIN_LABELS[domainTab]} :
          </span>
          {activeDomainTabs.map((d) => {
            const count = countByDomain[d] ?? 0;
            return (
              <Badge
                key={d}
                variant="outline"
                className={cn("text-[9px] cursor-default", DOMAIN_COLORS[d])}
              >
                {DOMAIN_LABELS[d]} {count}
              </Badge>
            );
          })}
          <span className="text-muted-foreground/50 ml-auto">
            {uiOnlyCount} UI-only
          </span>
        </div>

        {/* Feature cards */}
        <div className="grid gap-2">
          {filtered.map((feature, idx) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={idx}
              onUpdate={handleUpdate}
              dependencyOptions={dependencyOptions}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground/50">
            {L.noFeature}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground/50">
          {L.footer(features.length, uiOnlyCount)}
        </p>
      </div>
    </TooltipProvider>
  );
}
