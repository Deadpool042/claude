import { describe, expect, it } from "vitest";
import {
  buildRecommendationWhy,
  buildWizardDecisionFlow,
  resolveProductionModeLabel,
  type WizardFlowInput,
} from "./wizard-flow";

function makeInput(overrides: Partial<WizardFlowInput> = {}): WizardFlowInput {
  return {
    projectType: "VITRINE",
    offerProjectType: "VITRINE_BLOG",
    projectFamily: "CMS_MONO",
    projectImplementation: "WORDPRESS",
    projectImplementationLabel: "",
    projectFrontendImplementation: null,
    projectFrontendImplementationLabel: "",
    hostingSelectionMode: "SINGLE",
    hostingTarget: "SHARED_PHP",
    hostingTargetBack: null,
    hostingTargetFront: null,
    selectedModules: new Set(),
    formFields: {
      name: "Projet Acme",
      clientId: "client-1",
      description: "",
      domain: "",
      port: "",
      gitRepo: "",
      hostingProviderId: "O2SWITCH",
    },
    qualification: null,
    budgetBandEffective: "UP_TO_3500",
    clientKnowledge: "BASIC",
    primaryGoal: "GENERATE_LEADS",
    ambitionLevel: "GROW_FEATURES",
    targetTimeline: "ONE_TO_TWO_MONTHS",
    needsEditing: true,
    editingMode: "BACKOFFICE",
    editingFrequency: "REGULAR",
    editorialPushOwner: "AGENCY",
    clientAccessPolicy: "TO_CONFIRM",
    trafficLevel: "MEDIUM",
    dataSensitivity: "STANDARD",
    scalabilityLevel: "GROWING",
    canonicalTaxonomyResolution: null,
    ...overrides,
  };
}

describe("wizard-flow", () => {
  it("builds a readable decision chain", () => {
    const flow = buildWizardDecisionFlow(makeInput());

    expect(flow).toHaveLength(5);
    expect(flow[0]).toMatchObject({
      label: "Besoin client",
      value: "Vitrine",
    });
    expect(flow[1].value).toBe("Vitrine / Blog");
    expect(flow[2].value).toBe("WordPress");
    expect(flow[4]).toMatchObject({
      value: "Prête à créer",
      detail: "Projet Acme",
    });
  });

  it("explains recommendation continuity from business answers to implementation", () => {
    const why = buildRecommendationWhy(
      makeInput({
        projectType: "ECOM",
        offerProjectType: "ECOMMERCE",
      }),
    );

    expect(why).toHaveLength(4);
    expect(why[0].consequenceValue).toContain("E-commerce");
    expect(why[2].consequenceValue).toContain("back-office CMS");
    expect(why[3].consequenceLabel).toBe("Impact mise en œuvre");
  });

  it("describes Git/MDX client publishing mode explicitly", () => {
    expect(
      resolveProductionModeLabel({
        needsEditing: true,
        editingMode: "GIT_MDX",
        editorialPushOwner: "CLIENT",
      }),
    ).toBe("Client publie directement via Git/MDX.");
  });
});
