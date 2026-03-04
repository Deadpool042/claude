import { describe, it, expect } from "vitest";
import {
  MODULE_CATALOG,
  normalizeModuleId,
  normalizeCanonicalModuleIds,
  normalizeModuleIds,
  getAllowedDeployTargets,
} from "../../lib/referential";
import { computeStackMultiplier, getMultiplierLabel } from "../../lib/stack-pricing";
import {
  resolveModuleMonthly,
  resolveModulePrice,
  resolveModuleRequalification,
} from "../../lib/module-pricing";
import { qualifyProject, type QualificationInput } from "../../lib/qualification-runtime";

const assistantModule = MODULE_CATALOG.find(
  (module) => module.id === "module.MARKETING_AUTOMATION",
);

if (!assistantModule) {
  throw new Error("module.MARKETING_AUTOMATION missing from catalog");
}

describe("normalizeModuleId", () => {
  it("keeps a valid module id", () => {
    expect(normalizeModuleId("module.B2B_COMMERCE")).toBe("module.B2B_COMMERCE");
  });

  it("rejects legacy module ids", () => {
    expect(normalizeModuleId("assistant-ia")).toBeNull();
    expect(normalizeModuleId("tunnel-vente")).toBeNull();
  });

  it("returns null for unknown ids", () => {
    expect(normalizeModuleId("unknown-module")).toBeNull();
  });
});

describe("normalizeModuleIds", () => {
  it("deduplicates and ignores unknown ids", () => {
    expect(
      normalizeModuleIds([
        "module.MARKETING_AUTOMATION",
        "module.B2B_COMMERCE",
        "module.MARKETING_AUTOMATION",
        "unknown",
      ]),
    ).toEqual(["module.MARKETING_AUTOMATION", "module.B2B_COMMERCE"]);
  });
});

describe("normalizeCanonicalModuleIds", () => {
  it("normalizes from mixed ids and deduplicates", () => {
    expect(
      normalizeCanonicalModuleIds([
        "module.ERP_INTEGRATIONS",
        "module.ERP_INTEGRATIONS",
        "module.LOGISTICS_ORCHESTRATION",
        "unknown",
      ]),
    ).toEqual(["module.ERP_INTEGRATIONS", "module.LOGISTICS_ORCHESTRATION"]);
  });
});

describe("computeStackMultiplier", () => {
  it("returns the stack complexity factor", () => {
    expect(computeStackMultiplier("VITRINE", "NEXTJS")).toBe(1.3);
  });

  it("keeps WordPress as the reference stack", () => {
    expect(computeStackMultiplier("VITRINE", "WORDPRESS")).toBe(1);
  });
});

describe("resolveModulePrice", () => {
  it("uses the selected setup tier on WordPress", () => {
    const resolved = resolveModulePrice(
      assistantModule,
      "VITRINE",
      "WORDPRESS",
      false,
      { setupCatId: "automation-standard" },
    );

    expect(resolved).toEqual({
      setup: 1300,
      setupMax: null,
      isCustom: false,
    });
  });

  it("applies stack multiplier on JS stacks", () => {
    const moduleWithMultiplier = MODULE_CATALOG.find((mod) => mod.jsMultiplier > 1);
    expect(moduleWithMultiplier).toBeDefined();

    const resolved = resolveModulePrice(
      moduleWithMultiplier!,
      "VITRINE",
      "NEXTJS",
      false,
      undefined,
    );

    expect(resolved.setup).toBe(Math.round(moduleWithMultiplier!.priceSetup * moduleWithMultiplier!.jsMultiplier));
  });
});

describe("resolveModuleMonthly", () => {
  it("uses the selected subscription tier", () => {
    expect(resolveModuleMonthly(assistantModule, { subCatId: "automation-business" })).toBe(
      79,
    );
  });

  it("falls back to the module default", () => {
    expect(resolveModuleMonthly(assistantModule)).toBe(29);
  });
});

