//src/app/dashboard/projects/new/_components/step-summary.tsx
"use client";

import { useWizard } from "../logic/WizardProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BudgetBreakdown } from "@/components/qualification/budget-breakdown";
import { InlineHint } from "@/components/shared/InlineHint";
import { SupportBadge } from "@/components/shared/SupportBadge";
import { AlertTriangle } from "lucide-react";
import { formatEur } from "@/lib/currency";
import { computeStackMultiplier, getMultiplierLabel } from "@/lib/stack-pricing";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_SHORT,
  HOSTING_COSTS,
  HOSTING_COSTS_HEADLESS,
  MAINTENANCE_LABELS,
  MAINTENANCE_PRICES,
  MODULE_CATALOG,
  SPEC_MODULES,
  estimatePluginSubscriptions,
  estimateQuoteFromSpec,
  type QuoteEstimate,
} from "@/lib/referential";
import type { Category as SpecCategory } from "@/lib/referential/spec/types";
import { BACKEND_FAMILY_LABELS } from "@/lib/referential";
import { HOSTING_PROVIDERS } from "@/lib/hosting";
import {
  FRONTEND_IMPLEMENTATIONS,
  IMPLEMENTATION_OPTIONS,
  IMPLEMENTATION_SAAS_MONTHLY_ESTIMATES,
  SUPPORT_BADGE_LABELS,
  getFrontendImplementationLabel,
  getImplementationLabel,
  resolveCmsIdFromImplementation,
} from "@/lib/project-choices";
import {
  HOSTING_TARGET_LABELS,
  PROJECT_FAMILY_LABELS,
} from "@/lib/validators";
import { MARKET_GUARDRAILS, MARKET_TYPE_LABELS } from "@/lib/market-guardrails";
import { suggestModuleRecommendationsFromDiscovery } from "../logic/module-suggestions";
import { deriveDiscoveryInsights } from "../logic/discovery-insights";
import { getDiscoveryLabels } from "../logic/discovery-labels";

const TECH_STACK_LABELS = {
  WORDPRESS: "WordPress",
  NEXTJS: "Next.js",
  NUXT: "Nuxt",
  ASTRO: "Astro",
} as const;

const BILLING_MODE_LABELS = {
  SOLO: "Solo (100 %)" as const,
  SOUS_TRAITANT: "Sous-traitant" as const,
};

