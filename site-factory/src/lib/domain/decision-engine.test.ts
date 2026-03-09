import { describe, expect, it } from "vitest";
import { buildCanonicalProjectInputDraft } from "./canonical-input";
import { runDecisionEngine } from "./decision-engine";
import type { QualificationInput } from "@/lib/qualification-runtime";

describe("runDecisionEngine", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: [],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("returns a canonical decision output from canonical draft + final category", () => {
    const canonicalInput = buildCanonicalProjectInputDraft(baseInput);

    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory: "CAT1"
    });

    expect(decision.solutionFamily).toBe("BUSINESS_SITE");
    expect(decision.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(decision.legacyMapping.finalCategory).toBe("CAT1");
  });

  it("keeps managed standardized trajectory when operated-product signal is active", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      selectedModuleIds: ["seo", "forms"]
    });

    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory: "CAT2"
    });

    expect(decision.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(decision.mutualizationLevel).toBe("MUTUALIZED_SINGLE_TENANT");
  });
});
