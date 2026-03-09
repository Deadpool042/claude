import type {
  CanonicalDecisionOutput,
  DeliveryModel,
  MutualizationLevel
} from "@/lib/referential";
import type { CanonicalProjectInputDraft } from "./canonical-input";

export interface StandardizationAssessment {
  shouldRemainCustom: boolean;
  standardizationEligible: boolean;
  operatedProductEligible: boolean;
  recommendedDeliveryShift: DeliveryModel | null;
  recommendedMutualizationShift: MutualizationLevel | null;
  reasons: string[];
}

export function assessStandardization(args: {
  canonicalInput: CanonicalProjectInputDraft;
  decision: CanonicalDecisionOutput;
}): StandardizationAssessment {
  const { canonicalInput, decision } = args;

  const reasons: string[] = [];

  const standardizationEligible =
    canonicalInput.signals.standardizationCandidate ||
    canonicalInput.signals.mutualizationCandidate;

  const operatedProductEligible =
    canonicalInput.signals.operatedProductCandidate &&
    decision.mutualizationLevel !== "DEDICATED";

  const shouldRemainCustom =
    !standardizationEligible && !operatedProductEligible;

  let recommendedDeliveryShift: DeliveryModel | null = null;
  let recommendedMutualizationShift: MutualizationLevel | null = null;

  if (operatedProductEligible) {
    recommendedDeliveryShift = "OPERATED_PRODUCT";
    recommendedMutualizationShift = "MUTUALIZED_SINGLE_TENANT";
    reasons.push(
      "Canonical signals indicate a repeatable operated trajectory."
    );
  } else if (
    standardizationEligible &&
    decision.deliveryModel !== "MANAGED_STANDARDIZED"
  ) {
    recommendedDeliveryShift = "MANAGED_STANDARDIZED";
    recommendedMutualizationShift =
      decision.mutualizationLevel === "DEDICATED"
        ? "SHARED_SOCLE"
        : decision.mutualizationLevel;
    reasons.push(
      "Canonical signals indicate the project may fit a managed standardized offer."
    );
  } else if (shouldRemainCustom) {
    reasons.push(
      "Current signals do not justify a standardized or operated trajectory."
    );
  }

  if (canonicalInput.signals.standardizationCandidate) {
    reasons.push("Standardization candidate signal is active.");
  }

  if (canonicalInput.signals.mutualizationCandidate) {
    reasons.push("Mutualization candidate signal is active.");
  }

  if (canonicalInput.signals.operatedProductCandidate) {
    reasons.push("Operated product candidate signal is active.");
  }

  return {
    shouldRemainCustom,
    standardizationEligible,
    operatedProductEligible,
    recommendedDeliveryShift,
    recommendedMutualizationShift,
    reasons
  };
}
