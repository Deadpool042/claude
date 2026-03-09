import type { ExportBundleDraft } from "./artifact-export";

export interface ExportLayoutDraft {
  folderName: string;
  relativeRoot: string;
  filesRoot: string;
  metadataFile: string;
}

function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildExportFolderName(bundle: ExportBundleDraft): string {
  const generator = slugifySegment(bundle.artifact.generatorKey);
  const profile = slugifySegment(bundle.artifact.technicalProfile);
  const delivery = slugifySegment(bundle.artifact.deliveryModel);

  return `${generator}__${profile}__${delivery}`;
}

export function buildExportLayoutDraft(
  bundle: ExportBundleDraft
): ExportLayoutDraft {
  const folderName = buildExportFolderName(bundle);

  return {
    folderName,
    relativeRoot: folderName,
    filesRoot: `${folderName}/files`,
    metadataFile: `${folderName}/export.bundle.json`
  };
}
