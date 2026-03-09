import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ExportBundleDraft } from "./artifact-export";

export interface WriteExportBundleResult {
  outputDir: string;
  writtenFiles: string[];
}

export async function writeExportBundleToDirectory(args: {
  bundle: ExportBundleDraft;
  outputDir: string;
}): Promise<WriteExportBundleResult> {
  const { bundle, outputDir } = args;

  await mkdir(outputDir, { recursive: true });

  const writtenFiles: string[] = [];

  for (const file of bundle.files) {
    const absolutePath = path.join(outputDir, file.path);
    const parentDir = path.dirname(absolutePath);

    await mkdir(parentDir, { recursive: true });
    await writeFile(absolutePath, file.content, "utf8");

    writtenFiles.push(file.path);
  }

  return {
    outputDir,
    writtenFiles
  };
}
