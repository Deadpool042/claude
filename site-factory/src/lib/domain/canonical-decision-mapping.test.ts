import { describe, expect, it } from "vitest";
import { buildCanonicalProjectInputDraft } from "./canonical-input";
import {
  buildCanonicalDecisionOutputFromDraft,
  mapCommercialProfileFromCanonical,
  mapDeliveryModelFromCanonical,
  mapImplementationStrategyFromCanonical,
  mapMutualizationLevelFromCanonical,
  mapSolutionFamilyFromCanonical,
  mapTechnicalProfileFromCanonical
} from "./canonical-decision-mapping";
import type { QualificationInput } from "@/lib/qualification-runtime";

describe("canonical decision mapping", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: [],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("maps solution family from canonical need kind", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      projectType: "ECOM"
    });

    expect(mapSolutionFamilyFromCanonical(canonicalInput)).toBe("ECOMMERCE");
  });

  it("maps delivery model from canonical operating intent", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      billingMode: "SOUS_TRAITANT"
    });

    expect(mapDeliveryModelFromCanonical(canonicalInput)).toBe(
      "MANAGED_CUSTOM"
    );
  });

  it("maps mutualization from canonical standardization intent", () => {
    const canonicalInput = buildCanonicalProjectInputDraft(baseInput);

    expect(mapMutualizationLevelFromCanonical(canonicalInput, "CAT2")).toBe(
      "SHARED_SOCLE"
    );
  });

  it("maps implementation strategy from canonical draft", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS"
    });

    expect(mapImplementationStrategyFromCanonical(canonicalInput)).toBe(
      "CUSTOM_WEB_APP"
    );
  });

  it("maps technical profile from canonical draft", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      projectType: "ECOM",
      techStack: "WORDPRESS",
      wpHeadless: false
    });

    expect(mapTechnicalProfileFromCanonical(canonicalInput)).toBe(
      "WOOCOMMERCE_STANDARD"
    );
  });

  it("maps commercial profile from canonical draft and delivery model", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      billingMode: "SOUS_TRAITANT"
    });

    expect(
      mapCommercialProfileFromCanonical(canonicalInput, "MANAGED_CUSTOM")
    ).toBe("SETUP_PLUS_MANAGED_RETAINER");
  });

  it("builds a full canonical decision output from draft", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      projectType: "BLOG"
    });

    const decision = buildCanonicalDecisionOutputFromDraft({
      canonicalInput,
      finalCategory: "CAT1"
    });

    expect(decision.solutionFamily).toBe("CONTENT_PLATFORM");
    expect(decision.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(decision.legacyMapping.finalCategory).toBe("CAT1");
  });
});
