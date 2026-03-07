//src/features/dashboard/projects/new/logic/WizardProvider.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { useModules, useQualification } from "@/features/dashboard/projects/hooks";
import {
  DEFAULT_CONSTRAINTS,
  type ProjectType,
  type LegacyTechStack as TechStack,
  type DeployTarget,
  type TrafficLevel,
  type ProductBucket,
  type DataSensitivity,
  type ScalabilityLevel,
  type BackendFamily,
} from "@/lib/referential";
import {
  resolveDefaultFrontend,
  type CommerceModel,
  type EditingFrequency,
} from "@/lib/project-choices";
import type { BackendMode } from "@/lib/wizard-domain";
import {
  normalizeTaxonomySignalForProjectType,
  resolveDefaultTaxonomySignalForProjectType,
  type TaxonomyDisambiguationSignal,
} from "@/lib/taxonomy";
import type {
  HostingTargetInput,
  ProjectFamilyInput,
  ProjectFrontendImplementationInput,
  ProjectImplementationInput,
} from "@/lib/validators";
import type { ModuleId } from "@/lib/offers";
import { WizardContext } from "./wizard-context";
import { useWizardCapabilitiesState } from "./wizard-capabilities-state";
import {
  computeWizardNextReasons,
  nextWizardStep,
  prevWizardStep,
  resetWizardStepForProjectTypeChange,
} from "./wizard-navigation";
import {
  buildQualificationConstraints,
  useWizardOfferDerivations,
} from "./wizard-offers";
import { parseWizardQueryPrefill, resolveOfferPrefill } from "./wizard-prefill";
import {
  createInitialWizardFormFields,
  useWizardSubmitAction,
} from "./wizard-submit";
import { useWizardTypeStackSync } from "./wizard-type-stack";
import {
  deriveBudgetBandFromManualValue,
  type AmbitionLevel,
  type BillingMode,
  type BudgetBand,
  type ClientAccessPolicy,
  type ClientKnowledge,
  type EditingMode,
  type EditorialPushOwner,
  type FormFields,
  type PrimaryGoal,
  type TargetTimeline,
} from "./wizard-types";

