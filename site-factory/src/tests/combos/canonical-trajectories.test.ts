import { describe, expect, it } from "vitest";
import {
  qualifyProject,
  type QualificationInput
} from "@/lib/qualification-runtime";

describe("canonical trajectories", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("keeps a delivered custom trajectory for a classic custom site", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "VITRINE",
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      selectedModuleIds: ["seo", "analytics"]
    });

    expect(result.decision.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(result.decision.mutualizationLevel).toBe("DEDICATED");
    expect(result.standardizationExplanation.status).toBe("CUSTOM_ONLY");

    expect(result.manifest.solution.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(result.manifest.solution.mutualizationLevel).toBe("DEDICATED");
  });

  it("keeps a managed custom trajectory for a managed custom project", () => {
    const result = qualifyProject({
      ...baseInput,
      techStack: "NEXTJS",
      deployTarget: "VERCEL",
      selectedModuleIds: ["seo", "analytics"]
    });

    expect(result.decision.deliveryModel).toBe("MANAGED_CUSTOM");
    expect(result.decision.mutualizationLevel).toBe("SHARED_SOCLE");
    expect(result.standardizationExplanation.status).toBe("CUSTOM_ONLY");

    expect(result.manifest.solution.deliveryModel).toBe("MANAGED_CUSTOM");
    expect(result.manifest.solution.mutualizationLevel).toBe("SHARED_SOCLE");
  });

  it("detects a managed standardized trajectory for a standardizable wordpress project", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "VITRINE",
      techStack: "WORDPRESS",
      deployTarget: "SHARED_HOSTING",
      selectedModuleIds: ["seo"]
    });

    expect(result.decision.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(result.decision.mutualizationLevel).toBe("SHARED_SOCLE");

    expect(result.standardization.standardizationEligible).toBe(true);
    expect(result.standardization.recommendedDeliveryShift).toBe(
      "MANAGED_STANDARDIZED"
    );
    expect(result.standardizationExplanation.status).toBe(
      "STANDARDIZATION_CANDIDATE"
    );

    expect(result.manifest.solution.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(result.manifest.solution.mutualizationLevel).toBe("SHARED_SOCLE");
  });

  it("keeps a next/mdx editorial trajectory explicit", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "BLOG",
      techStack: "NEXTJS",
      deployTarget: "VERCEL",
      selectedModuleIds: ["seo"]
    });

    expect(result.decision.technicalProfile).toBe("NEXT_MDX_EDITORIAL");
    expect(result.decision.implementationStrategy).toBe(
      "HEADLESS_CONTENT_SITE"
    );
    expect(result.manifest.solution.technicalProfile).toBe(
      "NEXT_MDX_EDITORIAL"
    );
  });

  it("keeps a business app non-mutualizable when standardization signals are absent", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      selectedModuleIds: ["crm", "erp"]
    });

    expect(result.decision.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(result.decision.mutualizationLevel).toBe("DEDICATED");

    expect(result.standardization.shouldRemainCustom).toBe(true);
    expect(result.standardizationExplanation.status).toBe("CUSTOM_ONLY");

    expect(result.manifest.solution.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(result.manifest.solution.mutualizationLevel).toBe("DEDICATED");
  });

  it("detects an operated-product compatible trajectory", () => {
    const result = qualifyProject({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      projectType: "VITRINE",
      techStack: "WORDPRESS",
      deployTarget: "SHARED_HOSTING",
      selectedModuleIds: ["seo"]
    });

    expect(result.decision.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(result.decision.mutualizationLevel).toBe("MUTUALIZED_SINGLE_TENANT");

    expect(result.standardization.operatedProductEligible).toBe(true);
    expect(result.standardization.recommendedDeliveryShift).toBe(
      "OPERATED_PRODUCT"
    );
    expect(result.standardizationExplanation.status).toBe("OPERATED_CANDIDATE");

    expect(result.manifest.solution.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(result.manifest.solution.mutualizationLevel).toBe(
      "MUTUALIZED_SINGLE_TENANT"
    );
  });
});
