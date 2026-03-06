import {
  useEffect,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  getAllowedDeployTargets,
  type BackendFamily,
  type DataSensitivity,
  type DeployTarget,
  type LegacyTechStack as TechStack,
  type ProductBucket,
  type ProjectType,
  type ScalabilityLevel,
  type TrafficLevel,
} from "@/lib/referential";
import {
  defaultHostingProviderForDeployTarget,
  getHostingProvidersForDeployTarget,
} from "@/lib/hosting";
import {
  HOSTING_ALLOWED_FAMILIES,
  PROJECT_FAMILY_OPTIONS,
  filterFamiliesByProjectType,
  filterHostingTargetsForProjectType,
  getImplementationOptions,
  isImplementationLiveEligible,
  resolveDefaultFrontend,
  resolveDeployTargetFromHosting,
  resolveFamilyFromInputs,
  resolveImplementationFromFamily,
  resolveTechStackFromImplementation,
  type CommerceModel,
  type EditingFrequency,
} from "@/lib/project-choices";
import {
  deriveHostingSelectionMode,
  isHeadlessArchitecture,
  resolveDefaultBackHosting,
  resolveDefaultFrontHosting,
  type BackendMode,
  type HostingSelectionMode,
  type WizardTypeStackState,
} from "@/lib/wizard-domain";
import type {
  HostingTargetInput,
  ProjectFamilyInput,
  ProjectFrontendImplementationInput,
  ProjectImplementationInput,
} from "@/lib/validators";
import type { BudgetBand, FormFields } from "./wizard-types";

export interface WizardTypeStackSyncParams {
  projectType: ProjectType | null;
  hostingTarget: HostingTargetInput;
  setHostingTarget: (target: HostingTargetInput) => void;
  hostingTargetBack: HostingTargetInput | null;
  setHostingTargetBack: (target: HostingTargetInput | null) => void;
  hostingTargetFront: HostingTargetInput | null;
  setHostingTargetFront: (target: HostingTargetInput | null) => void;
  needsEditing: boolean;
  editingFrequency: EditingFrequency;
  commerceModel: CommerceModel;
  backendMode: BackendMode;
  backendFamily: BackendFamily | null;
  backendOpsHeavy: boolean;
  headlessRequired: boolean;
  trafficLevel: TrafficLevel;
  productCount: ProductBucket;
  dataSensitivity: DataSensitivity;
  scalabilityLevel: ScalabilityLevel;
  projectFamily: ProjectFamilyInput | null;
  setProjectFamilyRaw: (family: ProjectFamilyInput | null) => void;
  projectImplementation: ProjectImplementationInput | null;
  setProjectImplementationRaw: (implementation: ProjectImplementationInput | null) => void;
  projectImplementationLabel: string;
  projectFrontendImplementation: ProjectFrontendImplementationInput | null;
  setProjectFrontendImplementationRaw: (
    implementation: ProjectFrontendImplementationInput | null,
  ) => void;
  projectFrontendImplementationLabel: string;
  setProjectFrontendImplementationLabel: (label: string) => void;
  techStack: TechStack | null;
  setTechStackRaw: (stack: TechStack | null) => void;
  wpHeadless: boolean;
  setWpHeadless: (value: boolean) => void;
  deployTarget: DeployTarget;
  setDeployTargetRaw: (target: DeployTarget) => void;
  budgetBandEffective: BudgetBand;
  familyManual: boolean;
  setFamilyManual: (value: boolean) => void;
  implementationManual: boolean;
  setImplementationManual: (value: boolean) => void;
  formFields: FormFields;
  setFormFields: Dispatch<SetStateAction<FormFields>>;
}

export interface WizardTypeStackSyncResult {
  typeStackState: WizardTypeStackState;
  hostingSelectionMode: HostingSelectionMode;
  isHeadless: boolean;
  allowedDeploys: DeployTarget[];
}