export function WizardProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const queryPrefill = useMemo(
    () => parseWizardQueryPrefill(searchParams),
    [searchParams],
  );

  const offerInitDoneRef = useRef(false);
  const pendingOfferModulesRef = useRef<ModuleId[] | null>(null);

  const { formAction, isPending, actionError } = useWizardSubmitAction();

  const [step, setStep] = useState(0);

  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [taxonomySignal, setTaxonomySignalRaw] =
    useState<TaxonomyDisambiguationSignal | null>(null);
  const [techStack, setTechStackRaw] = useState<TechStack | null>("WORDPRESS");
  const [wpHeadless, setWpHeadless] = useState(false);
  const [deployTarget, setDeployTargetRaw] = useState<DeployTarget>("DOCKER");
  const [hostingTarget, setHostingTarget] =
    useState<HostingTargetInput>("TO_CONFIRM");
  const [hostingTargetBack, setHostingTargetBack] =
    useState<HostingTargetInput | null>(null);
  const [hostingTargetFront, setHostingTargetFront] =
    useState<HostingTargetInput | null>(null);
  const [needsEditing, setNeedsEditing] = useState(false);
  const [editingMode, setEditingMode] = useState<EditingMode>("TO_CONFIRM");
  const [editorialPushOwner, setEditorialPushOwner] =
    useState<EditorialPushOwner>("TO_CONFIRM");
  const [includeOnboardingPack, setIncludeOnboardingPack] = useState(false);
  const [includeMonthlyEditorialValidation, setIncludeMonthlyEditorialValidation] =
    useState(false);
  const [includeUnblockInterventions, setIncludeUnblockInterventions] =
    useState(false);
  const [clientAccessPolicy, setClientAccessPolicy] =
    useState<ClientAccessPolicy>("TO_CONFIRM");
  const [budgetBand, setBudgetBand] = useState<BudgetBand>("TO_CONFIRM");
  const [manualBudgetMax, setManualBudgetMax] = useState("");
  const [clientKnowledge, setClientKnowledge] =
    useState<ClientKnowledge>("TO_CONFIRM");
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>("TO_CONFIRM");
  const [ambitionLevel, setAmbitionLevel] =
    useState<AmbitionLevel>("TO_CONFIRM");
  const [targetTimeline, setTargetTimeline] =
    useState<TargetTimeline>("TO_CONFIRM");
  const [editingFrequency, setEditingFrequency] =
    useState<EditingFrequency>("REGULAR");
  const [commerceModel, setCommerceModel] =
    useState<CommerceModel>("SELF_HOSTED");
  const [backendMode, setBackendMode] = useState<BackendMode>("FULLSTACK");
  const [backendFamily, setBackendFamily] = useState<BackendFamily | null>(null);
  const [backendOpsHeavy, setBackendOpsHeavy] = useState(false);
  const [headlessRequired, setHeadlessRequired] = useState(false);
  const [trafficLevel, setTrafficLevel] = useState<TrafficLevel>(
    DEFAULT_CONSTRAINTS.trafficLevel,
  );
  const [productCount, setProductCount] = useState<ProductBucket>(
    DEFAULT_CONSTRAINTS.productCount,
  );
  const [dataSensitivity, setDataSensitivity] = useState<DataSensitivity>(
    DEFAULT_CONSTRAINTS.dataSensitivity,
  );
  const [scalabilityLevel, setScalabilityLevel] = useState<ScalabilityLevel>(
    DEFAULT_CONSTRAINTS.scalabilityLevel,
  );
  const [projectFamily, setProjectFamilyRaw] =
    useState<ProjectFamilyInput | null>(null);
  const [projectImplementation, setProjectImplementationRaw] =
    useState<ProjectImplementationInput | null>(null);
  const [projectImplementationLabel, setProjectImplementationLabel] =
    useState("");
  const [projectFrontendImplementation, setProjectFrontendImplementationRaw] =
    useState<ProjectFrontendImplementationInput | null>(null);
  const [projectFrontendImplementationLabel, setProjectFrontendImplementationLabel] =
    useState("");
  const [familyManual, setFamilyManual] = useState(false);
  const [implementationManual, setImplementationManual] = useState(false);
  const [billingMode, setBillingMode] = useState<BillingMode>("SOLO");

  const {
    wizardModules,
    setWizardModules,
    enableWizardModule,
    disableWizardModule,
    configureWizardModule,
    wizardFeatures,
    setWizardFeatures,
    setWizardFeatureStatus,
    configureWizardFeature,
    wizardProviders,
    setWizardProviders,
    setWizardProviderStatus,
    configureWizardProvider,
    resetWizardCapabilities,
  } = useWizardCapabilitiesState();

  const [formFields, setFormFields] = useState<FormFields>(() =>
    createInitialWizardFormFields(queryPrefill),
  );

  const budgetBandEffective = useMemo<BudgetBand>(() => {
    const fromManual = deriveBudgetBandFromManualValue(manualBudgetMax);
    if (fromManual) return fromManual;
    return budgetBand;
  }, [manualBudgetMax, budgetBand]);

  const setTaxonomySignal = useCallback(
    (signal: TaxonomyDisambiguationSignal | null) => {
      const normalized = normalizeTaxonomySignalForProjectType(projectType, signal);
      setTaxonomySignalRaw(
        normalized ?? resolveDefaultTaxonomySignalForProjectType(projectType),
      );
    },
    [projectType],
  );

  useEffect(() => {
    setTaxonomySignalRaw((previous) => {
      const normalized = normalizeTaxonomySignalForProjectType(projectType, previous);
      return normalized ?? resolveDefaultTaxonomySignalForProjectType(projectType);
    });
  }, [projectType]);

  const {
    selectedModules,
    catSelections,
    setCatSelections,
    toggleModule,
    syncModules,
    clearModules,
  } = useModules();

  const {
    hostingSelectionMode,
    isHeadless,
    allowedDeploys,
  } = useWizardTypeStackSync({
    projectType,
    hostingTarget,
    setHostingTarget,
    hostingTargetBack,
    setHostingTargetBack,
    hostingTargetFront,
    setHostingTargetFront,
    needsEditing,
    editingFrequency,
    commerceModel,
    backendMode,
    backendFamily,
    backendOpsHeavy,
    headlessRequired,
    trafficLevel,
    productCount,
    dataSensitivity,
    scalabilityLevel,
    projectFamily,
    setProjectFamilyRaw,
    projectImplementation,
    setProjectImplementationRaw,
    projectImplementationLabel,
    projectFrontendImplementation,
    setProjectFrontendImplementationRaw,
    projectFrontendImplementationLabel,
    setProjectFrontendImplementationLabel,
    techStack,
    setTechStackRaw,
    wpHeadless,
    setWpHeadless,
    deployTarget,
    setDeployTargetRaw,
    budgetBandEffective,
    familyManual,
    setFamilyManual,
    implementationManual,
    setImplementationManual,
    formFields,
    setFormFields,
  });

  const {
    qualificationProjectType,
    offerProjectType,
    canonicalTaxonomyResolution,
    backendMultiplier,
    compatibleModuleIds,
    mandatoryModuleIds,
    includedModuleIds,
    toggleModuleSafe,
  } = useWizardOfferDerivations({
    projectType,
    taxonomySignal,
    projectFamily,
    needsEditing,
    editingFrequency,
    trafficLevel,
    productCount,
    dataSensitivity,
    scalabilityLevel,
    techStack,
    wpHeadless,
    selectedModules,
    syncModules,
    toggleModule,
    pendingOfferModulesRef,
    backendFamily,
    backendOpsHeavy,
  });

  const qualificationConstraints = useMemo(
    () =>
      buildQualificationConstraints({
        projectType,
        trafficLevel,
        productCount,
        dataSensitivity,
        scalabilityLevel,
        needsEditing,
        editingFrequency,
        commerceModel,
        backendFamily,
        backendOpsHeavy,
        isHeadless,
      }),
    [
      projectType,
      trafficLevel,
      productCount,
      dataSensitivity,
      scalabilityLevel,
      needsEditing,
      editingFrequency,
      commerceModel,
      backendFamily,
      backendOpsHeavy,
      isHeadless,
    ],
  );

  const qualification = useQualification({
    projectType: qualificationProjectType,
    techStack,
    selectedModules,
    billingMode,
    deployTarget,
    wpHeadless,
    catSelections,
    constraints: qualificationConstraints,
  });

  const changeProjectType = useCallback(
    (type: ProjectType) => {
      if (type === projectType) {
        return;
      }

      setStep((current) => resetWizardStepForProjectTypeChange(current));
      setProjectType(type);
      setTaxonomySignalRaw(resolveDefaultTaxonomySignalForProjectType(type));
      clearModules();
      resetWizardCapabilities();

      if (type === "BLOG") {
        setHeadlessRequired(false);
      }

      setEditingMode("TO_CONFIRM");
      setEditorialPushOwner("TO_CONFIRM");
      setIncludeOnboardingPack(false);
      setIncludeMonthlyEditorialValidation(false);
      setIncludeUnblockInterventions(false);
      setClientAccessPolicy("TO_CONFIRM");
      setBudgetBand("TO_CONFIRM");
      setManualBudgetMax("");
      setClientKnowledge("TO_CONFIRM");
      setPrimaryGoal("TO_CONFIRM");
      setAmbitionLevel("TO_CONFIRM");
      setTargetTimeline("TO_CONFIRM");

      if (type === "VITRINE") {
        setCommerceModel("SELF_HOSTED");
      }

      if (type !== "APP") {
        setBackendMode("FULLSTACK");
        setBackendFamily(null);
        setBackendOpsHeavy(false);
      }

      if (type !== "ECOM") {
        setCommerceModel("SELF_HOSTED");
        setProductCount("NONE");
      }

      setFamilyManual(false);
      setImplementationManual(false);
    },
    [clearModules, projectType, resetWizardCapabilities],
  );

  const setProjectFamily = useCallback((value: ProjectFamilyInput) => {
    setProjectFamilyRaw(value);
    setFamilyManual(true);
  }, []);

  const setProjectImplementation = useCallback(
    (value: ProjectImplementationInput) => {
      setProjectImplementationRaw(value);
      setImplementationManual(true);
    },
    [],
  );

  const setProjectFrontendImplementation = useCallback(
    (value: ProjectFrontendImplementationInput) => {
      setProjectFrontendImplementationRaw(value);
    },
    [],
  );

  useEffect(() => {
    if (offerInitDoneRef.current) return;

    const prefill = resolveOfferPrefill(queryPrefill);
    if (!prefill) {
      offerInitDoneRef.current = true;
      return;
    }

    changeProjectType(prefill.projectType);

    if (prefill.taxonomySignal) {
      setTaxonomySignalRaw(prefill.taxonomySignal);
    }

    setProjectFamilyRaw(prefill.projectFamily);
    setProjectImplementationRaw(prefill.projectImplementation);
    setFamilyManual(false);
    setImplementationManual(false);

    if (prefill.shouldPrefillFrontendImplementation) {
      setProjectFrontendImplementationRaw(resolveDefaultFrontend());
    }

    if (prefill.hostingTarget) {
      setHostingTarget(prefill.hostingTarget);
    }

    if (prefill.hostingTargetBack || prefill.hostingTargetFront) {
      setHostingTargetBack(prefill.hostingTargetBack);
      setHostingTargetFront(prefill.hostingTargetFront);
    }

    if (prefill.offerModules.length > 0) {
      pendingOfferModulesRef.current = prefill.offerModules;
    }

    offerInitDoneRef.current = true;
  }, [queryPrefill, changeProjectType]);

  const nextReasons = useMemo(
    () =>
      computeWizardNextReasons({
        step,
        projectType,
        budgetBandEffective,
        clientKnowledge,
        primaryGoal,
        ambitionLevel,
        targetTimeline,
        needsEditing,
        editingMode,
        editorialPushOwner,
        clientAccessPolicy,
        isHeadless,
        projectFrontendImplementation,
        hostingSelectionMode,
        hostingTargetBack,
        hostingTargetFront,
        selectedModules,
        wizardModules,
        formName: formFields.name,
        formClientId: formFields.clientId,
      }),
    [
      step,
      projectType,
      budgetBandEffective,
      clientKnowledge,
      primaryGoal,
      ambitionLevel,
      targetTimeline,
      needsEditing,
      editingMode,
      editorialPushOwner,
      clientAccessPolicy,
      isHeadless,
      projectFrontendImplementation,
      hostingSelectionMode,
      hostingTargetBack,
      hostingTargetFront,
      selectedModules,
      wizardModules,
      formFields.name,
      formFields.clientId,
    ],
  );

  const canGoNext = nextReasons.length === 0;

  const next = useCallback(() => {
    if (!canGoNext) return;
    setStep((current) => nextWizardStep(current));
  }, [canGoNext]);

  const prev = useCallback(() => {
    setStep((current) => prevWizardStep(current));
  }, []);

  return (
    <WizardContext.Provider
      value={{
        step,
        setStep,
        next,
        prev,
        canGoNext,
        nextReasons,
        projectType,
        changeProjectType,
        taxonomySignal,
        setTaxonomySignal,
        techStack,
        wpHeadless,
        deployTarget,
        hostingTarget,
        setHostingTarget,
        hostingTargetBack,
        setHostingTargetBack,
        hostingTargetFront,
        setHostingTargetFront,
        projectFamily,
        setProjectFamily,
        projectImplementation,
        setProjectImplementation,
        projectImplementationLabel,
        setProjectImplementationLabel,
        projectFrontendImplementation,
        setProjectFrontendImplementation,
        projectFrontendImplementationLabel,
        setProjectFrontendImplementationLabel,
        needsEditing,
        setNeedsEditing,
        editingMode,
        setEditingMode,
        editingFrequency,
        setEditingFrequency,
        editorialPushOwner,
        setEditorialPushOwner,
        includeOnboardingPack,
        setIncludeOnboardingPack,
        includeMonthlyEditorialValidation,
        setIncludeMonthlyEditorialValidation,
        includeUnblockInterventions,
        setIncludeUnblockInterventions,
        clientAccessPolicy,
        setClientAccessPolicy,
        budgetBand,
        setBudgetBand,
        manualBudgetMax,
        setManualBudgetMax,
        budgetBandEffective,
        clientKnowledge,
        setClientKnowledge,
        primaryGoal,
        setPrimaryGoal,
        ambitionLevel,
        setAmbitionLevel,
        targetTimeline,
        setTargetTimeline,
        commerceModel,
        setCommerceModel,
        backendMode,
        setBackendMode,
        backendFamily,
        setBackendFamily,
        backendOpsHeavy,
        setBackendOpsHeavy,
        headlessRequired,
        setHeadlessRequired,
        trafficLevel,
        setTrafficLevel,
        productCount,
        setProductCount,
        dataSensitivity,
        setDataSensitivity,
        scalabilityLevel,
        setScalabilityLevel,
        billingMode,
        setBillingMode,
        selectedModules,
        toggleModule: toggleModuleSafe,
        catSelections,
        setCatSelections,
        mandatoryModuleIds,
        includedModuleIds,
        compatibleModuleIds,
        wizardModules,
        setWizardModules,
        enableWizardModule,
        disableWizardModule,
        configureWizardModule,
        wizardFeatures,
        setWizardFeatures,
        setWizardFeatureStatus,
        configureWizardFeature,
        wizardProviders,
        setWizardProviders,
        setWizardProviderStatus,
        configureWizardProvider,
        formFields,
        setFormFields,
        qualification,
        qualificationProjectType,
        offerProjectType,
        canonicalTaxonomyResolution,
        backendMultiplier,
        allowedDeploys,
        isHeadless,
        hostingSelectionMode,
        formAction,
        isPending,
        actionError,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export { useWizard } from "./wizard-context";
