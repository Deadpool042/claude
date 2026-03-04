import type {
  SuggestionAmbition,
  SuggestionBudget,
  SuggestionPrimaryGoal,
  SuggestionProjectType,
} from "./module-suggestions";

export interface DiscoveryInsightsInput {
  projectType: SuggestionProjectType | null;
  budgetBand: SuggestionBudget;
  clientKnowledge: "NONE" | "BASIC" | "INTERMEDIATE" | "ADVANCED" | "TO_CONFIRM";
  primaryGoal: SuggestionPrimaryGoal;
  ambitionLevel: SuggestionAmbition;
  targetTimeline:
    | "UNDER_1_MONTH"
    | "ONE_TO_TWO_MONTHS"
    | "TWO_TO_FOUR_MONTHS"
    | "FLEXIBLE"
    | "TO_CONFIRM";
  needsEditing: boolean;
  editingMode: "BACKOFFICE" | "GIT_MDX" | "TO_CONFIRM";
  editorialPushOwner: "CLIENT" | "AGENCY" | "TO_CONFIRM";
  suggestedModuleIds: string[];
}

export interface DiscoveryInsights {
  warnings: string[];
  lot1ModuleIds: string[];
  lot2ModuleIds: string[];
  posture: string;
}

export function deriveDiscoveryInsights(
  input: DiscoveryInsightsInput
): DiscoveryInsights {
  const {
    projectType,
    budgetBand,
    clientKnowledge,
    primaryGoal,
    ambitionLevel,
    targetTimeline,
    needsEditing,
    editingMode,
    editorialPushOwner,
    suggestedModuleIds,
  } = input;

  const warningCandidates: Array<{ message: string; score: number }> = [];
  const addWarning = (message: string, score: number) => {
    warningCandidates.push({ message, score });
  };
  const lowBudget = budgetBand === "UNDER_1200" || budgetBand === "UP_TO_1800";
  const tightEcomBudget =
    budgetBand === "UNDER_1200" ||
    budgetBand === "UP_TO_1800" ||
    budgetBand === "UP_TO_3500";
  const shortTimeline = targetTimeline === "UNDER_1_MONTH";
  const highAmbition =
    ambitionLevel === "PREPARE_PLATFORM" || ambitionLevel === "SCALE_TRAFFIC";

  if (budgetBand === "UNDER_1200") {
    addWarning(
      "Budget < 1 200 € : la mise en ligne + le développement atteignent vite ce plafond, cadrer un lot 1 minimal.",
      98
    );
  }

  if (projectType === "ECOM" && budgetBand === "UNDER_1200") {
    addWarning(
      "E-commerce avec budget < 1 200 € : recadrer vers vitrine/catalogue sans paiement ou augmenter le budget avant qualification e-commerce.",
      110
    );
  }

  if (projectType === "ECOM" && tightEcomBudget) {
    addWarning(
      "Budget serré pour e-commerce (≤ 3 500 €) : cadrer un lot 1 essentiel, privilégier un socle SaaS et planifier une phase 2.",
      100
    );
  }
  if (projectType === "APP" && lowBudget) {
    addWarning(
      "Budget serré pour application : cadrer un MVP minimal, éviter le périmètre plateforme au lot 1.",
      100
    );
  }
  if (lowBudget && highAmbition) {
    addWarning(
      "Ambition élevée vs budget actuel : sécuriser un lotissement en 2 phases pour rester réaliste.",
      90
    );
  }
  if (shortTimeline && ambitionLevel === "PREPARE_PLATFORM") {
    addWarning(
      "Délai court et ambition plateforme : prioriser les fondations et reporter les modules non critiques.",
      80
    );
  }
  if (shortTimeline && primaryGoal === "TO_CONFIRM") {
    addWarning(
      "Délai court sans objectif clair : fixer un objectif prioritaire unique avant chiffrage final.",
      70
    );
  }
  if (
    clientKnowledge === "NONE" &&
    needsEditing &&
    editingMode === "GIT_MDX" &&
    editorialPushOwner === "CLIENT"
  ) {
    addWarning(
      "Client non technique en push Git/MDX : privilégier client rédige / agence publie au démarrage.",
      95
    );
  }

  const warnings = warningCandidates
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map((item) => item.message);

  const maxLot1ByBudget: Record<SuggestionBudget, number> = {
    UNDER_1200: 1,
    UP_TO_1800: 2,
    UP_TO_3500: 3,
    UP_TO_7000: 4,
    OVER_7000: 5,
    TO_CONFIRM: 3,
  };

  let lot1Count = maxLot1ByBudget[budgetBand];
  if (shortTimeline) {
    lot1Count = Math.max(1, lot1Count - 1);
  }

  const lot1ModuleIds = suggestedModuleIds.slice(0, lot1Count);
  const lot2ModuleIds = suggestedModuleIds.slice(lot1Count);

  const posture =
    lowBudget && (clientKnowledge === "NONE" || clientKnowledge === "BASIC")
      ? "MVP cadré + accompagnement renforcé"
      : highAmbition
        ? "Socle évolutif + roadmap en phases"
        : "Livraison standard orientée résultat";

  return {
    warnings,
    lot1ModuleIds,
    lot2ModuleIds,
    posture,
  };
}
