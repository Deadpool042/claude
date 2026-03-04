//src/features/dashboard/projects/new/logic/WizardProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  type Dispatch,
  type SetStateAction,
  type ReactNode
} from "react";
import { useSearchParams } from "next/navigation";
import { createProjectAction } from "@/features/dashboard/projects/server-actions";
import { useModules, useQualification } from "@/hooks";
import {
  getOfferStackForProject,
} from "@/lib/qualification-runtime";
import {
  DEFAULT_CONSTRAINTS,
  getAllowedDeployTargets,
  MODULE_CATALOG,
  normalizeModuleIds,
  type ProjectType,
  type LegacyTechStack as TechStack,
  type DeployTarget,
  type TrafficLevel,
  type ProductBucket,
  type DataSensitivity,
  type ScalabilityLevel,
  type ProjectConstraints,
  type BackendFamily,
  getBackendMultiplier
} from "@/lib/referential";
import {
  HOSTING_ALLOWED_FAMILIES,
  getImplementationOptions,
  isImplementationLiveEligible,
  resolveDefaultFrontend,
  resolveDeployTargetFromHosting,
  resolveFamilyFromInputs,
  resolveImplementationFromFamily,
  resolveTechStackFromImplementation,
  PROJECT_FAMILY_OPTIONS,
  type CommerceModel,
  type EditingFrequency,
  filterFamiliesByProjectType,
  filterHostingTargetsForProjectType
} from "@/lib/project-choices";
import {
  deriveOfferProjectType,
  deriveQualificationProjectType,
  deriveHostingSelectionMode,
  isHeadlessArchitecture,
  resolveDefaultBackHosting,
  resolveDefaultFrontHosting,
  type WizardTypeStackState,
  type BackendMode,
  type HostingSelectionMode
} from "@/lib/wizard-domain";
import type {
  HostingTargetInput,
  ProjectFamilyInput,
  ProjectFrontendImplementationInput,
  ProjectImplementationInput
} from "@/lib/validators";
import {
  getMandatoryModules,
  getIncludedModules,
  isModuleCompatible,
  type ModuleId,
  type OfferCategory,
  type Stack as OfferStack
} from "@/lib/offers";
import {
  getHostingProvidersForDeployTarget,
  defaultHostingProviderForDeployTarget,
  type HostingProviderId
} from "@/lib/hosting";

type BillingMode = "SOLO" | "SOUS_TRAITANT";
type QualificationResult = NonNullable<ReturnType<typeof useQualification>>;

interface ModuleCatSelection {
  setupCatId?: string;
  subCatId?: string;
}

// ── Types ──────────────────────────────────────────────────────────

export interface FormFields {
  name: string;
  clientId: string;
  description: string;
  domain: string;
  port: string;
  gitRepo: string;
  hostingProviderId: HostingProviderId;
}

type EditingMode = "BACKOFFICE" | "GIT_MDX" | "TO_CONFIRM";
type EditorialPushOwner = "CLIENT" | "AGENCY" | "TO_CONFIRM";
type ClientAccessPolicy =
  | "CONTENT_REPO_ONLY"
  | "CONTENT_REPO_WITH_PR"
  | "TO_CONFIRM";
type BudgetBand =
  | "UNDER_1200"
  | "UP_TO_1800"
  | "UP_TO_3500"
  | "UP_TO_7000"
  | "OVER_7000"
  | "TO_CONFIRM";

