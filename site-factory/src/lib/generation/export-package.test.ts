import { describe, expect, it } from "vitest";
import type { QualificationInput } from "@/lib/qualification-runtime";
import { buildCanonicalProjectInputDraft } from "@/lib/domain/canonical-input";
import { runDecisionEngine } from "@/lib/domain/decision-engine";
import { buildProjectManifestDraft } from "@/lib/domain/project-manifest";
import { buildGenerationPlanFromManifest } from "./manifest-adapter";
import { buildGenerationArtifactDraft } from "./generators/router";
import { buildExportBundleFromArtifact } from "./artifact-export";
import { buildExportPackageDraft } from "./export-package";

describe("buildExportPackageDraft", () => {
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
    finalCategory: "CAT1" | "CAT2" | "CAT3"
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

  it("builds a package draft from a single bundle", () => {
    const bundle = buildBundle(baseInput, "CAT1");

    const pkg = buildExportPackageDraft([bundle]);

    expect(pkg.packageVersion).toBe("draft-package-v1");
    expect(pkg.bundleCount).toBe(1);
    expect(pkg.summary).toHaveLength(1);
    expect(pkg.summary[0]?.generatorKey).toBe("wordpress-site");
    expect(pkg.summary[0]?.technicalProfile).toBe("WP_BUSINESS_EXTENDED");
  });

  it("builds a package summary across multiple bundles", () => {
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

    expect(pkg.bundleCount).toBe(2);
    expect(pkg.summary.map(item => item.generatorKey)).toEqual([
      "wordpress-site",
      "next-content-site"
    ]);
    expect(pkg.summary.map(item => item.deployTarget)).toEqual([
      "SHARED_HOSTING",
      "VERCEL"
    ]);
  });
});
