"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Tip } from "@/shared/components/Tip";
import { FieldSelect } from "@/shared/components/FieldSelect";
import { splitCamelCase } from "@/shared/lib/text";
import type { JsonValue, JsonPath, ConstraintDef } from "../../../logic/spec-types";
import { LABELS } from "../../../logic/spec-labels";

const CATEGORY_OPTIONS = [
  { value: "0", label: "0 — Aucun" },
  { value: "1", label: "1 — CAT1" },
  { value: "2", label: "2 — CAT2" },
  { value: "3", label: "3 — CAT3" },
  { value: "4", label: "4 — CAT4" },
];

export function ConstraintSection({
  name,
  constraint,
  path,
  onUpdate,
}: {
  name: string;
  constraint: ConstraintDef;
  path: JsonPath;
  onUpdate: (path: JsonPath, val: JsonValue) => void;
}) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-3 space-y-2">
        <Tip content="Contrainte de projet utilisée par le moteur pour ajuster la catégorie minimale recommandée">
          <h4 className="text-xs font-medium text-foreground/80 cursor-help">
            {splitCamelCase(name)}
          </h4>
        </Tip>
        <div className="space-y-1.5">
          {constraint.values.map((val) => (
            <div
              key={val}
              className="grid grid-cols-[100px_1fr_80px] items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/20"
            >
              <Badge variant="outline" className="text-[10px] font-mono">
                {val}
              </Badge>
              <Input
                value={constraint.labels[val] ?? ""}
                onChange={(e) => {
                  const newLabels = {
                    ...constraint.labels,
                    [val]: e.target.value,
                  };
                  onUpdate([...path, "labels"], newLabels as unknown as JsonValue);
                }}
                className="h-7 text-xs"
              />
              {constraint.minCategoryIndex && (
                <Tip content={LABELS.decision.constraints.minCatHint(val)}>
                  <div>
                    <FieldSelect
                      value={String(constraint.minCategoryIndex[val] ?? 0)}
                      onChange={(v) =>
                        onUpdate(
                          [...path, "minCategoryIndex", val],
                          Number(v),
                        )
                      }
                      options={CATEGORY_OPTIONS}
                      size="sm"
                    />
                  </div>
                </Tip>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
