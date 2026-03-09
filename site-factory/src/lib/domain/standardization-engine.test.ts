import { describe, expect, it } from "vitest";
import type { QualificationInput } from "@/lib/qualification-runtime";
import { buildCanonicalProjectInputDraft } from "./canonical-input";
import { runDecisionEngine } from "./decision-engine";
import { assessStandardization } from "./standardization-engine";

describe("assessStandardization", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("keeps a project custom when no standardization trajectory is justified", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      techStack: "NEXTJS",
      projectType: "APP",
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

    expect(assessment.shouldRemainCustom).toBe(true);
    expect(assessment.standardizationEligible).toBe(false);
    expect(assessment.operatedProductEligible).toBe(false);
    expect(assessment.recommendedDeliveryShift).toBeNull();
  });

  it("detects a managed standardized trajectory when standardization signals are active", () => {
    const canonicalInput = buildCanonicalProjectInputDraft(baseInput);
    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory: "CAT1"
    });

    const assessment = assessStandardization({
      canonicalInput,
      decision
    });

    expect(assessment.standardizationEligible).toBe(true);
    expect(assessment.recommendedDeliveryShift).toBe("MANAGED_STANDARDIZED");
    expect(assessment.recommendedMutualizationShift).toBe("SHARED_SOCLE");
  });

  it("detects an operated-product trajectory when operated signals are active", () => {
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

    expect(assessment.operatedProductEligible).toBe(true);
    expect(assessment.recommendedDeliveryShift).toBe("OPERATED_PRODUCT");
    expect(assessment.recommendedMutualizationShift).toBe(
      "MUTUALIZED_SINGLE_TENANT"
    );
  });
});
