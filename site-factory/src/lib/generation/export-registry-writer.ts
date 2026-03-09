import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ExportPackageDraft } from "./export-package";
import {
  appendExportRegistryEntry,
  buildExportRegistryEntry,
  type ExportRegistryDraft
} from "./export-registry";

export interface WriteExportRegistryResult {
  registryPath: string;
  entryCount: number;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

async function readRegistryIfExists(
  registryPath: string
): Promise<ExportRegistryDraft | null> {
  try {
    const raw = await readFile(registryPath, "utf8");
    return JSON.parse(raw) as ExportRegistryDraft;
  } catch {
    return null;
  }
}

export async function registerExportPackage(args: {
  outputDir: string;
  packageFolderName: string;
  pkg: ExportPackageDraft;
  createdAt?: string;
}): Promise<WriteExportRegistryResult> {
  const { outputDir, packageFolderName, pkg, createdAt } = args;

  await mkdir(outputDir, { recursive: true });

  const registryPath = path.join(outputDir, "exports.registry.json");
  const current = await readRegistryIfExists(registryPath);

  const entry = buildExportRegistryEntry(
    createdAt
      ? {
          pkg,
          packageFolderName,
          createdAt
        }
      : {
          pkg,
          packageFolderName
        }
  );

  const next = appendExportRegistryEntry({
    registry: current,
    entry
  });

  await writeFile(registryPath, stableStringify(next), "utf8");

  return {
    registryPath,
    entryCount: next.entries.length
  };
}
