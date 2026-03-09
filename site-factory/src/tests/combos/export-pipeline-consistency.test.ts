import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  qualifyProject,
  type QualificationInput
} from "@/lib/qualification-runtime";
import { buildGenerationPlanFromManifest } from "@/lib/generation/manifest-adapter";
import { buildGenerationArtifactDraft } from "@/lib/generation/generators/router";
import { buildExportBundleFromArtifact } from "@/lib/generation/artifact-export";
import { buildExportLayoutDraft } from "@/lib/generation/export-layout";
import { buildExportPackageDraft } from "@/lib/generation/export-package";
import { writeExportPackageToDirectory } from "@/lib/generation/export-package-writer";
import { registerExportPackage } from "@/lib/generation/export-registry-writer";

describe("export pipeline consistency", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  function buildBundle(input: QualificationInput) {
    const result = qualifyProject(input);
    const plan = buildGenerationPlanFromManifest(result.manifest);
    const artifact = buildGenerationArtifactDraft(plan);
    const bundle = buildExportBundleFromArtifact(artifact);
    const layout = buildExportLayoutDraft(bundle);

    return { result, plan, artifact, bundle, layout };
  }

  it("keeps wordpress export metadata coherent across bundle, layout, package and registry", async () => {
    const { result, plan, artifact, bundle, layout } = buildBundle(baseInput);
    const pkg = buildExportPackageDraft([bundle]);
    const tempDir = await mkdtemp(
      path.join(os.tmpdir(), "sf-export-pipeline-")
    );

    try {
      const packageWrite = await writeExportPackageToDirectory({
        pkg,
        outputDir: tempDir
      });

      const packageFolderName = path.basename(packageWrite.packageRoot);

      const registryWrite = await registerExportPackage({
        outputDir: tempDir,
        packageFolderName,
        pkg,
        createdAt: "2026-03-09T12:00:00.000Z"
      });

      expect(result.decision.technicalProfile).toBe(
        result.manifest.solution.technicalProfile
      );
      expect(plan.profile).toBe(result.manifest.solution.technicalProfile);
      expect(artifact.identity.technicalProfile).toBe(plan.profile);
      expect(bundle.artifact.technicalProfile).toBe(plan.profile);

      expect(layout.folderName).toContain("wordpress-site");
      expect(packageFolderName).toBe("site-factory-export-package__1-bundles");

      const registryRaw = await readFile(registryWrite.registryPath, "utf8");
      expect(registryRaw).toContain(packageFolderName);
      expect(registryRaw).toContain("wordpress-site");
      expect(registryRaw).toContain("WP_BUSINESS_EXTENDED");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("keeps next editorial export metadata coherent across bundle, package and registry", async () => {
    const { result, plan, artifact, bundle, layout } = buildBundle({
      ...baseInput,
      projectType: "BLOG",
      techStack: "NEXTJS",
      deployTarget: "VERCEL"
    });
    const pkg = buildExportPackageDraft([bundle]);
    const tempDir = await mkdtemp(
      path.join(os.tmpdir(), "sf-export-pipeline-")
    );

    try {
      const packageWrite = await writeExportPackageToDirectory({
        pkg,
        outputDir: tempDir
      });

      const packageFolderName = path.basename(packageWrite.packageRoot);

      await registerExportPackage({
        outputDir: tempDir,
        packageFolderName,
        pkg,
        createdAt: "2026-03-09T12:30:00.000Z"
      });

      expect(result.decision.technicalProfile).toBe("NEXT_MDX_EDITORIAL");
      expect(plan.generatorKey).toBe("next-content-site");
      expect(artifact.projectKind).toBe("next-content-site");
      expect(bundle.artifact.deployTarget).toBe("VERCEL");
      expect(layout.folderName).toContain("next-content-site");
      expect(layout.folderName).toContain("managed-custom");

      const packageJson = await readFile(
        path.join(packageWrite.packageRoot, "export.package.json"),
        "utf8"
      );

      expect(packageJson).toContain("NEXT_MDX_EDITORIAL");
      expect(packageJson).toContain("VERCEL");
      expect(packageJson).toContain("next-content-site");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("keeps operated-compatible export metadata coherent through packaging", async () => {
    const { result, plan, artifact, bundle } = buildBundle({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      projectType: "VITRINE",
      techStack: "WORDPRESS",
      deployTarget: "SHARED_HOSTING",
      selectedModuleIds: ["seo"]
    });
    const pkg = buildExportPackageDraft([bundle]);

    expect(result.standardizationExplanation.status).toBe("OPERATED_CANDIDATE");
    expect(result.standardization.recommendedDeliveryShift).toBe(
      "OPERATED_PRODUCT"
    );

    expect(result.decision.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(result.manifest.solution.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(plan.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(artifact.identity.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(bundle.artifact.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(pkg.summary[0]?.deliveryModel).toBe("MANAGED_STANDARDIZED");
  });
});
