import { describe, expect, it } from "vitest";
import {
  qualifyProject,
  type QualificationInput
} from "@/lib/qualification-runtime";
import { buildQualificationExport } from "./qualification-export";

describe("buildQualificationExport", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("builds a stable qualification export for a standardizable wordpress project", () => {
    const result = qualifyProject(baseInput);
    const exported = buildQualificationExport(result);

    expect(exported.exportVersion).toBe("draft-qualification-export-v1");
    expect(exported.generatedFrom.technicalProfile).toBe(
      "WP_BUSINESS_EXTENDED"
    );
    expect(exported.generatedFrom.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(exported.generatedFrom.mutualizationLevel).toBe("SHARED_SOCLE");

    expect(exported.report.standardizationSnapshot.status).toBe(
      "STANDARDIZATION_CANDIDATE"
    );
    expect(
      exported.report.standardizationSnapshot.recommendedDeliveryShift
    ).toBe("MANAGED_STANDARDIZED");
  });

  it("builds an operated-oriented qualification export", () => {
    const result = qualifyProject({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      selectedModuleIds: ["seo"]
    });
    const exported = buildQualificationExport(result);

    expect(exported.generatedFrom.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(exported.generatedFrom.mutualizationLevel).toBe(
      "MUTUALIZED_SINGLE_TENANT"
    );

    expect(exported.report.standardizationSnapshot.status).toBe(
      "OPERATED_CANDIDATE"
    );
    expect(
      exported.report.standardizationSnapshot.recommendedDeliveryShift
    ).toBe("OPERATED_PRODUCT");
    expect(
      exported.report.operationalNotes.some(note =>
        note.includes("Shift recommandé")
      )
    ).toBe(true);
  });

  it("builds a custom-only qualification export for a dedicated business app", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      selectedModuleIds: ["crm", "erp"]
    });
    const exported = buildQualificationExport(result);

    expect(exported.generatedFrom.technicalProfile).toBe("CUSTOM_APP_MANAGED");
    expect(exported.generatedFrom.deliveryModel).toBe("DELIVERED_CUSTOM");
    expect(exported.generatedFrom.mutualizationLevel).toBe("DEDICATED");

    expect(exported.report.standardizationSnapshot.status).toBe("CUSTOM_ONLY");
    expect(
      exported.report.standardizationSnapshot.recommendedDeliveryShift
    ).toBeNull();
    expect(exported.report.consistencyFlags.technicalProfileAligned).toBe(true);
  });
});
