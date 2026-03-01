import { describe, it, expect } from "vitest";
import {
  computeStackMultiplier,
  getAllowedDeployTargets,
  getMultiplierLabel,
  MODULE_CATALOG,
  normalizeModuleId,
  normalizeModuleIds,
  qualifyProject,
  resolveModuleMonthly,
  resolveModulePrice,
  resolveModuleRequalification,
  type QualificationInput,
} from "../../lib/qualification";

const assistantModule = MODULE_CATALOG.find(
  (module) => module.id === "module-assistant-ia",
);

if (!assistantModule) {
  throw new Error("module-assistant-ia missing from catalog");
}

describe("normalizeModuleId", () => {
  it("keeps a valid module id", () => {
    expect(normalizeModuleId("module-paiement")).toBe("module-paiement");
  });

  it("maps legacy module ids", () => {
    expect(normalizeModuleId("assistant-ia")).toBe("module-assistant-ia");
    expect(normalizeModuleId("tunnel-vente")).toBe("module-tunnel-de-vente");
  });

  it("returns null for unknown ids", () => {
    expect(normalizeModuleId("unknown-module")).toBeNull();
  });
});

describe("normalizeModuleIds", () => {
  it("deduplicates and ignores unknown ids", () => {
    expect(
      normalizeModuleIds([
        "assistant-ia",
        "module-paiement",
        "assistant-ia",
        "unknown",
      ]),
    ).toEqual(["module-assistant-ia", "module-paiement"]);
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
      { setupTierId: "ia-standard" },
    );

    expect(resolved).toEqual({
      setup: 1500,
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
    expect(resolveModuleMonthly(assistantModule, { subTierId: "ia-business" })).toBe(
      99,
    );
  });

  it("falls back to the module default", () => {
    expect(resolveModuleMonthly(assistantModule)).toBe(0);
  });
});

describe("resolveModuleRequalification", () => {
  it("respects the selected setup tier", () => {
    expect(
      resolveModuleRequalification(assistantModule, { setupTierId: "ia-avance" }),
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

  it("ignores modules for STARTER projects", () => {
    const result = qualifyProject({
      ...baseInput,
      projectType: "STARTER",
      selectedModuleIds: ["module-assistant-ia"],
    });

    expect(result.initialCategory).toBe("CAT0");
    expect(result.finalCategory).toBe("CAT0");
    expect(result.modules).toHaveLength(0);
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

    expect(result.initialCategory).toBe("CAT1");
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
      selectedModuleIds: ["module-assistant-ia"],
      tierSelections: {
        "module-assistant-ia": { setupTierId: "ia-avance" },
      },
    });

    expect(result.finalCategory).toBe("CAT3");
    expect(result.wasRequalified).toBe(true);
    expect(result.requalifyingModules.map((mod) => mod.id)).toEqual([
      "module-assistant-ia",
    ]);
  });

  it("computes financial splits in sous-traitant mode", () => {
    const result = qualifyProject({
      ...baseInput,
      billingMode: "SOUS_TRAITANT",
      selectedModuleIds: ["module-assistant-ia"],
      tierSelections: {
        "module-assistant-ia": { setupTierId: "ia-standard" },
      },
    });

    expect(result.finalCategory).toBe("CAT2");
    expect(result.splits).not.toBeNull();
    expect(result.splits?.baseSplitPrestataire).toBe(70);
    expect(result.splits?.baseSplitAgence).toBe(30);
    expect(result.splits?.modulesSplitPrestataire).toBe(900);
    expect(result.splits?.modulesSplitAgence).toBe(600);
  });
});
