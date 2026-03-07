"use client";

import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Tip } from "@/shared/components/Tip";
import { cn } from "@/shared/lib/utils";
import type { PluginItem } from "../../../logic/spec-types";
import {
  BILLING_CYCLE_LABELS,
  PRICING_COLORS,
} from "../../../logic/spec-constants";

interface PluginCardHeaderProps {
  plugin: PluginItem;
  expanded: boolean;
  onToggle: () => void;
}

function PluginQuickPricing({ plugin }: { plugin: PluginItem }) {
  if (typeof plugin.priceAnnual === "number" && plugin.priceAnnual > 0) {
    const renewalDiscount = plugin.renewalDiscountPercent ?? 0;
    const discountedAnnual = Math.round(
      plugin.priceAnnual * (1 - renewalDiscount / 100),
    );
    const monthlyEquivalent = (plugin.priceAnnual / 12).toFixed(1);
    const tipContent = `Licence ${plugin.billingCycle === "ONE_TIME" ? "achat unique" : "annuelle"} : ${plugin.priceAnnual} €${renewalDiscount > 0 ? ` (−${renewalDiscount}% sur 2 ans → ${discountedAnnual} €/an)` : ""}. ${plugin.amortization === "ONE_SHOT" ? "Inclus dans le coût projet." : `Équiv. ${monthlyEquivalent} €/mois.`}`;

    return (
      <Tip content={tipContent}>
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-foreground/80">{plugin.priceAnnual}</span>
          <span className="text-[10px] text-muted-foreground/50">€/an</span>
          {plugin.amortization === "MONTHLY_SPREAD" && (
            <span className="ml-1 text-[10px] text-muted-foreground/40">
              ≈ {(plugin.priceAnnual / 12).toFixed(0)} €/mois
            </span>
          )}
        </div>
      </Tip>
    );
  }

  if (
    plugin.priceMonthlyMin !== undefined
    || plugin.priceMonthlyMax !== undefined
  ) {
    return (
      <Tip content="Fourchette de coût mensuel récurrent du plugin">
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-muted-foreground/60">
            {plugin.priceMonthlyMin ?? 0}
          </span>
          <span className="text-muted-foreground/30">–</span>
          <span className="text-foreground/80">
            {plugin.priceMonthlyMax ?? "?"}
          </span>
          <span className="text-[10px] text-muted-foreground/50">€/mois</span>
        </div>
      </Tip>
    );
  }

  return null;
}

export function PluginCardHeader({
  plugin,
  expanded,
  onToggle,
}: PluginCardHeaderProps) {
  return (
    <div className="flex items-center gap-2 bg-muted/10 px-4 py-3">
      <button
        type="button"
        onClick={onToggle}
        aria-label={expanded ? `Réduire ${plugin.label}` : `Développer ${plugin.label}`}
        className="shrink-0 text-muted-foreground transition hover:text-foreground"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{plugin.label}</span>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 text-[9px]",
              PRICING_COLORS[plugin.pricingMode] ?? "",
            )}
          >
            {plugin.pricingMode}
          </Badge>
        </div>
        <div className="mt-0.5 text-[10px] text-muted-foreground/60">
          {plugin.description && (
            <span className="mr-2 line-clamp-1">{plugin.description}</span>
          )}
          {plugin.vendor}
          {plugin.url && (
            <a
              href={plugin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1.5 inline-flex items-center gap-0.5 text-primary/60 hover:text-primary"
            >
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {plugin.billingCycle && (
          <Badge variant="outline" className="text-[9px]">
            {BILLING_CYCLE_LABELS[plugin.billingCycle] ?? plugin.billingCycle}
          </Badge>
        )}
        <PluginQuickPricing plugin={plugin} />
      </div>
    </div>
  );
}
