export interface GenerationFileDraft {
  path: string;
  kind: "json" | "yaml" | "ts" | "md" | "env" | "text";
  purpose: string;
}

export interface GenerationArtifactDraft {
  generatorKey: string;
  projectKind: string;
  files: GenerationFileDraft[];
  modules: string[];
  notes: string[];
}
