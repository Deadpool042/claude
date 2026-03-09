import { describe, expect, it } from "vitest";
import {
  qualifyProject,
  type QualificationInput
} from "@/lib/qualification-runtime";
import { buildCanonicalProjectInputDraft } from "@/lib/domain/canonical-input";
import { buildGenerationPlanFromManifest } from "@/lib/generation/manifest-adapter";

describe("final phase 8 guardrails", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("keeps canonical need kind and editorial model aligned for a BLOG project", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      projectType: "BLOG",
      techStack: "NEXTJS",
      deployTarget: "VERCEL"
    });

    expect(canonicalInput.businessIntent.needKind).toBe("CONTENT");
    expect(canonicalInput.contentModel.editingModel).toBe(
      "STRUCTURED_EDITORIAL"
    );
    expect(canonicalInput.operatingModel.operatingIntent).toBe(
      "MANAGED_FOR_CLIENT"
    );
  });

  it("keeps canonical app projects out of standardization signals", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      selectedModuleIds: ["crm", "erp"]
    });

    expect(canonicalInput.businessIntent.needKind).toBe("BUSINESS_TOOL");
    expect(canonicalInput.signals.standardizationCandidate).toBe(false);
    expect(canonicalInput.signals.mutualizationCandidate).toBe(false);
    expect(canonicalInput.signals.operatedProductCandidate).toBe(false);
  });

  it("keeps wordpress standard projects eligible for standardization but not automatically operated", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      projectType: "VITRINE",
      techStack: "WORDPRESS",
      deployTarget: "SHARED_HOSTING",
      billingMode: "SOLO",
      selectedModuleIds: ["seo"]
    });

    expect(canonicalInput.operatingModel.standardizationIntent).toBe(
      "STANDARDIZATION_POSSIBLE"
    );
    expect(canonicalInput.signals.standardizationCandidate).toBe(true);
    expect(canonicalInput.signals.mutualizationCandidate).toBe(true);
    expect(canonicalInput.signals.operatedProductCandidate).toBe(false);
  });

  it("keeps the headless wordpress exclusion on the generation side", () => {
    const result = qualifyProject({
      ...baseInput,
      techStack: "WORDPRESS",
      wpHeadless: true,
      deployTarget: "SHARED_HOSTING"
    });

    const plan = buildGenerationPlanFromManifest(result.manifest);

    expect(result.decision.technicalProfile).toBe("HEADLESS_WP");
    expect(plan.generatorKey).toBe("wordpress-site");
    expect(result.manifest.technicalContext.wpHeadless).toBe(true);
  });

  it("keeps operated-product candidacy gated by subcontracting plus mutualization signals", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      projectType: "VITRINE",
      techStack: "WORDPRESS",
      selectedModuleIds: ["seo"]
    });

    expect(canonicalInput.signals.standardizationCandidate).toBe(true);
    expect(canonicalInput.signals.mutualizationCandidate).toBe(true);
    expect(canonicalInput.signals.operatedProductCandidate).toBe(true);
  });

  it("keeps operated-product candidacy disabled when the mutualization signal is absent", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      projectType: "VITRINE",
      techStack: "WORDPRESS",
      selectedModuleIds: ["seo", "analytics", "crm", "erp"]
    });

    expect(canonicalInput.signals.standardizationCandidate).toBe(true);
    expect(canonicalInput.signals.mutualizationCandidate).toBe(false);
    expect(canonicalInput.signals.operatedProductCandidate).toBe(false);
  });
});
