import { describe, expect, it } from "vitest";
import {
  qualifyProject,
  type QualificationInput
} from "@/lib/qualification-runtime";
import { buildCanonicalProjectInputDraft } from "@/lib/domain/canonical-input";
import { runDecisionEngine } from "@/lib/domain/decision-engine";
import { buildProjectManifestDraft } from "@/lib/domain/project-manifest";
import { buildGenerationPlanFromManifest } from "./manifest-adapter";
import { buildGenerationArtifactDraft } from "./generators/router";
import {
  buildExportBundleFromArtifact,
  buildExportBundleFromArtifactAndQualification
} from "./artifact-export";

describe("buildExportBundleFromArtifact", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("builds an export bundle from a wordpress artifact", () => {
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

    const bundle = buildExportBundleFromArtifact(artifact);

    expect(bundle.exportVersion).toBe("draft-export-v1");
    expect(bundle.artifact.generatorKey).toBe("wordpress-site");
    expect(bundle.files.map(file => file.path)).toEqual([
      "project.manifest.export.json",
      "README.export.md",
      "files.index.json"
    ]);
  });

  it("keeps identity and deployment metadata in the export bundle", () => {
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

    const bundle = buildExportBundleFromArtifact(artifact);

    expect(bundle.artifact.technicalProfile).toBe("NEXT_MDX_EDITORIAL");
    expect(bundle.artifact.deployTarget).toBe("VERCEL");
    expect(bundle.artifact.deliveryModel).toBeDefined();
  });

  it("builds an enriched export bundle with qualification report", () => {
    const input: QualificationInput = {
      projectType: "VITRINE",
      techStack: "WORDPRESS",
      selectedModuleIds: ["seo"],
      billingMode: "SOLO",
      deployTarget: "SHARED_HOSTING",
      wpHeadless: false,
      catSelections: {}
    };

    const qualification = qualifyProject(input);
    const plan = buildGenerationPlanFromManifest(qualification.manifest);
    const artifact = buildGenerationArtifactDraft(plan);

    const bundle = buildExportBundleFromArtifactAndQualification({
      artifact,
      qualification
    });

    expect(bundle.files.map(file => file.path)).toEqual([
      "project.manifest.export.json",
      "README.export.md",
      "files.index.json",
      "qualification.report.json"
    ]);

    const qualificationFile = bundle.files.find(
      file => file.path === "qualification.report.json"
    );

    expect(qualificationFile).toBeDefined();
    expect(qualificationFile?.content).toContain(
      "draft-qualification-export-v1"
    );
    expect(qualificationFile?.content).toContain("WP_BUSINESS_EXTENDED");
    expect(qualificationFile?.content).toContain("STANDARDIZATION_CANDIDATE");
  });
});
