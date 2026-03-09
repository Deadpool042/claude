import { describe, expect, it } from "vitest";
import {
  qualifyProject,
  type QualificationInput
} from "@/lib/qualification-runtime";

describe("standardization flow", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("keeps a custom app on a custom-only trajectory", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS",
      deployTarget: "DOCKER"
    });

    expect(result.decision.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(result.standardization.shouldRemainCustom).toBe(true);
    expect(result.standardization.standardizationEligible).toBe(false);
    expect(result.standardization.operatedProductEligible).toBe(false);
    expect(result.standardizationExplanation.status).toBe("CUSTOM_ONLY");
    expect(
      result.standardizationExplanation.recommendedDeliveryShift
    ).toBeNull();
  });

  it("detects a managed standardized trajectory for a standardizable project", () => {
    const result = qualifyProject(baseInput);

    expect(result.decision.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(result.standardization.standardizationEligible).toBe(true);
    expect(result.standardization.operatedProductEligible).toBe(false);
    expect(result.standardization.recommendedDeliveryShift).toBe(
      "MANAGED_STANDARDIZED"
    );
    expect(result.standardizationExplanation.status).toBe(
      "STANDARDIZATION_CANDIDATE"
    );
    expect(result.standardizationExplanation.recommendedDeliveryShift).toBe(
      "MANAGED_STANDARDIZED"
    );
    expect(
      result.standardizationExplanation.recommendedMutualizationShift
    ).toBe("SHARED_SOCLE");
  });

  it("detects an operated trajectory for an operated-product candidate", () => {
    const result = qualifyProject({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      selectedModuleIds: ["seo"]
    });

    expect(result.standardization.operatedProductEligible).toBe(true);
    expect(result.standardization.recommendedDeliveryShift).toBe(
      "OPERATED_PRODUCT"
    );
    expect(result.standardizationExplanation.status).toBe("OPERATED_CANDIDATE");
    expect(result.standardizationExplanation.recommendedDeliveryShift).toBe(
      "OPERATED_PRODUCT"
    );
    expect(
      result.standardizationExplanation.recommendedMutualizationShift
    ).toBe("MUTUALIZED_SINGLE_TENANT");
  });
});
