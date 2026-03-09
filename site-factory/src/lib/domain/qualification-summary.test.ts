import { describe, expect, it } from "vitest";
import {
  qualifyProject,
  type QualificationInput
} from "@/lib/qualification-runtime";
import { buildQualificationSummary } from "./qualification-summary";

describe("buildQualificationSummary", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("builds a stable reading summary for a standardizable wordpress project", () => {
    const result = qualifyProject(baseInput);
    const summary = buildQualificationSummary(result);

    expect(summary.projectIdentity.technicalProfile).toBe(
      "WP_BUSINESS_EXTENDED"
    );
    expect(summary.projectIdentity.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(summary.projectIdentity.mutualizationLevel).toBe("SHARED_SOCLE");

    expect(summary.standardizationSnapshot.status).toBe(
      "STANDARDIZATION_CANDIDATE"
    );
    expect(summary.standardizationSnapshot.standardizationEligible).toBe(true);
    expect(summary.standardizationSnapshot.operatedProductEligible).toBe(false);

    expect(summary.consistency.deliveryModelAligned).toBe(true);
    expect(summary.consistency.mutualizationLevelAligned).toBe(true);
    expect(summary.consistency.technicalProfileAligned).toBe(true);
  });

  it("builds a readable operated snapshot for an operated-compatible project", () => {
    const result = qualifyProject({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      selectedModuleIds: ["seo"]
    });
    const summary = buildQualificationSummary(result);

    expect(summary.standardizationSnapshot.status).toBe("OPERATED_CANDIDATE");
    expect(summary.standardizationSnapshot.operatedProductEligible).toBe(true);
    expect(summary.standardizationSnapshot.recommendedDeliveryShift).toBe(
      "OPERATED_PRODUCT"
    );
    expect(summary.standardizationSnapshot.recommendedMutualizationShift).toBe(
      "MUTUALIZED_SINGLE_TENANT"
    );

    expect(summary.projectIdentity.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(summary.projectIdentity.mutualizationLevel).toBe(
      "MUTUALIZED_SINGLE_TENANT"
    );
  });

  it("keeps a custom-only reading for a dedicated business app", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      selectedModuleIds: ["crm", "erp"]
    });
    const summary = buildQualificationSummary(result);

    expect(summary.standardizationSnapshot.status).toBe("CUSTOM_ONLY");
    expect(summary.standardizationSnapshot.shouldRemainCustom).toBe(true);
    expect(summary.standardizationSnapshot.standardizationEligible).toBe(false);
    expect(summary.standardizationSnapshot.operatedProductEligible).toBe(false);

    expect(summary.projectIdentity.technicalProfile).toBe("CUSTOM_APP_MANAGED");
    expect(summary.projectIdentity.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(summary.projectIdentity.mutualizationLevel).toBe("DEDICATED");
  });
});
