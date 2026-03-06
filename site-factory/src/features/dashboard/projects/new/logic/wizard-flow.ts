import {
  DATA_SENSITIVITY_LABELS,
  PROJECT_TYPE_LABELS,
  SCALABILITY_LEVEL_LABELS,
  TRAFFIC_LEVEL_LABELS,
} from "@/lib/referential";
import {
  getFrontendImplementationLabel,
  getImplementationLabel,
} from "@/lib/project-choices";
import {
  HOSTING_TARGET_LABELS,
  PROJECT_FAMILY_LABELS,
} from "@/lib/validators";
import { CANONICAL_TAXONOMY_LABELS } from "@/lib/taxonomy";
import { deriveDiscoveryInsights } from "./discovery-insights";
import { getDiscoveryLabels } from "./discovery-labels";
import type { WizardContextType } from "./wizard-types";

const OFFER_LABELS = {
  VITRINE_BLOG: "Vitrine / Blog",
  ECOMMERCE: "E-commerce",
  APP_CUSTOM: "App custom",
} as const;

const STEP_LABELS = [
  "Besoin client",
  "Recommandation",
  "Mise en œuvre",
  "Modules",
  "Synthèse projet",
] as const;

export interface WizardDecisionFlowItem {
  step: number;
  label: string;
  value: string;
  detail: string;
}

export interface RecommendationWhyItem {
  id: string;
  sourceLabel: string;
  sourceValue: string;
  consequenceLabel: string;
  consequenceValue: string;
  detail: string;
}

export type WizardFlowInput = Pick<
  WizardContextType,
  | "projectType"
  | "offerProjectType"
  | "projectFamily"
  | "projectImplementation"
  | "projectImplementationLabel"
  | "projectFrontendImplementation"
  | "projectFrontendImplementationLabel"
  | "hostingSelectionMode"
  | "hostingTarget"
  | "hostingTargetBack"
  | "hostingTargetFront"
  | "selectedModules"
  | "formFields"
  | "qualification"
  | "budgetBandEffective"
  | "clientKnowledge"
  | "primaryGoal"
  | "ambitionLevel"
  | "targetTimeline"
  | "needsEditing"
  | "editingMode"
  | "editingFrequency"
  | "editorialPushOwner"
  | "clientAccessPolicy"
  | "trafficLevel"
  | "dataSensitivity"
  | "scalabilityLevel"
  | "canonicalTaxonomyResolution"
>;

function resolveOfferLabel(
  offerProjectType: WizardContextType["offerProjectType"],
): string {
  if (!offerProjectType) return "À préciser";
  return OFFER_LABELS[offerProjectType];
}

export function resolveProductionModeLabel(params: {
  needsEditing: boolean;
  editingMode: WizardContextType["editingMode"];
  editorialPushOwner: WizardContextType["editorialPushOwner"];
}): string {
  if (!params.needsEditing) {
    return "Contenu stable ou piloté par l’agence.";
  }
  if (params.editingMode === "BACKOFFICE") {
    return "Autonomie client via back-office CMS.";
  }
  if (params.editingMode === "GIT_MDX" && params.editorialPushOwner === "CLIENT") {
    return "Client publie directement via Git/MDX.";
  }
  if (params.editingMode === "GIT_MDX" && params.editorialPushOwner === "AGENCY") {
    return "Client rédige, agence publie en workflow Git/MDX.";
  }
  return "Mode de production à confirmer.";
}

function resolveHostingSummary(input: WizardFlowInput): string {
  if (input.hostingSelectionMode === "NONE") {
    return "Hosting géré par le provider";
  }
  if (input.hostingSelectionMode === "SINGLE") {
    return HOSTING_TARGET_LABELS[input.hostingTarget];
  }
  if (input.hostingSelectionMode === "FRONT_ONLY") {
    return `Front ${HOSTING_TARGET_LABELS[input.hostingTargetFront ?? "TO_CONFIRM"]}`;
  }
  return [
    `Back ${HOSTING_TARGET_LABELS[input.hostingTargetBack ?? "TO_CONFIRM"]}`,
    `Front ${HOSTING_TARGET_LABELS[input.hostingTargetFront ?? "TO_CONFIRM"]}`,
  ].join(" / ");
}

