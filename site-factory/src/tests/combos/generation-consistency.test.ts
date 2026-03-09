import { describe, expect, it } from "vitest";
import {
  qualifyProject,
  type QualificationInput
} from "@/lib/qualification-runtime";
import { buildGenerationPlanFromManifest } from "@/lib/generation/manifest-adapter";
import { buildGenerationArtifactDraft } from "@/lib/generation/generators/router";
import { buildExportBundleFromArtifact } from "@/lib/generation/artifact-export";

describe("generation consistency", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("keeps wordpress trajectory coherent across decision, manifest, plan, artifact and export", () => {
    const result = qualifyProject(baseInput);
    const plan = buildGenerationPlanFromManifest(result.manifest);
    const artifact = buildGenerationArtifactDraft(plan);
    const bundle = buildExportBundleFromArtifact(artifact);

    expect(result.decision.technicalProfile).toBe(
      result.manifest.solution.technicalProfile
    );
    expect(plan.profile).toBe(result.manifest.solution.technicalProfile);
    expect(artifact.identity.technicalProfile).toBe(plan.profile);
    expect(bundle.artifact.technicalProfile).toBe(plan.profile);

    expect(plan.generatorKey).toBe("wordpress-site");
    expect(artifact.generatorKey).toBe("wordpress-site");
    expect(bundle.artifact.generatorKey).toBe("wordpress-site");

    expect(plan.deployTarget).toBe(
      result.manifest.technicalContext.deployTarget
    );
    expect(artifact.deployTarget).toBe(plan.deployTarget);
    expect(bundle.artifact.deployTarget).toBe(plan.deployTarget);
  });

  it("keeps next editorial trajectory coherent across all layers", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "BLOG",
      techStack: "NEXTJS",
      deployTarget: "VERCEL"
    });
    const plan = buildGenerationPlanFromManifest(result.manifest);
    const artifact = buildGenerationArtifactDraft(plan);
    const bundle = buildExportBundleFromArtifact(artifact);

    expect(result.decision.technicalProfile).toBe("NEXT_MDX_EDITORIAL");
    expect(result.manifest.solution.technicalProfile).toBe(
      "NEXT_MDX_EDITORIAL"
    );
    expect(plan.profile).toBe("NEXT_MDX_EDITORIAL");
    expect(plan.generatorKey).toBe("next-content-site");
    expect(artifact.projectKind).toBe("next-content-site");
    expect(bundle.artifact.technicalProfile).toBe("NEXT_MDX_EDITORIAL");
    expect(bundle.artifact.deployTarget).toBe("VERCEL");
  });

  it("keeps custom app trajectory coherent across domain and generation", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      selectedModuleIds: ["crm", "erp"]
    });
    const plan = buildGenerationPlanFromManifest(result.manifest);
    const artifact = buildGenerationArtifactDraft(plan);
    const bundle = buildExportBundleFromArtifact(artifact);

    expect(result.decision.technicalProfile).toBe("CUSTOM_APP_MANAGED");
    expect(plan.generatorKey).toBe("custom-app");
    expect(artifact.projectKind).toBe("custom-app");
    expect(bundle.artifact.generatorKey).toBe("custom-app");

    expect(result.standardizationExplanation.status).toBe("CUSTOM_ONLY");
  });

  it("keeps operated-compatible trajectory coherent across domain and generation", () => {
    const result = qualifyProject({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      projectType: "VITRINE",
      techStack: "WORDPRESS",
      deployTarget: "SHARED_HOSTING",
      selectedModuleIds: ["seo"]
    });
    const plan = buildGenerationPlanFromManifest(result.manifest);
    const artifact = buildGenerationArtifactDraft(plan);
    const bundle = buildExportBundleFromArtifact(artifact);

    expect(result.standardizationExplanation.status).toBe("OPERATED_CANDIDATE");
    expect(result.standardization.recommendedDeliveryShift).toBe(
      "OPERATED_PRODUCT"
    );

    expect(result.decision.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(result.manifest.solution.deliveryModel).toBe(
      result.decision.deliveryModel
    );
    expect(plan.deliveryModel).toBe(result.manifest.solution.deliveryModel);
    expect(artifact.identity.deliveryModel).toBe(plan.deliveryModel);
    expect(bundle.artifact.deliveryModel).toBe(plan.deliveryModel);
  });
});
