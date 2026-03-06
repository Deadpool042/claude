import { describe, expect, it } from "vitest";
import {
  readCiAxesPayloadFromCiAxesJson,
  readPersistedTaxonomySignalDualSource,
  readPersistedTaxonomySignalFromCiAxesJson,
  resolveTaxonomySignalFromRuntimeContext,
  serializeQualificationCiAxesJson,
} from "@/lib/taxonomy";

describe("taxonomy signal runtime flow", () => {
  it("persists explicit signals in ciAxesJson transitional envelope", () => {
    const serialized = serializeQualificationCiAxesJson({
      taxonomySignal: "SITE_BUSINESS",
      ciAxes: { axisA: 3, axisB: 5 },
    });

    expect(serialized).not.toBeNull();
    expect(readPersistedTaxonomySignalFromCiAxesJson(serialized)).toBe(
      "SITE_BUSINESS",
    );
    expect(readCiAxesPayloadFromCiAxesJson(serialized)).toEqual({
      axisA: 3,
      axisB: 5,
    });
  });

  it("unwraps back to legacy ci axes payload when signal is removed", () => {
    const wrapped = serializeQualificationCiAxesJson({
      taxonomySignal: "APP_METIER",
      ciAxes: { complexity: 12 },
    });

    const unwrapped = serializeQualificationCiAxesJson({
      taxonomySignal: null,
      previousCiAxesJson: wrapped,
    });

    expect(unwrapped).toBe('{"complexity":12}');
    expect(readPersistedTaxonomySignalFromCiAxesJson(unwrapped)).toBeNull();
    expect(readCiAxesPayloadFromCiAxesJson(unwrapped)).toEqual({ complexity: 12 });
  });

  it("keeps persisted signal priority in runtime resolution", () => {
    const resolution = resolveTaxonomySignalFromRuntimeContext({
      projectType: "VITRINE",
      persistedSignal: "SITE_BUSINESS",
      category: "CAT0",
      selectedModulesCount: 0,
      trafficLevel: "LOW",
    });

    expect(resolution.signal).toBe("SITE_BUSINESS");
    expect(resolution.source).toBe("persisted");
  });

  it("uses dedicated persistence first, then falls back to ciAxesJson", () => {
    const wrappedLegacy = serializeQualificationCiAxesJson({
      taxonomySignal: "SITE_VITRINE",
      ciAxes: { axisA: 1 },
    });

    const dedicatedFirst = readPersistedTaxonomySignalDualSource({
      projectType: "VITRINE",
      taxonomySignal: "SITE_BUSINESS",
      ciAxesJson: wrappedLegacy,
    });

    const fallbackLegacy = readPersistedTaxonomySignalDualSource({
      projectType: "VITRINE",
      taxonomySignal: null,
      ciAxesJson: wrappedLegacy,
    });

    expect(dedicatedFirst).toBe("SITE_BUSINESS");
    expect(fallbackLegacy).toBe("SITE_VITRINE");
  });

  it("drops incompatible dedicated values and keeps a compatible fallback", () => {
    const wrappedLegacy = serializeQualificationCiAxesJson({
      taxonomySignal: "MVP_SAAS",
      ciAxes: { axisA: 9 },
    });

    const signal = readPersistedTaxonomySignalDualSource({
      projectType: "APP",
      taxonomySignal: "SITE_BUSINESS",
      ciAxesJson: wrappedLegacy,
    });

    expect(signal).toBe("MVP_SAAS");
  });

  it("reconstitutes SITE_BUSINESS from business hints when signal is absent", () => {
    const resolution = resolveTaxonomySignalFromRuntimeContext({
      projectType: "BLOG",
      persistedSignal: null,
      category: "CAT3",
      selectedModulesCount: 1,
      trafficLevel: "MEDIUM",
    });

    expect(resolution.signal).toBe("SITE_BUSINESS");
    expect(resolution.source).toBe("inferred");
  });

  it("reconstitutes APP_METIER from backend and ops hints", () => {
    const resolution = resolveTaxonomySignalFromRuntimeContext({
      projectType: "APP",
      backendFamily: "CUSTOM_API",
      backendOpsHeavy: true,
      selectedModulesCount: 1,
    });

    expect(resolution.signal).toBe("APP_METIER");
    expect(resolution.source).toBe("inferred");
  });

  it("falls back to defaults only on ambiguous clusters", () => {
    const blogResolution = resolveTaxonomySignalFromRuntimeContext({
      projectType: "BLOG",
    });
    const ecomResolution = resolveTaxonomySignalFromRuntimeContext({
      projectType: "ECOM",
    });

    expect(blogResolution.signal).toBe("SITE_VITRINE");
    expect(blogResolution.source).toBe("default");
    expect(ecomResolution.signal).toBeNull();
    expect(ecomResolution.source).toBe("none");
  });
});
