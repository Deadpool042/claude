import { describe, it, expect } from "vitest";
import { defaultComposeModeFromDevMode, supportsProdCompose } from "./types";

describe("defaultComposeModeFromDevMode", () => {
  it("maps DEV_COMFORT to dev", () => {
    expect(defaultComposeModeFromDevMode("DEV_COMFORT")).toBe("dev");
  });

  it("maps DEV_PROD_LIKE to prod-like", () => {
    expect(defaultComposeModeFromDevMode("DEV_PROD_LIKE")).toBe("prod-like");
  });

  it("maps PROD to prod", () => {
    expect(defaultComposeModeFromDevMode("PROD")).toBe("prod");
  });
});

describe("supportsProdCompose", () => {
  it("returns true for DOCKER", () => {
    expect(supportsProdCompose("DOCKER")).toBe(true);
  });

  it("returns false for VERCEL", () => {
    expect(supportsProdCompose("VERCEL")).toBe(false);
  });

  it("returns false for SHARED_HOSTING", () => {
    expect(supportsProdCompose("SHARED_HOSTING")).toBe(false);
  });
});
