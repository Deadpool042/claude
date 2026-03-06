import { describe, expect, it } from "vitest";
import {
  getTaxonomySignalOptionsForProjectType,
  TAXONOMY_SIGNAL_SOURCE_LABELS,
  normalizeTaxonomySignalForProjectType,
  parseTaxonomyDisambiguationSignal,
  resolveDefaultTaxonomySignalForProjectType,
} from "@/lib/taxonomy";

describe("transitional taxonomy signal", () => {
  it("parses only allowed runtime values", () => {
    expect(parseTaxonomyDisambiguationSignal("SITE_BUSINESS")).toBe(
      "SITE_BUSINESS",
    );
    expect(parseTaxonomyDisambiguationSignal("APP_METIER")).toBe(
      "APP_METIER",
    );
    expect(parseTaxonomyDisambiguationSignal("UNKNOWN_SIGNAL")).toBeNull();
    expect(parseTaxonomyDisambiguationSignal("")).toBeNull();
    expect(parseTaxonomyDisambiguationSignal(null)).toBeNull();
  });

  it("normalizes by project type compatibility", () => {
    expect(
      normalizeTaxonomySignalForProjectType("VITRINE", "SITE_BUSINESS"),
    ).toBe("SITE_BUSINESS");
    expect(normalizeTaxonomySignalForProjectType("APP", "APP_METIER")).toBe(
      "APP_METIER",
    );
    expect(normalizeTaxonomySignalForProjectType("ECOM", "SITE_VITRINE")).toBeNull();
    expect(normalizeTaxonomySignalForProjectType("APP", "SITE_BUSINESS")).toBeNull();
  });

  it("exposes defaults only for ambiguous clusters", () => {
    expect(resolveDefaultTaxonomySignalForProjectType("VITRINE")).toBe(
      "SITE_VITRINE",
    );
    expect(resolveDefaultTaxonomySignalForProjectType("BLOG")).toBe(
      "SITE_VITRINE",
    );
    expect(resolveDefaultTaxonomySignalForProjectType("APP")).toBe("MVP_SAAS");
    expect(resolveDefaultTaxonomySignalForProjectType("ECOM")).toBeNull();
  });

  it("returns contextual options for wizard forms", () => {
    const siteOptions = getTaxonomySignalOptionsForProjectType("BLOG");
    const appOptions = getTaxonomySignalOptionsForProjectType("APP");
    const ecomOptions = getTaxonomySignalOptionsForProjectType("ECOM");

    expect(siteOptions.map((item) => item.value)).toEqual([
      "SITE_VITRINE",
      "SITE_BUSINESS",
    ]);
    expect(appOptions.map((item) => item.value)).toEqual([
      "MVP_SAAS",
      "APP_METIER",
    ]);
    expect(ecomOptions).toEqual([]);
  });

  it("exposes stable source labels for taxonomy fallback states", () => {
    expect(TAXONOMY_SIGNAL_SOURCE_LABELS.persisted).toBe("persisté");
    expect(TAXONOMY_SIGNAL_SOURCE_LABELS.inferred).toBe(
      "déduit du contexte",
    );
    expect(TAXONOMY_SIGNAL_SOURCE_LABELS.default).toBe("par défaut");
    expect(TAXONOMY_SIGNAL_SOURCE_LABELS.none).toBe("absent");
  });
});
