import { describe, expect, it } from "vitest";
import {
  qualifyProject,
  type QualificationInput
} from "@/lib/qualification-runtime";
import { buildQualificationSummary } from "./qualification-summary";
import { buildQualificationReport } from "./qualification-report";

describe("buildQualificationReport", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("builds a readable report for a standardizable wordpress project", () => {
    const result = qualifyProject(baseInput);
    const summary = buildQualificationSummary(result);
    const report = buildQualificationReport(summary);

    expect(report.projectIdentity.technicalProfile).toBe(
      "WP_BUSINESS_EXTENDED"
    );
    expect(report.projectIdentity.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(report.projectIdentity.mutualizationLevel).toBe("SHARED_SOCLE");

    expect(report.standardizationSnapshot.status).toBe(
      "STANDARDIZATION_CANDIDATE"
    );
    expect(report.standardizationSnapshot.recommendedDeliveryShift).toBe(
      "MANAGED_STANDARDIZED"
    );
    expect(report.consistencyFlags.deliveryModelAligned).toBe(true);
  });

  it("builds an operated-oriented report for an operated-compatible project", () => {
    const result = qualifyProject({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      selectedModuleIds: ["seo"]
    });
    const summary = buildQualificationSummary(result);
    const report = buildQualificationReport(summary);

    expect(report.standardizationSnapshot.status).toBe("OPERATED_CANDIDATE");
    expect(report.standardizationSnapshot.recommendedDeliveryShift).toBe(
      "OPERATED_PRODUCT"
    );
    expect(report.projectIdentity.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(
      report.operationalNotes.some(note => note.includes("Shift recommandé"))
    ).toBe(true);
  });

  it("keeps a custom-only report for a dedicated business app", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      selectedModuleIds: ["crm", "erp"]
    });
    const summary = buildQualificationSummary(result);
    const report = buildQualificationReport(summary);

    expect(report.standardizationSnapshot.status).toBe("CUSTOM_ONLY");
    expect(report.standardizationSnapshot.recommendedDeliveryShift).toBeNull();
    expect(report.projectIdentity.technicalProfile).toBe("CUSTOM_APP_MANAGED");
    expect(report.consistencyFlags.technicalProfileAligned).toBe(true);
  });
});
