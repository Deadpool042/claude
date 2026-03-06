"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Tip } from "@/shared/components/Tip";
import type { JsonValue, JsonPath } from "../../../logic/spec-types";

export function ComplexitySection({
  ci,
  path,
  onUpdate,
}: {
  ci: Record<string, JsonValue>;
  path: JsonPath;
  onUpdate: (path: JsonPath, val: JsonValue) => void;
}) {
  const weights = ci.weights as Record<string, number> | undefined;
  const thresholds = ci.thresholds as
    | Array<Record<string, JsonValue>>
    | undefined;
  const axisLabels = ci.axisLabels as Record<string, string> | undefined;

  return (
    <div className="space-y-3">
      {/* Formula */}
      <Card className="border-border/40 bg-muted/10">
        <CardContent className="p-3">
          <Tip content="Formule utilisée pour calculer l'indice de complexité d'un projet">
            <code className="text-xs text-primary/80 cursor-help">
              {(ci.formula as string) ?? ""}
            </code>
          </Tip>
        </CardContent>
      </Card>

      {/* Weights */}
      {weights && (
        <Card className="border-border/40">
          <CardContent className="p-4 space-y-2">
            <Tip content="Poids de chaque axe dans le calcul CI. Modifie l'importance relative de chaque dimension.">
              <h4 className="text-xs font-semibold text-foreground/80 cursor-help">
                Poids des axes
              </h4>
            </Tip>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(weights).map(([axis, weight]) => (
                <div key={axis} className="flex items-center gap-2">
                  <Tip content={axisLabels?.[axis] ?? axis}>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono w-8 justify-center cursor-help"
                    >
                      {axis.toUpperCase()}
                    </Badge>
                  </Tip>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) =>
                      onUpdate(
                        [...path, "weights", axis],
                        Number(e.target.value),
                      )
                    }
                    className="h-7 w-20 text-xs font-mono"
                    step={0.1}
                    min={0}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Thresholds */}
      {thresholds && (
        <Card className="border-border/40">
          <CardContent className="p-4 space-y-2">
            <Tip content="Seuils CI → catégorie. Définit quelle valeur CI mène à quelle catégorie projet.">
              <h4 className="text-xs font-semibold text-foreground/80 cursor-help">
                Seuils de catégorisation
              </h4>
            </Tip>
            {thresholds.map((t, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[60px_80px_1fr] items-center gap-2"
              >
                <Badge variant="outline" className="text-[10px] font-mono">
                  {(t.category as string) ?? ""}
                </Badge>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">
                    max:
                  </span>
                  {t.max !== null ? (
                    <Input
                      type="number"
                      value={t.max as number}
                      onChange={(e) =>
                        onUpdate(
                          [...path, "thresholds", idx, "max"],
                          Number(e.target.value),
                        )
                      }
                      className="h-6 w-14 text-[10px] font-mono"
                    />
                  ) : (
                    <span className="text-[10px] text-muted-foreground/50">
                      ∞
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground/70">
                  {(t.label as string) ?? ""}
                  {t.note ? ` (${t.note as string})` : ""}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
