import type { ExportPackageDraft } from "./export-package";

export interface ExportRegistryEntry {
  packageVersion: string;
  bundleCount: number;
  primaryGeneratorKey: string | null;
  primaryTechnicalProfile: string | null;
  createdAt: string;
  packageFolderName: string;
}

export interface ExportRegistryDraft {
  registryVersion: "draft-registry-v1";
  entries: ExportRegistryEntry[];
}

export function buildExportRegistryEntry(args: {
  pkg: ExportPackageDraft;
  packageFolderName: string;
  createdAt?: string;
}): ExportRegistryEntry {
  const { pkg, packageFolderName, createdAt } = args;
  const first = pkg.summary[0];

  return {
    packageVersion: pkg.packageVersion,
    bundleCount: pkg.bundleCount,
    primaryGeneratorKey: first?.generatorKey ?? null,
    primaryTechnicalProfile: first?.technicalProfile ?? null,
    createdAt: createdAt ?? new Date().toISOString(),
    packageFolderName
  };
}

export function appendExportRegistryEntry(args: {
  registry: ExportRegistryDraft | null;
  entry: ExportRegistryEntry;
}): ExportRegistryDraft {
  const { registry, entry } = args;

  return {
    registryVersion: "draft-registry-v1",
    entries: [...(registry?.entries ?? []), entry]
  };
}
