import { describe, expect, it } from "vitest";
import {
  qualifyProject,
  type QualificationInput
} from "@/lib/qualification-runtime";
import { buildGenerationPlanFromManifest } from "@/lib/generation/manifest-adapter";
import { buildGenerationArtifactDraft } from "@/lib/generation/generators/router";
import { buildExportBundleFromArtifact } from "@/lib/generation/artifact-export";
import { buildExportPackageDraft } from "@/lib/generation/export-package";
import { buildExportRegistryEntry } from "@/lib/generation/export-registry";

describe("mapping invariants", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  function buildPipeline(input: QualificationInput) {
    const result = qualifyProject(input);
    const plan = buildGenerationPlanFromManifest(result.manifest);
    const artifact = buildGenerationArtifactDraft(plan);
    const bundle = buildExportBundleFromArtifact(artifact);
    const pkg = buildExportPackageDraft([bundle]);
    const registryEntry = buildExportRegistryEntry({
      pkg,
      packageFolderName: "site-factory-export-package__1-bundles",
      createdAt: "2026-03-09T13:00:00.000Z"
    });

    return { result, plan, artifact, bundle, pkg, registryEntry };
  }

  it("maps wordpress business profile to wordpress generator", () => {
    const { result, plan, artifact, bundle, pkg, registryEntry } =
      buildPipeline(baseInput);

    expect(result.decision.technicalProfile).toBe("WP_BUSINESS_EXTENDED");
    expect(plan.generatorKey).toBe("wordpress-site");
    expect(artifact.generatorKey).toBe("wordpress-site");
    expect(bundle.artifact.generatorKey).toBe("wordpress-site");
    expect(pkg.summary[0]?.generatorKey).toBe("wordpress-site");
    expect(registryEntry.primaryGeneratorKey).toBe("wordpress-site");
  });

  it("maps next editorial profile to next-content generator", () => {
    const { result, plan, artifact, bundle, pkg, registryEntry } =
      buildPipeline({
        ...baseInput,
        projectType: "BLOG",
        techStack: "NEXTJS",
        deployTarget: "VERCEL"
      });

    expect(result.decision.technicalProfile).toBe("NEXT_MDX_EDITORIAL");
    expect(plan.generatorKey).toBe("next-content-site");
    expect(artifact.projectKind).toBe("next-content-site");
    expect(bundle.artifact.technicalProfile).toBe("NEXT_MDX_EDITORIAL");
    expect(pkg.summary[0]?.technicalProfile).toBe("NEXT_MDX_EDITORIAL");
    expect(registryEntry.primaryTechnicalProfile).toBe("NEXT_MDX_EDITORIAL");
  });

  it("maps custom app profile to custom-app generator", () => {
    const { result, plan, artifact, bundle, pkg, registryEntry } =
      buildPipeline({
        ...baseInput,
        projectType: "APP",
        techStack: "NEXTJS",
        deployTarget: "DOCKER",
        selectedModuleIds: ["crm", "erp"]
      });

    expect(result.decision.technicalProfile).toBe("CUSTOM_APP_MANAGED");
    expect(plan.generatorKey).toBe("custom-app");
    expect(artifact.projectKind).toBe("custom-app");
    expect(bundle.artifact.generatorKey).toBe("custom-app");
    expect(pkg.summary[0]?.generatorKey).toBe("custom-app");
    expect(registryEntry.primaryGeneratorKey).toBe("custom-app");
  });

  it("keeps delivery and mutualization metadata stable through export layers", () => {
    const { result, plan, artifact, bundle, pkg, registryEntry } =
      buildPipeline({
        ...baseInput,
        billingMode: "SOUS_TRAITANT",
        projectType: "VITRINE",
        techStack: "WORDPRESS",
        deployTarget: "SHARED_HOSTING",
        selectedModuleIds: ["seo"]
      });

    expect(result.decision.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(result.manifest.solution.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(plan.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(artifact.identity.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(bundle.artifact.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(pkg.summary[0]?.deliveryModel).toBe("MANAGED_STANDARDIZED");

    expect(result.decision.mutualizationLevel).toBe("MUTUALIZED_SINGLE_TENANT");
    expect(result.manifest.solution.mutualizationLevel).toBe(
      "MUTUALIZED_SINGLE_TENANT"
    );
    expect(plan.mutualizationLevel).toBe("MUTUALIZED_SINGLE_TENANT");
    expect(artifact.identity.mutualizationLevel).toBe(
      "MUTUALIZED_SINGLE_TENANT"
    );
    expect(bundle.artifact.mutualizationLevel).toBe("MUTUALIZED_SINGLE_TENANT");
    expect(pkg.summary[0]?.mutualizationLevel).toBe("MUTUALIZED_SINGLE_TENANT");

    expect(registryEntry.primaryGeneratorKey).toBe("operated-template");
    expect(registryEntry.primaryTechnicalProfile).toBe(
      "OPERATED_CONTENT_PRODUCT"
    );
  });
});
