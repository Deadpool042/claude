import { describe, expect, it } from "vitest";
import {
  qualifyProject,
  type QualificationInput
} from "@/lib/qualification-runtime";
import { buildQualificationExportPackage } from "./qualification-export-pipeline";

describe("buildQualificationExportPackage", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("builds an enriched export package for a standardizable wordpress project", () => {
    const qualification = qualifyProject(baseInput);
    const pipeline = buildQualificationExportPackage(qualification);

    expect(pipeline.qualificationExport.exportVersion).toBe(
      "draft-qualification-export-v1"
    );
    expect(pipeline.plan.profile).toBe("WP_BUSINESS_EXTENDED");
    expect(pipeline.artifact.generatorKey).toBe("wordpress-site");
    expect(pipeline.bundle.files.map(file => file.path)).toEqual([
      "project.manifest.export.json",
      "README.export.md",
      "files.index.json",
      "qualification.report.json"
    ]);
    expect(pipeline.pkg.bundleCount).toBe(1);
    expect(pipeline.pkg.summary[0]?.technicalProfile).toBe(
      "WP_BUSINESS_EXTENDED"
    );
  });

  it("builds an operated-oriented export package", () => {
    const qualification = qualifyProject({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      selectedModuleIds: ["seo"]
    });
    const pipeline = buildQualificationExportPackage(qualification);

    expect(
      pipeline.qualificationExport.report.standardizationSnapshot.status
    ).toBe("OPERATED_CANDIDATE");
    expect(pipeline.plan.generatorKey).toBe("operated-template");
    expect(pipeline.artifact.generatorKey).toBe("operated-template");
    expect(pipeline.bundle.artifact.deliveryModel).toBe("MANAGED_STANDARDIZED");
    expect(pipeline.pkg.summary[0]?.generatorKey).toBe("operated-template");
  });

  it("builds a custom-only export package for a dedicated business app", () => {
    const qualification = qualifyProject({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      selectedModuleIds: ["crm", "erp"]
    });
    const pipeline = buildQualificationExportPackage(qualification);

    expect(
      pipeline.qualificationExport.report.standardizationSnapshot.status
    ).toBe("CUSTOM_ONLY");
    expect(pipeline.plan.generatorKey).toBe("custom-app");
    expect(pipeline.artifact.projectKind).toBe("custom-app");
    expect(
      pipeline.bundle.files.some(
        file => file.path === "qualification.report.json"
      )
    ).toBe(true);
    expect(pipeline.pkg.summary[0]?.technicalProfile).toBe(
      "CUSTOM_APP_MANAGED"
    );
  });
});
