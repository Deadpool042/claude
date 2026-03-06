//src/tests/combos/wizard-domain.test.ts
import { describe, expect, it } from "vitest";
import {
  allowedHostingTargetsForType,
  allowedFamiliesForTypeAndHosting,
  normalizeTypeStackState,
  deriveOfferProjectType,
  deriveQualificationProjectType,
  resolveCanonicalTaxonomyFromOfferInput,
  isStarterEligible,
} from "@/lib/wizard-domain";
import type { WizardTypeStackState } from "@/lib/wizard-domain";

const baseState: WizardTypeStackState = {
  projectType: "VITRINE",
  hostingTarget: "SHARED_PHP",
  hostingTargetBack: null,
  hostingTargetFront: null,
  needsEditing: true,
  editingFrequency: "REGULAR",
  commerceModel: "SELF_HOSTED",
  backendMode: "FULLSTACK",
  backendFamily: null,
  backendOpsHeavy: false,
  headlessRequired: false,
  trafficLevel: "LOW",
  productCount: "NONE",
  dataSensitivity: "STANDARD",
  scalabilityLevel: "FIXED",
  projectFamily: "CMS_MONO",
  projectImplementation: "WORDPRESS",
  projectImplementationLabel: "",
  projectFrontendImplementation: null,
  projectFrontendImplementationLabel: "",
  techStack: "WORDPRESS",
  wpHeadless: false,
};

describe("wizard-domain rules", () => {
  it("filters hosting targets by project type", () => {
    const vitrineHosting = allowedHostingTargetsForType("VITRINE");
    expect(vitrineHosting).not.toContain("SPLIT_HEADLESS");

    const appHosting = allowedHostingTargetsForType("APP");
    expect(appHosting).toContain("CLOUD_SSR");
    expect(appHosting).not.toContain("SHARED_PHP");
  });

  it("filters families by type and hosting", () => {
    const families = allowedFamiliesForTypeAndHosting("VITRINE", "SHARED_PHP");
    expect(families).toEqual(expect.arrayContaining(["STATIC_SSG", "CMS_MONO"]));
    expect(families).not.toContain("COMMERCE_HEADLESS");
  });
});

describe("wizard-domain normalization", () => {
  it("resets invalid hosting to first allowed", () => {
    const next = normalizeTypeStackState(
      { ...baseState, projectType: "APP", hostingTarget: "SHARED_PHP" },
      {},
    );
    expect(next.hostingTarget).toBe("CLOUD_SSR");
  });

  it("resets front/headless when not needed", () => {
    const next = normalizeTypeStackState(
      { ...baseState, hostingTarget: "TO_CONFIRM", projectFrontendImplementation: "NEXTJS" },
      {},
    );
    expect(next.projectFrontendImplementation).toBeNull();
  });

  it("clears backend fields for non-app projects", () => {
    const next = normalizeTypeStackState(
      {
        ...baseState,
        projectType: "BLOG",
        backendMode: "SEPARATE",
        backendFamily: "CUSTOM_API",
        backendOpsHeavy: true,
      },
      {},
    );
    expect(next.backendMode).toBe("FULLSTACK");
    expect(next.backendFamily).toBeNull();
    expect(next.backendOpsHeavy).toBe(false);
  });

  it("clears backend details when fullstack app", () => {
    const next = normalizeTypeStackState(
      {
        ...baseState,
        projectType: "APP",
        projectFamily: "APP_PLATFORM",
        backendMode: "FULLSTACK",
        backendFamily: "CUSTOM_API",
        backendOpsHeavy: true,
      },
      {},
    );
    expect(next.backendFamily).toBeNull();
    expect(next.backendOpsHeavy).toBe(false);
  });
});

