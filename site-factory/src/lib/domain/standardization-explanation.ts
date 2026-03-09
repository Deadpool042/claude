import type { DeliveryModel, MutualizationLevel } from "@/lib/referential";
import type { StandardizationAssessment } from "./standardization-engine";

export type StandardizationStatus =
  | "CUSTOM_ONLY"
  | "STANDARDIZATION_CANDIDATE"
  | "OPERATED_CANDIDATE";

export interface StandardizationExplanation {
  status: StandardizationStatus;
  headline: string;
  recommendedDeliveryShift: DeliveryModel | null;
  recommendedMutualizationShift: MutualizationLevel | null;
  reasons: string[];
  warnings: string[];
}

export function buildStandardizationExplanation(
  assessment: StandardizationAssessment
): StandardizationExplanation {
  const warnings: string[] = [];

  if (assessment.operatedProductEligible) {
    return {
      status: "OPERATED_CANDIDATE",
      headline:
        "Le projet présente une trajectoire crédible vers une offre opérée.",
      recommendedDeliveryShift: assessment.recommendedDeliveryShift,
      recommendedMutualizationShift: assessment.recommendedMutualizationShift,
      reasons: assessment.reasons,
      warnings
    };
  }

  if (assessment.standardizationEligible) {
    if (assessment.shouldRemainCustom) {
      warnings.push(
        "Le projet montre des signaux de standardisation, mais reste encore classé custom."
      );
    }

    return {
      status: "STANDARDIZATION_CANDIDATE",
      headline:
        "Le projet peut être orienté vers une offre managée standardisée.",
      recommendedDeliveryShift: assessment.recommendedDeliveryShift,
      recommendedMutualizationShift: assessment.recommendedMutualizationShift,
      reasons: assessment.reasons,
      warnings
    };
  }

  return {
    status: "CUSTOM_ONLY",
    headline: "Le projet doit rester sur une trajectoire custom à ce stade.",
    recommendedDeliveryShift: assessment.recommendedDeliveryShift,
    recommendedMutualizationShift: assessment.recommendedMutualizationShift,
    reasons: assessment.reasons,
    warnings
  };
}
