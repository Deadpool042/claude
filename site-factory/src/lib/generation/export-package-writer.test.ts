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
import { writeExportPackageToDirectory } from "./export-package-writer";

describe("writeExportPackageToDirectory", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  function buildBundle(
    input: QualificationInput,
    finalCategory: "CAT1" | "CAT2"
  ) {
    const canonicalInput = buildCanonicalProjectInputDraft(input);
    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory
    });
    const manifest = buildProjectManifestDraft({
      canonicalInput,
      decision,
      finalCategory
    });
    const plan = buildGenerationPlanFromManifest(manifest);
    const artifact = buildGenerationArtifactDraft(plan);

    return buildExportBundleFromArtifact(artifact);
  }

  it("writes a package root with metadata and bundle index", async () => {
    const pkg = buildExportPackageDraft([buildBundle(baseInput, "CAT1")]);
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "sf-package-"));

    try {
      const result = await writeExportPackageToDirectory({
        pkg,
        outputDir: tempDir
      });

      expect(result.packageRoot).toContain(
        "site-factory-export-package__1-bundles"
      );
      expect(result.writtenFiles).toContain(
        path.join(
          "site-factory-export-package__1-bundles",
          "export.package.json"
        )
      );
      expect(result.writtenFiles).toContain(
        path.join(
          "site-factory-export-package__1-bundles",
          "bundles.index.json"
        )
      );

      const packageJson = await readFile(
        path.join(
          tempDir,
          "site-factory-export-package__1-bundles",
          "export.package.json"
        ),
        "utf8"
      );

      expect(packageJson).toContain("draft-package-v1");
      expect(packageJson).toContain("wordpress-site");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("writes multiple bundles under the package root", async () => {
    const wordpressBundle = buildBundle(baseInput, "CAT1");
    const nextBundle = buildBundle(
      {
        ...baseInput,
        projectType: "BLOG",
        techStack: "NEXTJS",
        deployTarget: "VERCEL"
      },
      "CAT2"
    );

    const pkg = buildExportPackageDraft([wordpressBundle, nextBundle]);
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "sf-package-"));

    try {
      const result = await writeExportPackageToDirectory({
        pkg,
        outputDir: tempDir
      });

      expect(result.packageRoot).toContain(
        "site-factory-export-package__2-bundles"
      );

      const nextManifest = await readFile(
        path.join(
          tempDir,
          "site-factory-export-package__2-bundles",
          "next-content-site__next-mdx-editorial__managed-custom",
          "files",
          "project.manifest.export.json"
        ),
        "utf8"
      );

      expect(nextManifest).toContain("NEXT_MDX_EDITORIAL");
      expect(nextManifest).toContain("VERCEL");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
