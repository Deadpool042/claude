"use client";

import { Input } from "@/shared/components/ui/input";
import type { JsonValue } from "../../../logic/spec-types";
import { LABELS } from "../../../logic/spec-labels";

interface AnnexCostsSectionProps {
  annex: Record<string, JsonValue>;
  onUpdateField: (key: string, value: JsonValue) => void;
}

function isRangeValue(value: JsonValue): value is { min: number; max: number } {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && "min" in value
    && "max" in value
    && Object.keys(value).length === 2;
}

export function AnnexCostsSection({
  annex,
  onUpdateField,
}: AnnexCostsSectionProps) {
  const annexLabels = LABELS.commercial.annex;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-foreground/80">
          Coûts annexes propres
        </span>
        <span className="text-[9px] text-muted-foreground/40">
          Domaine, email, stockage — non couverts par déploiement/hébergement
        </span>
      </div>

      <div className="grid gap-2">
        {Object.entries(annex).map(([key, value]) => {
          const label = annexLabels[key] ?? key;
          const hint = annexLabels[`${key}Hint`];

          if (isRangeValue(value)) {
            return (
              <div
                key={key}
                className="flex items-center gap-3 rounded-md bg-muted/20 px-3 py-2.5"
              >
                <div className="w-52 shrink-0">
                  <span className="text-xs font-medium">{label}</span>
                  {hint && (
                    <p className="mt-0.5 text-[9px] text-muted-foreground/40">
                      {hint}
                    </p>
                  )}
                </div>
                <Input
                  type="number"
                  value={value.min}
                  onChange={(event) =>
                    onUpdateField(key, {
                      ...value,
                      min: Number(event.target.value),
                    })
                  }
                  className="h-7 w-24 text-xs font-mono"
                />
                <span className="text-xs text-muted-foreground">→</span>
                <Input
                  type="number"
                  value={value.max}
                  onChange={(event) =>
                    onUpdateField(key, {
                      ...value,
                      max: Number(event.target.value),
                    })
                  }
                  className="h-7 w-24 text-xs font-mono"
                />
                <span className="text-[10px] text-muted-foreground/50">€</span>
              </div>
            );
          }

          return (
            <div
              key={key}
              className="flex items-center gap-3 rounded-md bg-muted/20 px-3 py-2.5"
            >
              <span className="flex-1 text-xs font-medium">{label}</span>
              <span className="text-xs font-mono">{JSON.stringify(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
