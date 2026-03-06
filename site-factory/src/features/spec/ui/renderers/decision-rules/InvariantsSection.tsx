"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Tip } from "@/shared/components/Tip";
import { capitalizeFirst, splitCamelCase } from "@/shared/lib/text";
import type { JsonValue, JsonPath } from "../../../logic/spec-types";

export function InvariantsSection({
  invariants,
  path,
  onUpdate,
}: {
  invariants: Record<string, JsonValue>;
  path: JsonPath;
  onUpdate: (path: JsonPath, val: JsonValue) => void;
}) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-4 space-y-2">
        <Tip content="Invariants métier qui ne doivent jamais être violés par le moteur de décision">
          <h4 className="text-xs font-semibold text-foreground/80 cursor-help">
            Invariants
          </h4>
        </Tip>
        {Object.entries(invariants).map(([key, val]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3"
          >
            <Label className="text-[10px] text-muted-foreground">
              {capitalizeFirst(splitCamelCase(key))}
            </Label>
            {typeof val === "boolean" ? (
              <Switch
                checked={val}
                onCheckedChange={(v) => onUpdate([...path, key], v)}
              />
            ) : typeof val === "number" ? (
              <Input
                type="number"
                value={val}
                onChange={(e) =>
                  onUpdate([...path, key], Number(e.target.value))
                }
                className="h-7 w-20 text-xs font-mono"
              />
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
