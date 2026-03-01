import { DEFAULT_CONSTRAINTS } from "@/lib/referential";
import type { WizardTypeStackState } from "./types";

export const DEFAULT_WIZARD_TYPE_STACK_STATE: WizardTypeStackState = {
  projectType: null,
  hostingTarget: "TO_CONFIRM",
  hostingTargetBack: null,
  hostingTargetFront: null,
  needsEditing: DEFAULT_CONSTRAINTS.needsEditing,
  editingFrequency: DEFAULT_CONSTRAINTS.editingFrequency,
  commerceModel: "SELF_HOSTED",
  backendMode: "FULLSTACK",
  backendFamily: DEFAULT_CONSTRAINTS.backendFamily ?? null,
  backendOpsHeavy: DEFAULT_CONSTRAINTS.backendOpsHeavy ?? false,
  headlessRequired: false,
  trafficLevel: DEFAULT_CONSTRAINTS.trafficLevel,
  productCount: DEFAULT_CONSTRAINTS.productCount,
  dataSensitivity: DEFAULT_CONSTRAINTS.dataSensitivity,
  scalabilityLevel: DEFAULT_CONSTRAINTS.scalabilityLevel,
  projectFamily: null,
  projectImplementation: null,
  projectImplementationLabel: "",
  projectFrontendImplementation: null,
  projectFrontendImplementationLabel: "",
  techStack: "WORDPRESS",
  wpHeadless: false,
};
