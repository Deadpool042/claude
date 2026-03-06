"use client";

import { Check, CircleDot, ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { WizardDecisionFlowItem } from "../logic/wizard-flow";

interface WizardDecisionFlowPanelProps {
  currentStep: number;
  items: WizardDecisionFlowItem[];
  title?: string;
  description?: string;
  compact?: boolean;
  className?: string;
}

export function WizardDecisionFlowPanel({
  currentStep,
  items,
  title = "Fil de décision",
  description,
  compact = false,
  className,
}: WizardDecisionFlowPanelProps) {
  return (
    <section className={cn("rounded-xl border bg-card/60 p-4", className)}>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div
        className={cn(
          "mt-4 grid gap-3",
          compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-5",
        )}
      >
        {items.map((item) => {
          const isCurrent = item.step === currentStep;
          const isDone = item.step < currentStep;
          return (
            <div
              key={item.step}
              className={cn(
                "relative rounded-lg border p-3 transition-colors",
                isCurrent
                  ? "border-primary/40 bg-primary/5"
                  : isDone
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-dashed bg-muted/20",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <span>Étape {item.step + 1}</span>
                    {!compact && item.step < items.length - 1 ? (
                      <ArrowRight className="size-3" />
                    ) : null}
                  </div>
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    isCurrent
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : isDone
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                        : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="size-3" /> : <CircleDot className="size-3" />}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
