import { describe, expect, it } from "vitest";
import type { QualificationInput } from "@/lib/qualification-runtime";
import { buildCanonicalProjectInputDraft } from "@/lib/domain/canonical-input";
import { runDecisionEngine } from "@/lib/domain/decision-engine";
import { buildProjectManifestDraft } from "@/lib/domain/project-manifest";
import { buildGenerationPlanFromManifest } from "../manifest-adapter";
import { buildGenerationArtifactDraft } from "./router";
import { validateGenerationArtifactDraft } from "./validate-artifact";

describe("validateGenerationArtifactDraft", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("validates a wordpress artifact draft", () => {
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
    const plan = buildGenerationPlanFromManifest(manifest);
    const artifact = buildGenerationArtifactDraft(plan);

    const validation = validateGenerationArtifactDraft(artifact);

    expect(validation.isValid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it("reports invalid draft when manifest file is missing", () => {
    const validation = validateGenerationArtifactDraft({
      generatorKey: "wordpress-site",
      projectKind: "wordpress-site",
      identity: {
        manifestVersion: "draft-v1",
        technicalProfile: "WP_BUSINESS_EXTENDED",
        deliveryModel: "DELIVERED_CUSTOM",
        mutualizationLevel: "SHARED_SOCLE"
      },
      structure: {
        rootPaths: ["wordpress/"],
        fileCount: 0
      },
      files: [],
      modules: [],
      deployTarget: "SHARED_HOSTING",
      notes: []
    });

    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});
