import { describe, expect, it } from "vitest";
import { BOOKING_MODULE_ID } from "@/features/booking/lib/booking-config";
import {
  parseOfferModules,
  parseWizardQueryPrefill,
  resolveOfferPrefill,
} from "./wizard-prefill";

describe("wizard-prefill", () => {
  it("parses raw query params with empty-string defaults", () => {
    const query = new URLSearchParams({
      clientId: "cl_123",
      name: "My Project",
      domain: "acme.localhost",
    });

    const parsed = parseWizardQueryPrefill(query);

    expect(parsed.defaultClientId).toBe("cl_123");
    expect(parsed.prefillName).toBe("My Project");
    expect(parsed.prefillDomain).toBe("acme.localhost");
    expect(parsed.prefillDescription).toBe("");
    expect(parsed.offerStackParam).toBeNull();
  });

  it("normalizes offer module ids from query", () => {
    const modules = parseOfferModules(
      `${BOOKING_MODULE_ID},invalid-module,${BOOKING_MODULE_ID}`,
    );

    expect(modules).toEqual([BOOKING_MODULE_ID]);
  });

  it("returns null when offer prefill is incomplete", () => {
    const resolution = resolveOfferPrefill({
      offerProjectTypeParam: "VITRINE_BLOG",
      offerStackParam: null,
      offerDeploymentParam: null,
      offerTaxonomySignalParam: null,
      offerModulesParam: "",
    });

    expect(resolution).toBeNull();
  });

  it("maps offer prefill to wizard state and normalizes incompatible taxonomy signal", () => {
    const resolution = resolveOfferPrefill({
      offerProjectTypeParam: "APP_CUSTOM",
      offerStackParam: "NEXTJS",
      offerDeploymentParam: "headless_split",
      offerTaxonomySignalParam: "SITE_VITRINE",
      offerModulesParam: BOOKING_MODULE_ID,
    });

    expect(resolution).not.toBeNull();
    expect(resolution?.projectType).toBe("APP");
    expect(resolution?.taxonomySignal).toBeNull();
    expect(resolution?.projectFamily).toBe("APP_PLATFORM");
    expect(resolution?.projectImplementation).toBe("NEXTJS");
    expect(resolution?.shouldPrefillFrontendImplementation).toBe(false);
    expect(resolution?.hostingTarget).toBe("TO_CONFIRM");
    expect(resolution?.hostingTargetBack).toBe("SHARED_PHP");
    expect(resolution?.hostingTargetFront).toBe("CLOUD_SSR");
    expect(resolution?.offerModules).toEqual([BOOKING_MODULE_ID]);
  });
});
