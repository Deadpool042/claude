import { describe, expect, it } from "vitest";
import type { QualificationInput } from "@/lib/qualification-runtime";
import { buildCanonicalProjectInputDraft } from "@/lib/domain/canonical-input";
import { runDecisionEngine } from "@/lib/domain/decision-engine";
import { buildProjectManifestDraft } from "@/lib/domain/project-manifest";
import { buildGenerationPlanFromManifest } from "./manifest-adapter";
import { buildGenerationArtifactDraft } from "./generators/router";
import { buildExportBundleFromArtifact } from "./artifact-export";
import { buildExportPackageDraft } from "./export-package";
import {
  appendExportRegistryEntry,
  buildExportRegistryEntry
} from "./export-registry";

describe("export-registry", () => {
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

  it("builds a registry entry from an export package", () => {
    const pkg = buildPackage();

    const entry = buildExportRegistryEntry({
      pkg,
      packageFolderName: "site-factory-export-package__1-bundles",
      createdAt: "2026-03-09T10:00:00.000Z"
    });

    expect(entry.packageVersion).toBe("draft-package-v1");
    expect(entry.bundleCount).toBe(1);
    expect(entry.primaryGeneratorKey).toBe("wordpress-site");
    expect(entry.primaryTechnicalProfile).toBe("WP_BUSINESS_EXTENDED");
    expect(entry.packageFolderName).toBe(
      "site-factory-export-package__1-bundles"
    );
  });

  it("appends an entry to an empty or existing registry", () => {
    const pkg = buildPackage();

    const firstEntry = buildExportRegistryEntry({
      pkg,
      packageFolderName: "site-factory-export-package__1-bundles",
      createdAt: "2026-03-09T10:00:00.000Z"
    });

    const registry1 = appendExportRegistryEntry({
      registry: null,
      entry: firstEntry
    });

    expect(registry1.entries).toHaveLength(1);

    const secondEntry = buildExportRegistryEntry({
      pkg,
      packageFolderName: "site-factory-export-package__2-bundles",
      createdAt: "2026-03-09T11:00:00.000Z"
    });

    const registry2 = appendExportRegistryEntry({
      registry: registry1,
      entry: secondEntry
    });

    expect(registry2.entries).toHaveLength(2);
    expect(registry2.entries[1]?.packageFolderName).toBe(
      "site-factory-export-package__2-bundles"
    );
  });
});
