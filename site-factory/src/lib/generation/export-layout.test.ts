import { describe, expect, it } from "vitest";
import type { QualificationInput } from "@/lib/qualification-runtime";
import { buildCanonicalProjectInputDraft } from "@/lib/domain/canonical-input";
import { runDecisionEngine } from "@/lib/domain/decision-engine";
import { buildProjectManifestDraft } from "@/lib/domain/project-manifest";
import { buildGenerationPlanFromManifest } from "./manifest-adapter";
import { buildGenerationArtifactDraft } from "./generators/router";
import { buildExportBundleFromArtifact } from "./artifact-export";
import { buildExportFolderName, buildExportLayoutDraft } from "./export-layout";

describe("export-layout", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("builds a deterministic export folder name", () => {
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

    const folderName = buildExportFolderName(bundle);

    expect(folderName).toBe(
      "wordpress-site__wp-business-extended__delivered-custom"
    );
  });

  it("builds a stable export layout draft", () => {
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

    const layout = buildExportLayoutDraft(bundle);

    expect(layout.relativeRoot).toBe(
      "next-content-site__next-mdx-editorial__managed-custom"
    );
    expect(layout.filesRoot).toBe(
      "next-content-site__next-mdx-editorial__managed-custom/files"
    );
    expect(layout.metadataFile).toBe(
      "next-content-site__next-mdx-editorial__managed-custom/export.bundle.json"
    );
  });
});
