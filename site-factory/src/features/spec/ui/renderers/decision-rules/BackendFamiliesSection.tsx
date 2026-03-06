"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Tip } from "@/shared/components/Tip";
import type { JsonValue, JsonPath } from "../../../logic/spec-types";

export function BackendFamiliesSection({
  families,
  path,
  onUpdate,
}: {
  families: Record<string, Record<string, JsonValue>>;
  path: JsonPath;
  onUpdate: (path: JsonPath, val: JsonValue) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {Object.entries(families).map(([key, fam]) => (
        <Card key={key} className="border-border/40">
          <CardContent className="p-3 space-y-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              {key}
            </Badge>
            <div className="text-xs font-medium">{fam.label as string}</div>
            <p className="text-[10px] text-muted-foreground/60">
              {fam.description as string}
            </p>
            <div className="flex items-center gap-2">
              <Tip content="Coefficient multiplicateur appliqué au coût de développement pour ce type de backend">
                <Label className="text-[10px] text-muted-foreground cursor-help">
                  Coefficient
                </Label>
              </Tip>
              <Input
                type="number"
                value={fam.coefficient as number}
                onChange={(e) =>
                  onUpdate(
                    [...path, key, "coefficient"],
                    Number(e.target.value),
                  )
                }
                className="h-6 w-16 text-xs font-mono"
                step={0.05}
              />
              <span className="text-[10px] text-muted-foreground">×</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
