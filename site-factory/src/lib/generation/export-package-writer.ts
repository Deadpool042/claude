import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ExportPackageDraft } from "./export-package";
import { buildExportLayoutDraft } from "./export-layout";

export interface WriteExportPackageResult {
  outputDir: string;
  packageRoot: string;
  writtenFiles: string[];
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function buildPackageFolderName(pkg: ExportPackageDraft): string {
  return `site-factory-export-package__${pkg.bundleCount}-bundles`;
}

export async function writeExportPackageToDirectory(args: {
  pkg: ExportPackageDraft;
  outputDir: string;
}): Promise<WriteExportPackageResult> {
  const { pkg, outputDir } = args;
  const packageFolderName = buildPackageFolderName(pkg);
  const packageRoot = path.join(outputDir, packageFolderName);

  await mkdir(packageRoot, { recursive: true });

  const writtenFiles: string[] = [];

  const packageMetadataPath = path.join(packageRoot, "export.package.json");
  await writeFile(packageMetadataPath, stableStringify(pkg), "utf8");
  writtenFiles.push(path.join(packageFolderName, "export.package.json"));

  const bundlesIndexPath = path.join(packageRoot, "bundles.index.json");
  await writeFile(
    bundlesIndexPath,
    stableStringify(
      pkg.summary.map((item, index) => ({
        index,
        generatorKey: item.generatorKey,
        projectKind: item.projectKind,
        technicalProfile: item.technicalProfile,
        deliveryModel: item.deliveryModel,
        mutualizationLevel: item.mutualizationLevel,
        deployTarget: item.deployTarget,
        fileCount: item.fileCount
      }))
    ),
    "utf8"
  );
  writtenFiles.push(path.join(packageFolderName, "bundles.index.json"));

  for (const bundle of pkg.bundles) {
    const layout = buildExportLayoutDraft(bundle);
    const bundleRoot = path.join(packageRoot, layout.relativeRoot);
    const bundleFilesRoot = path.join(bundleRoot, "files");

    await mkdir(bundleFilesRoot, { recursive: true });

    const bundleMetadataPath = path.join(bundleRoot, "export.bundle.json");
    await writeFile(bundleMetadataPath, stableStringify(bundle), "utf8");
    writtenFiles.push(
      path.join(packageFolderName, layout.relativeRoot, "export.bundle.json")
    );

    for (const file of bundle.files) {
      const relativePath = path.join(
        packageFolderName,
        layout.relativeRoot,
        "files",
        file.path
      );
      const absolutePath = path.join(outputDir, relativePath);

      await mkdir(path.dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, file.content, "utf8");
      writtenFiles.push(relativePath);
    }
  }

  return {
    outputDir,
    packageRoot,
    writtenFiles
  };
}