export function StepSummary() {
  const {
    projectType,
    qualificationProjectType,
    offerProjectType,
    needsEditing,
    editingMode,
    editingFrequency,
    editorialPushOwner,
    includeOnboardingPack,
    includeMonthlyEditorialValidation,
    includeUnblockInterventions,
    clientAccessPolicy,
    budgetBandEffective,
    manualBudgetMax,
    clientKnowledge,
    primaryGoal,
    ambitionLevel,
    targetTimeline,
    commerceModel,
    trafficLevel,
    dataSensitivity,
    scalabilityLevel,
    techStack,
    wpHeadless,
    deployTarget,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    hostingSelectionMode,
    projectFamily,
    projectImplementation,
    projectImplementationLabel,
    projectFrontendImplementation,
    projectFrontendImplementationLabel,
    billingMode,
    setBillingMode,
    formFields,
    selectedModules,
    qualification,
    backendMode,
    backendFamily,
    backendOpsHeavy,
    backendMultiplier,
  } = useWizard();
  const {
    editingModeLabel,
    editingFrequencyLabel,
    pushOwnerLabel,
    clientAccessPolicyLabel,
    budgetBandLabel,
    clientKnowledgeLabel,
    primaryGoalLabel,
    ambitionLevelLabel,
    targetTimelineLabel,
  } = getDiscoveryLabels({
    editingMode,
    editingFrequency,
    editorialPushOwner,
    clientAccessPolicy,
    budgetBand: budgetBandEffective,
    clientKnowledge,
    primaryGoal,
    ambitionLevel,
    targetTimeline,
  });
  const extraSetupMin = (includeOnboardingPack ? 300 : 0) + (includeUnblockInterventions ? 90 : 0);
  const extraSetupMax = (includeOnboardingPack ? 500 : 0) + (includeUnblockInterventions ? 150 : 0);
  const extraMonthlyMin = includeMonthlyEditorialValidation ? 120 : 0;
  const extraMonthlyMax = includeMonthlyEditorialValidation ? 250 : 0;
  const hostingProviderLabel =
    HOSTING_PROVIDERS.find((p) => p.id === formFields.hostingProviderId)?.label ?? "—";
  const isWpHeadless = Boolean(techStack && wpHeadless && techStack === "WORDPRESS");
  const hostingCost = techStack
    ? isWpHeadless
      ? HOSTING_COSTS_HEADLESS[deployTarget]
      : HOSTING_COSTS[deployTarget]
    : null;
  const hasQualification = Boolean(qualification && techStack);
  const offerLabel =
    offerProjectType === "VITRINE_BLOG"
        ? "Vitrine / Blog"
        : offerProjectType === "ECOMMERCE"
          ? "E-commerce"
          : offerProjectType === "APP_CUSTOM"
            ? "App custom"
            : null;

  const implementationEntry = projectImplementation
    ? IMPLEMENTATION_OPTIONS.find((item) => item.value === projectImplementation)
    : null;
  const implementationLabel =
    projectImplementation === "OTHER" && projectImplementationLabel
      ? projectImplementationLabel
      : implementationEntry?.label ??
        getImplementationLabel(projectImplementation);
  const implementationSupport = implementationEntry?.support ?? null;
  const saasImplementationEstimate = projectImplementation
    ? IMPLEMENTATION_SAAS_MONTHLY_ESTIMATES[projectImplementation]
    : undefined;

  const frontEntry = projectFrontendImplementation
    ? FRONTEND_IMPLEMENTATIONS.find((item) => item.value === projectFrontendImplementation)
    : null;
  const frontLabel =
    projectFrontendImplementation === "OTHER" && projectFrontendImplementationLabel
      ? projectFrontendImplementationLabel
      : frontEntry?.label ??
        (projectFrontendImplementation ? getFrontendImplementationLabel(projectFrontendImplementation) : null);
  const showBackend = projectType === "APP";
  const backendLabel =
    backendMode === "SEPARATE"
      ? backendFamily
        ? BACKEND_FAMILY_LABELS[backendFamily]
        : "À confirmer"
      : "Full‑stack intégré";
  const backendSuffix =
    backendMode === "SEPARATE" && backendOpsHeavy ? " + ops lourds" : "";
  const backendCoefLabel =
    backendMode === "SEPARATE" && backendFamily && backendMultiplier !== 1
      ? `×${backendMultiplier.toFixed(2).replace(/\.?0+$/, "")}`
      : null;
  const effectiveProjectType = qualificationProjectType ?? projectType;
  const marketRule = effectiveProjectType
    ? MARKET_GUARDRAILS[effectiveProjectType]
    : null;
  const belowMarketFloor = hasQualification
    ? marketRule
      ? qualification!.budget.grandTotal < marketRule.floor
      : false
    : false;
  const suggestedRecommendations = suggestModuleRecommendationsFromDiscovery({
    projectType,
    primaryGoal,
    ambitionLevel,
    budgetBand: budgetBandEffective,
    needsEditing,
    editingMode,
    commerceModel,
    trafficLevel,
    dataSensitivity,
    scalabilityLevel,
  });
  const suggestedModuleIds = suggestedRecommendations.map((item) => item.id);
  const suggestedModuleLabels = suggestedRecommendations
    .map((item) => MODULE_CATALOG.find((module) => module.id === item.id)?.name)
    .filter((value): value is string => Boolean(value));
  const discoveryInsights = deriveDiscoveryInsights({
    projectType,
    budgetBand: budgetBandEffective,
    clientKnowledge,
    primaryGoal,
    ambitionLevel,
    targetTimeline,
    needsEditing,
    editingMode,
    editorialPushOwner,
    suggestedModuleIds,
  });
  const lot1Labels = discoveryInsights.lot1ModuleIds
    .map((id) => MODULE_CATALOG.find((module) => module.id === id)?.name)
    .filter((value): value is string => Boolean(value));
  const lot2Labels = discoveryInsights.lot2ModuleIds
    .map((id) => MODULE_CATALOG.find((module) => module.id === id)?.name)
    .filter((value): value is string => Boolean(value));

  const estimate = (() => {
    if (!qualification?.finalCategory) {
      return null;
    }
    const values: SpecCategory[] = ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"];
    const category = values.includes(qualification.finalCategory as SpecCategory)
      ? (qualification.finalCategory as SpecCategory)
      : null;
    if (!category) {
      return null;
    }
    try {
      return estimateQuoteFromSpec({
        category,
        moduleIds: Array.from(selectedModules),
      });
    } catch {
      return null;
    }
  })();

  const estimateModuleById = new Map<string, QuoteEstimate["modules"][number]>(
    (estimate?.modules ?? []).map((item) => [item.id, item]),
  );

  const formatRange = (min: number, max: number, suffix = ""): string => {
    if (min === max) return `${formatEur(min)}${suffix}`;
    return `${formatEur(min)}–${formatEur(max)}${suffix}`;
  };
  const clientSetupTariff = qualification?.budget.grandTotal ?? 0;
  const maintenanceMonthly =
    estimate?.maintenance.monthly ??
    (qualification
      ? (Number(MAINTENANCE_PRICES[qualification.maintenance].replace(/\D+/g, "")) || 0)
      : 0);
  const budgetCapByBand: Record<string, number | null> = {
    UNDER_1200: 1200,
    UP_TO_1800: 1800,
    UP_TO_3500: 3500,
    UP_TO_7000: 7000,
    OVER_7000: null,
    TO_CONFIRM: null,
  };
  const manualBudgetCap = Number(manualBudgetMax);
  const hasManualBudgetCap = Number.isFinite(manualBudgetCap) && manualBudgetCap > 0;
  const budgetCap = hasManualBudgetCap
    ? manualBudgetCap
    : budgetCapByBand[budgetBandEffective] ?? null;
  const setupMin = clientSetupTariff;
  const setupMax = clientSetupTariff;
  const budgetStatus = (() => {
    if (budgetCap == null) return null;
    if (setupMin > budgetCap) {
      return {
        label: `Hors budget client (dépassement min ${formatEur(setupMin - budgetCap)})`,
        className: "text-amber-600 dark:text-amber-400",
      };
    }
    if (setupMax <= budgetCap) {
      return {
        label: "Compatible avec le budget client",
        className: "text-emerald-600 dark:text-emerald-400",
      };
    }
    return {
      label: `Zone de risque (jusqu’à ${formatEur(setupMax - budgetCap)} au-dessus du budget)`,
      className: "text-amber-600 dark:text-amber-400",
    };
  })();
  const cmsId = resolveCmsIdFromImplementation(projectImplementation, projectImplementationLabel);
  const selectedFeatureIds = Array.from(selectedModules)
    .flatMap((moduleId) => SPEC_MODULES.find((moduleItem) => moduleItem.id === moduleId)?.featureIds ?? []);
  const pluginEstimate = cmsId
    ? estimatePluginSubscriptions({ cmsId, featureIds: selectedFeatureIds })
    : null;

  if (!projectType) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Résumé de qualification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ── Nom du projet ───────────────────────── */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm text-muted-foreground">Projet</span>
            <span className="text-sm font-medium">
              {formFields.name || "—"}
            </span>
          </div>

          {/* ── Catégorie ───────────────────────────── */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm text-muted-foreground">Catégorie finale</span>
            {hasQualification ? (
              <Badge className={CATEGORY_COLORS[qualification!.finalCategory]}>
                {CATEGORY_LABELS[qualification!.finalCategory]}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                Non qualifié
              </Badge>
            )}
          </div>

          {offerLabel && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Offre détectée</span>
              <Badge variant="secondary" className="text-[11px]">
                {offerLabel}
              </Badge>
            </div>
          )}

          {hasQualification && qualification!.wasRequalified && (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-3.5" />
              Requalifié depuis{" "}
              {CATEGORY_SHORT[qualification!.initialCategory]} par :{" "}
              {qualification!.requalifyingModules
                .map((m) => m.name)
                .join(", ")}
            </div>
          )}

          {hasQualification && marketRule && effectiveProjectType && (
            <div className="rounded-lg border border-dashed p-3 text-xs space-y-1">
              <p className="font-medium">Repères marché local</p>
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
              <p
                className={
                  belowMarketFloor
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }
              >
                {belowMarketFloor
                  ? "Alerte tarifaire : budget sous le minimum recommandé."
                  : "Minimum recommandé respecté."}
              </p>
            </div>
          )}

          {/* ── Implémentation ─────────────────────── */}
          <div className="rounded-lg border p-3 text-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Budget max</span>
              <span>{budgetBandLabel}</span>
            </div>
            {manualBudgetMax.trim() && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget manuel</span>
                <span>{formatEur(Number(manualBudgetMax))}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Maturité client</span>
              <span>{clientKnowledgeLabel}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Objectif principal</span>
              <span>{primaryGoalLabel}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Ambition 12 mois</span>
              <span>{ambitionLevelLabel}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Délai cible</span>
              <span>{targetTimelineLabel}</span>
            </div>
            {suggestedModuleLabels.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Modules suggérés</span>
                  <span>{suggestedModuleLabels.length}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {suggestedModuleLabels.join(" · ")}
                </p>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  {suggestedRecommendations.map((item) => {
                    const moduleName = MODULE_CATALOG.find((module) => module.id === item.id)?.name;
                    if (!moduleName) return null;
                    return (
                      <p key={item.id}>
                        <span className="font-medium text-foreground">{moduleName}</span>
                        {" · "}
                        {item.reasons.slice(0, 2).join(" · ")}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
            {(lot1Labels.length > 0 || lot2Labels.length > 0) && (
              <div className="space-y-1 pt-1 text-[10px] text-muted-foreground">
                <p className="font-medium text-foreground">Lotissement recommandé</p>
                <p>Lot 1 : {lot1Labels.length > 0 ? lot1Labels.join(" · ") : "À définir"}</p>
                <p>Lot 2 : {lot2Labels.length > 0 ? lot2Labels.join(" · ") : "Non prioritaire"}</p>
              </div>
            )}
            {discoveryInsights.warnings.length > 0 && (
              <div className="space-y-1 rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-[10px] text-amber-700 dark:text-amber-300">
                <p className="font-medium">Alertes prioritaires</p>
                {discoveryInsights.warnings.map((warning) => (
                  <p key={warning}>• {warning}</p>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Édition continue</span>
              <span>{needsEditing ? "Oui" : "Non"}</span>
            </div>
            {needsEditing && (
              <>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Mode d’édition</span>
                  <span>{editingModeLabel}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Fréquence</span>
                  <span>{editingFrequencyLabel}</span>
                </div>
                {editingMode === "GIT_MDX" && (
                  <>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Publication</span>
                      <span>{pushOwnerLabel}</span>
                    </div>
                    {editorialPushOwner === "CLIENT" && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Accès client</span>
                        <span>{clientAccessPolicyLabel}</span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Famille</span>
              <span className="font-medium">
                {projectFamily ? PROJECT_FAMILY_LABELS[projectFamily] : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Implémentation</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{implementationLabel}</span>
                {implementationSupport && (
                  <SupportBadge>
                    {SUPPORT_BADGE_LABELS[implementationSupport]}
                  </SupportBadge>
                )}
              </div>
            </div>
            {frontLabel && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Front</span>
                <span>{frontLabel}</span>
              </div>
            )}
            {showBackend && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Backend</span>
                <span>
                  {backendLabel}
                  {backendSuffix}
                  {backendCoefLabel ? ` (${backendCoefLabel})` : ""}
                </span>
              </div>
            )}
            {needsEditing && editingMode === "GIT_MDX" && (
              <div className="space-y-2">
                <InlineHint className="text-[10px]">
                  Le mode d’édition MDX/Git n’ajuste pas le CI à lui seul.
                </InlineHint>
                {(includeOnboardingPack || includeMonthlyEditorialValidation || includeUnblockInterventions) && (
                  <div className="rounded-md border border-dashed p-2 text-[10px] text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">Coûts en sus (hors budget projet)</p>
                    {(includeOnboardingPack || includeUnblockInterventions) && (
                      <p>
                        Ponctuel estimatif : {formatEur(extraSetupMin)} à {formatEur(extraSetupMax)}
                      </p>
                    )}
                    {includeMonthlyEditorialValidation && (
                      <p>
                        Mensuel estimatif : {formatEur(extraMonthlyMin)} à {formatEur(extraMonthlyMax)} / mois
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Hébergement ────────────────────────── */}
          <div className="rounded-lg border border-dashed p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hébergement cible</span>
              <span className="text-sm font-medium">
                {HOSTING_TARGET_LABELS[hostingTarget]}
              </span>
            </div>
            {hostingSelectionMode !== "SINGLE" &&
              hostingSelectionMode !== "NONE" && (
              <div className="text-xs text-muted-foreground space-y-1">
                {hostingSelectionMode === "SPLIT" && (
                  <div className="flex items-center justify-between">
                    <span>Back</span>
                    <span>
                      {hostingTargetBack ? HOSTING_TARGET_LABELS[hostingTargetBack] : "—"}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Front</span>
                  <span>{hostingTargetFront ? HOSTING_TARGET_LABELS[hostingTargetFront] : "—"}</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Hébergeur</span>
              <span>{hostingProviderLabel}</span>
            </div>
            {hostingCost && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Coût indicatif</span>
                <span>{hostingCost.range}</span>
              </div>
            )}
            {estimate && (
              <>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Domaine (annuel)</span>
                  <span>{formatRange(estimate.annexFees.domainCostRange.yearlyMin, estimate.annexFees.domainCostRange.yearlyMax, "/an")}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Hébergement (mensuel)</span>
                  <span>{formatRange(estimate.annexFees.hostingCostRange.monthlyMin, estimate.annexFees.hostingCostRange.monthlyMax, "/mois")}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Email (mensuel)</span>
                  <span>{formatRange(estimate.annexFees.emailProviderCostRange.monthlyMin, estimate.annexFees.emailProviderCostRange.monthlyMax, "/mois")}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Stockage (mensuel)</span>
                  <span>{formatRange(estimate.annexFees.storageCostRange.monthlyMin, estimate.annexFees.storageCostRange.monthlyMax, "/mois")}</span>
                </div>
                {implementationSupport === "SAAS" && (
                  <>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Abonnement SaaS (mensuel)</span>
                      <span>
                        {saasImplementationEstimate
                          ? formatRange(
                              saasImplementationEstimate.min,
                              saasImplementationEstimate.max,
                              "/mois",
                            )
                          : "À chiffrer"}
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400">
                      {saasImplementationEstimate?.notes ??
                        `Abonnement SaaS (${implementationLabel}) à ajouter (hors apps/commissions).`}
                    </p>
                  </>
                )}
                {pluginEstimate && pluginEstimate.plugins.length > 0 && (
                  <>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Plugins/apps recommandés</span>
                      <span>{String(pluginEstimate.plugins.length)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Plugins/apps payants potentiels</span>
                      <span>{String(pluginEstimate.paidOrMixedCount)}</span>
                    </div>
                    {pluginEstimate.monthlyMax > 0 && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Plugins/apps (mensuel)</span>
                        <span>{formatRange(pluginEstimate.monthlyMin, pluginEstimate.monthlyMax, "/mois")}</span>
                      </div>
                    )}
                    {pluginEstimate.unknownPricingCount > 0 && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">
                        {String(pluginEstimate.unknownPricingCount)} plugin(s)/app(s) payant(s) à chiffrer précisément.
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {hasQualification && (
            <div className="rounded-lg border border-dashed p-3 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tarif projet (setup)</span>
                <span>{formatEur(clientSetupTariff)}</span>
              </div>
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                <span>Maintenance mensuelle agence</span>
                <span>{formatEur(maintenanceMonthly)}/mois</span>
              </div>
              {budgetStatus && <p className={`text-[10px] ${budgetStatus.className}`}>{budgetStatus.label}</p>}
            </div>
          )}

          {/* ── Modules ─────────────────────────────── */}
          {hasQualification && qualification!.modules.length > 0 && techStack && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Modules ({String(qualification!.modules.length)})
              </p>
              <div className="space-y-1.5">
                {qualification!.modules.map((m) => {
                  const moduleEstimate = estimateModuleById.get(m.id);
                  const setupLabel = moduleEstimate
                    ? formatRange(moduleEstimate.setup.min, moduleEstimate.setup.max)
                    : "—";

                  return (
                    <div
                      key={m.id}
                      className="flex flex-col gap-0.5 rounded-md border p-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{m.name}</span>
                        <span className="font-medium">{setupLabel}</span>
                      </div>
                      {moduleEstimate?.monthly && (
                        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                          <span>↳ Récurrent</span>
                          <span>{formatRange(moduleEstimate.monthly.min, moduleEstimate.monthly.max, "/mois")}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Budget ──────────────────────────────── */}
          {hasQualification && techStack ? (
            <BudgetBreakdown
              budget={qualification!.budget}
              moduleCount={selectedModules.size}
              projectType={qualificationProjectType ?? projectType}
              techStack={techStack}
              wpHeadless={isWpHeadless}
              variant="full"
            />
          ) : (
            <InlineHint className="rounded-lg border-dashed">
              Qualification indisponible pour cette implémentation. Les budgets
              et modules ne sont pas calculés.
            </InlineHint>
          )}

          {/* ── Mode de facturation ─────────────────── */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Mode de facturation
              </p>
              <p className="text-sm font-medium">
                {BILLING_MODE_LABELS[billingMode]}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setBillingMode(
                  billingMode === "SOLO" ? "SOUS_TRAITANT" : "SOLO",
                );
              }}
            >
              Changer
            </Button>
          </div>

          {/* ── Splits (sous-traitant) ──────────────── */}
          {hasQualification && qualification!.splits && (
            <div className="grid gap-3 rounded-lg border border-dashed p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Split base (prestataire / agence)
                </p>
                <p className="text-sm font-medium">
                  {String(qualification!.splits.baseSplitPrestataire)} % /{" "}
                  {String(qualification!.splits.baseSplitAgence)} %
                </p>
              </div>
              {qualification!.budget.modulesTotal > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Split modules (prestataire / agence)
                  </p>
                  <p className="text-sm font-medium">
                    {formatEur(qualification!.splits.modulesSplitPrestataire)}{" "}
                    / {formatEur(qualification!.splits.modulesSplitAgence)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Maintenance ─────────────────────────── */}
          {hasQualification && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Maintenance</span>
              <div className="text-right text-sm">
                <p className="font-medium">
                  {MAINTENANCE_LABELS[qualification!.maintenance]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {MAINTENANCE_PRICES[qualification!.maintenance]}
                </p>
              </div>
            </div>
          )}

          {techStack && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Stack</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {TECH_STACK_LABELS[techStack]}
                </span>
                {computeStackMultiplier(projectType, techStack, isWpHeadless) !== 1 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-muted-foreground"
                  >
                    {getMultiplierLabel(projectType, techStack, isWpHeadless)} sur la base
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
