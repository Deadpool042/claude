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
import { buildExportPackageDraft } from "./export-package";
import { registerExportPackage } from "./export-registry-writer";

describe("registerExportPackage", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  function buildPackage() {
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

    return buildExportPackageDraft([bundle]);
  }

  it("creates a registry file for the first package", async () => {
    const pkg = buildPackage();
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "sf-registry-"));

    try {
      const result = await registerExportPackage({
        outputDir: tempDir,
        packageFolderName: "site-factory-export-package__1-bundles",
        pkg,
        createdAt: "2026-03-09T10:00:00.000Z"
      });

      expect(result.entryCount).toBe(1);

      const registryRaw = await readFile(
        path.join(tempDir, "exports.registry.json"),
        "utf8"
      );

      expect(registryRaw).toContain("draft-registry-v1");
      expect(registryRaw).toContain("wordpress-site");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("appends a second package entry to the registry", async () => {
    const pkg = buildPackage();
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "sf-registry-"));

    try {
      await registerExportPackage({
        outputDir: tempDir,
        packageFolderName: "site-factory-export-package__1-bundles",
        pkg,
        createdAt: "2026-03-09T10:00:00.000Z"
      });

      const result = await registerExportPackage({
        outputDir: tempDir,
        packageFolderName: "site-factory-export-package__2-bundles",
        pkg,
        createdAt: "2026-03-09T11:00:00.000Z"
      });

      expect(result.entryCount).toBe(2);

      const registryRaw = await readFile(
        path.join(tempDir, "exports.registry.json"),
        "utf8"
      );

      expect(registryRaw).toContain("site-factory-export-package__1-bundles");
      expect(registryRaw).toContain("site-factory-export-package__2-bundles");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
