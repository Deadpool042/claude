"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import type { PriceBand } from "../../../logic/spec-types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../../../logic/spec-constants";
import { LABELS } from "../../../logic/spec-labels";

export function PriceBandRow({
  catKey,
  band,
  onUpdate,
}: {
  catKey: string;
  band: PriceBand;
  onUpdate: (field: keyof NonNullable<PriceBand>, value: string | number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!band) return null;

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
        <Badge
          variant="outline"
          className={cn("text-[10px] w-24 justify-center", CATEGORY_COLORS[catKey])}
        >
          {CATEGORY_LABELS[catKey] ?? catKey}
        </Badge>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">{LABELS.commercial.from}</span>
          <span className="font-mono font-semibold text-emerald-400">{band.from} €</span>
          <span className="text-muted-foreground mx-1">→</span>
          <span className="font-mono font-semibold text-amber-400">{band.to} €</span>
        </div>
        {band.description && (
          <span className="text-[10px] text-muted-foreground/60 ml-auto line-clamp-1 max-w-[40%]">
            {band.description}
          </span>
        )}
      </button>

      {expanded && (
        <CardContent className="pt-0 px-3 pb-3 space-y-2 border-t border-border/30">
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">{LABELS.commercial.from}</Label>
              <Input
                type="number"
                value={band.from}
                onChange={(e) => onUpdate("from", Number(e.target.value))}
                className="h-7 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">{LABELS.commercial.to}</Label>
              <Input
                type="number"
                value={band.to}
                onChange={(e) => onUpdate("to", Number(e.target.value))}
                className="h-7 text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground/50">{LABELS.commercial.description}</Label>
            <textarea
              value={band.description ?? ""}
              onChange={(e) => onUpdate("description", e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-8"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