describe("resolveModuleRequalification", () => {
  it("respects the selected setup tier", () => {
    expect(
      resolveModuleRequalification(assistantModule, { setupCatId: "automation-avance" }),
    ).toBe("CAT3");
  });

  it("falls back to the module default", () => {
    expect(resolveModuleRequalification(assistantModule)).toBe("CAT2");
  });
});

describe("getMultiplierLabel", () => {
  it("formats the multiplier for display", () => {
    expect(getMultiplierLabel("VITRINE", "NEXTJS")).toBe("×1.3");
  });

  it("returns empty string for the reference stack", () => {
    expect(getMultiplierLabel("VITRINE", "WORDPRESS")).toBe("");
  });
});

describe("getAllowedDeployTargets", () => {
  it("restricts WP headless to docker or shared hosting", () => {
    expect(getAllowedDeployTargets("WORDPRESS", true)).toEqual([
      "SHARED_HOSTING",
      "DOCKER",
    ]);
  });

  it("allows Vercel for JS stacks", () => {
    expect(getAllowedDeployTargets("NEXTJS", false)).toEqual(["DOCKER", "VERCEL"]);
  });
});

describe("qualifyProject", () => {
  const baseInput = {
    projectType: "VITRINE",
    techStack: "WORDPRESS",
    selectedModuleIds: [],
    billingMode: "SOLO",
    deployTarget: "DOCKER",
    wpHeadless: false,
  } satisfies QualificationInput;

  it("VITRINE with structuring module escalates from CAT0", () => {
    const result = qualifyProject({
      ...baseInput,
      selectedModuleIds: ["module.MARKETING_AUTOMATION"],
    });

    expect(result.initialCategory).toBe("CAT0");
    expect(result.finalCategory).toBe("CAT2");
    expect(result.modules).toHaveLength(1);
  });

  it("keeps the base tier for non-WP e-commerce", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "ECOM",
      techStack: "NEXTJS",
    });

    expect(result.initialCategory).toBe("CAT3");
    expect(result.finalCategory).toBe("CAT3");
    expect(result.wasRequalified).toBe(false);
  });

  it("forces CAT4 for WordPress headless", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "VITRINE",
      techStack: "WORDPRESS",
      wpHeadless: true,
    });

    expect(result.initialCategory).toBe("CAT0");
    expect(result.finalCategory).toBe("CAT4");
    expect(result.wasRequalified).toBe(true);
    expect(result.requalifyingModules).toHaveLength(0);
  });

  it("requalifies based on traffic constraints", () => {
    const result = qualifyProject({
      ...baseInput,
      constraints: { trafficLevel: "HIGH" },
    });

    expect(result.finalCategory).toBe("CAT2");
  });

  it("requalifies based on data sensitivity constraints", () => {
    const result = qualifyProject({
      ...baseInput,
      constraints: { dataSensitivity: "REGULATED" },
    });

    expect(result.finalCategory).toBe("CAT3");
  });

  it("requalifies based on module tiers", () => {
    const result = qualifyProject({
      ...baseInput,
      selectedModuleIds: ["module.MARKETING_AUTOMATION"],
      catSelections: {
        "module.MARKETING_AUTOMATION": { setupCatId: "automation-avance" },
      },
    });

    expect(result.finalCategory).toBe("CAT3");
    expect(result.wasRequalified).toBe(true);
    expect(result.requalifyingModules.map((mod) => mod.id)).toEqual([
      "module.MARKETING_AUTOMATION",
    ]);
  });

  it("computes financial splits in sous-traitant mode", () => {
    const result = qualifyProject({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      selectedModuleIds: ["module.MARKETING_AUTOMATION"],
      catSelections: {
        "module.MARKETING_AUTOMATION": { setupCatId: "automation-standard" },
      },
    });

    expect(result.finalCategory).toBe("CAT2");
    expect(result.splits).not.toBeNull();
    expect(result.splits?.baseSplitPrestataire).toBe(70);
    expect(result.splits?.baseSplitAgence).toBe(30);
    expect(result.splits?.modulesSplitPrestataire).toBe(780);
    expect(result.splits?.modulesSplitAgence).toBe(520);
  });
});
