import type { QualificationResult } from "@/lib/qualification-runtime";
import { buildQualificationExportPackage } from "./qualification-export-pipeline";
import {
  writeExportPackageToDirectory,
  type WriteExportPackageResult
} from "./export-package-writer";

export interface WriteQualificationExportPackageResult {
  qualificationExportVersion: string;
  packageRoot: string;
  writtenFiles: string[];
}

export async function writeQualificationExportPackageToDirectory(args: {
  qualification: QualificationResult;
  outputDir: string;
}): Promise<WriteQualificationExportPackageResult> {
  const { qualification, outputDir } = args;

  const pipeline = buildQualificationExportPackage(qualification);

  const writeResult: WriteExportPackageResult =
    await writeExportPackageToDirectory({
      pkg: pipeline.pkg,
      outputDir
    });

  return {
    qualificationExportVersion: pipeline.qualificationExport.exportVersion,
    packageRoot: writeResult.packageRoot,
    writtenFiles: writeResult.writtenFiles
  };
}
