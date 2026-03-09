import type { GenerationPlan } from "../manifest-adapter";
import type { GenerationArtifactDraft } from "./types";

export function buildNextContentSiteDraft(
  plan: GenerationPlan
): GenerationArtifactDraft {
  return {
    generatorKey: plan.generatorKey,
    projectKind: "next-content-site",
    files: [
      {
        path: "project.manifest.json",
        kind: "json",
        purpose: "Manifest projet exporté"
      },
      {
        path: "src/app/",
        kind: "text",
        purpose: "Entrée App Router"
      },
      {
        path: "content/",
        kind: "md",
        purpose: "Contenus éditoriaux / MDX"
      },
      {
        path: "config/deploy/",
        kind: "yaml",
        purpose: "Configuration de déploiement"
      }
    ],
    modules: plan.modules,
    notes: [...plan.notes, "Draft generator: Next/content-oriented export."]
  };
}
