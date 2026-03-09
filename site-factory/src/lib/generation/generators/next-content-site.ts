import type { GenerationPlan } from "../manifest-adapter";
import type { GenerationArtifactDraft } from "./types";

export function buildNextContentSiteDraft(
  plan: GenerationPlan
): GenerationArtifactDraft {
  const files = [
    {
      path: "project.manifest.json",
      kind: "json" as const,
      purpose: "Manifest projet exporté"
    },
    {
      path: "src/app/",
      kind: "text" as const,
      purpose: "Entrée App Router"
    },
    {
      path: "content/",
      kind: "md" as const,
      purpose: "Contenus éditoriaux / MDX"
    },
    {
      path: "config/deploy/",
      kind: "yaml" as const,
      purpose: "Configuration de déploiement"
    }
  ];

  return {
    generatorKey: plan.generatorKey,
    projectKind: "next-content-site",
    identity: {
      manifestVersion: "draft-v1",
      technicalProfile: plan.profile,
      deliveryModel: plan.deliveryModel,
      mutualizationLevel: plan.mutualizationLevel
    },
    structure: {
      rootPaths: ["src/", "content/", "config/"],
      fileCount: files.length
    },
    files,
    modules: plan.modules,
    deployTarget: plan.deployTarget,
    notes: [...plan.notes, "Draft generator: Next/content-oriented export."]
  };
}
