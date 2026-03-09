import type { GenerationPlan } from "../manifest-adapter";
import type { GenerationArtifactDraft } from "./types";
import { buildNextContentSiteDraft } from "./next-content-site";
import { buildWordpressSiteDraft } from "./wordpress-site";

function buildPlaceholderArtifactDraft(
  plan: GenerationPlan,
  args: {
    projectKind: string;
    rootPaths: string[];
    extraNote: string;
    extraFiles: {
      path: string;
      kind: "json" | "yaml" | "ts" | "md" | "env" | "text";
      purpose: string;
    }[];
  }
): GenerationArtifactDraft {
  const files = [
    {
      path: "project.manifest.json",
      kind: "json" as const,
      purpose: "Manifest projet exporté"
    },
    ...args.extraFiles
  ];

  return {
    generatorKey: plan.generatorKey,
    projectKind: args.projectKind,
    identity: {
      manifestVersion: "draft-v1",
      technicalProfile: plan.profile,
      deliveryModel: plan.deliveryModel,
      mutualizationLevel: plan.mutualizationLevel
    },
    structure: {
      rootPaths: args.rootPaths,
      fileCount: files.length
    },
    files,
    modules: plan.modules,
    deployTarget: plan.deployTarget,
    notes: [...plan.notes, args.extraNote]
  };
}

export function buildGenerationArtifactDraft(
  plan: GenerationPlan
): GenerationArtifactDraft {
  switch (plan.generatorKey) {
    case "wordpress-site":
      return buildWordpressSiteDraft(plan);

    case "next-content-site":
      return buildNextContentSiteDraft(plan);

    case "custom-app":
      return buildPlaceholderArtifactDraft(plan, {
        projectKind: "custom-app",
        rootPaths: ["src/"],
        extraNote: "Draft generator: custom app placeholder.",
        extraFiles: [
          {
            path: "src/",
            kind: "text",
            purpose: "Entrée application custom"
          }
        ]
      });

    case "operated-template":
      return buildPlaceholderArtifactDraft(plan, {
        projectKind: "operated-template",
        rootPaths: ["template/"],
        extraNote: "Draft generator: operated template placeholder.",
        extraFiles: [
          {
            path: "template/",
            kind: "text",
            purpose: "Base opérée mutualisable"
          }
        ]
      });

    default: {
      const _never: never = plan.generatorKey;
      return _never;
    }
  }
}
