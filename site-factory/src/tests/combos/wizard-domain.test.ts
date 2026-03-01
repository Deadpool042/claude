import { describe, expect, it } from "vitest";
import {
  allowedHostingTargetsForType,
  allowedFamiliesForTypeAndHosting,
  normalizeTypeStackState,
  deriveOfferProjectType,
  deriveQualificationProjectType,
} from "@/lib/wizard-domain";
import type { WizardTypeStackState } from "@/lib/wizard-domain";

const baseState: WizardTypeStackState = {
  projectType: "STARTER",
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
    const starterHosting = allowedHostingTargetsForType("STARTER");
    expect(starterHosting).not.toContain("SPLIT_HEADLESS");

    const appHosting = allowedHostingTargetsForType("APP");
    expect(appHosting).toContain("CLOUD_SSR");
    expect(appHosting).not.toContain("SHARED_PHP");
  });

  it("filters families by type and hosting", () => {
    const families = allowedFamiliesForTypeAndHosting("STARTER", "SHARED_PHP");
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
  it("derives Starter when constraints are minimal", () => {
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
    expect(deriveQualificationProjectType(input)).toBe("STARTER");
    expect(deriveOfferProjectType(input)).toBe("STARTER");
  });

  it("keeps classic offer when modules are selected", () => {
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
    expect(deriveOfferProjectType(input)).toBe("VITRINE_BLOG");
  });
});