describe("wizard-domain offers", () => {
  it("identifies starter-eligible projects (CAT0 candidates)", () => {
    const input = {
      projectType: "VITRINE",
      projectFamily: "STATIC_SSG",
      needsEditing: true,
      editingFrequency: "RARE",
      trafficLevel: "LOW",
      productCount: "NONE",
      dataSensitivity: "STANDARD",
      scalabilityLevel: "FIXED",
      selectedModulesCount: 0,
    } as const;
    expect(isStarterEligible(input)).toBe(true);
    expect(deriveOfferProjectType(input)).toBe("VITRINE_BLOG");
  });

  it("keeps VITRINE_BLOG when modules are selected", () => {
    const input = {
      projectType: "VITRINE",
      projectFamily: "STATIC_SSG",
      needsEditing: false,
      editingFrequency: "RARE",
      trafficLevel: "LOW",
      productCount: "NONE",
      dataSensitivity: "STANDARD",
      scalabilityLevel: "FIXED",
      selectedModulesCount: 1,
    } as const;
    expect(isStarterEligible(input)).toBe(false);
    expect(deriveOfferProjectType(input)).toBe("VITRINE_BLOG");
  });

  it("identifies starter-eligible WordPress CMS_MONO vitrine", () => {
    const input = {
      projectType: "VITRINE",
      projectFamily: "CMS_MONO",
      needsEditing: true,
      editingFrequency: "RARE",
      trafficLevel: "LOW",
      productCount: "NONE",
      dataSensitivity: "STANDARD",
      scalabilityLevel: "FIXED",
      selectedModulesCount: 0,
    } as const;
    expect(isStarterEligible(input)).toBe(true);
    expect(deriveOfferProjectType(input)).toBe("VITRINE_BLOG");
  });

  it("keeps VITRINE_BLOG for CMS_MONO with regular editing", () => {
    const input = {
      projectType: "VITRINE",
      projectFamily: "CMS_MONO",
      needsEditing: true,
      editingFrequency: "REGULAR",
      trafficLevel: "LOW",
      productCount: "NONE",
      dataSensitivity: "STANDARD",
      scalabilityLevel: "FIXED",
      selectedModulesCount: 0,
    } as const;
    expect(isStarterEligible(input)).toBe(false);
    expect(deriveOfferProjectType(input)).toBe("VITRINE_BLOG");
  });

  it("identifies starter-eligible simple Blog CMS_MONO", () => {
    const input = {
      projectType: "BLOG",
      projectFamily: "CMS_MONO",
      needsEditing: false,
      editingFrequency: "RARE",
      trafficLevel: "LOW",
      productCount: "NONE",
      dataSensitivity: "STANDARD",
      scalabilityLevel: "FIXED",
      selectedModulesCount: 0,
    } as const;
    expect(isStarterEligible(input)).toBe(true);
    expect(deriveOfferProjectType(input)).toBe("VITRINE_BLOG");
  });

  it("resolves SITE_BUSINESS when a site signal is set", () => {
    const input = {
      projectType: "VITRINE",
      taxonomySignal: "SITE_BUSINESS",
      projectFamily: "CMS_MONO",
      needsEditing: true,
      editingFrequency: "REGULAR",
      trafficLevel: "MEDIUM",
      productCount: "NONE",
      dataSensitivity: "STANDARD",
      scalabilityLevel: "GROWING",
      selectedModulesCount: 1,
    } as const;

    const canonical = resolveCanonicalTaxonomyFromOfferInput(input);
    expect(canonical?.target).toBe("SITE_BUSINESS");
    expect(canonical?.needsSignal).toBe(false);
    expect(deriveQualificationProjectType(input)).toBe("VITRINE");
    expect(deriveOfferProjectType(input)).toBe("VITRINE_BLOG");
  });

  it("resolves APP_METIER when an app signal is set", () => {
    const input = {
      projectType: "APP",
      taxonomySignal: "APP_METIER",
      projectFamily: "APP_PLATFORM",
      needsEditing: true,
      editingFrequency: "DAILY",
      trafficLevel: "HIGH",
      productCount: "NONE",
      dataSensitivity: "REGULATED",
      scalabilityLevel: "ELASTIC",
      selectedModulesCount: 2,
    } as const;

    const canonical = resolveCanonicalTaxonomyFromOfferInput(input);
    expect(canonical?.target).toBe("APP_METIER");
    expect(canonical?.needsSignal).toBe(false);
    expect(deriveQualificationProjectType(input)).toBe("APP");
    expect(deriveOfferProjectType(input)).toBe("APP_CUSTOM");
  });

  it("keeps legacy fallback when no app signal is provided", () => {
    const input = {
      projectType: "APP",
      projectFamily: "APP_PLATFORM",
      needsEditing: false,
      editingFrequency: "RARE",
      trafficLevel: "LOW",
      productCount: "NONE",
      dataSensitivity: "STANDARD",
      scalabilityLevel: "FIXED",
      selectedModulesCount: 0,
    } as const;

    const canonical = resolveCanonicalTaxonomyFromOfferInput(input);
    expect(canonical?.target).toBeNull();
    expect(canonical?.needsSignal).toBe(true);
    expect(deriveQualificationProjectType(input)).toBe("APP");
    expect(deriveOfferProjectType(input)).toBe("APP_CUSTOM");
  });
});
