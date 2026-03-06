import {
  BOOKING_MODULE_ID,
  getBookingConfigIssues,
  normalizeBookingConfig,
} from "@/features/booking/lib/booking-config";
import type { ModuleId } from "@/lib/offers";
import type { HostingSelectionMode } from "@/lib/wizard-domain";
import type { HostingTargetInput } from "@/lib/validators";
import type { ProjectType } from "@/lib/referential";
import type {
  AmbitionLevel,
  BudgetBand,
  ClientAccessPolicy,
  ClientKnowledge,
  EditingMode,
  EditorialPushOwner,
  PrimaryGoal,
  TargetTimeline,
} from "./wizard-types";
import type { WizardModuleStates } from "./wizard-capabilities";

export const WIZARD_MIN_STEP = 0;
export const WIZARD_MAX_STEP = 4;

export interface WizardNextReasonsInput {
  step: number;
  projectType: ProjectType | null;
  budgetBandEffective: BudgetBand;
  clientKnowledge: ClientKnowledge;
  primaryGoal: PrimaryGoal;
  ambitionLevel: AmbitionLevel;
  targetTimeline: TargetTimeline;
  needsEditing: boolean;
  editingMode: EditingMode;
  editorialPushOwner: EditorialPushOwner;
  clientAccessPolicy: ClientAccessPolicy;
  isHeadless: boolean;
  projectFrontendImplementation: string | null;
  hostingSelectionMode: HostingSelectionMode;
  hostingTargetBack: HostingTargetInput | null;
  hostingTargetFront: HostingTargetInput | null;
  selectedModules: Set<ModuleId>;
  wizardModules: WizardModuleStates;
  formName: string;
  formClientId: string;
}

export function computeWizardNextReasons(
  input: WizardNextReasonsInput,
): string[] {
  const reasons: string[] = [];

  if (input.step === 0) {
    if (!input.projectType) {
      reasons.push("Sélectionnez un type de projet pour continuer.");
    }
    if (input.projectType && input.budgetBandEffective === "TO_CONFIRM") {
      reasons.push("Précisez le budget maximum du client.");
    }
    if (
      input.projectType &&
      input.budgetBandEffective !== "TO_CONFIRM" &&
      input.clientKnowledge === "TO_CONFIRM"
    ) {
      reasons.push("Précisez le niveau de connaissance numérique du client.");
    }
    if (
      input.projectType &&
      input.budgetBandEffective !== "TO_CONFIRM" &&
      input.clientKnowledge !== "TO_CONFIRM" &&
      input.primaryGoal === "TO_CONFIRM"
    ) {
      reasons.push("Précisez l’objectif principal du projet.");
    }
    if (
      input.projectType &&
      input.budgetBandEffective !== "TO_CONFIRM" &&
      input.clientKnowledge !== "TO_CONFIRM" &&
      input.primaryGoal !== "TO_CONFIRM" &&
      input.ambitionLevel === "TO_CONFIRM"
    ) {
      reasons.push("Précisez l’ambition du client à 12 mois.");
    }
    if (
      input.projectType &&
      input.budgetBandEffective !== "TO_CONFIRM" &&
      input.clientKnowledge !== "TO_CONFIRM" &&
      input.primaryGoal !== "TO_CONFIRM" &&
      input.ambitionLevel !== "TO_CONFIRM" &&
      input.targetTimeline === "TO_CONFIRM"
    ) {
      reasons.push("Précisez le délai cible.");
    }
    if (
      input.needsEditing &&
      input.editingMode === "GIT_MDX" &&
      input.editorialPushOwner === "TO_CONFIRM"
    ) {
      reasons.push(
        "Précisez qui publie en mode Git/MDX (équipe client ou agence).",
      );
    }
    if (
      input.needsEditing &&
      input.editingMode === "GIT_MDX" &&
      input.editorialPushOwner === "CLIENT" &&
      input.clientAccessPolicy === "TO_CONFIRM"
    ) {
      reasons.push("Précisez la limite d’accès client en mode push client.");
    }
    if (input.projectType === "APP" && input.budgetBandEffective === "UNDER_1200") {
      reasons.push(
        "Avec un budget < 1 200 €, une App n’est pas réaliste : requalifiez vers Vitrine/Blog avec CMS monolithique.",
      );
    }
    if (
      input.projectType === "ECOM" &&
      input.budgetBandEffective === "UNDER_1200"
    ) {
      reasons.push(
        "Avec un budget < 1 200 €, un e-commerce n’est pas réaliste : requalifiez vers vitrine/catalogue sans paiement ou augmentez le budget.",
      );
    }
  }

  if (input.step === 2) {
    if (input.projectType === "APP" && input.budgetBandEffective === "UNDER_1200") {
      reasons.push(
        "Budget < 1 200 € incompatible avec une App : revenez sur le type projet (Vitrine/Blog + CMS monolithique).",
      );
    }
    if (
      input.projectType === "ECOM" &&
      input.budgetBandEffective === "UNDER_1200"
    ) {
      reasons.push(
        "Budget < 1 200 € incompatible avec un e-commerce : revenez sur le type projet (vitrine/catalogue sans paiement) ou augmentez le budget.",
      );
    }
    if (input.isHeadless && !input.projectFrontendImplementation) {
      reasons.push(
        "Sélectionnez une implémentation frontend (architecture headless).",
      );
    }
    if (input.hostingSelectionMode === "SPLIT" && !input.hostingTargetBack) {
      reasons.push("Sélectionnez un hébergement back (architecture découplée).");
    }
    if (
      (input.hostingSelectionMode === "SPLIT" ||
        input.hostingSelectionMode === "FRONT_ONLY") &&
      !input.hostingTargetFront
    ) {
      reasons.push("Sélectionnez un hébergement front.");
    }
  }

  if (input.step === 3) {
    if (input.selectedModules.has(BOOKING_MODULE_ID)) {
      const bookingConfig = normalizeBookingConfig(
        input.wizardModules.BOOKING?.config,
      );
      const bookingIssues = getBookingConfigIssues(bookingConfig);
      bookingIssues.forEach((issue) => {
        reasons.push(`Booking: ${issue}`);
      });
    }
  }

  if (input.step === 4) {
    if (input.formName.trim().length < 2) {
      reasons.push("Le nom du projet doit faire au moins 2 caractères.");
    }
    if (!input.formClientId.trim()) {
      reasons.push("Sélectionnez un client.");
    }
  }

  return reasons;
}

export function nextWizardStep(currentStep: number): number {
  return Math.min(currentStep + 1, WIZARD_MAX_STEP);
}

export function prevWizardStep(currentStep: number): number {
  return Math.max(currentStep - 1, WIZARD_MIN_STEP);
}
