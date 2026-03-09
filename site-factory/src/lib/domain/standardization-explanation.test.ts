import { describe, expect, it } from "vitest";
import type { QualificationInput } from "@/lib/qualification-runtime";
import { buildCanonicalProjectInputDraft } from "./canonical-input";
import { runDecisionEngine } from "./decision-engine";
import { assessStandardization } from "./standardization-engine";
import { buildStandardizationExplanation } from "./standardization-explanation";

describe("buildStandardizationExplanation", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("returns CUSTOM_ONLY for a project that should remain custom", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS",
      deployTarget: "DOCKER"
    });
    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory: "CAT3"
    });
    const assessment = assessStandardization({
      canonicalInput,
      decision
    });

    const explanation = buildStandardizationExplanation(assessment);

    expect(explanation.status).toBe("CUSTOM_ONLY");
    expect(explanation.headline).toContain("custom");
    expect(explanation.recommendedDeliveryShift).toBeNull();
  });

  it("returns STANDARDIZATION_CANDIDATE for a standardizable project", () => {
    const canonicalInput = buildCanonicalProjectInputDraft(baseInput);
    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory: "CAT1"
    });
    const assessment = assessStandardization({
      canonicalInput,
      decision
    });

    const explanation = buildStandardizationExplanation(assessment);

    expect(explanation.status).toBe("STANDARDIZATION_CANDIDATE");
    expect(explanation.recommendedDeliveryShift).toBe("MANAGED_STANDARDIZED");
    expect(explanation.recommendedMutualizationShift).toBe("SHARED_SOCLE");
  });

  it("returns OPERATED_CANDIDATE for an operated trajectory", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      selectedModuleIds: ["seo"]
    });
    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory: "CAT2"
    });
    const assessment = assessStandardization({
      canonicalInput,
      decision
    });

    const explanation = buildStandardizationExplanation(assessment);

    expect(explanation.status).toBe("OPERATED_CANDIDATE");
    expect(explanation.recommendedDeliveryShift).toBe("OPERATED_PRODUCT");
    expect(explanation.recommendedMutualizationShift).toBe(
      "MUTUALIZED_SINGLE_TENANT"
    );
  });
});
