import { describe, expect, it } from "vitest";
import type { QualificationInput } from "@/lib/qualification-runtime";
import { buildCanonicalProjectInputDraft } from "./canonical-input";
import { runDecisionEngine } from "./decision-engine";
import { buildProjectManifestDraft } from "./project-manifest";

describe("buildProjectManifestDraft", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo", "forms"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("builds a manifest from canonical input and decision output", () => {
    const canonicalInput = buildCanonicalProjectInputDraft(baseInput);
    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory: "CAT1"
    });

    const manifest = buildProjectManifestDraft({
      canonicalInput,
      decision,
      finalCategory: "CAT1"
    });

    expect(manifest.solution.solutionFamily).toBe("BUSINESS_SITE");
    expect(manifest.solution.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(manifest.solution.technicalProfile).toBe("WP_BUSINESS_EXTENDED");
    expect(manifest.functionalScope.selectedModuleIds).toEqual([
      "seo",
      "forms"
    ]);
    expect(manifest.runtimeCompatibility.finalCategory).toBe("CAT1");
  });

  it("keeps standardization and mutualization signals in operations", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      selectedModuleIds: ["seo"]
    });
    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory: "CAT2"
    });

    const manifest = buildProjectManifestDraft({
      canonicalInput,
      decision,
      finalCategory: "CAT2"
    });

    expect(manifest.operations.managedServiceCandidate).toBe(true);
    expect(manifest.operations.standardizationCandidate).toBe(true);
    expect(manifest.operations.mutualizationCandidate).toBe(true);
  });
});
