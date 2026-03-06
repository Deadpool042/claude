"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Tip } from "@/shared/components/Tip";
import { capitalizeFirst, splitCamelCase } from "@/shared/lib/text";
import type { JsonValue, JsonPath } from "../../../logic/spec-types";

const categories = ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"];

export function EconomicRulesSection({
  rules,
  path,
  onUpdate,
}: {
  rules: Record<string, JsonValue>;
  path: JsonPath;
  onUpdate: (path: JsonPath, val: JsonValue) => void;
}) {
  const basePricing = rules.basePricingByCategory as
    | Record<string, JsonValue>
    | undefined;
  const maintenancePricing = rules.maintenancePricingByCategory as
    | Record<string, JsonValue>
    | undefined;

  return (
    <div className="space-y-3">
      {/* Base pricing by category */}
      {basePricing && (
        <Card className="border-border/40">
          <CardContent className="p-4 space-y-3">
            <Tip content="Prix de base du package par catégorie. Utilisé pour générer les fourchettes de devis.">
              <h4 className="text-xs font-semibold text-foreground/80 cursor-help">
                Tarifs de base par catégorie
              </h4>
            </Tip>
            {categories.map((cat) => {
              const entry = basePricing[cat];
              if (!entry || typeof entry !== "object") return null;
              const obj = entry as Record<string, JsonValue>;
              const mode =
                typeof obj.from === "number"
                  ? "RANGE"
                  : typeof obj.startingFrom === "number"
                    ? "FROM"
                    : null;
              return (
                <div
                  key={cat}
                  className="grid grid-cols-[60px_1fr] items-center gap-3"
                >
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {cat}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {mode === "RANGE" && (
                      <>
                        <Input
                          type="number"
                          value={(obj.from as number) ?? 0}
                          onChange={(e) =>
                            onUpdate(
                              [
                                ...path,
                                "basePricingByCategory",
                                cat,
                                "from",
                              ],
                              Number(e.target.value),
                            )
                          }
                          className="h-7 w-24 text-xs font-mono"
                        />
                        <span className="text-muted-foreground text-xs">
                          →
                        </span>
                        <Input
                          type="number"
                          value={(obj.to as number) ?? 0}
                          onChange={(e) =>
                            onUpdate(
                              [
                                ...path,
                                "basePricingByCategory",
                                cat,
                                "to",
                              ],
                              Number(e.target.value),
                            )
                          }
                          className="h-7 w-24 text-xs font-mono"
                        />
                        <span className="text-[10px] text-muted-foreground">
                          €
                        </span>
                      </>
                    )}
                    {mode === "FROM" && (
                      <>
                        <span className="text-[10px] text-muted-foreground">
                          À partir de
                        </span>
                        <Input
                          type="number"
                          value={(obj.startingFrom as number) ?? 0}
                          onChange={(e) =>
                            onUpdate(
                              [
                                ...path,
                                "basePricingByCategory",
                                cat,
                                "startingFrom",
                              ],
                              Number(e.target.value),
                            )
                          }
                          className="h-7 w-24 text-xs font-mono"
                        />
                        <span className="text-[10px] text-muted-foreground">
                          €
                        </span>
                      </>
                    )}
                    {typeof obj.label === "string" && (
                      <span className="text-[10px] text-muted-foreground/50">
                        ({obj.label as string})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Maintenance pricing */}
      {maintenancePricing && (
        <Card className="border-border/40">
          <CardContent className="p-4 space-y-3">
            <Tip content="Tarifs de maintenance mensuelle par catégorie. Affichés au client dans le devis récurrent.">
              <h4 className="text-xs font-semibold text-foreground/80 cursor-help">
                Maintenance mensuelle par catégorie
              </h4>
            </Tip>
            {categories.map((cat) => {
              const entry = maintenancePricing[cat];
              if (!entry) return null;
              return (
                <div
                  key={cat}
                  className="grid grid-cols-[60px_1fr] items-center gap-3"
                >
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {cat}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={((entry as Record<string, JsonValue>).monthly as number) ?? 0}
                      onChange={(e) =>
                        onUpdate(
                          [
                            ...path,
                            "maintenancePricingByCategory",
                            cat,
                            "monthly",
                          ],
                          Number(e.target.value),
                        )
                      }
                      className="h-7 w-24 text-xs font-mono"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      €/mois
                    </span>
                    {typeof (entry as Record<string, JsonValue>).label === "string" && (
                      <span className="text-[10px] text-muted-foreground/50">
                        ({(entry as Record<string, JsonValue>).label as string})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Guardrails */}
      {rules.marketPositioning &&
        typeof rules.marketPositioning === "object" && (
          <Card className="border-border/40">
            <CardContent className="p-4 space-y-3">
              <Tip content="Garde-fous tarifaires pour éviter des incohérences dans le positionnement prix">
                <h4 className="text-xs font-semibold text-foreground/80 cursor-help">
                  Garde-fous positionnement
                </h4>
              </Tip>
              {(() => {
                const mp = rules.marketPositioning as Record<string, JsonValue>;
                const guardrails = mp.guardrails as Record<string, JsonValue> | undefined;
                if (!guardrails) return null;
                return Object.entries(guardrails).map(([key, val]) => (
                  <div
                    key={key}
                    className="grid grid-cols-[1fr_120px] items-center gap-3"
                  >
                    <Tip content={`Règle économique : ${key}`}>
                      <Label className="text-[10px] text-muted-foreground cursor-help">
                        {capitalizeFirst(splitCamelCase(key))}
                      </Label>
                    </Tip>
                    {typeof val === "boolean" ? (
                      <Switch
                        checked={val}
                        onCheckedChange={(v) =>
                          onUpdate(
                            [
                              ...path,
                              "marketPositioning",
                              "guardrails",
                              key,
                            ],
                            v,
                          )
                        }
                      />
                    ) : typeof val === "number" ? (
                      <Input
                        type="number"
                        value={val}
                        onChange={(e) =>
                          onUpdate(
                            [
                              ...path,
                              "marketPositioning",
                              "guardrails",
                              key,
                            ],
                            Number(e.target.value),
                          )
                        }
                        className="h-7 text-xs font-mono"
                        step={0.01}
                      />
                    ) : null}
                  </div>
                ));
              })()}
            </CardContent>
          </Card>
        )}

      {/* Pricing coherence rules */}
      {rules.pricingCoherence &&
        typeof rules.pricingCoherence === "object" && (
          <Card className="border-border/40">
            <CardContent className="p-4 space-y-3">
              <Tip content="Règles de cohérence prix imposées au moteur de décision">
                <h4 className="text-xs font-semibold text-foreground/80 cursor-help">
                  Cohérence tarifaire
                </h4>
              </Tip>
              {Object.entries(
                rules.pricingCoherence as Record<string, boolean>,
              ).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3"
                >
                  <Label className="text-[10px] text-muted-foreground flex-1">
                    {capitalizeFirst(splitCamelCase(key))}
                  </Label>
                  <Switch
                    checked={val}
                    onCheckedChange={(v) =>
                      onUpdate(
                        [...path, "pricingCoherence", key],
                        v,
                      )
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