export function useWizardTypeStackSync(
  params: WizardTypeStackSyncParams,
): WizardTypeStackSyncResult {
  const typeStackState = useMemo<WizardTypeStackState>(
    () => ({
      projectType: params.projectType,
      hostingTarget: params.hostingTarget,
      hostingTargetBack: params.hostingTargetBack,
      hostingTargetFront: params.hostingTargetFront,
      needsEditing: params.needsEditing,
      editingFrequency: params.editingFrequency,
      commerceModel: params.commerceModel,
      backendMode: params.backendMode,
      backendFamily: params.backendFamily,
      backendOpsHeavy: params.backendOpsHeavy,
      headlessRequired: params.headlessRequired,
      trafficLevel: params.trafficLevel,
      productCount: params.productCount,
      dataSensitivity: params.dataSensitivity,
      scalabilityLevel: params.scalabilityLevel,
      projectFamily: params.projectFamily,
      projectImplementation: params.projectImplementation,
      projectImplementationLabel: params.projectImplementationLabel,
      projectFrontendImplementation: params.projectFrontendImplementation,
      projectFrontendImplementationLabel: params.projectFrontendImplementationLabel,
      techStack: params.techStack,
      wpHeadless: params.wpHeadless,
    }),
    [
      params.projectType,
      params.hostingTarget,
      params.hostingTargetBack,
      params.hostingTargetFront,
      params.needsEditing,
      params.editingFrequency,
      params.commerceModel,
      params.backendMode,
      params.backendFamily,
      params.backendOpsHeavy,
      params.headlessRequired,
      params.trafficLevel,
      params.productCount,
      params.dataSensitivity,
      params.scalabilityLevel,
      params.projectFamily,
      params.projectImplementation,
      params.projectImplementationLabel,
      params.projectFrontendImplementation,
      params.projectFrontendImplementationLabel,
      params.techStack,
      params.wpHeadless,
    ],
  );

  const hostingSelectionMode = useMemo(
    () => deriveHostingSelectionMode(typeStackState),
    [typeStackState],
  );
  const isHeadless = useMemo(
    () => isHeadlessArchitecture(typeStackState),
    [typeStackState],
  );

  const allowedDeploys = useMemo(
    () =>
      params.techStack
        ? getAllowedDeployTargets(params.techStack, params.wpHeadless)
        : (["DOCKER"] as DeployTarget[]),
    [params.techStack, params.wpHeadless],
  );
  const allowedHostingTargets = useMemo(
    () => filterHostingTargetsForProjectType(params.projectType ?? "VITRINE"),
    [params.projectType],
  );

  useEffect(() => {
    if (!allowedHostingTargets.includes(params.hostingTarget)) {
      params.setHostingTarget(allowedHostingTargets[0] ?? "TO_CONFIRM");
    }
  }, [allowedHostingTargets, params.hostingTarget, params.setHostingTarget]);

  useEffect(() => {
    const isLowBudget =
      params.budgetBandEffective === "UNDER_1200" ||
      params.budgetBandEffective === "UP_TO_1800";
    const isSite = params.projectType === "VITRINE" || params.projectType === "BLOG";
    if (!isLowBudget || !isSite) return;
    if (hostingSelectionMode !== "SINGLE") return;
    if (params.hostingTarget !== "SHARED_PHP") {
      params.setHostingTarget("SHARED_PHP");
    }
  }, [
    params.budgetBandEffective,
    params.projectType,
    params.hostingTarget,
    params.setHostingTarget,
    hostingSelectionMode,
  ]);

  const allowedFamiliesRaw =
    hostingSelectionMode === "SINGLE"
      ? HOSTING_ALLOWED_FAMILIES[params.hostingTarget] ??
        HOSTING_ALLOWED_FAMILIES.TO_CONFIRM
      : PROJECT_FAMILY_OPTIONS.map((opt) => opt.value);
  const allowedFamilies = filterFamiliesByProjectType(
    allowedFamiliesRaw,
    params.projectType ?? "VITRINE",
  );
  const allowedHostingProviders = getHostingProvidersForDeployTarget(
    params.deployTarget,
  ).map((provider) => provider.id);
  const defaultHostingProvider = defaultHostingProviderForDeployTarget(
    params.deployTarget,
  );

  const derivedDeployTarget = useMemo(() => {
    const baseTarget =
      hostingSelectionMode === "SINGLE"
        ? params.hostingTarget
        : hostingSelectionMode === "NONE"
          ? "TO_CONFIRM"
          : params.hostingTargetFront ?? params.hostingTarget;
    const desiredTarget = resolveDeployTargetFromHosting(baseTarget ?? "TO_CONFIRM");
    return allowedDeploys.includes(desiredTarget)
      ? desiredTarget
      : (allowedDeploys[0] ?? desiredTarget);
  }, [
    hostingSelectionMode,
    params.hostingTarget,
    params.hostingTargetFront,
    allowedDeploys,
  ]);

  useEffect(() => {
    if (!params.projectType) return;
    let suggestedFamily = resolveFamilyFromInputs({
      projectType: params.projectType,
      needsEditing: params.needsEditing,
      editingFrequency: params.editingFrequency,
      commerceModel: params.commerceModel,
      headlessRequired: params.headlessRequired,
    });
    if (!allowedFamilies.includes(suggestedFamily)) {
      suggestedFamily = allowedFamilies[0] ?? suggestedFamily;
    }
    if (
      !params.familyManual ||
      (params.projectFamily && !allowedFamilies.includes(params.projectFamily))
    ) {
      params.setProjectFamilyRaw(suggestedFamily);
      params.setFamilyManual(false);
    }
  }, [
    params.projectType,
    params.needsEditing,
    params.editingFrequency,
    params.commerceModel,
    params.headlessRequired,
    allowedFamilies,
    params.familyManual,
    params.projectFamily,
    params.setProjectFamilyRaw,
    params.setFamilyManual,
  ]);

  useEffect(() => {
    if (!params.projectFamily) return;
    const allowedOptions = getImplementationOptions(params.projectFamily, "all");
    const isStillAllowed = params.projectImplementation
      ? allowedOptions.some(
          (opt) =>
            opt.value === params.projectImplementation &&
            (params.projectImplementation !== "OTHER" ||
              opt.label === params.projectImplementationLabel),
        )
      : false;
    if (!params.implementationManual || !isStillAllowed) {
      const nextImplementation = resolveImplementationFromFamily(
        params.projectFamily,
        "supported",
      );
      params.setProjectImplementationRaw(nextImplementation);
      params.setImplementationManual(false);
    }
  }, [
    params.projectFamily,
    params.projectImplementation,
    params.projectImplementationLabel,
    params.implementationManual,
    params.setProjectImplementationRaw,
    params.setImplementationManual,
  ]);

  useEffect(() => {
    const needsFrontend = isHeadless;

    if (hostingSelectionMode === "SINGLE" || hostingSelectionMode === "NONE") {
      params.setHostingTargetBack(null);
      params.setHostingTargetFront(null);
    } else if (hostingSelectionMode === "FRONT_ONLY") {
      params.setHostingTargetBack(null);
      if (!params.hostingTargetFront) {
        params.setHostingTargetFront(resolveDefaultFrontHosting(typeStackState));
      }
    } else {
      if (!params.hostingTargetBack) {
        params.setHostingTargetBack(resolveDefaultBackHosting(typeStackState));
      }
      if (!params.hostingTargetFront) {
        params.setHostingTargetFront(resolveDefaultFrontHosting(typeStackState));
      }
    }

    if (!needsFrontend) {
      params.setProjectFrontendImplementationRaw(null);
      params.setProjectFrontendImplementationLabel("");
      return;
    }

    if (!params.projectFrontendImplementation) {
      params.setProjectFrontendImplementationRaw(resolveDefaultFrontend());
    }
  }, [
    hostingSelectionMode,
    params.hostingTargetBack,
    params.hostingTargetFront,
    isHeadless,
    params.projectFrontendImplementation,
    typeStackState,
    params.setHostingTargetBack,
    params.setHostingTargetFront,
    params.setProjectFrontendImplementationRaw,
    params.setProjectFrontendImplementationLabel,
  ]);

  useEffect(() => {
    const liveEligible = params.projectImplementation
      ? isImplementationLiveEligible(params.projectImplementation)
      : false;
    if (!liveEligible) {
      if (params.techStack !== null) params.setTechStackRaw(null);
      if (params.wpHeadless) params.setWpHeadless(false);
      return;
    }
    const { techStack: resolved, wpHeadless: headless } =
      resolveTechStackFromImplementation(
        params.projectImplementation,
        params.projectFrontendImplementation,
      );
    const fallbackByFamily: Record<ProjectFamilyInput, TechStack> = {
      STATIC_SSG: "ASTRO",
      CMS_MONO: "WORDPRESS",
      CMS_HEADLESS: "WORDPRESS",
      COMMERCE_SAAS: "WORDPRESS",
      COMMERCE_SELF_HOSTED: "WORDPRESS",
      COMMERCE_HEADLESS: "NEXTJS",
      APP_PLATFORM: "NEXTJS",
    };
    const nextTechStack =
      resolved ?? (params.projectFamily ? fallbackByFamily[params.projectFamily] : null);
    if (nextTechStack !== params.techStack) params.setTechStackRaw(nextTechStack);
    if (headless !== params.wpHeadless) params.setWpHeadless(headless);
  }, [
    params.projectImplementation,
    params.projectFrontendImplementation,
    params.projectFamily,
    params.techStack,
    params.wpHeadless,
    params.setTechStackRaw,
    params.setWpHeadless,
  ]);

  useEffect(() => {
    if (derivedDeployTarget && derivedDeployTarget !== params.deployTarget) {
      params.setDeployTargetRaw(derivedDeployTarget);
    }
  }, [derivedDeployTarget, params.deployTarget, params.setDeployTargetRaw]);

  useEffect(() => {
    if (!allowedHostingProviders.includes(params.formFields.hostingProviderId)) {
      params.setFormFields((prev) => ({
        ...prev,
        hostingProviderId: defaultHostingProvider,
      }));
    }
  }, [
    allowedHostingProviders,
    defaultHostingProvider,
    params.formFields.hostingProviderId,
    params.setFormFields,
  ]);

  return {
    typeStackState,
    hostingSelectionMode,
    isHeadless,
    allowedDeploys,
  };
}
