import { describe, it, expect } from "vitest";
import { isServiceEnabledForMode } from "./enabled";

describe("isServiceEnabledForMode", () => {
  it("returns false if service is not in enabledIds", () => {
    const enabled = new Set<string>(["redis"]);
    expect(isServiceEnabledForMode("mailpit", enabled, "DOCKER", "dev")).toBe(
      false,
    );
  });

  it("returns true for any enabled service in dev mode", () => {
    const enabled = new Set<string>(["phpmyadmin"]);
    expect(
      isServiceEnabledForMode("phpmyadmin", enabled, "DOCKER", "dev"),
    ).toBe(true);
  });

  it("returns false for dev-only service in prod-like mode", () => {
    // phpmyadmin has env: "dev" in the catalog
    const enabled = new Set<string>(["phpmyadmin"]);
    expect(
      isServiceEnabledForMode("phpmyadmin", enabled, "DOCKER", "prod-like"),
    ).toBe(false);
  });

  it("returns false for dev-only service in prod mode", () => {
    const enabled = new Set<string>(["mailpit"]);
    expect(
      isServiceEnabledForMode("mailpit", enabled, "DOCKER", "prod"),
    ).toBe(false);
  });

  it("returns true for both-env service in prod-like mode", () => {
    // redis has env: "both" in the catalog
    const enabled = new Set<string>(["redis"]);
    expect(
      isServiceEnabledForMode("redis", enabled, "DOCKER", "prod-like"),
    ).toBe(true);
  });

  it("returns false for unknown service in non-dev mode", () => {
    const enabled = new Set<string>(["unknown-service"]);
    expect(
      isServiceEnabledForMode("unknown-service", enabled, "DOCKER", "prod-like"),
    ).toBe(false);
  });

  it("returns false for service with incompatible deploy target", () => {
    // redis targets: ["DOCKER"] only
    const enabled = new Set<string>(["redis"]);
    expect(
      isServiceEnabledForMode("redis", enabled, "VERCEL", "prod-like"),
    ).toBe(false);
  });
});
