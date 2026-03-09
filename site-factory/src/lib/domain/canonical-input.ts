import type {
  LegacyTechStack,
  ProjectConstraints,
  ProjectType
} from "@/lib/referential";
import type {
  BillingMode,
  QualificationInput
} from "@/lib/qualification-runtime";

export type CanonicalNeedKind =
  | "CONTENT"
  | "BUSINESS_PRESENCE"
  | "COMMERCE"
  | "BUSINESS_TOOL";

export type CanonicalEditingModel =
  | "NO_EDITORIAL_NEED"
  | "LIGHT_EDITORIAL"
  | "STRUCTURED_EDITORIAL";

export type CanonicalOperatingIntent =
  | "CLIENT_OPERATED"
  | "MANAGED_FOR_CLIENT"
  | "UNSPECIFIED";

export type CanonicalStandardizationIntent =
  | "CUSTOM_FIRST"
  | "STANDARDIZATION_POSSIBLE"
  | "UNSPECIFIED";

export interface CanonicalProjectInputDraft {
  identity: {
    legacyProjectType: ProjectType;
  };
  businessIntent: {
    needKind: CanonicalNeedKind;
  };
  contentModel: {
    editingModel: CanonicalEditingModel;
  };
  functionalScope: {
    selectedModuleIds: string[];
  };
  constraints: Partial<ProjectConstraints> | undefined;
  operatingModel: {
    operatingIntent: CanonicalOperatingIntent;
    standardizationIntent: CanonicalStandardizationIntent;
  };
  signals: {
    managedServiceCandidate: boolean;
    standardizationCandidate: boolean;
    mutualizationCandidate: boolean;
    operatedProductCandidate: boolean;
  };
  technicalContext: {
    legacyTechStack: LegacyTechStack;
    wpHeadless: boolean;
    deployTarget: QualificationInput["deployTarget"];
    billingMode: BillingMode;
  };
}

function mapNeedKind(projectType: ProjectType): CanonicalNeedKind {
  switch (projectType) {
    case "BLOG":
      return "CONTENT";
    case "VITRINE":
      return "BUSINESS_PRESENCE";
    case "ECOM":
      return "COMMERCE";
    case "APP":
      return "BUSINESS_TOOL";
    default: {
      const _never: never = projectType;
      return _never;
    }
  }
}

function mapEditingModel(input: QualificationInput): CanonicalEditingModel {
  if (input.projectType === "BLOG") {
    return "STRUCTURED_EDITORIAL";
  }

  if (input.projectType === "VITRINE") {
    return "LIGHT_EDITORIAL";
  }

  return "NO_EDITORIAL_NEED";
}

function mapOperatingIntent(
  input: QualificationInput
): CanonicalOperatingIntent {
  if (
    input.billingMode === "SOUS_TRAITANT" ||
    input.deployTarget === "VERCEL"
  ) {
    return "MANAGED_FOR_CLIENT";
  }

  return "CLIENT_OPERATED";
}

function mapStandardizationIntent(
  input: QualificationInput
): CanonicalStandardizationIntent {
  if (input.techStack === "WORDPRESS" && !input.wpHeadless) {
    return "STANDARDIZATION_POSSIBLE";
  }

  return "CUSTOM_FIRST";
}

function buildSignals(input: QualificationInput) {
  const managedServiceCandidate =
    input.billingMode === "SOUS_TRAITANT" || input.deployTarget === "VERCEL";

  const standardizationCandidate =
    input.techStack === "WORDPRESS" &&
    !input.wpHeadless &&
    input.projectType !== "APP";

  const mutualizationCandidate =
    standardizationCandidate && input.selectedModuleIds.length <= 3;

  const operatedProductCandidate =
    mutualizationCandidate &&
    input.projectType !== "APP" &&
    input.billingMode === "SOUS_TRAITANT";

  return {
    managedServiceCandidate,
    standardizationCandidate,
    mutualizationCandidate,
    operatedProductCandidate
  };
}

export function buildCanonicalProjectInputDraft(
  input: QualificationInput
): CanonicalProjectInputDraft {
  return {
    identity: {
      legacyProjectType: input.projectType
    },
    businessIntent: {
      needKind: mapNeedKind(input.projectType)
    },
    contentModel: {
      editingModel: mapEditingModel(input)
    },
    functionalScope: {
      selectedModuleIds: input.selectedModuleIds
    },
    constraints: input.constraints,
    operatingModel: {
      operatingIntent: mapOperatingIntent(input),
      standardizationIntent: mapStandardizationIntent(input)
    },
    signals: buildSignals(input),
    technicalContext: {
      legacyTechStack: input.techStack,
      wpHeadless: input.wpHeadless,
      deployTarget: input.deployTarget,
      billingMode: input.billingMode
    }
  };
}
