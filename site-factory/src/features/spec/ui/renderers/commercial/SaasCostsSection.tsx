"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { JsonValue, SaasCost } from "../../../logic/spec-types";
import { LABELS } from "../../../logic/spec-labels";

interface SaasCostsSectionProps {
  saas: Record<string, SaasCost>;
  onUpdate: (key: string, field: keyof SaasCost, value: JsonValue) => void;
}

export function SaasCostsSection({
  saas,
  onUpdate,
}: SaasCostsSectionProps) {
  return (
    <div className="grid gap-2">
      {Object.entries(saas).map(([key, entry]) => (
        <Card key={key} className="overflow-hidden border-border/30 bg-card/50">
          <CardContent className="space-y-2 px-3 py-2.5">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-violet-500/30 bg-violet-500/20 text-[10px] text-violet-400"
              >
                {key}
              </Badge>
              <span className="flex-1 text-xs font-medium">{entry.label}</span>
              <span className="text-xs font-mono font-semibold text-violet-400">
                {entry.range}
              </span>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <Label className="text-[10px] text-muted-foreground/50">Label</Label>
              <Input
                value={entry.label}
                onChange={(event) => onUpdate(key, "label", event.target.value)}
                className="h-7 text-xs"
              />
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <Label className="text-[10px] text-muted-foreground/50">
                {LABELS.commercial.range}
              </Label>
              <Input
                value={entry.range}
                onChange={(event) => onUpdate(key, "range", event.target.value)}
                className="h-7 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-[120px_1fr] items-start gap-2">
              <Label className="mt-1.5 text-[10px] text-muted-foreground/50">
                {LABELS.commercial.description}
              </Label>
              <textarea
                value={entry.description ?? ""}
                onChange={(event) => onUpdate(key, "description", event.target.value)}
                rows={2}
                className="min-h-8 w-full resize-y rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
