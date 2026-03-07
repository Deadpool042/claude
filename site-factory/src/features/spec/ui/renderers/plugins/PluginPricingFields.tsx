"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Tip } from "@/shared/components/Tip";
import { FieldSelect } from "@/shared/components/FieldSelect";
import type { JsonValue, PluginItem } from "../../../logic/spec-types";
import { LABELS } from "../../../logic/spec-labels";
import {
  AMORTIZATION_OPTIONS,
  BILLING_CYCLE_OPTIONS,
} from "./plugin-select-options";

interface PluginPricingFieldsProps {
  plugin: PluginItem;
  onUpdate: (field: keyof PluginItem, value: JsonValue) => void;
}

export function PluginPricingFields({
  plugin,
  onUpdate,
}: PluginPricingFieldsProps) {
  const showBillingCycle = plugin.pricingMode !== "FREE";
  const showAnnualPricing =
    plugin.pricingMode !== "FREE"
    && (plugin.billingCycle === "ANNUAL" || plugin.billingCycle === "ONE_TIME");
  const showRenewalDiscount =
    plugin.billingCycle === "ANNUAL" && plugin.pricingMode !== "FREE";
  const showMonthlyPricing =
    plugin.pricingMode !== "FREE"
    && (
      plugin.billingCycle === "MONTHLY"
      || plugin.billingCycle === "USAGE_BASED"
      || !plugin.billingCycle
    );

  return (
    <>
      {showBillingCycle && (
        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
          <Tip content={LABELS.plugins.billingCycleHint}>
            <Label className="cursor-help text-xs text-muted-foreground">
              {LABELS.plugins.billingCycle}
            </Label>
          </Tip>
          <FieldSelect
            value={plugin.billingCycle ?? ""}
            onChange={(value) => onUpdate("billingCycle", value)}
            options={BILLING_CYCLE_OPTIONS}
            placeholder={LABELS.plugins.notDefined}
            size="sm"
          />
        </div>
      )}

      {showAnnualPricing && (
        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
          <Tip
            content={
              plugin.billingCycle === "ONE_TIME"
                ? "Prix d'achat unique du plugin/module."
                : "Prix de la licence annuelle. L'engine calcule l'équivalent mensuel (÷12) pour le devis."
            }
          >
            <Label className="cursor-help text-xs text-muted-foreground">
              {plugin.billingCycle === "ONE_TIME"
                ? LABELS.plugins.priceOneTimeLabel
                : LABELS.plugins.priceAnnualLabel}
            </Label>
          </Tip>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={plugin.priceAnnual ?? 0}
              onChange={(event) => onUpdate("priceAnnual", Number(event.target.value))}
              className="h-7 w-24 text-xs font-mono"
              min={0}
            />
            <span className="text-[10px] text-muted-foreground">
              {plugin.billingCycle === "ONE_TIME" ? "€" : "€/an"}
            </span>
            {plugin.billingCycle === "ANNUAL"
              && typeof plugin.priceAnnual === "number"
              && plugin.priceAnnual > 0 && (
                <span className="ml-1 text-[10px] text-muted-foreground/60">
                  ≈ {(plugin.priceAnnual / 12).toFixed(1)} €/mois
                </span>
            )}
          </div>
        </div>
      )}

      {showRenewalDiscount && (
        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
          <Tip content="Réduction accordée pour un engagement multi-année (ex: plan 2 ans). Typiquement 20% chez WooCommerce.com.">
            <Label className="cursor-help text-xs text-muted-foreground">
              {LABELS.plugins.renewalDiscount}
            </Label>
          </Tip>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={plugin.renewalDiscountPercent ?? 0}
              onChange={(event) =>
                onUpdate("renewalDiscountPercent", Number(event.target.value))
              }
              className="h-7 w-20 text-xs font-mono"
              min={0}
              max={100}
            />
            <span className="text-[10px] text-muted-foreground">%</span>
            {typeof plugin.priceAnnual === "number"
              && plugin.priceAnnual > 0
              && (plugin.renewalDiscountPercent ?? 0) > 0 && (
                <span className="ml-1 text-[10px] text-muted-foreground/60">
                  → {Math.round(
                    plugin.priceAnnual * (1 - (plugin.renewalDiscountPercent ?? 0) / 100),
                  )} €/an
                  {" ≈ "}
                  {(
                    plugin.priceAnnual
                    * (1 - (plugin.renewalDiscountPercent ?? 0) / 100)
                    / 12
                  ).toFixed(1)} €/mois
                </span>
            )}
          </div>
        </div>
      )}

      {showAnnualPricing && (
        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
          <Tip content="Comment présenter ce coût au client : inclus dans le coût projet (one-shot) ou lissé dans l'abonnement mensuel.">
            <Label className="cursor-help text-xs text-muted-foreground">
              {LABELS.plugins.amortization}
            </Label>
          </Tip>
          <FieldSelect
            value={plugin.amortization ?? "MONTHLY_SPREAD"}
            onChange={(value) => onUpdate("amortization", value)}
            options={AMORTIZATION_OPTIONS}
            size="sm"
          />
        </div>
      )}

      {showMonthlyPricing && (
        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
          <Tip content="Coût mensuel estimé du plugin/app. Utilisé pour l'estimation des charges récurrentes dans le devis.">
            <Label className="cursor-help text-xs text-muted-foreground">
              {LABELS.plugins.monthlyCost}
            </Label>
          </Tip>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={plugin.priceMonthlyMin ?? 0}
              onChange={(event) =>
                onUpdate("priceMonthlyMin", Number(event.target.value))
              }
              className="h-7 w-20 text-xs font-mono"
              min={0}
            />
            <span className="text-muted-foreground/40">–</span>
            <Input
              type="number"
              value={plugin.priceMonthlyMax ?? 0}
              onChange={(event) =>
                onUpdate("priceMonthlyMax", Number(event.target.value))
              }
              className="h-7 w-20 text-xs font-mono"
              min={0}
            />
            <span className="text-[10px] text-muted-foreground">€/mois</span>
          </div>
        </div>
      )}
    </>
  );
}
