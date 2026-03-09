import type { DeliveryModel, MutualizationLevel } from "@/lib/referential";
import type { QualificationSummary } from "./qualification-summary";

export interface QualificationReport {
  headline: string;
  projectIdentity: {
    technicalProfile: string;
    deliveryModel: DeliveryModel;
    mutualizationLevel: MutualizationLevel;
    implementationStrategy: string;
    deployTarget: string;
  };
  decisionSnapshot: {
    solutionFamily: string;
    technicalProfile: string;
    deliveryModel: DeliveryModel;
    mutualizationLevel: MutualizationLevel;
    implementationStrategy: string;
    commercialProfile: string;
  };
  standardizationSnapshot: {
    status: string;
    headline: string;
    recommendedDeliveryShift: DeliveryModel | null;
    recommendedMutualizationShift: MutualizationLevel | null;
    reasons: string[];
    warnings: string[];
  };
  operationalNotes: string[];
  consistencyFlags: {
    deliveryModelAligned: boolean;
    mutualizationLevelAligned: boolean;
    technicalProfileAligned: boolean;
  };
}

export function buildQualificationReport(
  summary: QualificationSummary
): QualificationReport {
  const operationalNotes: string[] = [];

  operationalNotes.push(
    `Delivery model actuel: ${summary.projectIdentity.deliveryModel}.`
  );
  operationalNotes.push(
    `Mutualisation actuelle: ${summary.projectIdentity.mutualizationLevel}.`
  );
  operationalNotes.push(
    `Déploiement cible: ${summary.projectIdentity.deployTarget}.`
  );

  if (summary.standardizationSnapshot.recommendedDeliveryShift) {
    operationalNotes.push(
      `Shift recommandé: ${summary.standardizationSnapshot.recommendedDeliveryShift}.`
    );
  }

  if (summary.standardizationSnapshot.recommendedMutualizationShift) {
    operationalNotes.push(
      `Mutualisation recommandée: ${summary.standardizationSnapshot.recommendedMutualizationShift}.`
    );
  }

  return {
    headline: summary.standardizationSnapshot.headline,
    projectIdentity: summary.projectIdentity,
    decisionSnapshot: {
      solutionFamily: summary.decision.solutionFamily,
      technicalProfile: summary.decision.technicalProfile,
      deliveryModel: summary.decision.deliveryModel,
      mutualizationLevel: summary.decision.mutualizationLevel,
      implementationStrategy: summary.decision.implementationStrategy,
      commercialProfile: summary.decision.commercialProfile
    },
    standardizationSnapshot: {
      status: summary.standardizationSnapshot.status,
      headline: summary.standardizationSnapshot.headline,
      recommendedDeliveryShift:
        summary.standardizationSnapshot.recommendedDeliveryShift,
      recommendedMutualizationShift:
        summary.standardizationSnapshot.recommendedMutualizationShift,
      reasons: summary.standardizationExplanation.reasons,
      warnings: summary.standardizationExplanation.warnings
    },
    operationalNotes,
    consistencyFlags: summary.consistency
  };
}
