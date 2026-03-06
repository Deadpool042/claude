"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { FieldSelect } from "@/shared/components/FieldSelect";
import type { JsonValue, DeployFee } from "../../../logic/spec-types";
import { LABELS } from "../../../logic/spec-labels";

const COMPLEXITY_OPTIONS = [
  { value: "LOW", label: "LOW" },
  { value: "MEDIUM", label: "MEDIUM" },
  { value: "HIGH", label: "HIGH" },
];

export function DeployCard({
  fee,
  onUpdate,
}: {
  fee: DeployFee;
  onUpdate: (field: string, value: JsonValue) => void;
}) {
  const [open, setOpen] = useState(false);

  const complexityColor = fee.complexity === "LOW"
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : fee.complexity === "HIGH"
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
      : "bg-sky-500/20 text-sky-400 border-sky-500/30";

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
        <Badge variant="outline" className={cn("text-[9px]", complexityColor)}>
          {fee.complexity ?? "MEDIUM"}
        </Badge>
        <span className="text-xs font-medium flex-1">{fee.label}</span>
        <span className="text-xs font-mono font-semibold text-amber-400">
          {fee.cost} {LABELS.commercial.oneShot}
        </span>
      </button>

      {open && (
        <CardContent className="pt-0 px-3 pb-3 space-y-2 border-t border-border/30">
          <div className="grid grid-cols-[120px_1fr] items-center gap-2 pt-2">
            <Label className="text-[10px] text-muted-foreground/50">Label</Label>
            <Input
              value={fee.label}
              onChange={(e) => onUpdate("label", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label className="text-[10px] text-muted-foreground/50">{LABELS.commercial.cost}</Label>
            <Input
              type="number"
              value={fee.cost}
              onChange={(e) => onUpdate("cost", Number(e.target.value))}
              className="h-7 text-xs font-mono"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label className="text-[10px] text-muted-foreground/50">Complexité</Label>
            <FieldSelect
              value={fee.complexity ?? "MEDIUM"}
              onChange={(v) => onUpdate("complexity", v)}
              options={COMPLEXITY_OPTIONS}
              size="sm"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-start gap-2">
            <Label className="text-[10px] text-muted-foreground/50 mt-1.5">{LABELS.commercial.description}</Label>
            <textarea
              value={fee.description ?? ""}
              onChange={(e) => onUpdate("description", e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground/50">{LABELS.commercial.scope}</Label>
            {fee.scope.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-sky-400 text-xs">•</span>
                <Input
                  value={item}
                  onChange={(e) => {
                    const newScope = [...fee.scope];
                    newScope[i] = e.target.value;
                    onUpdate("scope", newScope);
                  }}
                  className="h-7 text-xs flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground/50 hover:text-destructive shrink-0"
                  onClick={() => onUpdate("scope", fee.scope.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground/60 hover:text-foreground gap-1 mt-1"
              onClick={() => onUpdate("scope", [...fee.scope, ""])}
            >
              <Plus className="h-3 w-3" /> Ajouter
            </Button>
          </div>

          {/* Headless sub-section */}
          {fee.headless && (
            <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] bg-violet-500/20 text-violet-400 border-violet-500/30">
                  🔗 HEADLESS
                </Badge>
                <span className="text-[10px] text-muted-foreground/60">{fee.headless.label}</span>
                <span className="ml-auto text-xs font-mono font-semibold text-violet-400">
                  {fee.headless.cost} €
                </span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <Label className="text-[10px] text-muted-foreground/50">Label headless</Label>
                <Input
                  value={fee.headless.label}
                  onChange={(e) =>
                    onUpdate("headless", { ...fee.headless!, label: e.target.value } as JsonValue)
                  }
                  className="h-7 text-xs"
                />
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <Label className="text-[10px] text-muted-foreground/50">Coût headless</Label>
                <Input
                  type="number"
                  value={fee.headless.cost}
                  onChange={(e) =>
                    onUpdate(
                      "headless",
                      { ...fee.headless!, cost: Number(e.target.value) } as JsonValue
                    )
                  }
                  className="h-7 text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                <Label className="text-[10px] text-muted-foreground/50 mt-1.5">Description</Label>
                <textarea
                  value={fee.headless.description ?? ""}
                  onChange={(e) =>
                    onUpdate(
                      "headless",
                      { ...fee.headless!, description: e.target.value } as JsonValue
                    )
                  }
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground/50">Scope headless</Label>
                {fee.headless.scope.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-violet-400 text-xs">•</span>
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newScope = [...fee.headless!.scope];
                        newScope[i] = e.target.value;
                        onUpdate(
                          "headless",
                          { ...fee.headless!, scope: newScope } as JsonValue
                        );
                      }}
                      className="h-7 text-xs flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground/50 hover:text-destructive shrink-0"
                      onClick={() =>
                        onUpdate(
                          "headless",
                          {
                            ...fee.headless!,
                            scope: fee.headless!.scope.filter((_, j) => j !== i),
                          } as JsonValue
                        )
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground/60 hover:text-foreground gap-1 mt-1"
                  onClick={() =>
                    onUpdate(
                      "headless",
                      { ...fee.headless!, scope: [...fee.headless!.scope, ""] } as JsonValue
                    )
                  }
                >
                  <Plus className="h-3 w-3" /> Ajouter
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
