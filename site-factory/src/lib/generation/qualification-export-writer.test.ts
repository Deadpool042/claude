import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  qualifyProject,
  type QualificationInput
} from "@/lib/qualification-runtime";
import { writeQualificationExportPackageToDirectory } from "./qualification-export-writer";

describe("writeQualificationExportPackageToDirectory", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("writes an enriched export package for a standardizable wordpress project", async () => {
    const qualification = qualifyProject(baseInput);
    const tempDir = await mkdtemp(
      path.join(os.tmpdir(), "sf-qualification-export-")
    );

    try {
      const result = await writeQualificationExportPackageToDirectory({
        qualification,
        outputDir: tempDir
      });

      expect(result.qualificationExportVersion).toBe(
        "draft-qualification-export-v1"
      );
      expect(result.packageRoot).toContain(
        "site-factory-export-package__1-bundles"
      );
      expect(
        result.writtenFiles.some(file =>
          file.endsWith("files/qualification.report.json")
        )
      ).toBe(true);

      const reportJson = await readFile(
        path.join(
          result.packageRoot,
          "wordpress-site__wp-business-extended__delivered-custom",
          "files",
          "qualification.report.json"
        ),
        "utf8"
      );

      expect(reportJson).toContain("draft-qualification-export-v1");
      expect(reportJson).toContain("WP_BUSINESS_EXTENDED");
      expect(reportJson).toContain("STANDARDIZATION_CANDIDATE");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("writes an operated-oriented enriched export package", async () => {
    const qualification = qualifyProject({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      selectedModuleIds: ["seo"]
    });
    const tempDir = await mkdtemp(
      path.join(os.tmpdir(), "sf-qualification-export-")
    );

    try {
      const result = await writeQualificationExportPackageToDirectory({
        qualification,
        outputDir: tempDir
      });

      const reportJson = await readFile(
        path.join(
          result.packageRoot,
          "operated-template__operated-content-product__managed-standardized",
          "files",
          "qualification.report.json"
        ),
        "utf8"
      );

      expect(reportJson).toContain("OPERATED_CANDIDATE");
      expect(reportJson).toContain("OPERATED_PRODUCT");
      expect(reportJson).toContain("MANAGED_STANDARDIZED");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("writes a custom-only enriched export package for a dedicated business app", async () => {
    const qualification = qualifyProject({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      selectedModuleIds: ["crm", "erp"]
    });
    const tempDir = await mkdtemp(
      path.join(os.tmpdir(), "sf-qualification-export-")
    );

    try {
      const result = await writeQualificationExportPackageToDirectory({
        qualification,
        outputDir: tempDir
      });

      const reportJson = await readFile(
        path.join(
          result.packageRoot,
          "custom-app__custom-app-managed__delivered-custom",
          "files",
          "qualification.report.json"
        ),
        "utf8"
      );

      expect(reportJson).toContain("CUSTOM_ONLY");
      expect(reportJson).toContain("CUSTOM_APP_MANAGED");
      expect(reportJson).toContain("DEDICATED");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
