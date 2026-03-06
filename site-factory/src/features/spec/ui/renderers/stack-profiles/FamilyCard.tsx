"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { Tip } from "@/shared/components/Tip";
import type { JsonValue, StackFamily } from "../../../logic/spec-types";
import { LABELS } from "../../../logic/spec-labels";
import { FAMILY_COLORS } from "./constants";

export function FamilyCard({
  family,
  onUpdate,
}: {
  family: StackFamily;
  onUpdate: (field: string, value: JsonValue) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden border-border/30 bg-card/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/20 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        )}
        <Badge
          variant="outline"
          className={cn("text-[10px] shrink-0", FAMILY_COLORS[family.id])}
        >
          {family.id}
        </Badge>
        <span className="text-xs font-medium flex-1">{family.label}</span>
        <span className="text-xs font-mono font-semibold text-emerald-400">
          {family.basePrice.from} €+
        </span>
      </button>

      {open && (
        <CardContent className="pt-0 px-3 pb-3 space-y-2 border-t border-border/30">
          <div className="grid grid-cols-[120px_1fr] items-center gap-2 pt-2">
            <Label className="text-[10px] text-muted-foreground/50">Label</Label>
            <Input
              value={family.label}
              onChange={(e) => onUpdate("label", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-start gap-2">
            <Label className="text-[10px] text-muted-foreground/50 mt-1.5">
              {LABELS.stackProfiles.families.description}
            </Label>
            <textarea
              value={family.description}
              onChange={(e) => onUpdate("description", e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-8"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">
                {LABELS.stackProfiles.families.basePrice}
              </Label>
              <Input
                type="number"
                value={family.basePrice.from}
                onChange={(e) =>
                  onUpdate("basePrice", { ...family.basePrice, from: Number(e.target.value) })
                }
                className="h-7 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">
                <Tip content={LABELS.stackProfiles.families.maintenanceFloorHint}>
                  {LABELS.stackProfiles.families.maintenanceFloor}
                </Tip>
              </Label>
              <Input
                type="number"
                value={family.maintenanceFloor}
                onChange={(e) => onUpdate("maintenanceFloor", Number(e.target.value))}
                className="h-7 text-xs font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label className="text-[10px] text-muted-foreground/50">
              {LABELS.stackProfiles.families.basePriceLabel}
            </Label>
            <Input
              value={family.basePrice.label}
              onChange={(e) =>
                onUpdate("basePrice", { ...family.basePrice, label: e.target.value })
              }
              className="h-7 text-xs"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
