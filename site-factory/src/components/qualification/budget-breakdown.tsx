"use client";

import {
  computeStackMultiplier,
  getMultiplierLabel,
  type TechStack,
  type ProjectType,
} from "@/lib/qualification";
import { formatEur } from "@/lib/qualification-ui";

// ── Props ──────────────────────────────────────────────────────────

interface BudgetBreakdownProps {
  budget: {
    base: number;
    modulesTotal: number;
    deployCost: number;
    monthlyTotal: number;
    grandTotal: number;
  };
  moduleCount: number;
  projectType: ProjectType;
  techStack: TechStack;
  wpHeadless?: boolean;
  /** "compact" = liste inline  |  "full" = grille du récapitulatif */
  variant?: "compact" | "full";
}

// ── Component ──────────────────────────────────────────────────────

export function BudgetBreakdown({
  budget,
  moduleCount,
  projectType,
  techStack,
  wpHeadless = false,
  variant = "compact",
}: BudgetBreakdownProps) {
  const multiplier = computeStackMultiplier(projectType, techStack, wpHeadless);
  const multiplierLabel = getMultiplierLabel(projectType, techStack, wpHeadless);

  /* ── Variant "full" (step résumé / summary) ────────────────────── */
  if (variant === "full") {
    return (
      <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Base site</p>
          <p className="text-sm font-medium">{formatEur(budget.base)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Modules</p>
          <p className="text-sm font-medium">
            {formatEur(budget.modulesTotal)}
          </p>
        </div>
        {budget.deployCost > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">
              Mise en production
            </p>
            <p className="text-sm font-medium">
              {formatEur(budget.deployCost)}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Total estimé</p>
          <p className="text-base font-bold">
            {formatEur(budget.grandTotal)}
          </p>
        </div>
        {budget.monthlyTotal > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Récurrent</p>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {formatEur(budget.monthlyTotal)}/mois
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ── Variant "compact" (barre inline de l'edit form) ───────────── */
  return (
    <div className="rounded-lg border bg-muted/20 p-3 space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">
          Base projet
          {multiplier !== 1 && (
            <span className="ml-1 text-[10px] opacity-60">
              ({multiplierLabel})
            </span>
          )}
        </span>
        <span>{formatEur(budget.base)}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-muted-foreground">
          Modules ({String(moduleCount)})
        </span>
        <span>+ {formatEur(budget.modulesTotal)}</span>
      </div>

      {budget.deployCost > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mise en production</span>
          <span>+ {formatEur(budget.deployCost)}</span>
        </div>
      )}

      {budget.monthlyTotal > 0 && (
        <div className="flex justify-between text-amber-600 dark:text-amber-400">
          <span>Récurrent mensuel</span>
          <span>+ {formatEur(budget.monthlyTotal)}/mois</span>
        </div>
      )}

      <div className="flex justify-between font-medium border-t pt-1 mt-1">
        <span>Total</span>
        <span>{formatEur(budget.grandTotal)}</span>
      </div>
    </div>
  );
}
