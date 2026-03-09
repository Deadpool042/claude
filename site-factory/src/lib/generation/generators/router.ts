import type { GenerationPlan } from "../manifest-adapter";
import type { GenerationArtifactDraft } from "./types";
import { buildNextContentSiteDraft } from "./next-content-site";
import { buildWordpressSiteDraft } from "./wordpress-site";

export function buildGenerationArtifactDraft(
  plan: GenerationPlan
): GenerationArtifactDraft {
  switch (plan.generatorKey) {
    case "wordpress-site":
      return buildWordpressSiteDraft(plan);

    case "next-content-site":
      return buildNextContentSiteDraft(plan);

    case "custom-app":
      return {
        generatorKey: plan.generatorKey,
        projectKind: "custom-app",
        files: [
          {
            path: "project.manifest.json",
            kind: "json",
            purpose: "Manifest projet exporté"
          },
          {
            path: "src/",
            kind: "text",
            purpose: "Entrée application custom"
          }
        ],
        modules: plan.modules,
        notes: [...plan.notes, "Draft generator: custom app placeholder."]
      };

    case "operated-template":
      return {
        generatorKey: plan.generatorKey,
        projectKind: "operated-template",
        files: [
          {
            path: "project.manifest.json",
            kind: "json",
            purpose: "Manifest projet exporté"
          },
          {
            path: "template/",
            kind: "text",
            purpose: "Base opérée mutualisable"
          }
        ],
        modules: plan.modules,
        notes: [
          ...plan.notes,
          "Draft generator: operated template placeholder."
        ]
      };

    default: {
      const _never: never = plan.generatorKey;
      return _never;
    }
  }
}
