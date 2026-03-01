"use client";

import type { ModuleDef, ModuleTierSelection } from "@/lib/qualification";
import { formatEur } from "@/lib/qualification-ui";

// ── Props ──────────────────────────────────────────────────────────

interface TierSelectorProps {
  mod: ModuleDef;
  tierSel?: ModuleTierSelection | undefined;
  onTierChange: (tierSel: ModuleTierSelection) => void;
}

// ── Component ──────────────────────────────────────────────────────

export function TierSelector({ mod, tierSel, onTierChange }: TierSelectorProps) {
  return (
    <div className="rounded-b-lg border-2 border-t-0 border-primary bg-primary/5 p-3 space-y-3">
      {mod.setupTiers && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Niveau de setup
          </p>
          <div className="flex flex-col gap-1">
            {mod.setupTiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTierChange({ ...tierSel, setupTierId: tier.id });
                }}
                className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors ${
                  tierSel?.setupTierId === tier.id
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div>
                  <span className="font-medium">{tier.name}</span>
                  <span className="ml-1.5 text-muted-foreground">
                    {tier.description}
                  </span>
                </div>
                <span className="ml-2 shrink-0 font-medium">
                  {formatEur(tier.priceSetup)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {mod.subscriptionTiers && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Formule abonnement
          </p>
          <div className="flex flex-col gap-1">
            {mod.subscriptionTiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTierChange({ ...tierSel, subTierId: tier.id });
                }}
                className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors ${
                  tierSel?.subTierId === tier.id
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div>
                  <span className="font-medium">{tier.name}</span>
                  <span className="ml-1.5 text-muted-foreground">
                    {tier.description}
                  </span>
                </div>
                <span className="ml-2 shrink-0 font-medium text-amber-600 dark:text-amber-400">
                  {String(tier.priceMonthly)} €/mois
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
