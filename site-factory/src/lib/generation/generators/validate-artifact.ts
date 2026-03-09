import type { GenerationArtifactDraft } from "./types";

export interface GenerationArtifactValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateGenerationArtifactDraft(
  artifact: GenerationArtifactDraft
): GenerationArtifactValidationResult {
  const errors: string[] = [];

  if (!artifact.generatorKey) {
    errors.push("Missing generatorKey.");
  }

  if (!artifact.projectKind) {
    errors.push("Missing projectKind.");
  }

  if (artifact.files.length === 0) {
    errors.push("At least one file draft is required.");
  }

  if (artifact.structure.fileCount !== artifact.files.length) {
    errors.push("structure.fileCount must match files.length.");
  }

  if (artifact.structure.rootPaths.length === 0) {
    errors.push("At least one root path is required.");
  }

  if (!artifact.identity.technicalProfile) {
    errors.push("Missing identity.technicalProfile.");
  }

  if (!artifact.identity.deliveryModel) {
    errors.push("Missing identity.deliveryModel.");
  }

  if (!artifact.identity.mutualizationLevel) {
    errors.push("Missing identity.mutualizationLevel.");
  }

  const hasManifestFile = artifact.files.some(
    file => file.path === "project.manifest.json"
  );

  if (!hasManifestFile) {
    errors.push("Missing project.manifest.json draft.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
