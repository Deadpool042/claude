"use client";

import { Badge } from "@/shared/components/ui/badge";
import { InlineHint } from "@/shared/components/InlineHint";
import { StepCard } from "@/shared/components/StepCard";
import { CATEGORY_LABELS, CATEGORY_SHORT } from "@/lib/referential";
import { PROJECT_TYPE_LABELS } from "@/lib/referential";
import { PROJECT_FAMILY_LABELS } from "@/lib/validators";
import { CANONICAL_TAXONOMY_LABELS, TAXONOMY_SIGNAL_LABELS } from "@/lib/taxonomy";
import { Lightbulb, Route, Gauge, CircleHelp } from "lucide-react";
import { useWizard } from "../logic/WizardProvider";
import { getDiscoveryLabels } from "../logic/discovery-labels";
import {
  buildRecommendationWhy,
  buildWizardDecisionFlow,
  resolveProductionModeLabel,
} from "../logic/wizard-flow";
import { WizardDecisionFlowPanel } from "./wizard-decision-flow-panel";
import { RecommendationWhyPanel } from "./recommendation/recommendation-why-panel";

const OFFER_LABELS = {
  VITRINE_BLOG: "Vitrine / Blog",
  ECOMMERCE: "E-commerce",
  APP_CUSTOM: "App custom",
} as const;

export function StepRecommendation() {
  const {
    step,
    projectType,
    taxonomySignal,
    canonicalTaxonomyResolution,
    offerProjectType,
    qualification,
    projectFamily,
    projectImplementation,
    projectImplementationLabel,
    projectFrontendImplementation,
    projectFrontendImplementationLabel,
    needsEditing,
    editingMode,
    editingFrequency,
    editorialPushOwner,
    budgetBandEffective,
    clientKnowledge,
    primaryGoal,
    ambitionLevel,
    targetTimeline,
    clientAccessPolicy,
    hostingSelectionMode,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    selectedModules,
    formFields,
    trafficLevel,
    dataSensitivity,
    scalabilityLevel,
  } = useWizard();

  const {
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

  const confirmationPoints: string[] = [];
  if (canonicalTaxonomyResolution?.needsSignal) {
    confirmationPoints.push("Confirmer le signal métier pour lever l’ambiguïté de famille cible.");
  }
  if (budgetBandEffective === "TO_CONFIRM") {
    confirmationPoints.push("Confirmer le budget maximum pour sécuriser la recommandation.");
  }
  if (clientKnowledge === "TO_CONFIRM") {
    confirmationPoints.push("Préciser l’autonomie numérique du client.");
  }
  if (primaryGoal === "TO_CONFIRM") {
    confirmationPoints.push("Fixer un objectif principal unique.");
  }
  if (ambitionLevel === "TO_CONFIRM") {
    confirmationPoints.push("Préciser l’ambition à 12 mois.");
  }
  if (targetTimeline === "TO_CONFIRM") {
    confirmationPoints.push("Préciser le délai cible.");
  }
  if (needsEditing && editingMode === "TO_CONFIRM") {
    confirmationPoints.push("Préciser le mode d’édition (back-office ou Git/MDX).");
  }
  if (needsEditing && editingMode === "GIT_MDX" && editorialPushOwner === "TO_CONFIRM") {
    confirmationPoints.push("Préciser qui publie en mode Git/MDX.");
  }
  if (
    needsEditing &&
    editingMode === "GIT_MDX" &&
    editorialPushOwner === "CLIENT" &&
    clientAccessPolicy === "TO_CONFIRM"
  ) {
    confirmationPoints.push("Préciser la limite d’accès client au dépôt.");
  }

  return (
    <div className="space-y-4">
      <WizardDecisionFlowPanel
        currentStep={step}
        items={decisionFlowItems}
        description="Lecture continue du besoin client jusqu’à la synthèse. Cette étape formalise le sens de la recommandation avant l’arbitrage technique."
      />

      <StepCard
        title="Recommandation métier"
        icon={Lightbulb}
        tone="bg-amber-500/10 text-amber-500"
        description="Conséquence lisible des réponses client, avant les choix techniques détaillés."
      >
        <InlineHint>
          Cette étape formalise la recommandation : famille projet, signal métier, complexité et mode de production.
        </InlineHint>

        <div className="space-y-2 rounded-lg border p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type de besoin</span>
            <span className="font-medium">{projectType ? PROJECT_TYPE_LABELS[projectType] : "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Offre recommandée</span>
            <span className="font-medium">{offerProjectType ? OFFER_LABELS[offerProjectType] : "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Famille projet pressentie</span>
            <span className="font-medium">{projectFamily ? PROJECT_FAMILY_LABELS[projectFamily] : "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Signal métier</span>
            <span className="font-medium">{taxonomySignal ? TAXONOMY_SIGNAL_LABELS[taxonomySignal] : "—"}</span>
          </div>
          {canonicalTaxonomyResolution && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Famille canonique cible</span>
              <span className="font-medium">
                {canonicalTaxonomyResolution.target
                  ? CANONICAL_TAXONOMY_LABELS[canonicalTaxonomyResolution.target]
                  : "Ambiguë"}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Objectif principal</span>
            <span className="font-medium">{primaryGoalLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ambition</span>
            <span className="font-medium">{ambitionLevelLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Délai cible</span>
            <span className="font-medium">{targetTimelineLabel}</span>
          </div>
        </div>
      </StepCard>

      <StepCard
        title="Pourquoi cette recommandation"
        icon={Lightbulb}
        tone="bg-orange-500/10 text-orange-500"
        description="Lien direct entre les réponses métier, la recommandation retenue et l’étape suivante."
      >
        <RecommendationWhyPanel items={recommendationWhy} />
      </StepCard>

      <StepCard
        title="Niveau de complexité"
        icon={Gauge}
        tone="bg-sky-500/10 text-sky-500"
        description="Lecture rapide de la charge projet estimée à ce stade."
      >
        {qualification?.ci ? (
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Complexity Index</span>
              <span className="font-medium">
                {qualification.ci.score} ({CATEGORY_SHORT[qualification.ci.category]})
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Catégorie estimée</span>
              <Badge variant="outline">{CATEGORY_LABELS[qualification.ci.category]}</Badge>
            </div>
          </div>
        ) : (
          <InlineHint>
            La complexité sera disponible dès que l’implémentation supportée est stabilisée.
          </InlineHint>
        )}
      </StepCard>

      <StepCard
        title="Mode de production et hypothèses"
        icon={Route}
        tone="bg-violet-500/10 text-violet-500"
      >
        <p className="text-sm">
          <span className="text-muted-foreground">Mode recommandé :</span>{" "}
          <span className="font-medium">
            {resolveProductionModeLabel({ needsEditing, editingMode, editorialPushOwner })}
          </span>
        </p>

        {confirmationPoints.length > 0 ? (
          <div className="rounded-lg border border-dashed p-3 text-xs">
            <p className="font-medium">Points à confirmer</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
              {confirmationPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ) : (
          <InlineHint>
            Les informations clés sont suffisamment cadrées pour passer à la mise en œuvre technique.
          </InlineHint>
        )}

        <InlineHint>
          Étape suivante : valider la mise en œuvre (CMS/stack, hébergement et architecture).
        </InlineHint>
      </StepCard>

      {canonicalTaxonomyResolution?.note ? (
        <InlineHint className="text-xs">
          <CircleHelp className="size-3.5" />
          {canonicalTaxonomyResolution.note}
        </InlineHint>
      ) : null}
    </div>
  );
}
