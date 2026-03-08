import { AlertTriangle, ClipboardList } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/shared/components/ui/card";
import { InlineHint } from "@/shared/components/InlineHint";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_SHORT,
  MODULE_CATALOG
} from "@/lib/referential";
import {
  CANONICAL_TAXONOMY_LABELS,
  TAXONOMY_SIGNAL_LABELS
} from "@/lib/taxonomy";
import { useWizard } from "../../logic/WizardProvider";
import { getDiscoveryLabels } from "../../logic/discovery-labels";
import { deriveDiscoveryInsights } from "../../logic/discovery-insights";
import { suggestModuleRecommendationsFromDiscovery } from "../../logic/module-suggestions";
import { buildRecommendationWhy } from "../../logic/wizard-flow";
import { RecommendationWhyPanel } from "../recommendation/recommendation-why-panel";
import { resolveOfferLabel } from "./summary-helpers";
import { DecisionSummaryCard } from "../../components/decision-summary-card";

interface SummaryDecisionCardProps {
  showProjectIdentity: boolean;
}

export function SummaryDecisionCard({
  showProjectIdentity
}: SummaryDecisionCardProps) {
  const wizard = useWizard();
  const {
    projectType,
    offerProjectType,
    taxonomySignal,
    canonicalTaxonomyResolution,
    needsEditing,
    editingMode,
    editingFrequency,
    editorialPushOwner,
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
    qualification
  } = wizard;

  if (!projectType) {
    return null;
  }

  const {
    editingModeLabel,
    editingFrequencyLabel,
    pushOwnerLabel,
    clientAccessPolicyLabel,
    budgetBandLabel,
    clientKnowledgeLabel,
    primaryGoalLabel,
    ambitionLevelLabel,
    targetTimelineLabel
  } = getDiscoveryLabels({
    editingMode,
    editingFrequency,
    editorialPushOwner,
    clientAccessPolicy,
    budgetBand: budgetBandEffective,
    clientKnowledge,
    primaryGoal,
    ambitionLevel,
    targetTimeline
  });
  const offerLabel = resolveOfferLabel(offerProjectType);
  const taxonomySignalLabel = taxonomySignal
    ? TAXONOMY_SIGNAL_LABELS[taxonomySignal]
    : null;
  const canonicalTaxonomyLabel = canonicalTaxonomyResolution?.target
    ? CANONICAL_TAXONOMY_LABELS[canonicalTaxonomyResolution.target]
    : null;
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
    scalabilityLevel
  });
  const suggestedModuleLabels = suggestedRecommendations
    .map(item => MODULE_CATALOG.find(module => module.id === item.id)?.name)
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
    suggestedModuleIds: suggestedRecommendations.map(item => item.id)
  });
  const lot1Labels = discoveryInsights.lot1ModuleIds
    .map(id => MODULE_CATALOG.find(module => module.id === id)?.name)
    .filter((value): value is string => Boolean(value));
  const lot2Labels = discoveryInsights.lot2ModuleIds
    .map(id => MODULE_CATALOG.find(module => module.id === id)?.name)
    .filter((value): value is string => Boolean(value));
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
    canonicalTaxonomyResolution
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Décision retenue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showProjectIdentity ? (
          <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <span className="text-muted-foreground">Projet</span>
            <span className="font-medium">{formFields.name || "—"}</span>
          </div>
        ) : null}

        {qualification?.decision ? (
          <DecisionSummaryCard
            decision={qualification.decision}
            compact
            title="Décision canonique"
          />
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Catégorie finale</span>
              {qualification ? (
                <Badge className={CATEGORY_COLORS[qualification.finalCategory]}>
                  {CATEGORY_LABELS[qualification.finalCategory]}
                </Badge>
              ) : (
                <Badge variant="outline">Non qualifié</Badge>
              )}
            </div>
            {offerLabel ? (
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Offre retenue</span>
                <span className="font-medium text-foreground">
                  {offerLabel}
                </span>
              </div>
            ) : null}
            {qualification?.wasRequalified ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-3.5" />
                Requalifié depuis{" "}
                {CATEGORY_SHORT[qualification.initialCategory]}
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-dashed p-3 text-sm">
            <p className="font-medium">Repère de cadrage</p>
            <p className="mt-1 text-muted-foreground">
              {discoveryInsights.posture}
            </p>
            {lot1Labels.length > 0 || lot2Labels.length > 0 ? (
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>
                  Lot 1 :{" "}
                  {lot1Labels.length > 0 ? lot1Labels.join(" · ") : "À définir"}
                </p>
                <p>
                  Lot 2 :{" "}
                  {lot2Labels.length > 0
                    ? lot2Labels.join(" · ")
                    : "Non prioritaire"}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {canonicalTaxonomyResolution ? (
          <div className="space-y-1 rounded-lg border border-dashed p-3 text-xs">
            <p className="font-medium">Taxonomie cible</p>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Signal métier</span>
              <span className="font-medium text-foreground">
                {taxonomySignalLabel ?? "Non renseigné"}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Famille cible</span>
              <span className="font-medium text-foreground">
                {canonicalTaxonomyLabel ?? "Ambiguë"}
              </span>
            </div>
            <p
              className={
                canonicalTaxonomyResolution.needsSignal
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
              }>
              {canonicalTaxonomyResolution.note}
            </p>
          </div>
        ) : null}

        <div className="rounded-lg border p-3 text-sm">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList className="size-4 text-muted-foreground" />
            <p className="font-medium">Lecture métier</p>
          </div>
          <div className="grid gap-2 text-xs md:grid-cols-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Budget max</span>
              <span>{budgetBandLabel}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Maturité client</span>
              <span>{clientKnowledgeLabel}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Objectif principal</span>
              <span>{primaryGoalLabel}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Ambition 12 mois</span>
              <span>{ambitionLevelLabel}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Délai cible</span>
              <span>{targetTimelineLabel}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Édition continue</span>
              <span>{needsEditing ? "Oui" : "Non"}</span>
            </div>
            {manualBudgetMax.trim() ? (
              <div className="flex items-center justify-between text-muted-foreground md:col-span-2">
                <span>Budget manuel</span>
                <span>{manualBudgetMax} €</span>
              </div>
            ) : null}
            {needsEditing ? (
              <>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Mode d’édition</span>
                  <span>{editingModeLabel}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Fréquence</span>
                  <span>{editingFrequencyLabel}</span>
                </div>
                {editingMode === "GIT_MDX" ? (
                  <>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Publication</span>
                      <span>{pushOwnerLabel}</span>
                    </div>
                    {editorialPushOwner === "CLIENT" ? (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Accès client</span>
                        <span>{clientAccessPolicyLabel}</span>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        <RecommendationWhyPanel items={recommendationWhy} />

        {suggestedModuleLabels.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-dashed p-3 text-xs">
            <p className="font-medium">Modules suggérés par le besoin</p>
            <p className="text-muted-foreground">
              {suggestedModuleLabels.join(" · ")}
            </p>
            <div className="space-y-1 text-muted-foreground">
              {suggestedRecommendations.map(item => {
                const moduleName = MODULE_CATALOG.find(
                  module => module.id === item.id
                )?.name;
                if (!moduleName) return null;
                return (
                  <p key={item.id}>
                    <span className="font-medium text-foreground">
                      {moduleName}
                    </span>
                    {" · "}
                    {item.reasons.slice(0, 2).join(" · ")}
                  </p>
                );
              })}
            </div>
          </div>
        ) : null}

        {discoveryInsights.warnings.length > 0 ? (
          <div className="space-y-1 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
            <p className="font-medium">Alertes prioritaires</p>
            {discoveryInsights.warnings.map(warning => (
              <p key={warning}>• {warning}</p>
            ))}
          </div>
        ) : (
          <InlineHint>
            Les éléments métier sont suffisamment lisibles pour relire la
            recommandation sans revenir à chaque question.
          </InlineHint>
        )}
      </CardContent>
    </Card>
  );
}
