import type { GenerationPlan } from "../manifest-adapter";
import type { GenerationArtifactDraft } from "./types";

export function buildWordpressSiteDraft(
  plan: GenerationPlan
): GenerationArtifactDraft {
  return {
    generatorKey: plan.generatorKey,
    projectKind: "wordpress-site",
    files: [
      {
        path: "project.manifest.json",
        kind: "json",
        purpose: "Manifest projet exporté"
      },
      {
        path: "wordpress/wp-content/themes/custom-theme/",
        kind: "text",
        purpose: "Point d’ancrage du thème custom"
      },
      {
        path: "wordpress/wp-content/mu-plugins/",
        kind: "text",
        purpose: "Point d’ancrage des mu-plugins"
      },
      {
        path: "config/deploy/",
        kind: "yaml",
        purpose: "Configuration de déploiement"
      }
    ],
    modules: plan.modules,
    notes: [...plan.notes, "Draft generator: WordPress-oriented export."]
  };
}