function resolveImplementationValue(input: WizardFlowInput): string {
  const implementationLabel =
    input.projectImplementation === "OTHER" && input.projectImplementationLabel
      ? input.projectImplementationLabel
      : getImplementationLabel(input.projectImplementation);
  const frontLabel =
    input.projectFrontendImplementation === "OTHER" &&
    input.projectFrontendImplementationLabel
      ? input.projectFrontendImplementationLabel
      : input.projectFrontendImplementation
        ? getFrontendImplementationLabel(input.projectFrontendImplementation)
        : null;

  if (implementationLabel !== "—" && frontLabel) {
    return `${implementationLabel} + ${frontLabel}`;
  }
  if (implementationLabel !== "—") {
    return implementationLabel;
  }
  if (input.projectFamily) {
    return PROJECT_FAMILY_LABELS[input.projectFamily];
  }
  return "À arbitrer";
}

export function buildWizardDecisionFlow(
  input: WizardFlowInput,
): WizardDecisionFlowItem[] {
  const {
    budgetBandLabel,
    primaryGoalLabel,
    ambitionLevelLabel,
    targetTimelineLabel,
  } = getDiscoveryLabels({
    editingMode: input.editingMode,
    editingFrequency: input.editingFrequency,
    editorialPushOwner: input.editorialPushOwner,
    clientAccessPolicy: input.clientAccessPolicy,
    budgetBand: input.budgetBandEffective,
    clientKnowledge: input.clientKnowledge,
    primaryGoal: input.primaryGoal,
    ambitionLevel: input.ambitionLevel,
    targetTimeline: input.targetTimeline,
  });

  const selectedModuleCount = input.selectedModules.size;
  const categoryLabel = input.qualification?.finalCategory ?? null;
  const canonicalLabel = input.canonicalTaxonomyResolution?.target
    ? CANONICAL_TAXONOMY_LABELS[input.canonicalTaxonomyResolution.target]
    : null;

  return [
    {
      step: 0,
      label: STEP_LABELS[0],
      value: input.projectType ? PROJECT_TYPE_LABELS[input.projectType] : "À qualifier",
      detail: [primaryGoalLabel, budgetBandLabel]
        .filter((item) => item !== "À confirmer")
        .join(" · ") || "Objectif et budget à cadrer",
    },
    {
      step: 1,
      label: STEP_LABELS[1],
      value: resolveOfferLabel(input.offerProjectType),
      detail:
        [
          input.projectFamily ? PROJECT_FAMILY_LABELS[input.projectFamily] : canonicalLabel,
          ambitionLevelLabel !== "À confirmer" ? ambitionLevelLabel : null,
        ]
          .filter(Boolean)
          .join(" · ") || "Famille projet en cours de stabilisation",
    },
    {
      step: 2,
      label: STEP_LABELS[2],
      value: resolveImplementationValue(input),
      detail: [resolveHostingSummary(input), targetTimelineLabel]
        .filter((item) => item !== "À confirmer")
        .join(" · ") || "Architecture et hébergement à préciser",
    },
    {
      step: 3,
      label: STEP_LABELS[3],
      value:
        input.offerProjectType === "VITRINE_BLOG"
          ? "Sans modules optionnels"
          : `${String(selectedModuleCount)} module${selectedModuleCount > 1 ? "s" : ""}`,
      detail:
        input.offerProjectType === "VITRINE_BLOG"
          ? "Socle contenu simple"
          : categoryLabel
            ? `Catégorie ${categoryLabel}`
            : "Périmètre modules en cours",
    },
    {
      step: 4,
      label: STEP_LABELS[4],
      value: input.formFields.name.trim() ? "Prête à créer" : "Informations projet à compléter",
      detail: input.formFields.name.trim()
        ? input.formFields.name.trim()
        : "Nom, client et paramètres finaux",
    },
  ];
}

