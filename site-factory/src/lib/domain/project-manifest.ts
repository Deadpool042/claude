import type { CanonicalDecisionOutput, Category } from "@/lib/referential";
import type { CanonicalProjectInputDraft } from "./canonical-input";

export interface ProjectManifestDraft {
  identity: {
    legacyProjectType: CanonicalProjectInputDraft["identity"]["legacyProjectType"];
  };
  solution: {
    solutionFamily: CanonicalDecisionOutput["solutionFamily"];
    deliveryModel: CanonicalDecisionOutput["deliveryModel"];
    mutualizationLevel: CanonicalDecisionOutput["mutualizationLevel"];
    implementationStrategy: CanonicalDecisionOutput["implementationStrategy"];
    technicalProfile: CanonicalDecisionOutput["technicalProfile"];
    commercialProfile: CanonicalDecisionOutput["commercialProfile"];
  };
  functionalScope: {
    selectedModuleIds: string[];
  };
  editorial: {
    editingModel: CanonicalProjectInputDraft["contentModel"]["editingModel"];
  };
  operations: {
    operatingIntent: CanonicalProjectInputDraft["operatingModel"]["operatingIntent"];
    standardizationIntent: CanonicalProjectInputDraft["operatingModel"]["standardizationIntent"];
    managedServiceCandidate: boolean;
    standardizationCandidate: boolean;
    mutualizationCandidate: boolean;
    operatedProductCandidate: boolean;
  };
  technicalContext: {
    legacyTechStack: CanonicalProjectInputDraft["technicalContext"]["legacyTechStack"];
    wpHeadless: boolean;
    deployTarget: CanonicalProjectInputDraft["technicalContext"]["deployTarget"];
  };
  runtimeCompatibility: {
    finalCategory: Category;
  };
  constraints: Partial<CanonicalProjectInputDraft["constraints"]> | undefined;
}

export interface BuildProjectManifestDraftInput {
  canonicalInput: CanonicalProjectInputDraft;
  decision: CanonicalDecisionOutput;
  finalCategory: Category;
}

export function buildProjectManifestDraft(
  input: BuildProjectManifestDraftInput
): ProjectManifestDraft {
  const { canonicalInput, decision, finalCategory } = input;

  return {
    identity: {
      legacyProjectType: canonicalInput.identity.legacyProjectType
    },
    solution: {
      solutionFamily: decision.solutionFamily,
      deliveryModel: decision.deliveryModel,
      mutualizationLevel: decision.mutualizationLevel,
      implementationStrategy: decision.implementationStrategy,
      technicalProfile: decision.technicalProfile,
      commercialProfile: decision.commercialProfile
    },
    functionalScope: {
      selectedModuleIds: canonicalInput.functionalScope.selectedModuleIds
    },
    editorial: {
      editingModel: canonicalInput.contentModel.editingModel
    },
    operations: {
      operatingIntent: canonicalInput.operatingModel.operatingIntent,
      standardizationIntent:
        canonicalInput.operatingModel.standardizationIntent,
      managedServiceCandidate: canonicalInput.signals.managedServiceCandidate,
      standardizationCandidate: canonicalInput.signals.standardizationCandidate,
      mutualizationCandidate: canonicalInput.signals.mutualizationCandidate,
      operatedProductCandidate: canonicalInput.signals.operatedProductCandidate
    },
    technicalContext: {
      legacyTechStack: canonicalInput.technicalContext.legacyTechStack,
      wpHeadless: canonicalInput.technicalContext.wpHeadless,
      deployTarget: canonicalInput.technicalContext.deployTarget
    },
    runtimeCompatibility: {
      finalCategory
    },
    constraints: canonicalInput.constraints
  };
}
