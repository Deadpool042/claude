import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ExportBundleDraft } from "./artifact-export";
import { buildExportLayoutDraft } from "./export-layout";

export interface WriteExportBundleResult {
  outputDir: string;
  bundleRoot: string;
  writtenFiles: string[];
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export async function writeExportBundleToDirectory(args: {
  bundle: ExportBundleDraft;
  outputDir: string;
}): Promise<WriteExportBundleResult> {
  const { bundle, outputDir } = args;
  const layout = buildExportLayoutDraft(bundle);
  const bundleRoot = path.join(outputDir, layout.relativeRoot);

  await mkdir(bundleRoot, { recursive: true });
  await mkdir(path.join(outputDir, layout.filesRoot), { recursive: true });

  const writtenFiles: string[] = [];

  const metadataAbsolutePath = path.join(outputDir, layout.metadataFile);
  await mkdir(path.dirname(metadataAbsolutePath), { recursive: true });
  await writeFile(metadataAbsolutePath, stableStringify(bundle), "utf8");
  writtenFiles.push(layout.metadataFile);

  for (const file of bundle.files) {
    const relativePath = path.join(layout.relativeRoot, "files", file.path);
    const absolutePath = path.join(outputDir, relativePath);
    const parentDir = path.dirname(absolutePath);

    await mkdir(parentDir, { recursive: true });
    await writeFile(absolutePath, file.content, "utf8");

    writtenFiles.push(relativePath);
  }

  return {
    outputDir,
    bundleRoot,
    writtenFiles
  };
}
