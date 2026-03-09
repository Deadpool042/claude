import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { QualificationInput } from "@/lib/qualification-runtime";
import { buildCanonicalProjectInputDraft } from "@/lib/domain/canonical-input";
import { runDecisionEngine } from "@/lib/domain/decision-engine";
import { buildProjectManifestDraft } from "@/lib/domain/project-manifest";
import { buildGenerationPlanFromManifest } from "./manifest-adapter";
import { buildGenerationArtifactDraft } from "./generators/router";
import { buildExportBundleFromArtifact } from "./artifact-export";
import { writeExportBundleToDirectory } from "./artifact-writer";

describe("writeExportBundleToDirectory", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("writes export bundle files to the target directory", async () => {
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

    const tempDir = await mkdtemp(path.join(os.tmpdir(), "sf-export-"));

    try {
      const result = await writeExportBundleToDirectory({
        bundle,
        outputDir: tempDir
      });

      expect(result.outputDir).toBe(tempDir);
      expect(result.writtenFiles).toEqual([
        "project.manifest.export.json",
        "README.export.md",
        "files.index.json"
      ]);

      const readme = await readFile(
        path.join(tempDir, "README.export.md"),
        "utf8"
      );

      expect(readme).toContain("# Export draft");
      expect(readme).toContain("wordpress-site");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("writes next export bundle metadata correctly", async () => {
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

    const tempDir = await mkdtemp(path.join(os.tmpdir(), "sf-export-"));

    try {
      await writeExportBundleToDirectory({
        bundle,
        outputDir: tempDir
      });

      const manifestJson = await readFile(
        path.join(tempDir, "project.manifest.export.json"),
        "utf8"
      );

      expect(manifestJson).toContain("NEXT_MDX_EDITORIAL");
      expect(manifestJson).toContain("VERCEL");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
