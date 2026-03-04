import type { ReactNode } from "react";
import type {
  HostingTargetInput,
  ProjectFamilyInput,
  ProjectFrontendImplementationInput,
  ProjectImplementationInput,
} from "@/lib/validators";
import type { ProjectType, LegacyTechStack as TechStack } from "@/lib/referential";
import type {
  CommerceModel,
  EditingFrequency,
} from "@/lib/project-choices";
import type {
  DataSensitivity,
  ProductBucket,
  ScalabilityLevel,
  TrafficLevel,
  BackendFamily,
} from "@/lib/referential";

export type StepId = 0 | 1 | 2 | 3;
export type BackendMode = "FULLSTACK" | "SEPARATE";
export type HostingSelectionMode = "SINGLE" | "SPLIT" | "FRONT_ONLY" | "NONE";

export interface WizardTypeStackState {
  projectType: ProjectType | null;
  hostingTarget: HostingTargetInput;
  hostingTargetBack: HostingTargetInput | null;
  hostingTargetFront: HostingTargetInput | null;
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
  projectImplementation: ProjectImplementationInput | null;
  projectImplementationLabel: string;
  projectFrontendImplementation: ProjectFrontendImplementationInput | null;
  projectFrontendImplementationLabel: string;
  techStack: TechStack | null;
  wpHeadless: boolean;
}

export interface TypeStackOption<T extends string> {
  value: T;
  label: string;
  description?: string | undefined;
  support?: string | undefined;
  icon?: ReactNode | undefined;
}

export interface TypeStackViewModel {
  projectTypeOptions: TypeStackOption<ProjectType>[];
  hostingOptions: TypeStackOption<HostingTargetInput>[];
  hostingBackOptions: TypeStackOption<HostingTargetInput>[];
  hostingFrontOptions: TypeStackOption<HostingTargetInput>[];
  hostingSelectionMode: HostingSelectionMode;
  familyOptions: TypeStackOption<ProjectFamilyInput>[];
  implementationOptions: TypeStackOption<ProjectImplementationInput>[];
  frontOptions: TypeStackOption<ProjectFrontendImplementationInput>[];
  showHeadlessSelectors: boolean;
  commerceModelHint?: string | null;
  activeImplementation: TypeStackOption<ProjectImplementationInput> | null;
  activeFront: TypeStackOption<ProjectFrontendImplementationInput> | null;
  showAllImplementations: boolean;
}

export interface CanProceedResult {
  ok: boolean;
  reasons: string[];
}
