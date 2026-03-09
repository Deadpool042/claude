import { describe, expect, it } from "vitest";
import type { QualificationInput } from "@/lib/qualification-runtime";
import { buildCanonicalProjectInputDraft } from "@/lib/domain/canonical-input";
import { runDecisionEngine } from "@/lib/domain/decision-engine";
import { buildProjectManifestDraft } from "@/lib/domain/project-manifest";
import { buildGenerationPlanFromManifest } from "../manifest-adapter";
import { buildGenerationArtifactDraft } from "./router";

describe("buildGenerationArtifactDraft", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("builds a wordpress artifact draft from wordpress generation plan", () => {
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

    expect(artifact.projectKind).toBe("wordpress-site");
    expect(artifact.files.map(file => file.path)).toContain(
      "wordpress/wp-content/themes/custom-theme/"
    );
  });

  it("builds a next content artifact draft from next generation plan", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      projectType: "BLOG",
      techStack: "NEXTJS",
      deployTarget: "VERCEL"
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
    const plan = buildGenerationPlanFromManifest(manifest);

    const artifact = buildGenerationArtifactDraft(plan);

    expect(artifact.projectKind).toBe("next-content-site");
    expect(artifact.files.map(file => file.path)).toContain("content/");
  });
});
