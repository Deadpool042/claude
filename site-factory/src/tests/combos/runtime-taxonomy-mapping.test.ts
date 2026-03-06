import { describe, expect, it } from "vitest";
import {
  getCanonicalTaxonomyCluster,
  isAmbiguousTaxonomyMapping,
  isApproximateTaxonomyMapping,
  isExactTaxonomyMapping,
  isProvisionalTaxonomyMapping,
  mapCanonicalTaxonomyToLegacyOfferCategory,
  mapCanonicalTaxonomyToLegacyProjectType,
  mapLegacyOfferCategoryToCanonicalTaxonomy,
  mapLegacyProjectTypeToCanonicalTaxonomy,
  readLegacyTaxonomyCluster,
  resolveLegacyOfferCategoryFromProjectType,
  resolveLegacyProjectTypeFromOfferCategory,
} from "@/lib/taxonomy";

describe("runtime taxonomy mapping - legacy to canonical", () => {
  it("maps ECOM exactly to canonical ECOMMERCE", () => {
    const result = mapLegacyProjectTypeToCanonicalTaxonomy("ECOM");
    expect(result.target).toBe("ECOMMERCE");
    expect(result.status).toBe("EXACT");
    expect(isExactTaxonomyMapping(result)).toBe(true);
  });

  it("marks VITRINE as ambiguous without disambiguation signal", () => {
    const result = mapLegacyProjectTypeToCanonicalTaxonomy("VITRINE");
    expect(result.target).toBeNull();
    expect(result.candidates).toEqual(["SITE_VITRINE", "SITE_BUSINESS"]);
    expect(result.needsSignal).toBe(true);
    expect(isAmbiguousTaxonomyMapping(result)).toBe(true);
  });

  it("allows a signal for SITE_BUSINESS on VITRINE/BLOG cluster", () => {
    const result = mapLegacyProjectTypeToCanonicalTaxonomy(
      "BLOG",
      "SITE_BUSINESS",
    );
    expect(result.target).toBe("SITE_BUSINESS");
    expect(result.status).toBe("APPROXIMATE");
    expect(isApproximateTaxonomyMapping(result)).toBe(true);
  });

  it("maps STARTER to SITE_VITRINE as a provisional grouping", () => {
    const result = mapLegacyProjectTypeToCanonicalTaxonomy("STARTER");
    expect(result.target).toBe("SITE_VITRINE");
    expect(result.status).toBe("PROVISIONAL");
    expect(isProvisionalTaxonomyMapping(result)).toBe(true);
  });

  it("marks APP_CUSTOM as ambiguous without app intent signal", () => {
    const result = mapLegacyOfferCategoryToCanonicalTaxonomy("APP_CUSTOM");
    expect(result.target).toBeNull();
    expect(result.candidates).toEqual(["MVP_SAAS", "APP_METIER"]);
    expect(result.needsSignal).toBe(true);
  });
});

describe("runtime taxonomy mapping - canonical to legacy", () => {
  it("maps canonical ECOMMERCE exactly to legacy runtime enums", () => {
    const toType = mapCanonicalTaxonomyToLegacyProjectType("ECOMMERCE");
    const toOffer = mapCanonicalTaxonomyToLegacyOfferCategory("ECOMMERCE");

    expect(toType.target).toBe("ECOM");
    expect(toType.status).toBe("EXACT");
    expect(toOffer.target).toBe("ECOMMERCE");
    expect(toOffer.status).toBe("EXACT");
  });

  it("maps SITE_BUSINESS with explicit approximate status", () => {
    const toType = mapCanonicalTaxonomyToLegacyProjectType("SITE_BUSINESS");
    const toOffer = mapCanonicalTaxonomyToLegacyOfferCategory("SITE_BUSINESS");

    expect(toType.target).toBe("VITRINE");
    expect(toType.status).toBe("APPROXIMATE");
    expect(toOffer.target).toBe("VITRINE_BLOG");
    expect(toOffer.status).toBe("APPROXIMATE");
  });
});

describe("runtime taxonomy mapping - runtime bridge helpers", () => {
  it("keeps historical runtime mapping between project type and offer", () => {
    expect(resolveLegacyOfferCategoryFromProjectType("BLOG")).toBe("VITRINE_BLOG");
    expect(resolveLegacyOfferCategoryFromProjectType("VITRINE")).toBe("VITRINE_BLOG");
    expect(resolveLegacyOfferCategoryFromProjectType("ECOM")).toBe("ECOMMERCE");
    expect(resolveLegacyOfferCategoryFromProjectType("APP")).toBe("APP_CUSTOM");
  });

  it("keeps historical runtime mapping between offer and project type", () => {
    expect(resolveLegacyProjectTypeFromOfferCategory("VITRINE_BLOG")).toBe("VITRINE");
    expect(resolveLegacyProjectTypeFromOfferCategory("ECOMMERCE")).toBe("ECOM");
    expect(resolveLegacyProjectTypeFromOfferCategory("APP_CUSTOM")).toBe("APP");
  });

  it("resolves taxonomy clusters and detects mismatches", () => {
    expect(
      readLegacyTaxonomyCluster({ projectType: "VITRINE", offerCategory: "VITRINE_BLOG" }),
    ).toBe("SITE");
    expect(readLegacyTaxonomyCluster({ projectType: "APP", offerCategory: "APP_CUSTOM" })).toBe("APP");
    expect(readLegacyTaxonomyCluster({ projectType: "APP", offerCategory: "ECOMMERCE" })).toBeNull();
    expect(getCanonicalTaxonomyCluster("MVP_SAAS")).toBe("APP");
  });
});
