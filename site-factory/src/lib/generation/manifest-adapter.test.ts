import { describe, expect, it } from "vitest";
import type { QualificationInput } from "@/lib/qualification-runtime";
import { buildCanonicalProjectInputDraft } from "@/lib/domain/canonical-input";
import { runDecisionEngine } from "@/lib/domain/decision-engine";
import { buildProjectManifestDraft } from "@/lib/domain/project-manifest";
import { buildGenerationPlanFromManifest } from "./manifest-adapter";

describe("buildGenerationPlanFromManifest", () => {
  const baseInput: QualificationInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: ["seo", "forms"],
    billingMode: "SOLO",
    deployTarget: "SHARED_HOSTING",
    wpHeadless: false,
    catSelections: {}
  };

  it("routes wordpress business profiles to wordpress generator", () => {
    const canonicalInput = buildCanonicalProjectInputDraft(baseInput);
    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory: "CAT1"
    });
    const manifest = buildProjectManifestDraft({
      canonicalInput,
      decision,
      finalCategory: "CAT1"
    });

    const plan = buildGenerationPlanFromManifest(manifest);

    expect(plan.profile).toBe("WP_BUSINESS_EXTENDED");
    expect(plan.generatorKey).toBe("wordpress-site");
    expect(plan.modules).toEqual(["seo", "forms"]);
    expect(plan.deployTarget).toBe("SHARED_HOSTING");
  });

  it("routes next/mdx editorial profiles to next generator", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      projectType: "BLOG",
      techStack: "NEXTJS",
      deployTarget: "VERCEL"
    });
    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory: "CAT2"
    });
    const manifest = buildProjectManifestDraft({
      canonicalInput,
      decision,
      finalCategory: "CAT2"
    });

    const plan = buildGenerationPlanFromManifest(manifest);

    expect(plan.profile).toBe("NEXT_MDX_EDITORIAL");
    expect(plan.generatorKey).toBe("next-content-site");
    expect(plan.deployTarget).toBe("VERCEL");
  });

  it("routes custom app profiles to custom app generator", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      projectType: "APP",
      techStack: "NEXTJS",
      deployTarget: "DOCKER"
    });
    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory: "CAT3"
    });
    const manifest = buildProjectManifestDraft({
      canonicalInput,
      decision,
      finalCategory: "CAT3"
    });

    const plan = buildGenerationPlanFromManifest(manifest);

    expect(plan.profile).toBe("CUSTOM_APP_MANAGED");
    expect(plan.generatorKey).toBe("custom-app");
  });

  it("routes operated content product to operated template generator", () => {
    const canonicalInput = buildCanonicalProjectInputDraft({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      selectedModuleIds: ["seo"]
    });
    const decision = runDecisionEngine({
      canonicalInput,
      finalCategory: "CAT2"
    });
    const manifest = buildProjectManifestDraft({
      canonicalInput,
      decision,
      finalCategory: "CAT2"
    });

    const plan = buildGenerationPlanFromManifest(manifest);

    expect(plan.profile).toBe("OPERATED_CONTENT_PRODUCT");
    expect(plan.generatorKey).toBe("operated-template");
    expect(plan.notes.some(note => note.includes("operated"))).toBe(true);
  });
});
