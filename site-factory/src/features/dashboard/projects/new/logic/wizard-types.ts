import type { Dispatch, SetStateAction } from "react";
import type {
  ProjectType,
  LegacyTechStack as TechStack,
  DeployTarget,
  TrafficLevel,
  ProductBucket,
  DataSensitivity,
  ScalabilityLevel,
  BackendFamily,
} from "@/lib/referential";
import type {
  CommerceModel,
  EditingFrequency,
} from "@/lib/project-choices";
import type {
  CanonicalTaxonomyResolution,
  BackendMode,
  HostingSelectionMode,
} from "@/lib/wizard-domain";
import type {
  HostingTargetInput,
  ProjectFamilyInput,
  ProjectFrontendImplementationInput,
  ProjectImplementationInput,
} from "@/lib/validators";
import type {
  ModuleId,
  OfferCategory,
} from "@/lib/offers";
import type {
  TaxonomyDisambiguationSignal,
} from "@/lib/taxonomy";
import type { HostingProviderId } from "@/lib/hosting";
import type {
  ModuleCatSelection,
  QualificationResult,
  BillingMode,
} from "@/lib/qualification-runtime";
import type {
  WizardItemStatus,
  WizardModuleKey,
  WizardModuleStates,
  WizardModuleConfig,
  WizardFeatureKey,
  WizardFeatureStates,
  WizardFeatureConfig,
  WizardProviderKey,
  WizardProviderStates,
  WizardProviderConfig,
  WizardProviderKind,
} from "./wizard-capabilities";

export type { ModuleCatSelection, BillingMode };

export interface FormFields {
  name: string;
  clientId: string;
  description: string;
  domain: string;
  port: string;
  gitRepo: string;
  hostingProviderId: HostingProviderId;
}

export type EditingMode = "BACKOFFICE" | "GIT_MDX" | "TO_CONFIRM";
export type EditorialPushOwner = "CLIENT" | "AGENCY" | "TO_CONFIRM";
export type ClientAccessPolicy =
  | "CONTENT_REPO_ONLY"
  | "CONTENT_REPO_WITH_PR"
  | "TO_CONFIRM";
export type BudgetBand =
  | "UNDER_1200"
  | "UP_TO_1800"
  | "UP_TO_3500"
  | "UP_TO_7000"
  | "OVER_7000"
  | "TO_CONFIRM";
export type ClientKnowledge =
  | "NONE"
  | "BASIC"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "TO_CONFIRM";
export type PrimaryGoal =
  | "PRESENCE"
  | "GENERATE_LEADS"
  | "PUBLISH_CONTENT"
  | "SELL_ONLINE"
  | "DIGITIZE_PROCESS"
  | "TO_CONFIRM";
export type AmbitionLevel =
  | "KEEP_SIMPLE"
  | "GROW_FEATURES"
  | "SCALE_TRAFFIC"
  | "PREPARE_PLATFORM"
  | "TO_CONFIRM";
export type TargetTimeline =
  | "UNDER_1_MONTH"
  | "ONE_TO_TWO_MONTHS"
  | "TWO_TO_FOUR_MONTHS"
  | "FLEXIBLE"
  | "TO_CONFIRM";

export interface WizardContextType {
  step: number;
  setStep: (step: number) => void;
  next: () => void;
  prev: () => void;
  canGoNext: boolean;
  nextReasons: string[];
  projectType: ProjectType | null;
  changeProjectType: (type: ProjectType) => void;
  taxonomySignal: TaxonomyDisambiguationSignal | null;
  setTaxonomySignal: (signal: TaxonomyDisambiguationSignal | null) => void;
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
    value: ProjectFrontendImplementationInput,
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
  selectedModules: Set<ModuleId>;
  toggleModule: (id: ModuleId) => void;
  catSelections: Record<string, ModuleCatSelection>;
  setCatSelections: Dispatch<
    SetStateAction<Record<string, ModuleCatSelection>>
  >;
  mandatoryModuleIds: ModuleId[];
  includedModuleIds: ModuleId[];
  compatibleModuleIds: ModuleId[];
  wizardModules: WizardModuleStates;
  setWizardModules: Dispatch<SetStateAction<WizardModuleStates>>;
  enableWizardModule: (key: WizardModuleKey) => void;
  disableWizardModule: (key: WizardModuleKey) => void;
  configureWizardModule: (key: WizardModuleKey, config: WizardModuleConfig) => void;
  wizardFeatures: WizardFeatureStates;
  setWizardFeatures: Dispatch<SetStateAction<WizardFeatureStates>>;
  setWizardFeatureStatus: (
    key: WizardFeatureKey,
    status: WizardItemStatus,
  ) => void;
  configureWizardFeature: (
    key: WizardFeatureKey,
    config: WizardFeatureConfig,
  ) => void;
  wizardProviders: WizardProviderStates;
  setWizardProviders: Dispatch<SetStateAction<WizardProviderStates>>;
  setWizardProviderStatus: (
    key: WizardProviderKey,
    status: WizardItemStatus,
    kind?: WizardProviderKind,
  ) => void;
  configureWizardProvider: (
    key: WizardProviderKey,
    config: WizardProviderConfig,
    kind?: WizardProviderKind,
  ) => void;
  formFields: FormFields;
  setFormFields: Dispatch<SetStateAction<FormFields>>;
  qualification: QualificationResult | null;
  qualificationProjectType: ProjectType | null;
  offerProjectType: OfferCategory | null;
  canonicalTaxonomyResolution: CanonicalTaxonomyResolution | null;
  backendMultiplier: number;
  allowedDeploys: DeployTarget[];
  isHeadless: boolean;
  hostingSelectionMode: HostingSelectionMode;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  actionError: string | null;
}

export interface WizardQueryPrefill {
  defaultClientId: string;
  prefillName: string;
  prefillDescription: string;
  prefillDomain: string;
  prefillPort: string;
  prefillGitRepo: string;
  offerModulesParam: string;
  offerProjectTypeParam: string | null;
  offerStackParam: string | null;
  offerDeploymentParam: string | null;
  offerTaxonomySignalParam: string | null;
}

export interface WizardInitialFormFields {
  name: string;
  clientId: string;
  description: string;
  domain: string;
  port: string;
  gitRepo: string;
}

export function deriveBudgetBandFromManualValue(
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
