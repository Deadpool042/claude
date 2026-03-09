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

describe("drift guardrails", () => {
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
      createdAt: "2026-03-09T14:00:00.000Z"
    });

    return { result, plan, artifact, bundle, pkg, registryEntry };
  }

  function expectLayerConsistency(pipeline: ReturnType<typeof buildPipeline>) {
    const { result, plan, artifact, bundle, pkg, registryEntry } = pipeline;

    expect(result.decision.deliveryModel).toBe(
      result.manifest.solution.deliveryModel
    );
    expect(result.decision.mutualizationLevel).toBe(
      result.manifest.solution.mutualizationLevel
    );
    expect(result.decision.technicalProfile).toBe(
      result.manifest.solution.technicalProfile
    );
    expect(result.decision.implementationStrategy).toBe(
      result.manifest.solution.implementationStrategy
    );

    expect(plan.deliveryModel).toBe(result.manifest.solution.deliveryModel);
    expect(plan.mutualizationLevel).toBe(
      result.manifest.solution.mutualizationLevel
    );
    expect(plan.profile).toBe(result.manifest.solution.technicalProfile);

    expect(artifact.identity.deliveryModel).toBe(plan.deliveryModel);
    expect(artifact.identity.mutualizationLevel).toBe(plan.mutualizationLevel);
    expect(artifact.identity.technicalProfile).toBe(plan.profile);

    expect(bundle.artifact.deliveryModel).toBe(artifact.identity.deliveryModel);
    expect(bundle.artifact.mutualizationLevel).toBe(
      artifact.identity.mutualizationLevel
    );
    expect(bundle.artifact.technicalProfile).toBe(
      artifact.identity.technicalProfile
    );

    expect(pkg.summary[0]?.deliveryModel).toBe(bundle.artifact.deliveryModel);
    expect(pkg.summary[0]?.mutualizationLevel).toBe(
      bundle.artifact.mutualizationLevel
    );
    expect(pkg.summary[0]?.technicalProfile).toBe(
      bundle.artifact.technicalProfile
    );

    expect(registryEntry.primaryTechnicalProfile).toBe(
      pkg.summary[0]?.technicalProfile ?? null
    );
  }

  it("keeps wordpress standardizable trajectory aligned across all layers", () => {
    const pipeline = buildPipeline(baseInput);

    expectLayerConsistency(pipeline);

    expect(pipeline.result.decision.technicalProfile).toBe(
      "WP_BUSINESS_EXTENDED"
    );
    expect(pipeline.plan.generatorKey).toBe("wordpress-site");
    expect(pipeline.artifact.generatorKey).toBe("wordpress-site");
    expect(pipeline.bundle.artifact.generatorKey).toBe("wordpress-site");
    expect(pipeline.pkg.summary[0]?.generatorKey).toBe("wordpress-site");
    expect(pipeline.registryEntry.primaryGeneratorKey).toBe("wordpress-site");
  });

  it("keeps next editorial managed trajectory aligned across all layers", () => {
    const pipeline = buildPipeline({
      ...baseInput,
      projectType: "BLOG",
      techStack: "NEXTJS",
      deployTarget: "VERCEL"
    });

    expectLayerConsistency(pipeline);

    expect(pipeline.result.decision.deliveryModel).toBe("MANAGED_CUSTOM");
    expect(pipeline.result.decision.technicalProfile).toBe(
      "NEXT_MDX_EDITORIAL"
    );
    expect(pipeline.plan.generatorKey).toBe("next-content-site");
    expect(pipeline.artifact.projectKind).toBe("next-content-site");
    expect(pipeline.bundle.artifact.deployTarget).toBe("VERCEL");
    expect(pipeline.registryEntry.primaryGeneratorKey).toBe(
      "next-content-site"
    );
  });

  it("keeps custom app dedicated trajectory aligned across all layers", () => {
    const pipeline = buildPipeline({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      selectedModuleIds: ["crm", "erp"]
    });

    expectLayerConsistency(pipeline);

    expect(pipeline.result.decision.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(pipeline.result.decision.mutualizationLevel).toBe("DEDICATED");
    expect(pipeline.result.decision.technicalProfile).toBe(
      "CUSTOM_APP_MANAGED"
    );
    expect(pipeline.plan.generatorKey).toBe("custom-app");
    expect(pipeline.artifact.projectKind).toBe("custom-app");
    expect(pipeline.bundle.artifact.generatorKey).toBe("custom-app");
    expect(pipeline.result.standardizationExplanation.status).toBe(
      "CUSTOM_ONLY"
    );
  });

  it("keeps operated-compatible trajectory aligned across all layers", () => {
    const pipeline = buildPipeline({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      projectType: "VITRINE",
      techStack: "WORDPRESS",
      deployTarget: "SHARED_HOSTING",
      selectedModuleIds: ["seo"]
    });

    expectLayerConsistency(pipeline);

    expect(pipeline.result.standardizationExplanation.status).toBe(
      "OPERATED_CANDIDATE"
    );
    expect(pipeline.result.standardization.recommendedDeliveryShift).toBe(
      "OPERATED_PRODUCT"
    );

    expect(pipeline.result.decision.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(pipeline.result.decision.mutualizationLevel).toBe(
      "MUTUALIZED_SINGLE_TENANT"
    );

    expect(pipeline.plan.generatorKey).toBe("operated-template");
    expect(pipeline.bundle.artifact.generatorKey).toBe("operated-template");
    expect(pipeline.pkg.summary[0]?.generatorKey).toBe("operated-template");
    expect(pipeline.registryEntry.primaryGeneratorKey).toBe(
      "operated-template"
    );
    expect(pipeline.registryEntry.primaryTechnicalProfile).toBe(
      "OPERATED_CONTENT_PRODUCT"
    );
  });
});
