import type { ExportBundleDraft } from "./artifact-export";

export interface ExportPackageBundleSummary {
  generatorKey: string;
  projectKind: string;
  technicalProfile: string;
  deliveryModel: string;
  mutualizationLevel: string;
  deployTarget: string;
  fileCount: number;
}

export interface ExportPackageDraft {
  packageVersion: "draft-package-v1";
  bundleCount: number;
  bundles: ExportBundleDraft[];
  summary: ExportPackageBundleSummary[];
  notes: string[];
}

function buildBundleSummary(
  bundle: ExportBundleDraft
): ExportPackageBundleSummary {
  return {
    generatorKey: bundle.artifact.generatorKey,
    projectKind: bundle.artifact.projectKind,
    technicalProfile: bundle.artifact.technicalProfile,
    deliveryModel: bundle.artifact.deliveryModel,
    mutualizationLevel: bundle.artifact.mutualizationLevel,
    deployTarget: bundle.artifact.deployTarget,
    fileCount: bundle.files.length
  };
}

export function buildExportPackageDraft(
  bundles: ExportBundleDraft[]
): ExportPackageDraft {
  return {
    packageVersion: "draft-package-v1",
    bundleCount: bundles.length,
    bundles,
    summary: bundles.map(buildBundleSummary),
    notes: [
      `Package contains ${bundles.length} export bundle(s).`,
      "Draft package: filesystem-friendly export aggregation."
    ]
  };
}
