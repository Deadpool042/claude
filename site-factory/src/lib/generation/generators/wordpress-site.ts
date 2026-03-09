import type { GenerationPlan } from "../manifest-adapter";
import type { GenerationArtifactDraft } from "./types";

export function buildWordpressSiteDraft(
  plan: GenerationPlan
): GenerationArtifactDraft {
  const files = [
    {
      path: "project.manifest.json",
      kind: "json" as const,
      purpose: "Manifest projet exporté"
    },
    {
      path: "wordpress/wp-content/themes/custom-theme/",
      kind: "text" as const,
      purpose: "Point d’ancrage du thème custom"
    },
    {
      path: "wordpress/wp-content/mu-plugins/",
      kind: "text" as const,
      purpose: "Point d’ancrage des mu-plugins"
    },
    {
      path: "config/deploy/",
      kind: "yaml" as const,
      purpose: "Configuration de déploiement"
    }
  ];

  return {
    generatorKey: plan.generatorKey,
    projectKind: "wordpress-site",
    identity: {
      manifestVersion: "draft-v1",
      technicalProfile: plan.profile,
      deliveryModel: plan.deliveryModel,
      mutualizationLevel: plan.mutualizationLevel
    },
    structure: {
      rootPaths: ["wordpress/", "config/"],
      fileCount: files.length
    },
    files,
    modules: plan.modules,
    deployTarget: plan.deployTarget,
    notes: [...plan.notes, "Draft generator: WordPress-oriented export."]
  };
}
