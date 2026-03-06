"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import type { JsonValue, MaintenancePlan } from "../../../logic/spec-types";
import { CATEGORY_COLORS } from "../../../logic/spec-constants";
import { LABELS } from "../../../logic/spec-labels";

export function MaintenanceCard({
  catKey,
  plan,
  onUpdate,
}: {
  catKey: string;
  plan: MaintenancePlan;
  onUpdate: (field: string, value: JsonValue) => void;
}) {
  const [open, setOpen] = useState(false);
  if (!plan) return null;
  const scope = plan.scope ?? [];

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
          className={cn("text-[10px] w-24 justify-center", CATEGORY_COLORS[catKey])}
        >
          {plan.shortLabel}
        </Badge>
        <span className="text-xs font-medium flex-1">{plan.label}</span>
        <span className="text-xs font-mono font-semibold text-emerald-400">
          {plan.monthly} {LABELS.commercial.perMonth}
        </span>
        <Badge variant="outline" className="text-[9px]">
          {plan.splitPrestataire}% presta
        </Badge>
      </button>

      {open && (
        <CardContent className="pt-0 px-3 pb-3 space-y-2 border-t border-border/30">
          <div className="grid grid-cols-[120px_1fr] items-center gap-2 pt-2">
            <Label className="text-[10px] text-muted-foreground/50">Label</Label>
            <Input
              value={plan.label}
              onChange={(e) => onUpdate("label", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label className="text-[10px] text-muted-foreground/50">Label court</Label>
            <Input
              value={plan.shortLabel}
              onChange={(e) => onUpdate("shortLabel", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-start gap-2">
            <Label className="text-[10px] text-muted-foreground/50 mt-1.5">{LABELS.commercial.description}</Label>
            <textarea
              value={plan.description ?? ""}
              onChange={(e) => onUpdate("description", e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-8"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">{LABELS.commercial.monthly}</Label>
              <Input
                type="number"
                value={plan.monthly}
                onChange={(e) => onUpdate("monthly", Number(e.target.value))}
                className="h-7 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">{LABELS.commercial.splitPrestataire}</Label>
              <Input
                type="number"
                value={plan.splitPrestataire}
                onChange={(e) => onUpdate("splitPrestataire", Number(e.target.value))}
                className="h-7 text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground/50">{LABELS.commercial.scope}</Label>
            {scope.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-emerald-400 text-xs">•</span>
                <Input
                  value={item}
                  onChange={(e) => {
                    const newScope = [...scope];
                    newScope[i] = e.target.value;
                    onUpdate("scope", newScope);
                  }}
                  className="h-7 text-xs flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground/50 hover:text-destructive shrink-0"
                  onClick={() => onUpdate("scope", scope.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground/60 hover:text-foreground gap-1 mt-1"
              onClick={() => onUpdate("scope", [...scope, ""])}
            >
              <Plus className="h-3 w-3" /> Ajouter
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
