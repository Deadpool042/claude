import type { WizardContextType } from "./WizardProvider";

interface DiscoveryLabelInput {
  editingMode: WizardContextType["editingMode"];
  editingFrequency: WizardContextType["editingFrequency"];
  editorialPushOwner: WizardContextType["editorialPushOwner"];
  clientAccessPolicy: WizardContextType["clientAccessPolicy"];
  budgetBand: WizardContextType["budgetBand"];
  clientKnowledge: WizardContextType["clientKnowledge"];
  primaryGoal: WizardContextType["primaryGoal"];
  ambitionLevel: WizardContextType["ambitionLevel"];
  targetTimeline: WizardContextType["targetTimeline"];
}

const EDITING_MODE_LABELS: Record<WizardContextType["editingMode"], string> = {
  BACKOFFICE: "Back-office CMS",
  GIT_MDX: "Fichiers versionnés (MDX/Git)",
  TO_CONFIRM: "À confirmer",
};

const EDITING_FREQUENCY_LABELS: Record<WizardContextType["editingFrequency"], string> = {
  DAILY: "Quotidienne",
  REGULAR: "Régulière",
  RARE: "Rare",
};

const PUSH_OWNER_LABELS: Record<WizardContextType["editorialPushOwner"], string> = {
  CLIENT: "Client rédige et publie",
  AGENCY: "Client rédige, agence publie",
  TO_CONFIRM: "À confirmer",
};

const CLIENT_ACCESS_POLICY_LABELS: Record<WizardContextType["clientAccessPolicy"], string> = {
  CONTENT_REPO_ONLY: "Repo contenu uniquement",
  CONTENT_REPO_WITH_PR: "Repo + PR validée",
  TO_CONFIRM: "À confirmer",
};

const BUDGET_BAND_LABELS: Record<WizardContextType["budgetBand"], string> = {
  UNDER_1200: "< 1 200 € (très contraint)",
  UP_TO_1800: "≤ 1 800 €",
  UP_TO_3500: "≤ 3 500 €",
  UP_TO_7000: "≤ 7 000 €",
  OVER_7000: "> 7 000 €",
  TO_CONFIRM: "À confirmer",
};

const CLIENT_KNOWLEDGE_LABELS: Record<WizardContextType["clientKnowledge"], string> = {
  NONE: "Aucune",
  BASIC: "Basique",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancée",
  TO_CONFIRM: "À confirmer",
};

const PRIMARY_GOAL_LABELS: Record<WizardContextType["primaryGoal"], string> = {
  PRESENCE: "Présence en ligne",
  GENERATE_LEADS: "Génération de leads",
  PUBLISH_CONTENT: "Publication de contenu",
  SELL_ONLINE: "Vente en ligne",
  DIGITIZE_PROCESS: "Digitalisation métier",
  TO_CONFIRM: "À confirmer",
};

const AMBITION_LEVEL_LABELS: Record<WizardContextType["ambitionLevel"], string> = {
  KEEP_SIMPLE: "Rester simple",
  GROW_FEATURES: "Ajouter des fonctionnalités",
  SCALE_TRAFFIC: "Monter en trafic",
  PREPARE_PLATFORM: "Préparer une plateforme",
  TO_CONFIRM: "À confirmer",
};

const TARGET_TIMELINE_LABELS: Record<WizardContextType["targetTimeline"], string> = {
  UNDER_1_MONTH: "< 1 mois",
  ONE_TO_TWO_MONTHS: "1–2 mois",
  TWO_TO_FOUR_MONTHS: "2–4 mois",
  FLEXIBLE: "Flexible",
  TO_CONFIRM: "À confirmer",
};

export function getDiscoveryLabels(input: DiscoveryLabelInput) {
  return {
    editingModeLabel: EDITING_MODE_LABELS[input.editingMode],
    editingFrequencyLabel: EDITING_FREQUENCY_LABELS[input.editingFrequency],
    pushOwnerLabel: PUSH_OWNER_LABELS[input.editorialPushOwner],
    clientAccessPolicyLabel: CLIENT_ACCESS_POLICY_LABELS[input.clientAccessPolicy],
    budgetBandLabel: BUDGET_BAND_LABELS[input.budgetBand],
    clientKnowledgeLabel: CLIENT_KNOWLEDGE_LABELS[input.clientKnowledge],
    primaryGoalLabel: PRIMARY_GOAL_LABELS[input.primaryGoal],
    ambitionLevelLabel: AMBITION_LEVEL_LABELS[input.ambitionLevel],
    targetTimelineLabel: TARGET_TIMELINE_LABELS[input.targetTimeline],
  };
}
