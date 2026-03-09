import type { QualificationResult } from "@/lib/qualification-runtime";
import { buildQualificationExport } from "@/lib/domain/qualification-export";
import { buildGenerationPlanFromManifest } from "./manifest-adapter";
import { buildGenerationArtifactDraft } from "./generators/router";
import {
  buildExportBundleFromArtifactAndQualification,
  type ExportBundleDraft
} from "./artifact-export";
import {
  buildExportPackageDraft,
  type ExportPackageDraft
} from "./export-package";
import type { GenerationPlan } from "./manifest-adapter";
import type { GenerationArtifactDraft } from "./generators/types";
import type { QualificationExportDraft } from "@/lib/domain/qualification-export";

export interface QualificationExportPipelineDraft {
  qualificationExport: QualificationExportDraft;
  plan: GenerationPlan;
  artifact: GenerationArtifactDraft;
  bundle: ExportBundleDraft;
  pkg: ExportPackageDraft;
}

export function buildQualificationExportPackage(
  qualification: QualificationResult
): QualificationExportPipelineDraft {
  const qualificationExport = buildQualificationExport(qualification);
  const plan = buildGenerationPlanFromManifest(qualification.manifest);
  const artifact = buildGenerationArtifactDraft(plan);
  const bundle = buildExportBundleFromArtifactAndQualification({
    artifact,
    qualification
  });
  const pkg = buildExportPackageDraft([bundle]);

  return {
    qualificationExport,
    plan,
    artifact,
    bundle,
    pkg
  };
}
