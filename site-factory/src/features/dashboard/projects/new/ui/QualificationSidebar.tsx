"use client";

import { AlertTriangle, Gauge, Layers, Wallet } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { InlineHint } from "@/shared/components/InlineHint";
import { formatEur } from "@/shared/lib/currency";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  MAINTENANCE_LABELS,
  MAINTENANCE_PRICES,
} from "@/lib/referential";
import { WIZARD_STEPS } from "@/lib/wizard-domain";
import { useWizard } from "../logic/WizardProvider";
import { deriveDiscoveryInsights } from "../logic/discovery-insights";
import { suggestModuleRecommendationsFromDiscovery } from "../logic/module-suggestions";
import {
  buildRecommendationWhy,
  buildWizardDecisionFlow,
} from "../logic/wizard-flow";
import { WizardDecisionFlowPanel } from "./wizard-decision-flow-panel";

export function QualificationSidebar() {
  const wizard = useWizard();
  const {
    step,
    canGoNext,
    nextReasons,
    projectType,
    offerProjectType,
    projectFamily,
    projectImplementation,
    projectImplementationLabel,
    projectFrontendImplementation,
    projectFrontendImplementationLabel,
    hostingSelectionMode,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    selectedModules,
    formFields,
    qualification,
    budgetBandEffective,
    clientKnowledge,
    primaryGoal,
    ambitionLevel,
    targetTimeline,
    needsEditing,
    editingMode,
    editingFrequency,
    editorialPushOwner,
    clientAccessPolicy,
    trafficLevel,
    dataSensitivity,
    scalabilityLevel,
    canonicalTaxonomyResolution,
  } = wizard;

  if (!projectType) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <Gauge className="mx-auto mb-2 size-6 opacity-40" />
          Démarrage de la qualification après la première réponse du besoin client.
          <p className="mt-2 text-xs text-muted-foreground">
            Le panneau sticky affichera ensuite le fil de décision et les points de vigilance utiles.
          </p>
        </CardContent>
      </Card>
    );
  }

  const decisionFlowItems = buildWizardDecisionFlow({
    projectType,
    offerProjectType,
    projectFamily,
    projectImplementation,
    projectImplementationLabel,
    projectFrontendImplementation,
    projectFrontendImplementationLabel,
    hostingSelectionMode,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    selectedModules,
    formFields,
    qualification,
    budgetBandEffective,
    clientKnowledge,
    primaryGoal,
    ambitionLevel,
    targetTimeline,
    needsEditing,
    editingMode,
    editingFrequency,
    editorialPushOwner,
    clientAccessPolicy,
    trafficLevel,
    dataSensitivity,
    scalabilityLevel,
    canonicalTaxonomyResolution,
  });
  const recommendationWhy = buildRecommendationWhy({
    projectType,
    offerProjectType,
    projectFamily,
    projectImplementation,
    projectImplementationLabel,
    projectFrontendImplementation,
    projectFrontendImplementationLabel,
    hostingSelectionMode,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    selectedModules,
    formFields,
    qualification,
    budgetBandEffective,
    clientKnowledge,
    primaryGoal,
    ambitionLevel,
    targetTimeline,
    needsEditing,
    editingMode,
    editingFrequency,
    editorialPushOwner,
    clientAccessPolicy,
    trafficLevel,
    dataSensitivity,
    scalabilityLevel,
    canonicalTaxonomyResolution,
  });
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
    suggestedModuleIds: [],
  });
  const suggestedModules = suggestModuleRecommendationsFromDiscovery({
    projectType,
    primaryGoal,
    ambitionLevel,
    budgetBand: budgetBandEffective,
    needsEditing,
    editingMode,
    commerceModel: wizard.commerceModel,
    trafficLevel,
    dataSensitivity,
    scalabilityLevel,
  });
  const suggestedSelectedCount = suggestedModules.filter((item) => selectedModules.has(item.id)).length;
  const currentStepLabel = WIZARD_STEPS[step]?.label ?? "Étape inconnue";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">État live du wizard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InlineHint>
          Panneau sticky de suivi : il montre la continuité du flow et les arbitrages encore visibles à ce stade.
        </InlineHint>

        <div className="space-y-2 rounded-lg border p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Étape actuelle</span>
            <span className="font-medium">{currentStepLabel}</span>
          </div>
          {qualification ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Catégorie</span>
              <Badge className={CATEGORY_COLORS[qualification.finalCategory]}>
                {CATEGORY_LABELS[qualification.finalCategory]}
              </Badge>
            </div>
          ) : null}
          {qualification ? (
            <div className="grid gap-2 pt-1 sm:grid-cols-2">
              <div className="rounded-md border border-dashed p-2">
                <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <Wallet className="size-3" />
                  Projet
                </div>
                <p className="mt-1 text-sm font-medium">
                  {formatEur(qualification.budget.grandTotal)}
                </p>
              </div>
              <div className="rounded-md border border-dashed p-2">
                <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <Layers className="size-3" />
                  Maintenance
                </div>
                <p className="mt-1 text-sm font-medium">
                  {MAINTENANCE_LABELS[qualification.maintenance]}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {MAINTENANCE_PRICES[qualification.maintenance]}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <WizardDecisionFlowPanel
          currentStep={step}
          items={decisionFlowItems}
          compact
          title="Lecture transversale"
          description="Besoin, recommandation, mise en œuvre, modules et état final dans un seul fil." 
        />

        {!canGoNext && nextReasons.length > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="size-4" />
              Points bloquants actuels
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {nextReasons.slice(0, 3).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className="space-y-2 rounded-lg border p-3 text-xs">
          <p className="font-medium">Pourquoi ça oriente la suite</p>
          <div className="space-y-2">
            {recommendationWhy.slice(0, 2).map((item) => (
              <div key={item.id} className="rounded-md border border-dashed p-2">
                <p className="text-muted-foreground">{item.sourceLabel}</p>
                <p className="font-medium">{item.sourceValue}</p>
                <p className="mt-2 text-muted-foreground">{item.consequenceLabel}</p>
                <p className="font-medium">{item.consequenceValue}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2 rounded-lg border p-3 text-xs">
          <p className="font-medium">Vigilances et modules</p>
          {discoveryInsights.warnings.length > 0 ? (
            <div className="space-y-1 rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-amber-700 dark:text-amber-300">
              {discoveryInsights.warnings.map((warning) => (
                <p key={warning}>• {warning}</p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Pas d’alerte prioritaire détectée sur le cadrage actuel.
            </p>
          )}
          <div className="rounded-md border border-dashed p-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Modules conseillés retenus</span>
              <span className="font-medium">
                {suggestedModules.length > 0 ? `${suggestedSelectedCount}/${suggestedModules.length}` : "—"}
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">
              {suggestedModules.length > 0
                ? `${selectedModules.size} module${selectedModules.size > 1 ? "s" : ""} actuellement sélectionné${selectedModules.size > 1 ? "s" : ""}.`
                : "Aucun module conseillé à ce stade sur le cadrage actuel."}
            </p>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
