import { useCallback, useMemo, useState } from "react";
import {
  DATA_SENSITIVITY_LABELS,
  PRODUCT_BUCKET_LABELS,
  SCALABILITY_LEVEL_LABELS,
  TRAFFIC_LEVEL_LABELS,
  BACKEND_FAMILY_LABELS,
  BACKEND_FAMILY_DESCRIPTIONS,
  type DataSensitivity,
  type ProductBucket,
  type ScalabilityLevel,
  type TrafficLevel,
  type BackendFamily,
} from "@/lib/referential";
import {
  buildTypeStackViewModel,
  normalizeTypeStackState,
  type WizardTypeStackState,
  type BackendMode,
} from "@/lib/wizard-domain";
import type { CommerceModel, EditingFrequency } from "@/lib/project-choices";
import { useWizard } from "../../_providers/wizard-provider";

type SelectOption<T extends string> = { value: T; label: string; description?: string };

export function useTypeStackVM() {
  const wizard = useWizard();
  const [showAllImplementations, setShowAllImplementations] = useState(false);

  const currentState: WizardTypeStackState = {
    projectType: wizard.projectType,
    hostingTarget: wizard.hostingTarget,
    hostingTargetBack: wizard.hostingTargetBack,
    hostingTargetFront: wizard.hostingTargetFront,
    needsEditing: wizard.needsEditing,
    editingFrequency: wizard.editingFrequency,
    commerceModel: wizard.commerceModel,
    backendMode: wizard.backendMode,
    backendFamily: wizard.backendFamily,
    backendOpsHeavy: wizard.backendOpsHeavy,
    headlessRequired: wizard.headlessRequired,
    trafficLevel: wizard.trafficLevel,
    productCount: wizard.productCount,
    dataSensitivity: wizard.dataSensitivity,
    scalabilityLevel: wizard.scalabilityLevel,
    projectFamily: wizard.projectFamily,
    projectImplementation: wizard.projectImplementation,
    projectImplementationLabel: wizard.projectImplementationLabel,
    projectFrontendImplementation: wizard.projectFrontendImplementation,
    projectFrontendImplementationLabel: wizard.projectFrontendImplementationLabel,
    techStack: wizard.techStack,
    wpHeadless: wizard.wpHeadless,
  };

  const viewModel = useMemo(
    () => buildTypeStackViewModel(currentState, showAllImplementations),
    [currentState, showAllImplementations],
  );

  const isAppProject =
    currentState.projectType === "APP" || currentState.projectFamily === "APP_PLATFORM";
  const showCommerceModel = currentState.projectType === "ECOM";
  const showHeadlessToggle = Boolean(currentState.projectType && !showCommerceModel && !isAppProject);
  const showBackendSection = isAppProject;
  const showBackendFamily = showBackendSection && currentState.backendMode === "SEPARATE";
  const showProductCount = showCommerceModel;
  const implementationLabel = showBackendFamily
    ? "Frontend (app)"
    : viewModel.showHeadlessSelectors
      ? "Backend (CMS / commerce)"
      : "Implémentation";
  const implementationHint = showBackendFamily
    ? "Le backend est défini séparément pour les App Custom."
    : viewModel.showHeadlessSelectors
      ? "Choix du CMS/commerce côté back."
      : null;

  const toggleSupportFilter = useCallback(
    () => setShowAllImplementations((prev) => !prev),
    [],
  );

  const applyPatch = useCallback(
    (patch: Partial<WizardTypeStackState>) => {
      const next = normalizeTypeStackState(currentState, patch);
      if (next.hostingTarget !== wizard.hostingTarget) {
        wizard.setHostingTarget(next.hostingTarget);
      }
      if (next.hostingTargetBack !== wizard.hostingTargetBack) {
        wizard.setHostingTargetBack(next.hostingTargetBack);
      }
      if (next.hostingTargetFront !== wizard.hostingTargetFront) {
        wizard.setHostingTargetFront(next.hostingTargetFront);
      }
      if (next.projectType && next.projectType !== wizard.projectType) {
        wizard.changeProjectType(next.projectType);
      }
      if (next.needsEditing !== wizard.needsEditing) wizard.setNeedsEditing(next.needsEditing);
      if (next.editingFrequency !== wizard.editingFrequency)
        wizard.setEditingFrequency(next.editingFrequency);
      if (next.commerceModel !== wizard.commerceModel) wizard.setCommerceModel(next.commerceModel);
      if (next.backendMode !== wizard.backendMode) wizard.setBackendMode(next.backendMode);
      if (next.backendFamily !== wizard.backendFamily)
        wizard.setBackendFamily(next.backendFamily);
      if (next.backendOpsHeavy !== wizard.backendOpsHeavy)
        wizard.setBackendOpsHeavy(next.backendOpsHeavy);
      if (next.headlessRequired !== wizard.headlessRequired)
        wizard.setHeadlessRequired(next.headlessRequired);
      if (next.trafficLevel !== wizard.trafficLevel) wizard.setTrafficLevel(next.trafficLevel);
      if (next.productCount !== wizard.productCount) wizard.setProductCount(next.productCount);
      if (next.dataSensitivity !== wizard.dataSensitivity)
        wizard.setDataSensitivity(next.dataSensitivity);
      if (next.scalabilityLevel !== wizard.scalabilityLevel)
        wizard.setScalabilityLevel(next.scalabilityLevel);
      if (next.projectFamily && next.projectFamily !== wizard.projectFamily) {
        wizard.setProjectFamily(next.projectFamily);
      }
      if (
        next.projectImplementation &&
        next.projectImplementation !== wizard.projectImplementation
      ) {
        wizard.setProjectImplementation(next.projectImplementation);
      }
      if (next.projectImplementationLabel !== wizard.projectImplementationLabel) {
        wizard.setProjectImplementationLabel(next.projectImplementationLabel);
      }
      if (
        next.projectFrontendImplementation &&
        next.projectFrontendImplementation !== wizard.projectFrontendImplementation
      ) {
        wizard.setProjectFrontendImplementation(next.projectFrontendImplementation);
      }
      if (
        next.projectFrontendImplementationLabel !== wizard.projectFrontendImplementationLabel
      ) {
        wizard.setProjectFrontendImplementationLabel(next.projectFrontendImplementationLabel);
      }
    },
    [currentState, wizard],
  );

  const editingOptions: SelectOption<EditingFrequency>[] = [
    { value: "RARE", label: "Rare" },
    { value: "REGULAR", label: "Régulier" },
    { value: "DAILY", label: "Quotidien" },
  ];

  const commerceOptions: SelectOption<CommerceModel>[] = [
    { value: "SAAS", label: "SaaS (Shopify)" },
    { value: "SELF_HOSTED", label: "Auto‑hébergé" },
    { value: "HEADLESS", label: "Headless" },
  ];

  const backendModeOptions: SelectOption<BackendMode>[] = [
    {
      value: "FULLSTACK",
      label: "Full‑stack (front + back intégré)",
      description: "Une seule app, backend embarqué (Next.js, Nuxt...).",
    },
    {
      value: "SEPARATE",
      label: "Front + backend séparés",
      description: "Front web + backend BaaS/API distinct.",
    },
  ];

  const backendFamilyOptions: SelectOption<BackendFamily>[] = (
    Object.keys(BACKEND_FAMILY_LABELS) as BackendFamily[]
  ).map((value) => ({
    value,
    label: BACKEND_FAMILY_LABELS[value],
    description: BACKEND_FAMILY_DESCRIPTIONS[value],
  }));

  const trafficOptions: SelectOption<TrafficLevel>[] = [
    { value: "LOW", label: TRAFFIC_LEVEL_LABELS.LOW },
    { value: "MEDIUM", label: TRAFFIC_LEVEL_LABELS.MEDIUM },
    { value: "HIGH", label: TRAFFIC_LEVEL_LABELS.HIGH },
    { value: "VERY_HIGH", label: TRAFFIC_LEVEL_LABELS.VERY_HIGH },
  ];

  const productOptions: SelectOption<ProductBucket>[] = [
    { value: "NONE", label: PRODUCT_BUCKET_LABELS.NONE },
    { value: "SMALL", label: PRODUCT_BUCKET_LABELS.SMALL },
    { value: "MEDIUM", label: PRODUCT_BUCKET_LABELS.MEDIUM },
    { value: "LARGE", label: PRODUCT_BUCKET_LABELS.LARGE },
  ];

  const sensitivityOptions: SelectOption<DataSensitivity>[] = [
    { value: "STANDARD", label: DATA_SENSITIVITY_LABELS.STANDARD },
    { value: "SENSITIVE", label: DATA_SENSITIVITY_LABELS.SENSITIVE },
    { value: "REGULATED", label: DATA_SENSITIVITY_LABELS.REGULATED },
  ];

  const scalabilityOptions: SelectOption<ScalabilityLevel>[] = [
    { value: "FIXED", label: SCALABILITY_LEVEL_LABELS.FIXED },
    { value: "GROWING", label: SCALABILITY_LEVEL_LABELS.GROWING },
    { value: "ELASTIC", label: SCALABILITY_LEVEL_LABELS.ELASTIC },
  ];

  return {
    wizard,
    viewModel,
    showAllImplementations,
    toggleSupportFilter,
    applyPatch,
    showCommerceModel,
    showHeadlessToggle,
    showBackendSection,
    showBackendFamily,
    showProductCount,
    implementationLabel,
    implementationHint,
    hostingSelectionMode: viewModel.hostingSelectionMode,
    hostingBaseOptions: viewModel.hostingOptions,
    hostingBackOptions: viewModel.hostingBackOptions,
    hostingFrontOptions: viewModel.hostingFrontOptions,
    commerceModelHint: viewModel.commerceModelHint,
    projectTypeOptions: viewModel.projectTypeOptions,
    hostingOptions: viewModel.hostingOptions,
    familyOptions: viewModel.familyOptions,
    implementationOptions: viewModel.implementationOptions,
    frontOptions: viewModel.frontOptions,
    activeImplementation: viewModel.activeImplementation,
    activeFront: viewModel.activeFront,
    showHeadlessSelectors: viewModel.showHeadlessSelectors,
    editingOptions,
    commerceOptions,
    trafficOptions,
    productOptions,
    sensitivityOptions,
    scalabilityOptions,
    backendModeOptions,
    backendFamilyOptions,
  };
}
