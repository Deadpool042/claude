"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type {
  JsonValue,
  SpecRendererProps,
  PriceBand,
  MaintenancePlan,
  DeployFee,
  HostingCost,
  SaasCost,
} from "../../logic/spec-types";
import {
  COMMERCIAL_SECTIONS,
  COMMERCIAL_SECTION_LABELS,
  COMMERCIAL_SECTION_ICONS,
} from "../../logic/spec-constants";
import { LABELS } from "../../logic/spec-labels";
import { PriceBandRow } from "./commercial/PriceBandRow";
import { MaintenanceCard } from "./commercial/MaintenanceCard";
import { DeployCard } from "./commercial/DeployCard";
import { HostingRow } from "./commercial/HostingRow";
import { CompatAddRow } from "./commercial/CompatAddRow";

export function CommercialRenderer({ value, onChange }: SpecRendererProps) {
  const [activeTab, setActiveTab] = useState<string>("basePackageBandsByCategory");

  const root = value as Record<string, JsonValue>;

  const bands = root.basePackageBandsByCategory as Record<string, JsonValue> | undefined;
  const maintenance = root.maintenanceByCategory as Record<string, JsonValue> | undefined;
  const deploy = root.deployFees as Record<string, JsonValue> | undefined;
  const hosting = root.hostingCosts as Record<string, JsonValue> | undefined;
  const saas = root.saasCosts as Record<string, JsonValue> | undefined;
  const compat = root.stackDeployCompat as Record<string, JsonValue> | undefined;
  const annex = root.annexCosts as Record<string, JsonValue> | undefined;
  const rules = root.rules as Record<string, JsonValue> | undefined;

  const bandKeys = bands ? Object.keys(bands) : [];
  const totalSetupMin = bandKeys.reduce((sum, k) => sum + ((bands?.[k] as Record<string, number>)?.from ?? 0), 0);
  const totalSetupMax = bandKeys.reduce((sum, k) => sum + ((bands?.[k] as Record<string, number>)?.to ?? 0), 0);
  const totalMaintMin = maintenance
    ? Object.values(maintenance).reduce<number>((sum, v) => sum + ((v as Record<string, number>)?.monthly ?? 0), 0)
    : 0;

  const L = LABELS.commercial;
  const activeSections = COMMERCIAL_SECTIONS.filter((s) => root[s] != null);

  const updateSection = useCallback(
    (section: string, key: string, field: string, val: JsonValue) => {
      const sectionData = { ...(root[section] as Record<string, JsonValue>) };
      const entry = { ...(sectionData[key] as Record<string, JsonValue>) };
      entry[field] = val;
      sectionData[key] = entry as JsonValue;
      onChange({ ...root, [section]: sectionData as JsonValue });
    },
    [root, onChange],
  );

  const updateRuleField = useCallback(
    (key: string, val: JsonValue) => {
      const r = { ...(root.rules as Record<string, JsonValue>) };
      r[key] = val;
      onChange({ ...root, rules: r as JsonValue });
    },
    [root, onChange],
  );

  const updateAnnexField = useCallback(
    (key: string, val: JsonValue) => {
      const a = { ...(root.annexCosts as Record<string, JsonValue>) };
      a[key] = val;
      onChange({ ...root, annexCosts: a as JsonValue });
    },
    [root, onChange],
  );

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Section Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8 w-full justify-start overflow-x-auto">
            {activeSections.map((s) => (
              <TabsTrigger key={s} value={s} className="text-xs h-7 px-2.5 gap-1">
                <span>{COMMERCIAL_SECTION_ICONS[s]}</span>
                <span className="hidden sm:inline">{COMMERCIAL_SECTION_LABELS[s]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Stats summary */}
        <div className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-md bg-muted/30 text-[11px]">
          <span className="text-muted-foreground font-medium">
            {COMMERCIAL_SECTION_LABELS[activeTab]}
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span className="text-muted-foreground">
            Setup : <span className="font-mono text-emerald-400">{totalSetupMin}€</span>
            <span className="mx-0.5">→</span>
            <span className="font-mono text-amber-400">{totalSetupMax}€</span>
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span className="text-muted-foreground">
            Maintenance totale : <span className="font-mono text-sky-400">{totalMaintMin} {L.perMonth}</span>
          </span>
        </div>

        {/* ── BASE PACKAGE BANDS ── */}
        {activeTab === "basePackageBandsByCategory" && bands && (
          <div className="grid gap-2">
            {Object.entries(bands).map(([catKey, band]) => (
              <PriceBandRow
                key={catKey}
                catKey={catKey}
                band={band as unknown as PriceBand}
                onUpdate={(field, val) => updateSection("basePackageBandsByCategory", catKey, field, val as JsonValue)}
              />
            ))}
          </div>
        )}

        {/* ── MAINTENANCE ── */}
        {activeTab === "maintenanceByCategory" && maintenance && (
          <div className="grid gap-2">
            {Object.entries(maintenance).map(([catKey, plan]) => (
              <MaintenanceCard
                key={catKey}
                catKey={catKey}
                plan={plan as unknown as MaintenancePlan}
                onUpdate={(field, val) => updateSection("maintenanceByCategory", catKey, field, val)}
              />
            ))}
          </div>
        )}

        {/* ── DEPLOY FEES ── */}
        {activeTab === "deployFees" && deploy && (
          <div className="grid gap-2">
            {Object.entries(deploy).map(([key, fee]) => (
              <DeployCard
                key={key}
                fee={fee as unknown as DeployFee}
                onUpdate={(field, val) => updateSection("deployFees", key, field, val)}
              />
            ))}
          </div>
        )}

        {/* ── HOSTING COSTS ── */}
        {activeTab === "hostingCosts" && hosting && (
          <div className="grid gap-2">
            {Object.entries(hosting).map(([key, entry]) => (
              <HostingRow
                key={key}
                entryKey={key}
                entry={entry as unknown as HostingCost}
                onUpdate={(field, val) => updateSection("hostingCosts", key, field, val)}
              />
            ))}
          </div>
        )}

        {/* ── SAAS COSTS ── */}
        {activeTab === "saasCosts" && saas && (
          <div className="grid gap-2">
            {Object.entries(saas).map(([key, entry]) => {
              const item = entry as unknown as SaasCost;
              return (
                <Card key={key} className="overflow-hidden border-border/30 bg-card/50">
                  <CardContent className="px-3 py-2.5 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px] bg-violet-500/20 text-violet-400 border-violet-500/30">
                        {key}
                      </Badge>
                      <span className="text-xs font-medium flex-1">{item.label}</span>
                      <span className="text-xs font-mono font-semibold text-violet-400">{item.range}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-[10px] text-muted-foreground/50">Label</Label>
                      <Input
                        value={item.label}
                        onChange={(e) => updateSection("saasCosts", key, "label", e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-[10px] text-muted-foreground/50">{LABELS.commercial.range}</Label>
                      <Input
                        value={item.range}
                        onChange={(e) => updateSection("saasCosts", key, "range", e.target.value)}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                      <Label className="text-[10px] text-muted-foreground/50 mt-1.5">{LABELS.commercial.description}</Label>
                      <textarea
                        value={item.description ?? ""}
                        onChange={(e) => updateSection("saasCosts", key, "description", e.target.value)}
                        rows={2}
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-8"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── STACK DEPLOY COMPAT ── */}
        {activeTab === "stackDeployCompat" && compat && (
          <div className="grid gap-2">
            {Object.entries(compat).map(([stack, targets]) => {
              const items = targets as string[];
              return (
                <div
                  key={stack}
                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/20"
                >
                  <span className="text-xs font-medium w-28">{stack}</span>
                  <div className="flex gap-1.5 flex-wrap items-center flex-1">
                    {items.map((t, i) => (
                      <div key={i} className="flex items-center gap-0.5">
                        <Input
                          value={t}
                          onChange={(e) => {
                            const next = [...items];
                            next[i] = e.target.value;
                            onChange({
                              ...root,
                              stackDeployCompat: { ...compat, [stack]: next } as JsonValue,
                            });
                          }}
                          className="h-7 text-[10px] font-mono w-32"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground/50 hover:text-destructive shrink-0"
                          onClick={() =>
                            onChange({
                              ...root,
                              stackDeployCompat: {
                                ...compat,
                                [stack]: items.filter((_, j) => j !== i),
                              } as JsonValue,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground/50 hover:text-foreground shrink-0"
                      onClick={() =>
                        onChange({
                          ...root,
                          stackDeployCompat: {
                            ...compat,
                            [stack]: [...items, ""],
                          } as JsonValue,
                        })
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground/40 hover:text-destructive shrink-0"
                    onClick={() => {
                      const next = { ...compat };
                      delete next[stack];
                      onChange({ ...root, stackDeployCompat: next as JsonValue });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
            <CompatAddRow
              existingKeys={compat}
              onAdd={(key) =>
                onChange({
                  ...root,
                  stackDeployCompat: { ...compat, [key]: [] } as JsonValue,
                })
              }
            />
          </div>
        )}

        {/* ── ANNEX COSTS ── */}
        {activeTab === "annexCosts" && annex && (() => {
          const annexLabels = LABELS.commercial.annex;

          return (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground/80">Coûts annexes propres</span>
                <span className="text-[9px] text-muted-foreground/40">
                  Domaine, email, stockage — non couverts par déploiement/hébergement
                </span>
              </div>
              <div className="grid gap-2">
                {Object.entries(annex).map(([key, val]) => {
                  const label = annexLabels[key] ?? key;
                  const hint = annexLabels[`${key}Hint`];
                  const isObj = typeof val === "object" && val !== null && !Array.isArray(val);
                  const obj = isObj ? (val as Record<string, JsonValue>) : null;
                  const isRange = obj && "min" in obj && "max" in obj && Object.keys(obj).length === 2;

                  if (isRange) {
                    const range = val as unknown as { min: number; max: number };
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-muted/20"
                      >
                        <div className="w-52 shrink-0">
                          <span className="text-xs font-medium">{label}</span>
                          {hint && (
                            <p className="text-[9px] text-muted-foreground/40 mt-0.5">{hint}</p>
                          )}
                        </div>
                        <Input
                          type="number"
                          value={range.min}
                          onChange={(e) => updateAnnexField(key, { ...range, min: Number(e.target.value) })}
                          className="h-7 w-24 text-xs font-mono"
                        />
                        <span className="text-muted-foreground text-xs">→</span>
                        <Input
                          type="number"
                          value={range.max}
                          onChange={(e) => updateAnnexField(key, { ...range, max: Number(e.target.value) })}
                          className="h-7 w-24 text-xs font-mono"
                        />
                        <span className="text-[10px] text-muted-foreground/50">€</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-muted/20"
                    >
                      <span className="text-xs font-medium flex-1">{label}</span>
                      <span className="text-xs font-mono">{JSON.stringify(val)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── RULES ── */}
        {activeTab === "rules" && rules && (
          <div className="grid gap-2">
            {Object.entries(rules).map(([key, val]) => {
              if (typeof val === "boolean") {
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/20"
                  >
                    <span className="text-xs font-medium flex-1">{key}</span>
                    <Switch
                      checked={val}
                      onCheckedChange={(v) => updateRuleField(key, v)}
                    />
                  </div>
                );
              }
              if (typeof val === "number") {
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/20"
                  >
                    <span className="text-xs font-medium flex-1">{key}</span>
                    <Input
                      type="number"
                      value={val}
                      onChange={(e) => updateRuleField(key, Number(e.target.value))}
                      className="h-7 w-24 text-xs font-mono"
                    />
                  </div>
                );
              }
              if (typeof val === "string") {
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/20"
                  >
                    <span className="text-xs font-medium flex-1">{key}</span>
                    <Input
                      value={val}
                      onChange={(e) => updateRuleField(key, e.target.value)}
                      className="h-7 text-xs flex-1"
                    />
                  </div>
                );
              }
              if (typeof val === "object" && val !== null) {
                const obj = val as Record<string, JsonValue>;
                return (
                  <Card key={key} className="border-border/30 bg-card/50">
                    <CardContent className="px-3 py-2 space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
                        {key}
                      </span>
                      {Object.entries(obj).map(([subKey, subVal]) => (
                        <div key={subKey} className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground flex-1">{subKey}</span>
                          {typeof subVal === "number" ? (
                            <Input
                              type="number"
                              value={subVal}
                              onChange={(e) => {
                                const newObj = { ...obj, [subKey]: Number(e.target.value) };
                                updateRuleField(key, newObj as JsonValue);
                              }}
                              className="h-7 w-24 text-xs font-mono"
                            />
                          ) : typeof subVal === "boolean" ? (
                            <Switch
                              checked={subVal}
                              onCheckedChange={(v) => {
                                const newObj = { ...obj, [subKey]: v };
                                updateRuleField(key, newObj as JsonValue);
                              }}
                            />
                          ) : (
                            <span className="font-mono text-muted-foreground">
                              {JSON.stringify(subVal)}
                            </span>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground/50">
          {L.footer(activeSections.length)}
        </p>
      </div>
    </TooltipProvider>
  );
}
