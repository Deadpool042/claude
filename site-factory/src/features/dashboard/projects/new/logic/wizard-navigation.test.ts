import { describe, expect, it } from "vitest";
import { BOOKING_MODULE_ID } from "@/features/booking/lib/booking-config";
import type { ModuleId } from "@/lib/offers";
import { createWizardModuleStates } from "./wizard-capabilities";
import {
  computeWizardNextReasons,
  nextWizardStep,
  prevWizardStep,
  resetWizardStepForProjectTypeChange,
  type WizardNextReasonsInput,
} from "./wizard-navigation";

function createInput(
  overrides: Partial<WizardNextReasonsInput> = {},
): WizardNextReasonsInput {
  return {
    step: 0,
    projectType: null,
    budgetBandEffective: "TO_CONFIRM",
    clientKnowledge: "TO_CONFIRM",
    primaryGoal: "TO_CONFIRM",
    ambitionLevel: "TO_CONFIRM",
    targetTimeline: "TO_CONFIRM",
    needsEditing: false,
    editingMode: "TO_CONFIRM",
    editorialPushOwner: "TO_CONFIRM",
    clientAccessPolicy: "TO_CONFIRM",
    isHeadless: false,
    projectFrontendImplementation: null,
    hostingSelectionMode: "SINGLE",
    hostingTargetBack: null,
    hostingTargetFront: null,
    selectedModules: new Set<ModuleId>(),
    wizardModules: createWizardModuleStates(),
    formName: "",
    formClientId: "",
    ...overrides,
  };
}

describe("wizard-navigation", () => {
  it("blocks step 0 when project type is missing", () => {
    const reasons = computeWizardNextReasons(createInput());

    expect(reasons).toContain("Sélectionnez un type de projet pour continuer.");
  });

  it("blocks implementation step when split hosting/headless frontend are incomplete", () => {
    const reasons = computeWizardNextReasons(
      createInput({
        step: 2,
        projectType: "APP",
        budgetBandEffective: "UP_TO_3500",
        isHeadless: true,
        projectFrontendImplementation: null,
        hostingSelectionMode: "SPLIT",
        hostingTargetBack: null,
        hostingTargetFront: null,
      }),
    );

    expect(reasons).toContain(
      "Sélectionnez une implémentation frontend (architecture headless).",
    );
    expect(reasons).toContain(
      "Sélectionnez un hébergement back (architecture découplée).",
    );
    expect(reasons).toContain("Sélectionnez un hébergement front.");
  });

  it("surfaces booking configuration issues on modules step", () => {
    const reasons = computeWizardNextReasons(
      createInput({
        step: 3,
        selectedModules: new Set<ModuleId>([BOOKING_MODULE_ID as ModuleId]),
      }),
    );

    expect(reasons.some((reason) => reason.startsWith("Booking: "))).toBe(true);
  });

  it("validates project info fields on synthesis step", () => {
    const reasons = computeWizardNextReasons(
      createInput({
        step: 4,
        formName: "A",
        formClientId: "",
      }),
    );

    expect(reasons).toContain(
      "Le nom du projet doit faire au moins 2 caractères.",
    );
    expect(reasons).toContain("Sélectionnez un client.");
  });

  it("clamps wizard step navigation bounds", () => {
    expect(nextWizardStep(4)).toBe(4);
    expect(nextWizardStep(3)).toBe(4);
    expect(prevWizardStep(0)).toBe(0);
    expect(prevWizardStep(2)).toBe(1);
  });

  it("rewinds the wizard to the questionnaire after a project type change", () => {
    expect(resetWizardStepForProjectTypeChange(0)).toBe(0);
    expect(resetWizardStepForProjectTypeChange(2)).toBe(0);
    expect(resetWizardStepForProjectTypeChange(4)).toBe(0);
  });
});
