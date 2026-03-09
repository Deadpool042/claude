import type { GenerationArtifactDraft } from "./generators/types";

export interface ExportBundleFileDraft {
  path: string;
  content: string;
  kind: "json" | "yaml" | "ts" | "md" | "env" | "text";
}

export interface ExportBundleDraft {
  exportVersion: "draft-export-v1";
  artifact: {
    generatorKey: string;
    projectKind: string;
    technicalProfile: string;
    deliveryModel: string;
    mutualizationLevel: string;
    deployTarget: string;
  };
  files: ExportBundleFileDraft[];
  notes: string[];
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function buildManifestJsonFile(
  artifact: GenerationArtifactDraft
): ExportBundleFileDraft {
  return {
    path: "project.manifest.export.json",
    kind: "json",
    content: stableStringify({
      exportVersion: "draft-export-v1",
      generatorKey: artifact.generatorKey,
      projectKind: artifact.projectKind,
      identity: artifact.identity,
      structure: artifact.structure,
      modules: artifact.modules,
      deployTarget: artifact.deployTarget,
      notes: artifact.notes
    })
  };
}

function buildReadmeFile(
  artifact: GenerationArtifactDraft
): ExportBundleFileDraft {
  const lines = [
    `# Export draft — ${artifact.projectKind}`,
    "",
    `- Generator: ${artifact.generatorKey}`,
    `- Technical profile: ${artifact.identity.technicalProfile}`,
    `- Delivery model: ${artifact.identity.deliveryModel}`,
    `- Mutualization level: ${artifact.identity.mutualizationLevel}`,
    `- Deploy target: ${artifact.deployTarget}`,
    "",
    "## Root paths",
    ...artifact.structure.rootPaths.map(path => `- ${path}`),
    "",
    "## Files",
    ...artifact.files.map(file => `- ${file.path} — ${file.purpose}`),
    "",
    "## Modules",
    ...(artifact.modules.length > 0
      ? artifact.modules.map(moduleId => `- ${moduleId}`)
      : ["- none"]),
    "",
    "## Notes",
    ...(artifact.notes.length > 0
      ? artifact.notes.map(note => `- ${note}`)
      : ["- none"]),
    ""
  ];

  return {
    path: "README.export.md",
    kind: "md",
    content: lines.join("\n")
  };
}

function buildFileIndex(
  artifact: GenerationArtifactDraft
): ExportBundleFileDraft {
  return {
    path: "files.index.json",
    kind: "json",
    content: stableStringify(
      artifact.files.map(file => ({
        path: file.path,
        kind: file.kind,
        purpose: file.purpose
      }))
    )
  };
}

export function buildExportBundleFromArtifact(
  artifact: GenerationArtifactDraft
): ExportBundleDraft {
  const files: ExportBundleFileDraft[] = [
    buildManifestJsonFile(artifact),
    buildReadmeFile(artifact),
    buildFileIndex(artifact)
  ];

  return {
    exportVersion: "draft-export-v1",
    artifact: {
      generatorKey: artifact.generatorKey,
      projectKind: artifact.projectKind,
      technicalProfile: artifact.identity.technicalProfile,
      deliveryModel: artifact.identity.deliveryModel,
      mutualizationLevel: artifact.identity.mutualizationLevel,
      deployTarget: artifact.deployTarget
    },
    files,
    notes: artifact.notes
  };
}
