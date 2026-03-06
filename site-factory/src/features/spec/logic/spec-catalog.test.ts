import { describe, expect, it } from "vitest";
import { buildSpecCatalogEntry, buildSpecOverview } from "./spec-catalog";

describe("spec-catalog", () => {
  it("enrichit le catalogue avec le rôle, la couverture et la structure principale", () => {
    const entry = buildSpecCatalogEntry(
      {
        name: "features.json",
        label: "Features fonctionnelles",
        size: 1024,
        lastModified: "2026-03-06T10:00:00.000Z",
      },
      {
        _meta: {
          purpose: "Résumé local",
          shape: {
            requiredTopLevel: ["version", "features"],
          },
        },
        version: "1.2.0",
        features: [
          {
            id: "feature.BLOG",
            label: "Blog",
            domain: "CONTENT",
          },
        ],
      },
    );

    expect(entry.domain).toBe("Offre fonctionnelle");
    expect(entry.coverage).toBe("Features atomiques proposees au client");
    expect(entry.role).toContain("wizard");
    expect(entry.summary).toBe("Résumé local");
    expect(entry.itemCount).toBe(1);
    expect(entry.topLevelKeys).toEqual(["version", "features"]);
    expect(entry.relatedSpecs).toContain("capability-matrix.json");
    expect(entry.version).toBe("1.2.0");
  });

  it("retombe sur les métadonnées locales quand aucune doc dédiée n’existe", () => {
    const overview = buildSpecOverview("unknown.json", {
      _meta: {
        purpose: "Spec de test interne.",
        shape: {
          requiredTopLevel: ["version", "entries", "settings"],
        },
      },
      version: "0.9.0",
      entries: [
        {
          id: "entry.one",
          label: "Entry One",
          enabled: true,
        },
      ],
      settings: {
        mode: "STRICT",
        threshold: 2,
      },
      labels: ["a", "b"],
      flag: true,
    });

    expect(overview.domain).toBe("Referentiel");
    expect(overview.role).toBe("Source de verite metier et technique");
    expect(overview.summary).toBe("Spec de test interne.");
    expect(overview.requiredTopLevelKeys).toEqual(["version", "entries", "settings"]);
    expect(overview.governance.map((entry) => entry.label)).toEqual([
      "Resume humain",
      "Consommateurs",
      "Cadre de lecture",
      "Structure detaillee",
    ]);
    expect(overview.detailSections[0]?.title).toBe("Structure generale");
    expect(overview.sections).toEqual([
      { key: "version", kind: "scalar", count: null, sampleKeys: [] },
      { key: "entries", kind: "collection", count: 1, sampleKeys: ["id", "label", "enabled"] },
      { key: "settings", kind: "object", count: 2, sampleKeys: ["mode", "threshold"] },
      { key: "labels", kind: "list", count: 2, sampleKeys: [] },
      { key: "flag", kind: "scalar", count: null, sampleKeys: [] },
    ]);
  });

  it("utilise les relations documentées pour la vue détail", () => {
    const overview = buildSpecOverview("cms.json", {
      _meta: {
        purpose: "Catalogue CMS",
        consumedBy: [
          "site-factory/src/lib/referential/spec/load.ts",
        ],
      },
      version: "1.0.0",
      cms: [
        {
          id: "cms.WORDPRESS",
          label: "WordPress",
        },
      ],
    });

    expect(overview.domain).toBe("Architecture");
    expect(overview.relatedSpecs.map((relation) => relation.spec)).toEqual([
      "capability-matrix.json",
      "stack-profiles.json",
      "plugins.json",
    ]);
    expect(overview.concepts.length).toBeGreaterThan(0);
    expect(overview.consumers).toEqual([
      "site-factory/src/lib/referential/spec/load.ts",
    ]);
    expect(overview.detailSections[0]?.title).toBe("Panorama CMS");
  });
});
