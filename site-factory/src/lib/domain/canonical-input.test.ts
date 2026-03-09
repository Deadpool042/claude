import { describe, expect, it } from "vitest";
import { buildCanonicalProjectInputDraft } from "./canonical-input";
import type { QualificationInput } from "@/lib/qualification-runtime";

describe("buildCanonicalProjectInputDraft", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: [],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("maps legacy project type to canonical need kind", () => {
    const result = buildCanonicalProjectInputDraft({
      ...baseInput,
      projectType: "ECOM"
    });

    expect(result.businessIntent.needKind).toBe("COMMERCE");
  });

  it("maps managed intent from subcontracting billing mode", () => {
    const result = buildCanonicalProjectInputDraft({
      ...baseInput,
      billingMode: "SOUS_TRAITANT"
    });

    expect(result.operatingModel.operatingIntent).toBe("MANAGED_FOR_CLIENT");
    expect(result.signals.managedServiceCandidate).toBe(true);
  });

  it("keeps functional scope as selected module ids", () => {
    const result = buildCanonicalProjectInputDraft({
      ...baseInput,
      selectedModuleIds: ["booking", "seo"]
    });

    expect(result.functionalScope.selectedModuleIds).toEqual([
      "booking",
      "seo"
    ]);
  });

  it("marks wordpress non-headless as standardization possible", () => {
    const result = buildCanonicalProjectInputDraft({
      ...baseInput,
      techStack: "WORDPRESS",
      wpHeadless: false
    });

    expect(result.operatingModel.standardizationIntent).toBe(
      "STANDARDIZATION_POSSIBLE"
    );
    expect(result.signals.standardizationCandidate).toBe(true);
  });

  it("detects mutualization candidate for low-variation standardized setup", () => {
    const result = buildCanonicalProjectInputDraft({
      ...baseInput,
      selectedModuleIds: ["seo", "forms"]
    });

    expect(result.signals.mutualizationCandidate).toBe(true);
  });
});
