import type {
  CanonicalDecisionOutput,
  DeliveryModel,
  MutualizationLevel
} from "@/lib/referential";
import type { ProjectManifestDraft } from "./project-manifest";
import type { StandardizationAssessment } from "./standardization-engine";
import type {
  StandardizationExplanation,
  StandardizationStatus
} from "./standardization-explanation";
import type { QualificationResult } from "@/lib/qualification-runtime";

export interface QualificationSummary {
  decision: CanonicalDecisionOutput;
  manifest: ProjectManifestDraft;
  standardization: StandardizationAssessment;
  standardizationExplanation: StandardizationExplanation;
  projectIdentity: {
    technicalProfile: string;
    deliveryModel: DeliveryModel;
    mutualizationLevel: MutualizationLevel;
    implementationStrategy: string;
    deployTarget: string;
  };
  standardizationSnapshot: {
    status: StandardizationStatus;
    headline: string;
    shouldRemainCustom: boolean;
    standardizationEligible: boolean;
    operatedProductEligible: boolean;
    recommendedDeliveryShift: DeliveryModel | null;
    recommendedMutualizationShift: MutualizationLevel | null;
  };
  consistency: {
    deliveryModelAligned: boolean;
    mutualizationLevelAligned: boolean;
    technicalProfileAligned: boolean;
  };
}

export function buildQualificationSummary(
  result: QualificationResult
): QualificationSummary {
  const deliveryModelAligned =
    result.decision.deliveryModel === result.manifest.solution.deliveryModel;

  const mutualizationLevelAligned =
    result.decision.mutualizationLevel ===
    result.manifest.solution.mutualizationLevel;

  const technicalProfileAligned =
    result.decision.technicalProfile ===
    result.manifest.solution.technicalProfile;

  return {
    decision: result.decision,
    manifest: result.manifest,
    standardization: result.standardization,
    standardizationExplanation: result.standardizationExplanation,
    projectIdentity: {
      technicalProfile: result.decision.technicalProfile,
      deliveryModel: result.decision.deliveryModel,
      mutualizationLevel: result.decision.mutualizationLevel,
      implementationStrategy: result.decision.implementationStrategy,
      deployTarget: result.manifest.technicalContext.deployTarget
    },
    standardizationSnapshot: {
      status: result.standardizationExplanation.status,
      headline: result.standardizationExplanation.headline,
      shouldRemainCustom: result.standardization.shouldRemainCustom,
      standardizationEligible: result.standardization.standardizationEligible,
      operatedProductEligible: result.standardization.operatedProductEligible,
      recommendedDeliveryShift:
        result.standardizationExplanation.recommendedDeliveryShift,
      recommendedMutualizationShift:
        result.standardizationExplanation.recommendedMutualizationShift
    },
    consistency: {
      deliveryModelAligned,
      mutualizationLevelAligned,
      technicalProfileAligned
    }
  };
}
