import { describe, expect, it } from "vitest";
import { buildSpecDetailSections } from "./spec-detail-sections";

describe("spec-detail-sections", () => {
  it("calcule une synthese par type pour features.json", () => {
    const sections = buildSpecDetailSections("features.json", {
      features: [
        {
          id: "feature.BLOG",
          domain: "CONTENT",
          type: "CMS",
          uiOnly: false
        },
        {
          id: "feature.THEME",
          domain: "CONTENT",
          type: "THEME",
          uiOnly: true
        },
        {
          id: "feature.CHECKOUT",
          domain: "ECOMMERCE",
          type: "COMMERCE",
          uiOnly: false
        }
      ]
    });

    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBe("Catalogue fonctionnel");
    expect(sections[0]?.metrics).toEqual([
      { label: "Fonctionnalités", value: "3", tone: "accent" },
      { label: "Domaines", value: "2", tone: "default" },
      { label: "Interface seule", value: "1", tone: "default" },
      { label: "Types distincts", value: "3", tone: "default" }
    ]);
    expect(sections[0]?.tags).toEqual(["CONTENT 2", "ECOMMERCE 1"]);
  });

  it("retombe sur une vue generique pour un fichier non specialise", () => {
    const sections = buildSpecDetailSections("unknown.json", {
      version: "0.1.0",
      entries: [{ id: "entry.one" }],
      config: { strict: true }
    });

    expect(sections[0]?.title).toBe("Structure générale");
    expect(sections[0]?.metrics[0]).toEqual({
      label: "Sections principales",
      value: "3",
      tone: "accent"
    });
    expect(sections[0]?.tags).toEqual(["version", "entries", "config"]);
  });
});
