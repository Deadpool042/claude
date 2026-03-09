export interface GenerationFileDraft {
  path: string;
  kind: "json" | "yaml" | "ts" | "md" | "env" | "text";
  purpose: string;
}

export interface GenerationArtifactDraft {
  generatorKey: string;
  projectKind: string;
  identity: {
    manifestVersion: "draft-v1";
    technicalProfile: string;
    deliveryModel: string;
    mutualizationLevel: string;
  };
  structure: {
    rootPaths: string[];
    fileCount: number;
  };
  files: GenerationFileDraft[];
  modules: string[];
  deployTarget: string;
  notes: string[];
}
