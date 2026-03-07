"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import type { JsonValue } from "../../../logic/spec-types";

interface CommercialRulesSectionProps {
  rules: Record<string, JsonValue>;
  onUpdateField: (key: string, value: JsonValue) => void;
}

export function CommercialRulesSection({
  rules,
  onUpdateField,
}: CommercialRulesSectionProps) {
  return (
    <div className="grid gap-2">
      {Object.entries(rules).map(([key, value]) => {
        if (typeof value === "boolean") {
          return (
            <div
              key={key}
              className="flex items-center gap-3 rounded-md bg-muted/20 px-3 py-2"
            >
              <span className="flex-1 text-xs font-medium">{key}</span>
              <Switch
                checked={value}
                onCheckedChange={(checked) => onUpdateField(key, checked)}
              />
            </div>
          );
        }

        if (typeof value === "number") {
          return (
            <div
              key={key}
              className="flex items-center gap-3 rounded-md bg-muted/20 px-3 py-2"
            >
              <span className="flex-1 text-xs font-medium">{key}</span>
              <Input
                type="number"
                value={value}
                onChange={(event) => onUpdateField(key, Number(event.target.value))}
                className="h-7 w-24 text-xs font-mono"
              />
            </div>
          );
        }

        if (typeof value === "string") {
          return (
            <div
              key={key}
              className="flex items-center gap-3 rounded-md bg-muted/20 px-3 py-2"
            >
              <span className="flex-1 text-xs font-medium">{key}</span>
              <Input
                value={value}
                onChange={(event) => onUpdateField(key, event.target.value)}
                className="h-7 flex-1 text-xs"
              />
            </div>
          );
        }

        if (typeof value === "object" && value !== null) {
          const nestedRules = value as Record<string, JsonValue>;

          return (
            <Card key={key} className="border-border/30 bg-card/50">
              <CardContent className="space-y-1 px-3 py-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                  {key}
                </span>
                {Object.entries(nestedRules).map(([nestedKey, nestedValue]) => (
                  <div key={nestedKey} className="flex items-center gap-3 text-xs">
                    <span className="flex-1 text-muted-foreground">{nestedKey}</span>
                    {typeof nestedValue === "number" ? (
                      <Input
                        type="number"
                        value={nestedValue}
                        onChange={(event) =>
                          onUpdateField(key, {
                            ...nestedRules,
                            [nestedKey]: Number(event.target.value),
                          })
                        }
                        className="h-7 w-24 text-xs font-mono"
                      />
                    ) : typeof nestedValue === "boolean" ? (
                      <Switch
                        checked={nestedValue}
                        onCheckedChange={(checked) =>
                          onUpdateField(key, {
                            ...nestedRules,
                            [nestedKey]: checked,
                          })
                        }
                      />
                    ) : (
                      <span className="font-mono text-muted-foreground">
                        {JSON.stringify(nestedValue)}
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
  );
}
