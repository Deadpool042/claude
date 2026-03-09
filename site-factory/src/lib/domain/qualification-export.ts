import type { QualificationResult } from "@/lib/qualification-runtime";
import { buildQualificationSummary } from "./qualification-summary";
import {
  buildQualificationReport,
  type QualificationReport
} from "./qualification-report";

export interface QualificationExportDraft {
  exportVersion: "draft-qualification-export-v1";
  generatedFrom: {
    technicalProfile: string;
    deliveryModel: string;
    mutualizationLevel: string;
    deployTarget: string;
  };
  report: QualificationReport;
}

export function buildQualificationExport(
  result: QualificationResult
): QualificationExportDraft {
  const summary = buildQualificationSummary(result);
  const report = buildQualificationReport(summary);

  return {
    exportVersion: "draft-qualification-export-v1",
    generatedFrom: {
      technicalProfile: summary.projectIdentity.technicalProfile,
      deliveryModel: summary.projectIdentity.deliveryModel,
      mutualizationLevel: summary.projectIdentity.mutualizationLevel,
      deployTarget: summary.projectIdentity.deployTarget
    },
    report
  };
}
