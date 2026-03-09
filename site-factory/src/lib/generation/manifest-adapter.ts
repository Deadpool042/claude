import type { ProjectManifestDraft } from "@/lib/domain/project-manifest";

export type GeneratorKey =
  | "wordpress-site"
  | "next-content-site"
  | "custom-app"
  | "operated-template";

export interface GenerationPlan {
  profile: ProjectManifestDraft["solution"]["technicalProfile"];
  deliveryModel: ProjectManifestDraft["solution"]["deliveryModel"];
  mutualizationLevel: ProjectManifestDraft["solution"]["mutualizationLevel"];
  generatorKey: GeneratorKey;
  modules: string[];
  deployTarget: ProjectManifestDraft["technicalContext"]["deployTarget"];
  notes: string[];
}

function resolveGeneratorKey(manifest: ProjectManifestDraft): GeneratorKey {
  switch (manifest.solution.technicalProfile) {
    case "WP_EDITORIAL_STANDARD":
    case "WP_BUSINESS_EXTENDED":
    case "WOOCOMMERCE_STANDARD":
    case "HEADLESS_WP":
      return "wordpress-site";

    case "NEXT_MDX_EDITORIAL":
    case "JAMSTACK_CONTENT_SITE":
      return "next-content-site";

    case "CUSTOM_APP_MANAGED":
      return "custom-app";

    case "OPERATED_CONTENT_PRODUCT":
      return "operated-template";

    default: {
      const _never: never = manifest.solution.technicalProfile;
      return _never;
    }
  }
}

function buildGenerationNotes(
  manifest: ProjectManifestDraft,
  generatorKey: GeneratorKey
): string[] {
  const notes: string[] = [];

  notes.push(
    `Generator selected from technical profile: ${manifest.solution.technicalProfile}.`
  );
  notes.push(`Delivery model: ${manifest.solution.deliveryModel}.`);
  notes.push(`Mutualization level: ${manifest.solution.mutualizationLevel}.`);

  if (manifest.technicalContext.wpHeadless) {
    notes.push("Runtime flag: WordPress headless is enabled.");
  }

  if (manifest.operations.managedServiceCandidate) {
    notes.push("Signal: managed service candidate.");
  }

  if (manifest.operations.standardizationCandidate) {
    notes.push("Signal: standardization candidate.");
  }

  if (manifest.operations.mutualizationCandidate) {
    notes.push("Signal: mutualization candidate.");
  }

  if (manifest.operations.operatedProductCandidate) {
    notes.push("Signal: operated product candidate.");
  }

  if (generatorKey === "operated-template") {
    notes.push(
      "Generation should stay compatible with operated/template constraints."
    );
  }

  return notes;
}

export function buildGenerationPlanFromManifest(
  manifest: ProjectManifestDraft
): GenerationPlan {
  const generatorKey = resolveGeneratorKey(manifest);

  return {
    profile: manifest.solution.technicalProfile,
    deliveryModel: manifest.solution.deliveryModel,
    mutualizationLevel: manifest.solution.mutualizationLevel,
    generatorKey,
    modules: manifest.functionalScope.selectedModuleIds,
    deployTarget: manifest.technicalContext.deployTarget,
    notes: buildGenerationNotes(manifest, generatorKey)
  };
}
