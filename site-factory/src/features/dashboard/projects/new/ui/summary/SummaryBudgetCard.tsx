import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { InlineHint } from "@/shared/components/InlineHint";
import { formatEur } from "@/shared/lib/currency";
import {
  MAINTENANCE_PRICES,
  SPEC_MODULES,
  estimatePluginSubscriptions,
  estimateQuoteFromSpec,
} from "@/lib/referential";
import type { Category as SpecCategory } from "@/lib/referential/spec/types";
import { MARKET_GUARDRAILS, MARKET_TYPE_LABELS } from "@/lib/market-guardrails";
import {
  IMPLEMENTATION_SAAS_MONTHLY_ESTIMATES,
  resolveCmsIdFromImplementation,
} from "@/lib/project-choices";
import { useWizard } from "../../logic/WizardProvider";
import {
  BILLING_MODE_LABELS,
  buildBudgetStatus,
  formatSummaryRange,
  resolveImplementationData,
} from "./summary-helpers";

function toSpecCategory(category: string | null): SpecCategory | null {
  const values: SpecCategory[] = ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"];
  return category && values.includes(category as SpecCategory)
    ? (category as SpecCategory)
    : null;
}

export function SummaryBudgetCard() {
  const wizard = useWizard();
  const {
    projectType,
    qualificationProjectType,
    budgetBandEffective,
    manualBudgetMax,
    qualification,
    selectedModules,
    projectImplementation,
    projectImplementationLabel,
    projectFrontendImplementation,
    projectFrontendImplementationLabel,
    billingMode,
    setBillingMode,
  } = wizard;

  if (!projectType || !qualification) {
    return null;
  }

  const effectiveProjectType = qualificationProjectType ?? projectType;
  const marketRule = MARKET_GUARDRAILS[effectiveProjectType];
  const category = toSpecCategory(qualification.finalCategory);
  const estimate = category
    ? (() => {
        try {
          return estimateQuoteFromSpec({
            category,
            moduleIds: Array.from(selectedModules),
          });
        } catch {
          return null;
        }
      })()
    : null;
  const clientSetupTariff = qualification.budget.grandTotal;
  const maintenanceMonthly =
    estimate?.maintenance.monthly ??
    (Number(MAINTENANCE_PRICES[qualification.maintenance].replace(/\D+/g, "")) || 0);
  const budgetStatus = buildBudgetStatus({
    budgetBandEffective,
    manualBudgetMax,
    setupMin: clientSetupTariff,
    setupMax: clientSetupTariff,
  });
  const belowMarketFloor = estimate
    ? estimate.totalSetup.min < marketRule.floor
    : qualification.budget.grandTotal < marketRule.floor;
  const { implementationLabel, implementationSupport } = resolveImplementationData({
    projectImplementation,
    projectImplementationLabel,
    projectFrontendImplementation,
    projectFrontendImplementationLabel,
  });
  const saasImplementationEstimate = projectImplementation
    ? IMPLEMENTATION_SAAS_MONTHLY_ESTIMATES[projectImplementation]
    : undefined;
  const cmsId = resolveCmsIdFromImplementation(projectImplementation, projectImplementationLabel);
  const selectedFeatureIds = Array.from(selectedModules).flatMap(
    (moduleId) => SPEC_MODULES.find((moduleItem) => moduleItem.id === moduleId)?.featureIds ?? [],
  );
  const pluginEstimate = cmsId
    ? estimatePluginSubscriptions({ cmsId, featureIds: selectedFeatureIds })
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Budget et exploitation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border p-3 text-sm">
            <p className="font-medium">Tarification agence</p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Tarif projet (setup)</span>
                <span className="font-medium text-foreground">{formatEur(clientSetupTariff)}</span>
              </div>
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                <span>Maintenance mensuelle</span>
                <span>{formatEur(maintenanceMonthly)}/mois</span>
              </div>
              {budgetStatus ? (
                <p className={budgetStatus.className}>{budgetStatus.label}</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-dashed p-3 text-sm">
            <p className="font-medium">Repères marché local</p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Type / CI usuel</span>
                <span>
                  {MARKET_TYPE_LABELS[effectiveProjectType]} · {marketRule.ciRange}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Catégorie cible</span>
                <span>{marketRule.categoryRange}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Plancher création</span>
                <span>{formatEur(marketRule.floor)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Repère création</span>
                <span>{marketRule.creationRange}</span>
              </div>
              <p className={belowMarketFloor ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>
                {belowMarketFloor
                  ? "Alerte tarifaire : budget sous le minimum recommandé."
                  : "Minimum recommandé respecté."}
              </p>
            </div>
          </div>
        </div>

        {estimate ? (
          <div className="rounded-lg border border-dashed p-3 text-xs">
            <p className="font-medium">Coûts tiers et abonnements</p>
            <div className="mt-3 space-y-2 text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Domaine (annuel)</span>
                <span>{formatSummaryRange(estimate.annexFees.domainCostRange.yearlyMin, estimate.annexFees.domainCostRange.yearlyMax, "/an")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Hébergement (mensuel)</span>
                <span>{formatSummaryRange(estimate.annexFees.hostingCostRange.monthlyMin, estimate.annexFees.hostingCostRange.monthlyMax, "/mois")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Email (mensuel)</span>
                <span>{formatSummaryRange(estimate.annexFees.emailProviderCostRange.monthlyMin, estimate.annexFees.emailProviderCostRange.monthlyMax, "/mois")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Stockage (mensuel)</span>
                <span>{formatSummaryRange(estimate.annexFees.storageCostRange.monthlyMin, estimate.annexFees.storageCostRange.monthlyMax, "/mois")}</span>
              </div>
              {implementationSupport === "SAAS" ? (
                <>
                  <div className="flex items-center justify-between">
                    <span>Abonnement SaaS (mensuel)</span>
                    <span>
                      {saasImplementationEstimate
                        ? formatSummaryRange(
                            saasImplementationEstimate.min,
                            saasImplementationEstimate.max,
                            "/mois",
                          )
                        : "À chiffrer"}
                    </span>
                  </div>
                  <p className="text-amber-600 dark:text-amber-400">
                    {saasImplementationEstimate?.notes ??
                      `Abonnement SaaS (${implementationLabel}) à ajouter (hors apps/commissions).`}
                  </p>
                </>
              ) : null}
              {pluginEstimate && pluginEstimate.plugins.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span>Plugins/apps recommandés</span>
                    <span>{String(pluginEstimate.plugins.length)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Plugins/apps payants potentiels</span>
                    <span>{String(pluginEstimate.paidOrMixedCount)}</span>
                  </div>
                  {pluginEstimate.monthlyMax > 0 ? (
                    <div className="flex items-center justify-between">
                      <span>Plugins/apps (mensuel)</span>
                      <span>{formatSummaryRange(pluginEstimate.monthlyMin, pluginEstimate.monthlyMax, "/mois")}</span>
                    </div>
                  ) : null}
                  {pluginEstimate.annualLicenseMonthlyTotal > 0 ? (
                    <div className="flex items-center justify-between">
                      <span>Licences annuelles (lissé)</span>
                      <span>{formatEur(pluginEstimate.annualLicenseMonthlyTotal)}/mois</span>
                    </div>
                  ) : null}
                  {pluginEstimate.oneShotTotal > 0 ? (
                    <div className="flex items-center justify-between">
                      <span>Licences one-shot</span>
                      <span>{formatEur(pluginEstimate.oneShotTotal)}</span>
                    </div>
                  ) : null}
                  {pluginEstimate.unknownPricingCount > 0 ? (
                    <p className="text-amber-600 dark:text-amber-400">
                      {String(pluginEstimate.unknownPricingCount)} plugin(s)/app(s) payant(s) à chiffrer précisément.
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <InlineHint className="rounded-lg border-dashed">
            Qualification indisponible pour cette implémentation. Les budgets tiers détaillés ne sont pas calculés.
          </InlineHint>
        )}

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Mode de facturation</p>
              <p className="text-sm font-medium">{BILLING_MODE_LABELS[billingMode]}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setBillingMode(billingMode === "SOLO" ? "SOUS_TRAITANT" : "SOLO");
              }}
            >
              Changer
            </Button>
          </div>
          {qualification.splits ? (
            <div className="mt-4 grid gap-3 border-t pt-4 text-xs sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Split base (prestataire / agence)</p>
                <p className="font-medium">
                  {String(qualification.splits.baseSplitPrestataire)} % / {String(qualification.splits.baseSplitAgence)} %
                </p>
              </div>
              {qualification.budget.modulesTotal > 0 ? (
                <div>
                  <p className="text-muted-foreground">Split modules (prestataire / agence)</p>
                  <p className="font-medium">
                    {formatEur(qualification.splits.modulesSplitPrestataire)} / {formatEur(qualification.splits.modulesSplitAgence)}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