export function buildRecommendationWhy(
  input: WizardFlowInput,
): RecommendationWhyItem[] {
  const {
    budgetBandLabel,
    clientKnowledgeLabel,
    primaryGoalLabel,
    targetTimelineLabel,
    editingModeLabel,
    pushOwnerLabel,
  } = getDiscoveryLabels({
    editingMode: input.editingMode,
    editingFrequency: input.editingFrequency,
    editorialPushOwner: input.editorialPushOwner,
    clientAccessPolicy: input.clientAccessPolicy,
    budgetBand: input.budgetBandEffective,
    clientKnowledge: input.clientKnowledge,
    primaryGoal: input.primaryGoal,
    ambitionLevel: input.ambitionLevel,
    targetTimeline: input.targetTimeline,
  });

  const discoveryInsights = deriveDiscoveryInsights({
    projectType: input.projectType,
    budgetBand: input.budgetBandEffective,
    clientKnowledge: input.clientKnowledge,
    primaryGoal: input.primaryGoal,
    ambitionLevel: input.ambitionLevel,
    targetTimeline: input.targetTimeline,
    needsEditing: input.needsEditing,
    editingMode: input.editingMode,
    editorialPushOwner: input.editorialPushOwner,
    suggestedModuleIds: [],
  });

  const implementationValue = resolveImplementationValue(input);
  const recommendationValue = [
    resolveOfferLabel(input.offerProjectType),
    input.projectFamily ? PROJECT_FAMILY_LABELS[input.projectFamily] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return [
    {
      id: "need",
      sourceLabel: "Besoin exprimé",
      sourceValue: [
        input.projectType ? PROJECT_TYPE_LABELS[input.projectType] : "Type à confirmer",
        primaryGoalLabel,
      ].join(" · "),
      consequenceLabel: "Recommandation",
      consequenceValue: recommendationValue || "Recommandation en cours de stabilisation",
      detail: "Le type de besoin et l’objectif principal cadrent l’offre et la famille projet retenues.",
    },
    {
      id: "delivery",
      sourceLabel: "Budget et cadence",
      sourceValue: [budgetBandLabel, targetTimelineLabel].join(" · "),
      consequenceLabel: "Cadencement conseillé",
      consequenceValue: discoveryInsights.posture,
      detail:
        discoveryInsights.warnings[0] ??
        "Le budget et le délai guident le niveau d’ambition réaliste et le besoin de lotissement.",
    },
    {
      id: "editing",
      sourceLabel: "Mode éditorial",
      sourceValue: input.needsEditing
        ? [editingModeLabel, pushOwnerLabel !== "À confirmer" ? pushOwnerLabel : null]
            .filter(Boolean)
            .join(" · ")
        : "Pas d’édition continue",
      consequenceLabel: "Mode de production",
      consequenceValue: resolveProductionModeLabel({
        needsEditing: input.needsEditing,
        editingMode: input.editingMode,
        editorialPushOwner: input.editorialPushOwner,
      }),
      detail: "Ce point conditionne le niveau d’autonomie client et la nature du socle éditorial à retenir.",
    },
    {
      id: "constraints",
      sourceLabel: "Contraintes techniques",
      sourceValue: [
        TRAFFIC_LEVEL_LABELS[input.trafficLevel],
        DATA_SENSITIVITY_LABELS[input.dataSensitivity],
        SCALABILITY_LEVEL_LABELS[input.scalabilityLevel],
      ].join(" · "),
      consequenceLabel: "Impact mise en œuvre",
      consequenceValue:
        implementationValue === "À arbitrer"
          ? "Prépare les arbitrages d’implémentation et d’hébergement"
          : `${implementationValue} · ${resolveHostingSummary(input)}`,
      detail: `Maturité client : ${clientKnowledgeLabel}. Ces contraintes influencent directement la mise en œuvre qui suit.`,
    },
  ];
}
