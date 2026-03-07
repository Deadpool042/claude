// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { defaultHostingProviderForDeployTarget } from "@/lib/hosting";
import type { ModuleId } from "@/lib/offers";
import { DEFAULT_CONSTRAINTS } from "@/lib/referential";
import { qualifyProject, type ModuleCatSelection } from "@/lib/qualification-runtime";
import {
  createWizardFeatureStates,
  createWizardModuleStates,
  createWizardProviderStates,
} from "../logic/wizard-capabilities";
import { WizardContext } from "../logic/wizard-context";
import type { FormFields, WizardContextType } from "../logic/wizard-types";
import { WizardContent } from "./WizardContent";

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function WizardHarness() {
  const [step, setStep] = useState(0);
  const [formFields, setFormFields] = useState<FormFields>({
    name: "Acme Vitrine",
    clientId: "client-1",
    description: "Site vitrine business",
    domain: "",
    port: "",
    gitRepo: "",
    hostingProviderId: defaultHostingProviderForDeployTarget("DOCKER"),
  });
  const [catSelections, setCatSelections] = useState<Record<string, ModuleCatSelection>>({});
  const [wizardModules, setWizardModules] = useState(createWizardModuleStates());
  const [wizardFeatures, setWizardFeatures] = useState(createWizardFeatureStates());
  const [wizardProviders, setWizardProviders] = useState(createWizardProviderStates());

  const qualification = qualifyProject({
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: [],
    billingMode: "SOLO",
    deployTarget: "DOCKER",
    wpHeadless: false,
    constraints: {
      ...DEFAULT_CONSTRAINTS,
      needsEditing: true,
      editingFrequency: "REGULAR",
      trafficLevel: "MEDIUM",
      productCount: "NONE",
      dataSensitivity: "STANDARD",
      scalabilityLevel: "GROWING",
    },
  });

  const noop = () => undefined;

  const value: WizardContextType = {
    step,
    setStep,
    next: () => setStep((current) => Math.min(current + 1, 4)),
    prev: () => setStep((current) => Math.max(current - 1, 0)),
    canGoNext: true,
    nextReasons: [],
    projectType: "VITRINE",
    changeProjectType: noop,
    taxonomySignal: null,
    setTaxonomySignal: noop,
    techStack: "WORDPRESS",
    wpHeadless: false,
    deployTarget: "DOCKER",
    hostingTarget: "SHARED_PHP",
    setHostingTarget: noop,
    hostingTargetBack: null,
    setHostingTargetBack: noop,
    hostingTargetFront: null,
    setHostingTargetFront: noop,
    projectFamily: "CMS_MONO",
    setProjectFamily: noop,
    projectImplementation: "WORDPRESS",
    setProjectImplementation: noop,
    projectImplementationLabel: "",
    setProjectImplementationLabel: noop,
    projectFrontendImplementation: null,
    setProjectFrontendImplementation: noop,
    projectFrontendImplementationLabel: "",
    setProjectFrontendImplementationLabel: noop,
    needsEditing: true,
    setNeedsEditing: noop,
    editingMode: "BACKOFFICE",
    setEditingMode: noop,
    editingFrequency: "REGULAR",
    setEditingFrequency: noop,
    editorialPushOwner: "AGENCY",
    setEditorialPushOwner: noop,
    includeOnboardingPack: false,
    setIncludeOnboardingPack: noop,
    includeMonthlyEditorialValidation: false,
    setIncludeMonthlyEditorialValidation: noop,
    includeUnblockInterventions: false,
    setIncludeUnblockInterventions: noop,
    clientAccessPolicy: "TO_CONFIRM",
    setClientAccessPolicy: noop,
    budgetBand: "UP_TO_3500",
    setBudgetBand: noop,
    manualBudgetMax: "",
    setManualBudgetMax: noop,
    budgetBandEffective: "UP_TO_3500",
    clientKnowledge: "BASIC",
    setClientKnowledge: noop,
    primaryGoal: "GENERATE_LEADS",
    setPrimaryGoal: noop,
    ambitionLevel: "GROW_FEATURES",
    setAmbitionLevel: noop,
    targetTimeline: "ONE_TO_TWO_MONTHS",
    setTargetTimeline: noop,
    commerceModel: "SELF_HOSTED",
    setCommerceModel: noop,
    backendMode: "FULLSTACK",
    setBackendMode: noop,
    backendFamily: null,
    setBackendFamily: noop,
    backendOpsHeavy: false,
    setBackendOpsHeavy: noop,
    headlessRequired: false,
    setHeadlessRequired: noop,
    trafficLevel: "MEDIUM",
    setTrafficLevel: noop,
    productCount: "NONE",
    setProductCount: noop,
    dataSensitivity: "STANDARD",
    setDataSensitivity: noop,
    scalabilityLevel: "GROWING",
    setScalabilityLevel: noop,
    billingMode: "SOLO",
    setBillingMode: noop,
    selectedModules: new Set<ModuleId>(),
    toggleModule: noop,
    catSelections,
    setCatSelections,
    mandatoryModuleIds: [],
    includedModuleIds: [],
    compatibleModuleIds: [],
    wizardModules,
    setWizardModules,
    enableWizardModule: noop,
    disableWizardModule: noop,
    configureWizardModule: noop,
    wizardFeatures,
    setWizardFeatures,
    setWizardFeatureStatus: noop,
    configureWizardFeature: noop,
    wizardProviders,
    setWizardProviders,
    setWizardProviderStatus: noop,
    configureWizardProvider: noop,
    formFields,
    setFormFields,
    qualification,
    qualificationProjectType: "VITRINE",
    offerProjectType: "VITRINE_BLOG",
    canonicalTaxonomyResolution: null,
    backendMultiplier: 1,
    allowedDeploys: ["DOCKER"],
    isHeadless: false,
    hostingSelectionMode: "SINGLE",
    formAction: (_formData: FormData) => undefined,
    isPending: false,
    actionError: null,
  };

  return (
    <WizardContext.Provider value={value}>
      <WizardContent />
    </WizardContext.Provider>
  );
}

describe("WizardContent", () => {
  it("covers the vitrine/business flow from questionnaire to synthesis", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (resolveUrl(input) === "/api/clients") {
        return jsonResponse([{ id: "client-1", name: "Acme" }]);
      }
      throw new Error(`Unexpected fetch: ${resolveUrl(input)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<WizardHarness />);

    expect(screen.getByText("Besoin client")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
    expect(await screen.findByText("Recommandation métier")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
    expect(await screen.findByText("Périmètre retenu")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
    expect(
      await screen.findByText(
        "Les projets Vitrine / Blog n'incluent pas de modules optionnels.",
      ),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
    expect(await screen.findByText("Identité du projet")).toBeTruthy();
    expect(screen.getByText("Décision retenue")).toBeTruthy();

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([input]) => resolveUrl(input) === "/api/clients"),
      ).toBe(true);
    });

    fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
    expect(
      await screen.findByText(
        "Les projets Vitrine / Blog n'incluent pas de modules optionnels.",
      ),
    ).toBeTruthy();
  });
});
