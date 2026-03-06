import { describe, expect, it } from "vitest";
import { buildSpecViewHref, normalizeSpecView } from "./spec-view";

describe("spec-view", () => {
  it("normalise les vues inconnues vers overview", () => {
    expect(normalizeSpecView(undefined)).toBe("overview");
    expect(normalizeSpecView(null)).toBe("overview");
    expect(normalizeSpecView("other")).toBe("overview");
  });

  it("preserve la vue edition quand elle est demandee", () => {
    expect(normalizeSpecView("edit")).toBe("edit");
  });

  it("genere des liens stables pour detail et edition", () => {
    expect(buildSpecViewHref("features.json", "overview")).toBe(
      "/dashboard/spec/features.json",
    );
    expect(buildSpecViewHref("decision-rules.json", "edit")).toBe(
      "/dashboard/spec/decision-rules.json?view=edit",
    );
  });
});
