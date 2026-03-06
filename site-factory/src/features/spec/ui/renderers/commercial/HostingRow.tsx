"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { JsonValue, HostingCost } from "../../../logic/spec-types";
import { LABELS } from "../../../logic/spec-labels";

export function HostingRow({
  entryKey,
  entry,
  onUpdate,
}: {
  entryKey: string;
  entry: HostingCost;
  onUpdate: (field: string, value: JsonValue) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const rangeLabel = `${entry.range.min}–${entry.range.max} €/mois`;

  return (
    <Card className="overflow-hidden border-border/30 bg-card/50">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/20 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        )}
        <Badge variant="outline" className="text-[10px]">{entryKey}</Badge>
        <span className="text-xs font-medium flex-1">{entry.label}</span>
        <span className="text-xs font-mono font-semibold text-sky-400">{rangeLabel}</span>
      </button>

      {expanded && (
        <CardContent className="pt-0 px-3 pb-3 space-y-2 border-t border-border/30">
          <div className="grid grid-cols-[120px_1fr] items-center gap-2 pt-2">
            <Label className="text-[10px] text-muted-foreground/50">Label</Label>
            <Input
              value={entry.label}
              onChange={(e) => onUpdate("label", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label className="text-[10px] text-muted-foreground/50">{LABELS.commercial.range}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={entry.range.min}
                onChange={(e) => onUpdate("range", { ...entry.range, min: Number(e.target.value) })}
                className="h-7 w-24 text-xs font-mono"
              />
              <span className="text-muted-foreground text-xs">→</span>
              <Input
                type="number"
                value={entry.range.max}
                onChange={(e) => onUpdate("range", { ...entry.range, max: Number(e.target.value) })}
                className="h-7 w-24 text-xs font-mono"
              />
              <span className="text-[10px] text-muted-foreground/50">€/mois</span>
            </div>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-start gap-2">
            <Label className="text-[10px] text-muted-foreground/50 mt-1.5">{LABELS.commercial.description}</Label>
            <textarea
              value={entry.description ?? ""}
              onChange={(e) => onUpdate("description", e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-8"
            />
          </div>

          {/* Headless sub-section */}
          {entry.headless && (
            <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] bg-violet-500/20 text-violet-400 border-violet-500/30">
                  🔗 HEADLESS
                </Badge>
                <span className="text-[10px] text-muted-foreground/60">{entry.headless.label}</span>
                <span className="ml-auto text-xs font-mono font-semibold text-violet-400">
                  {entry.headless.range.min}–{entry.headless.range.max} €/mois
                </span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <Label className="text-[10px] text-muted-foreground/50">Label headless</Label>
                <Input
                  value={entry.headless.label}
                  onChange={(e) =>
                    onUpdate("headless", { ...entry.headless!, label: e.target.value } as JsonValue)
                  }
                  className="h-7 text-xs"
                />
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <Label className="text-[10px] text-muted-foreground/50">Range headless</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={entry.headless.range.min}
                    onChange={(e) =>
                      onUpdate(
                        "headless",
                        {
                          ...entry.headless!,
                          range: { ...entry.headless!.range, min: Number(e.target.value) },
                        } as JsonValue
                      )
                    }
                    className="h-7 w-24 text-xs font-mono"
                  />
                  <span className="text-muted-foreground text-xs">→</span>
                  <Input
                    type="number"
                    value={entry.headless.range.max}
                    onChange={(e) =>
                      onUpdate(
                        "headless",
                        {
                          ...entry.headless!,
                          range: { ...entry.headless!.range, max: Number(e.target.value) },
                        } as JsonValue
                      )
                    }
                    className="h-7 w-24 text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground/50">€/mois</span>
                </div>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                <Label className="text-[10px] text-muted-foreground/50 mt-1.5">Description</Label>
                <textarea
                  value={entry.headless.description ?? ""}
                  onChange={(e) =>
                    onUpdate(
                      "headless",
                      { ...entry.headless!, description: e.target.value } as JsonValue
                    )
                  }
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-8"
                />
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