function deriveBudgetBandFromManualValue(
  manualBudgetMax: string,
): BudgetBand | null {
  const parsed = Number(manualBudgetMax.replace(/\s+/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  if (parsed < 1200) return "UNDER_1200";
  if (parsed <= 1800) return "UP_TO_1800";
  if (parsed <= 3500) return "UP_TO_3500";
  if (parsed <= 7000) return "UP_TO_7000";
  return "OVER_7000";
}
type ClientKnowledge =
  | "NONE"
  | "BASIC"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "TO_CONFIRM";
type PrimaryGoal =
  | "PRESENCE"
  | "GENERATE_LEADS"
  | "PUBLISH_CONTENT"
  | "SELL_ONLINE"
  | "DIGITIZE_PROCESS"
  | "TO_CONFIRM";
type AmbitionLevel =
  | "KEEP_SIMPLE"
  | "GROW_FEATURES"
  | "SCALE_TRAFFIC"
  | "PREPARE_PLATFORM"
  | "TO_CONFIRM";
type TargetTimeline =
  | "UNDER_1_MONTH"
  | "ONE_TO_TWO_MONTHS"
  | "TWO_TO_FOUR_MONTHS"
  | "FLEXIBLE"
  | "TO_CONFIRM";

export interface WizardContextType {
  /* Navigation */
  step: number;
  setStep: (step: number) => void;
  next: () => void;
  prev: () => void;
  canGoNext: boolean;
  nextReasons: string[];

  /* Project config */
  projectType: ProjectType | null;
  changeProjectType: (type: ProjectType) => void;
  techStack: TechStack | null;
  wpHeadless: boolean;
  deployTarget: DeployTarget;
  hostingTarget: HostingTargetInput;
  setHostingTarget: (target: HostingTargetInput) => void;
  hostingTargetBack: HostingTargetInput | null;
  setHostingTargetBack: (target: HostingTargetInput | null) => void;
  hostingTargetFront: HostingTargetInput | null;
  setHostingTargetFront: (target: HostingTargetInput | null) => void;
  projectFamily: ProjectFamilyInput | null;
  setProjectFamily: (value: ProjectFamilyInput) => void;
  projectImplementation: ProjectImplementationInput | null;
  setProjectImplementation: (value: ProjectImplementationInput) => void;
  projectImplementationLabel: string;
  setProjectImplementationLabel: (value: string) => void;
  projectFrontendImplementation: ProjectFrontendImplementationInput | null;
  setProjectFrontendImplementation: (
    value: ProjectFrontendImplementationInput
  ) => void;
  projectFrontendImplementationLabel: string;
  setProjectFrontendImplementationLabel: (value: string) => void;
  needsEditing: boolean;
  setNeedsEditing: (value: boolean) => void;
  editingMode: EditingMode;
  setEditingMode: (value: EditingMode) => void;
  editingFrequency: EditingFrequency;
  setEditingFrequency: (value: EditingFrequency) => void;
  editorialPushOwner: EditorialPushOwner;
  setEditorialPushOwner: (value: EditorialPushOwner) => void;
  includeOnboardingPack: boolean;
  setIncludeOnboardingPack: (value: boolean) => void;
  includeMonthlyEditorialValidation: boolean;
  setIncludeMonthlyEditorialValidation: (value: boolean) => void;
  includeUnblockInterventions: boolean;
  setIncludeUnblockInterventions: (value: boolean) => void;
  clientAccessPolicy: ClientAccessPolicy;
  setClientAccessPolicy: (value: ClientAccessPolicy) => void;
  budgetBand: BudgetBand;
  setBudgetBand: (value: BudgetBand) => void;
  manualBudgetMax: string;
  setManualBudgetMax: (value: string) => void;
  budgetBandEffective: BudgetBand;
  clientKnowledge: ClientKnowledge;
  setClientKnowledge: (value: ClientKnowledge) => void;
  primaryGoal: PrimaryGoal;
  setPrimaryGoal: (value: PrimaryGoal) => void;
  ambitionLevel: AmbitionLevel;
  setAmbitionLevel: (value: AmbitionLevel) => void;
  targetTimeline: TargetTimeline;
  setTargetTimeline: (value: TargetTimeline) => void;
  commerceModel: CommerceModel;
  setCommerceModel: (value: CommerceModel) => void;
  backendMode: BackendMode;
  setBackendMode: (value: BackendMode) => void;
  backendFamily: BackendFamily | null;
  setBackendFamily: (value: BackendFamily | null) => void;
  backendOpsHeavy: boolean;
  setBackendOpsHeavy: (value: boolean) => void;
  headlessRequired: boolean;
  setHeadlessRequired: (value: boolean) => void;
  trafficLevel: TrafficLevel;
  setTrafficLevel: (value: TrafficLevel) => void;
  productCount: ProductBucket;
  setProductCount: (value: ProductBucket) => void;
  dataSensitivity: DataSensitivity;
  setDataSensitivity: (value: DataSensitivity) => void;
  scalabilityLevel: ScalabilityLevel;
  setScalabilityLevel: (value: ScalabilityLevel) => void;
  billingMode: BillingMode;
  setBillingMode: (mode: BillingMode) => void;

  /* Modules */
  selectedModules: Set<ModuleId>;
  toggleModule: (id: ModuleId) => void;
  catSelections: Record<string, ModuleCatSelection>;
  setCatSelections: Dispatch<
    SetStateAction<Record<string, ModuleCatSelection>>
  >;
  mandatoryModuleIds: ModuleId[];
  includedModuleIds: ModuleId[];
  compatibleModuleIds: ModuleId[];

  /* Form fields */
  formFields: FormFields;
  setFormFields: Dispatch<SetStateAction<FormFields>>;

  /* Derived */
  qualification: QualificationResult | null;
  qualificationProjectType: ProjectType | null;
  offerProjectType: OfferCategory | null;
  backendMultiplier: number;
  allowedDeploys: DeployTarget[];
  isHeadless: boolean;
  hostingSelectionMode: HostingSelectionMode;

  /* Form submission */
  formAction: (formData: FormData) => void;
  isPending: boolean;
  actionError: string | null;
}

// ── Context ────────────────────────────────────────────────────────

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard(): WizardContextType {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────

export function WizardProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const defaultClientId = searchParams.get("clientId") ?? "";
  const offerModulesParam = searchParams.get("offerModules") ?? "";
  const offerProjectTypeParam = searchParams.get("offerProjectType");
  const offerStackParam = searchParams.get("offerStack");
  const offerDeploymentParam = searchParams.get("offerDeployment");

  const offerModules = useMemo(() => {
    if (!offerModulesParam) return [] as ModuleId[];
    return normalizeModuleIds(
      offerModulesParam
        .split(",")
        .map(value => value.trim())
        .filter(Boolean)
    ) as ModuleId[];
  }, [offerModulesParam]);

  const offerInitDoneRef = useRef(false);
  const pendingOfferModulesRef = useRef<ModuleId[] | null>(null);

  const OFFER_PROJECT_MAP: Record<OfferCategory, ProjectType> = {
    VITRINE_BLOG: "VITRINE",
    ECOMMERCE: "ECOM",
    APP_CUSTOM: "APP"
  };

  const OFFER_STACKS: OfferStack[] = [
    "WORDPRESS",
    "NEXTJS",
    "NUXT",
    "ASTRO",
    "WORDPRESS_HEADLESS",
    "WOOCOMMERCE",
    "WOOCOMMERCE_HEADLESS"
  ];

  const [state, formAction, isPending] = useActionState(createProjectAction, {
    error: null
  });

  // ── Navigation ─────────────────────────────────────────────
  const [step, setStep] = useState(0);

  // ── Project config ─────────────────────────────────────────
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
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
  const [backendFamily, setBackendFamily] = useState<BackendFamily | null>(
    null
  );
  const [backendOpsHeavy, setBackendOpsHeavy] = useState(false);
  const [headlessRequired, setHeadlessRequired] = useState(false);
  const [trafficLevel, setTrafficLevel] = useState<TrafficLevel>(
    DEFAULT_CONSTRAINTS.trafficLevel
  );
  const [productCount, setProductCount] = useState<ProductBucket>(
    DEFAULT_CONSTRAINTS.productCount
  );
  const [dataSensitivity, setDataSensitivity] = useState<DataSensitivity>(
    DEFAULT_CONSTRAINTS.dataSensitivity
  );
  const [scalabilityLevel, setScalabilityLevel] = useState<ScalabilityLevel>(
    DEFAULT_CONSTRAINTS.scalabilityLevel
  );
  const [projectFamily, setProjectFamilyRaw] =
    useState<ProjectFamilyInput | null>(null);
  const [projectImplementation, setProjectImplementationRaw] =
    useState<ProjectImplementationInput | null>(null);
  const [projectImplementationLabel, setProjectImplementationLabel] =
    useState("");
  const [projectFrontendImplementation, setProjectFrontendImplementationRaw] =
    useState<ProjectFrontendImplementationInput | null>(null);
  const [
    projectFrontendImplementationLabel,
    setProjectFrontendImplementationLabel
  ] = useState("");
  const [familyManual, setFamilyManual] = useState(false);
  const [implementationManual, setImplementationManual] = useState(false);
  const [billingMode, setBillingMode] = useState<BillingMode>("SOLO");

  const budgetBandEffective = useMemo<BudgetBand>(() => {
    const fromManual = deriveBudgetBandFromManualValue(manualBudgetMax);
    if (fromManual) return fromManual;
    return budgetBand;
  }, [manualBudgetMax, budgetBand]);

  // ── Modules (shared hook) ──────────────────────────────────
  const {
    selectedModules,
    catSelections,
    setCatSelections,
    toggleModule,
    syncModules,
    clearModules
  } = useModules();

  // ── Form fields ────────────────────────────────────────────
  const [formFields, setFormFields] = useState<FormFields>({
    name: "",
    clientId: defaultClientId,
    description: "",
    domain: "",
    port: "",
    gitRepo: "",
    hostingProviderId: defaultHostingProviderForDeployTarget("DOCKER")
  });

  // ── Derived values ─────────────────────────────────────────
  const typeStackState = useMemo<WizardTypeStackState>(
    () => ({
      projectType,
      hostingTarget,
      hostingTargetBack,
      hostingTargetFront,
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
      projectImplementation,
      projectImplementationLabel,
      projectFrontendImplementation,
      projectFrontendImplementationLabel,
      techStack,
      wpHeadless
    }),
    [
      projectType,
      hostingTarget,
      hostingTargetBack,
      hostingTargetFront,
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
      projectImplementation,
      projectImplementationLabel,
      projectFrontendImplementation,
      projectFrontendImplementationLabel,
      techStack,
      wpHeadless
    ]
  );

  const hostingSelectionMode = useMemo(
    () => deriveHostingSelectionMode(typeStackState),
    [typeStackState]
  );
  const isHeadless = useMemo(
    () => isHeadlessArchitecture(typeStackState),
    [typeStackState]
  );

  const allowedDeploys = useMemo(
    () =>
      techStack
        ? getAllowedDeployTargets(techStack, wpHeadless)
        : (["DOCKER"] as DeployTarget[]),
    [techStack, wpHeadless]
  );
  const allowedHostingTargets = useMemo(
    () => filterHostingTargetsForProjectType(projectType ?? "VITRINE"),
    [projectType]
  );

  useEffect(() => {
    if (!allowedHostingTargets.includes(hostingTarget)) {
      setHostingTarget(allowedHostingTargets[0] ?? "TO_CONFIRM");
    }
  }, [allowedHostingTargets, hostingTarget]);

  useEffect(() => {
    const isLowBudget =
      budgetBandEffective === "UNDER_1200" || budgetBandEffective === "UP_TO_1800";
    const isSite = projectType === "VITRINE" || projectType === "BLOG";
    if (!isLowBudget || !isSite) return;
    if (hostingSelectionMode !== "SINGLE") return;
    if (hostingTarget !== "SHARED_PHP") {
      setHostingTarget("SHARED_PHP");
    }
  }, [budgetBandEffective, projectType, hostingSelectionMode, hostingTarget]);

  const allowedFamiliesRaw =
    hostingSelectionMode === "SINGLE"
      ? (HOSTING_ALLOWED_FAMILIES[hostingTarget] ??
        HOSTING_ALLOWED_FAMILIES.TO_CONFIRM)
      : PROJECT_FAMILY_OPTIONS.map(opt => opt.value);
  const allowedFamilies = filterFamiliesByProjectType(
    allowedFamiliesRaw,
    projectType ?? "VITRINE"
  );
  const allowedHostingProviders = getHostingProvidersForDeployTarget(
    deployTarget
  ).map(provider => provider.id);
  const defaultHostingProvider =
    defaultHostingProviderForDeployTarget(deployTarget);

  const derivedDeployTarget = useMemo(() => {
    const baseTarget =
      hostingSelectionMode === "SINGLE"
        ? hostingTarget
        : hostingSelectionMode === "NONE"
          ? "TO_CONFIRM"
          : (hostingTargetFront ?? hostingTarget);
    const desiredTarget = resolveDeployTargetFromHosting(
      baseTarget ?? "TO_CONFIRM"
    );
    return allowedDeploys.includes(desiredTarget)
      ? desiredTarget
      : (allowedDeploys[0] ?? desiredTarget);
  }, [hostingSelectionMode, hostingTarget, hostingTargetFront, allowedDeploys]);

  useEffect(() => {
    if (!projectType) return;
    let suggestedFamily = resolveFamilyFromInputs({
      projectType,
      needsEditing,
      editingFrequency,
      commerceModel,
      headlessRequired
    });
    if (!allowedFamilies.includes(suggestedFamily)) {
      suggestedFamily = allowedFamilies[0] ?? suggestedFamily;
    }
    if (
      !familyManual ||
      (projectFamily && !allowedFamilies.includes(projectFamily))
    ) {
      setProjectFamilyRaw(suggestedFamily);
      setFamilyManual(false);
    }
  }, [
    projectType,
    needsEditing,
    editingFrequency,
    commerceModel,
    headlessRequired,
    hostingTarget,
    allowedFamilies,
    familyManual,
    projectFamily
  ]);

  useEffect(() => {
    if (!projectFamily) return;
    const allowedOptions = getImplementationOptions(projectFamily, "all");
    const isStillAllowed = projectImplementation
      ? allowedOptions.some((opt) =>
          opt.value === projectImplementation &&
          (projectImplementation !== "OTHER" || opt.label === projectImplementationLabel)
        )
      : false;
    if (!implementationManual || !isStillAllowed) {
      const nextImplementation = resolveImplementationFromFamily(
        projectFamily,
        "supported"
      );
      setProjectImplementationRaw(nextImplementation);
      setImplementationManual(false);
    }
  }, [
    projectFamily,
    projectImplementation,
    projectImplementationLabel,
    implementationManual,
  ]);

  useEffect(() => {
    const needsFrontend = isHeadless;

    if (hostingSelectionMode === "SINGLE" || hostingSelectionMode === "NONE") {
      setHostingTargetBack(null);
      setHostingTargetFront(null);
    } else if (hostingSelectionMode === "FRONT_ONLY") {
      setHostingTargetBack(null);
      if (!hostingTargetFront) {
        setHostingTargetFront(resolveDefaultFrontHosting(typeStackState));
      }
    } else {
      if (!hostingTargetBack) {
        setHostingTargetBack(resolveDefaultBackHosting(typeStackState));
      }
      if (!hostingTargetFront) {
        setHostingTargetFront(resolveDefaultFrontHosting(typeStackState));
      }
    }

    if (!needsFrontend) {
      setProjectFrontendImplementationRaw(null);
      setProjectFrontendImplementationLabel("");
      return;
    }

    if (!projectFrontendImplementation) {
      setProjectFrontendImplementationRaw(resolveDefaultFrontend());
    }
  }, [
    hostingSelectionMode,
    hostingTargetBack,
    hostingTargetFront,
    isHeadless,
    projectFrontendImplementation,
    typeStackState
  ]);

  useEffect(() => {
    const liveEligible = projectImplementation
      ? isImplementationLiveEligible(projectImplementation)
      : false;
    if (!liveEligible) {
      if (techStack !== null) setTechStackRaw(null);
      if (wpHeadless) setWpHeadless(false);
      return;
    }
    const { techStack: resolved, wpHeadless: headless } =
      resolveTechStackFromImplementation(
        projectImplementation,
        projectFrontendImplementation
      );
    const fallbackByFamily: Record<ProjectFamilyInput, TechStack> = {
      STATIC_SSG: "ASTRO",
      CMS_MONO: "WORDPRESS",
      CMS_HEADLESS: "WORDPRESS",
      COMMERCE_SAAS: "WORDPRESS",
      COMMERCE_SELF_HOSTED: "WORDPRESS",
      COMMERCE_HEADLESS: "NEXTJS",
      APP_PLATFORM: "NEXTJS"
    };
    const nextTechStack =
      resolved ?? (projectFamily ? fallbackByFamily[projectFamily] : null);
    if (nextTechStack !== techStack) setTechStackRaw(nextTechStack);
    if (headless !== wpHeadless) setWpHeadless(headless);
  }, [
    projectImplementation,
    projectFrontendImplementation,
    projectFamily,
    techStack,
    wpHeadless
  ]);

  useEffect(() => {
    if (derivedDeployTarget && derivedDeployTarget !== deployTarget) {
      setDeployTargetRaw(derivedDeployTarget);
    }
  }, [derivedDeployTarget, deployTarget]);

  useEffect(() => {
    if (!allowedHostingProviders.includes(formFields.hostingProviderId)) {
      setFormFields(prev => ({
        ...prev,
        hostingProviderId: defaultHostingProvider
      }));
    }
  }, [
    allowedHostingProviders,
    defaultHostingProvider,
    formFields.hostingProviderId
  ]);

  const baseOfferInput = useMemo(
    () => ({
      projectType,
      projectFamily,
      needsEditing,
      editingFrequency,
      trafficLevel,
      productCount,
      dataSensitivity,
      scalabilityLevel
    }),
    [
      projectType,
      projectFamily,
      needsEditing,
      editingFrequency,
      trafficLevel,
      productCount,
      dataSensitivity,
      scalabilityLevel
    ]
  );

  const candidateOfferInput = useMemo(
    () => ({
      ...baseOfferInput,
      selectedModulesCount: selectedModules.size
    }),
    [baseOfferInput, selectedModules.size]
  );
  const candidateQualificationProjectType = useMemo(
    () => deriveQualificationProjectType(candidateOfferInput),
    [candidateOfferInput]
  );
  const candidateOfferProjectType = useMemo(
    () => deriveOfferProjectType(candidateOfferInput),
    [candidateOfferInput]
  );
  const candidateOfferStack = useMemo(() => {
    return candidateQualificationProjectType && techStack
      ? (getOfferStackForProject(
          candidateQualificationProjectType,
          techStack,
          wpHeadless
        ) as OfferStack)
      : null;
  }, [candidateQualificationProjectType, techStack, wpHeadless]);

  const candidateMandatoryModuleIds = useMemo(() => {
    if (!candidateOfferProjectType || !candidateOfferStack) return [];
    return getMandatoryModules(candidateOfferProjectType, candidateOfferStack);
  }, [candidateOfferProjectType, candidateOfferStack]);

  const candidateIncludedModuleIds = useMemo(() => {
    if (!candidateOfferProjectType || !candidateOfferStack) return [];
    return getIncludedModules(candidateOfferProjectType, candidateOfferStack);
  }, [candidateOfferProjectType, candidateOfferStack]);

  const candidateLockedModuleSet = useMemo(
    () =>
      new Set([...candidateMandatoryModuleIds, ...candidateIncludedModuleIds]),
    [candidateMandatoryModuleIds, candidateIncludedModuleIds]
  );

  const selectedOptionalCount = useMemo(() => {
    if (selectedModules.size === 0) return 0;
    let count = 0;
    for (const id of selectedModules) {
      if (!candidateLockedModuleSet.has(id)) {
        count += 1;
      }
    }
    return count;
  }, [selectedModules, candidateLockedModuleSet]);

  const offerInput = useMemo(
    () => ({
      ...baseOfferInput,
      selectedModulesCount: selectedOptionalCount
    }),
    [baseOfferInput, selectedOptionalCount]
  );
  const qualificationProjectType = useMemo(
    () => deriveQualificationProjectType(offerInput),
    [offerInput]
  );
  const offerProjectType = useMemo(
    () => deriveOfferProjectType(offerInput),
    [offerInput]
  );
  const offerStack = useMemo(() => {
    return qualificationProjectType && techStack
      ? (getOfferStackForProject(
          qualificationProjectType,
          techStack,
          wpHeadless
        ) as OfferStack)
      : null;
  }, [qualificationProjectType, techStack, wpHeadless]);

  const backendMultiplier = useMemo(
    () => getBackendMultiplier(backendFamily, backendOpsHeavy),
    [backendFamily, backendOpsHeavy]
  );

  const compatibleModuleIds = useMemo(() => {
    if (!offerStack || !offerProjectType) return [];
    return MODULE_CATALOG.filter(mod =>
      isModuleCompatible(mod.id as ModuleId, offerStack, offerProjectType)
    ).map(mod => mod.id);
  }, [offerStack, offerProjectType]);

  const mandatoryModuleIds = useMemo(() => {
    if (!offerProjectType || !offerStack) return [];
    return getMandatoryModules(offerProjectType, offerStack);
  }, [offerProjectType, offerStack]);

  const includedModuleIds = useMemo(() => {
    if (!offerProjectType || !offerStack) return [];
    return getIncludedModules(offerProjectType, offerStack);
  }, [offerProjectType, offerStack]);

  const lockedModuleSet = useMemo(
    () => new Set([...mandatoryModuleIds, ...includedModuleIds]),
    [mandatoryModuleIds, includedModuleIds]
  );

  useEffect(() => {
    if (!offerProjectType) return;
    if (!offerStack) return;
    const selectedIds = pendingOfferModulesRef.current ?? undefined;
    const payload: {
      allowedIds?: ModuleId[];
      mandatoryIds?: ModuleId[];
      selectedIds?: ModuleId[];
    } = {
      allowedIds: compatibleModuleIds,
      mandatoryIds: [...mandatoryModuleIds, ...includedModuleIds]
    };
    if (selectedIds) {
      payload.selectedIds = selectedIds;
    }
    syncModules(payload);
    if (pendingOfferModulesRef.current) {
      pendingOfferModulesRef.current = null;
    }
  }, [
    offerProjectType,
    offerStack,
    compatibleModuleIds,
    mandatoryModuleIds,
    includedModuleIds,
    syncModules,
    clearModules
  ]);

  const toggleModuleSafe = useCallback(
    (id: ModuleId) => {
      if (lockedModuleSet.has(id)) return;
      toggleModule(id);
    },
    [lockedModuleSet, toggleModule]
  );

  const qualificationConstraints = useMemo<ProjectConstraints>(() => {
    const headlessContext = isHeadless;

    return {
      ...DEFAULT_CONSTRAINTS,
      trafficLevel,
      productCount: projectType === "ECOM" ? productCount : "NONE",
      dataSensitivity,
      scalabilityLevel,
      needsEditing,
      editingFrequency,
      headlessRequired: headlessContext,
      commerceModel: projectType === "ECOM" ? commerceModel : null,
      backendFamily: projectType === "APP" ? backendFamily : null,
      backendOpsHeavy: projectType === "APP" ? backendOpsHeavy : false
    };
  }, [
    projectType,
    trafficLevel,
    productCount,
    dataSensitivity,
    scalabilityLevel,
    needsEditing,
    editingFrequency,
    headlessRequired,
    commerceModel,
    backendFamily,
    backendOpsHeavy,
    isHeadless
  ]);

  // ── Qualification (shared hook) ────────────────────────────
  const qualification = useQualification({
    projectType: qualificationProjectType,
    techStack,
    selectedModules,
    billingMode,
    deployTarget,
    wpHeadless,
    catSelections,
    constraints: qualificationConstraints
  });

  // ── Actions ────────────────────────────────────────────────

  /** Change le type de projet — reset modules + auto-corrige le stack */
  const changeProjectType = useCallback(
    (type: ProjectType) => {
      setProjectType(type);
      clearModules();
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
    [clearModules]
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
    []
  );

  const setProjectFrontendImplementation = useCallback(
    (value: ProjectFrontendImplementationInput) => {
      setProjectFrontendImplementationRaw(value);
    },
    []
  );

  useEffect(() => {
    if (offerInitDoneRef.current) return;

    const offerProjectType =
      offerProjectTypeParam &&
      Object.prototype.hasOwnProperty.call(
        OFFER_PROJECT_MAP,
        offerProjectTypeParam
      )
        ? (offerProjectTypeParam as OfferCategory)
        : null;
    const offerStack =
      offerStackParam && OFFER_STACKS.includes(offerStackParam as OfferStack)
        ? (offerStackParam as OfferStack)
        : null;

    if (!offerProjectType || !offerStack) {
      offerInitDoneRef.current = true;
      return;
    }

    const mappedProjectType = OFFER_PROJECT_MAP[offerProjectType];
    changeProjectType(mappedProjectType);
    const OFFER_STACK_MAP: Record<
      OfferStack,
      { family: ProjectFamilyInput; implementation: ProjectImplementationInput }
    > = {
      WORDPRESS: { family: "CMS_MONO", implementation: "WORDPRESS" },
      WORDPRESS_HEADLESS: {
        family: "CMS_HEADLESS",
        implementation: "WORDPRESS_HEADLESS"
      },
      WOOCOMMERCE: {
        family: "COMMERCE_SELF_HOSTED",
        implementation: "WOOCOMMERCE"
      },
      WOOCOMMERCE_HEADLESS: {
        family: "COMMERCE_HEADLESS",
        implementation: "WOOCOMMERCE_HEADLESS"
      },
      NEXTJS: { family: "APP_PLATFORM", implementation: "NEXTJS" },
      NUXT: { family: "APP_PLATFORM", implementation: "NUXT" },
      ASTRO: { family: "STATIC_SSG", implementation: "ASTRO" }
    };
    const mapped = OFFER_STACK_MAP[offerStack];
    if (mapped) {
      setProjectFamilyRaw(mapped.family);
      setProjectImplementationRaw(mapped.implementation);
      setFamilyManual(false);
      setImplementationManual(false);
      if (
        mapped.family === "CMS_HEADLESS" ||
        mapped.family === "COMMERCE_HEADLESS"
      ) {
        setProjectFrontendImplementationRaw(resolveDefaultFrontend());
      }
    }

    const OFFER_HOSTING_TARGET: Record<string, HostingTargetInput> = {
      shared: "SHARED_PHP",
      vercel: "CLOUD_SSR",
      docker_vps: "VPS_DOCKER",
      headless_unified: "VPS_DOCKER"
    };
    const mappedHosting = offerDeploymentParam
      ? OFFER_HOSTING_TARGET[offerDeploymentParam]
      : null;
    if (mappedHosting) {
      setHostingTarget(mappedHosting);
    }
    if (offerDeploymentParam === "headless_split") {
      setHostingTarget("TO_CONFIRM");
      setHostingTargetBack("SHARED_PHP");
      setHostingTargetFront("CLOUD_SSR");
    }

    if (offerModules.length > 0) {
      pendingOfferModulesRef.current = offerModules;
    }

    offerInitDoneRef.current = true;
  }, [
    offerProjectTypeParam,
    offerStackParam,
    offerDeploymentParam,
    offerModules,
    changeProjectType,
    setProjectFamily,
    setProjectImplementation,
    setProjectFrontendImplementation
  ]);

  // ── Navigation helpers ─────────────────────────────────────!

  const nextReasons = useMemo(() => {
    const reasons: string[] = [];
    // Step 0 = Questionnaire
    if (step === 0) {
      if (!projectType)
        reasons.push("Sélectionnez un type de projet pour continuer.");
      if (projectType && budgetBandEffective === "TO_CONFIRM") {
        reasons.push("Précisez le budget maximum du client.");
      }
      if (projectType && budgetBandEffective !== "TO_CONFIRM" && clientKnowledge === "TO_CONFIRM") {
        reasons.push("Précisez le niveau de connaissance numérique du client.");
      }
      if (
        projectType &&
        budgetBandEffective !== "TO_CONFIRM" &&
        clientKnowledge !== "TO_CONFIRM" &&
        primaryGoal === "TO_CONFIRM"
      ) {
        reasons.push("Précisez l’objectif principal du projet.");
      }
      if (
        projectType &&
        budgetBandEffective !== "TO_CONFIRM" &&
        clientKnowledge !== "TO_CONFIRM" &&
        primaryGoal !== "TO_CONFIRM" &&
        ambitionLevel === "TO_CONFIRM"
      ) {
        reasons.push("Précisez l’ambition du client à 12 mois.");
      }
      if (
        projectType &&
        budgetBandEffective !== "TO_CONFIRM" &&
        clientKnowledge !== "TO_CONFIRM" &&
        primaryGoal !== "TO_CONFIRM" &&
        ambitionLevel !== "TO_CONFIRM" &&
        targetTimeline === "TO_CONFIRM"
      ) {
        reasons.push("Précisez le délai cible.");
      }
      if (
        needsEditing &&
        editingMode === "GIT_MDX" &&
        editorialPushOwner === "TO_CONFIRM"
      ) {
        reasons.push(
          "Précisez qui publie en mode Git/MDX (équipe client ou agence)."
        );
      }
      if (
        needsEditing &&
        editingMode === "GIT_MDX" &&
        editorialPushOwner === "CLIENT" &&
        clientAccessPolicy === "TO_CONFIRM"
      ) {
        reasons.push(
          "Précisez la limite d’accès client en mode push client."
        );
      }
      if (projectType === "APP" && budgetBandEffective === "UNDER_1200") {
        reasons.push(
          "Avec un budget < 1 200 €, une App n’est pas réaliste : requalifiez vers Vitrine/Blog avec CMS monolithique."
        );
      }
      if (projectType === "ECOM" && budgetBandEffective === "UNDER_1200") {
        reasons.push(
          "Avec un budget < 1 200 €, un e-commerce n’est pas réaliste : requalifiez vers vitrine/catalogue sans paiement ou augmentez le budget."
        );
      }
    }

    if (step === 1) {
      if (projectType === "APP" && budgetBandEffective === "UNDER_1200") {
        reasons.push(
          "Budget < 1 200 € incompatible avec une App : revenez sur le type projet (Vitrine/Blog + CMS monolithique)."
        );
      }
      if (projectType === "ECOM" && budgetBandEffective === "UNDER_1200") {
        reasons.push(
          "Budget < 1 200 € incompatible avec un e-commerce : revenez sur le type projet (vitrine/catalogue sans paiement) ou augmentez le budget."
        );
      }
      if (isHeadless && !projectFrontendImplementation) {
        reasons.push(
          "Sélectionnez une implémentation frontend (architecture headless)."
        );
      }
      if (hostingSelectionMode === "SPLIT" && !hostingTargetBack) {
        reasons.push(
          "Sélectionnez un hébergement back (architecture découplée)."
        );
      }
      if (
        (hostingSelectionMode === "SPLIT" ||
          hostingSelectionMode === "FRONT_ONLY") &&
        !hostingTargetFront
      ) {
        reasons.push("Sélectionnez un hébergement front.");
      }
    }
    if (step === 3) {
      if (formFields.name.trim().length < 2) {
        reasons.push("Le nom du projet doit faire au moins 2 caractères.");
      }
      if (!formFields.clientId.trim()) {
        reasons.push("Sélectionnez un client.");
      }
    }
    return reasons;
  }, [
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
    formFields.name,
    formFields.clientId
  ]);

  const canGoNext = nextReasons.length === 0;

  const next = useCallback(() => {
    if (!canGoNext) return;
    setStep(s => Math.min(s + 1, 4));
  }, [canGoNext]);

  const prev = useCallback(() => {
    setStep(s => Math.max(s - 1, 0));
  }, []);

  // ── Render ─────────────────────────────────────────────────

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
        formFields,
        setFormFields,
        qualification,
        qualificationProjectType,
        offerProjectType,
        backendMultiplier,
        allowedDeploys,
        isHeadless,
        hostingSelectionMode,
        formAction,
        isPending,
        actionError: state.error
      }}>
      {children}
    </WizardContext.Provider>
  );
}
