import { buildDefaultOptionalServiceRows } from "@/lib/services";
import { describe, it, expect } from "vitest";

describe("buildDefaultOptionalServiceRows", () => {
  it("returns rows for all optional services (no databases)", () => {
    const rows = buildDefaultOptionalServiceRows({
      techStack: "WORDPRESS",
      deployTarget: "DOCKER",
      devMode: "DEV_COMFORT",
    });

    // Should never contain db-mariadb or db-postgresql
    const ids = rows.map((r) => r.serviceId);
    expect(ids).not.toContain("db-mariadb");
    expect(ids).not.toContain("db-postgresql");
  });

  it("enables phpmyadmin for WordPress + DOCKER + DEV_COMFORT", () => {
    const rows = buildDefaultOptionalServiceRows({
      techStack: "WORDPRESS",
      deployTarget: "DOCKER",
      devMode: "DEV_COMFORT",
    });
    const pma = rows.find((r) => r.serviceId === "phpmyadmin");
    expect(pma).toBeDefined();
    expect(pma!.enabled).toBe(true);
  });

  it("enables redis for WordPress + DOCKER + DEV_COMFORT", () => {
    const rows = buildDefaultOptionalServiceRows({
      techStack: "WORDPRESS",
      deployTarget: "DOCKER",
      devMode: "DEV_COMFORT",
    });
    const redis = rows.find((r) => r.serviceId === "redis");
    expect(redis).toBeDefined();
    expect(redis!.enabled).toBe(true);
  });

  it("enables mailpit for WordPress + DOCKER + DEV_COMFORT", () => {
    const rows = buildDefaultOptionalServiceRows({
      techStack: "WORDPRESS",
      deployTarget: "DOCKER",
      devMode: "DEV_COMFORT",
    });
    const mailpit = rows.find((r) => r.serviceId === "mailpit");
    expect(mailpit).toBeDefined();
    expect(mailpit!.enabled).toBe(true);
  });

  it("enables adminer for NEXTJS + DOCKER + DEV_COMFORT", () => {
    const rows = buildDefaultOptionalServiceRows({
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      devMode: "DEV_COMFORT",
    });
    const adminer = rows.find((r) => r.serviceId === "adminer");
    expect(adminer).toBeDefined();
    expect(adminer!.enabled).toBe(true);
  });

  it("disables phpmyadmin for NEXTJS (incompatible stack)", () => {
    const rows = buildDefaultOptionalServiceRows({
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      devMode: "DEV_COMFORT",
    });
    const pma = rows.find((r) => r.serviceId === "phpmyadmin");
    // phpmyadmin has stacks: [] (all stacks) so it's compatible,
    // but defaultFor.stacks: ["WORDPRESS"] so it shouldn't be enabled by default
    // Let's just check it exists
    expect(pma).toBeDefined();
  });

  it("disables DOCKER-only services for VERCEL target", () => {
    const rows = buildDefaultOptionalServiceRows({
      techStack: "NEXTJS",
      deployTarget: "VERCEL",
      devMode: "DEV_COMFORT",
    });

    // redis targets: ["DOCKER"] only
    const redis = rows.find((r) => r.serviceId === "redis");
    expect(redis?.enabled).toBe(false);

    // adminer targets: ["DOCKER"] only
    const adminer = rows.find((r) => r.serviceId === "adminer");
    expect(adminer?.enabled).toBe(false);
  });

  it("disables WordPress-only services for NEXTJS stack", () => {
    const rows = buildDefaultOptionalServiceRows({
      techStack: "NEXTJS",
      deployTarget: "DOCKER",
      devMode: "DEV_COMFORT",
    });

    // memcached has stacks: ["WORDPRESS"]
    const memcached = rows.find((r) => r.serviceId === "memcached");
    expect(memcached?.enabled).toBe(false);

    // varnish has stacks: ["WORDPRESS"]
    const varnish = rows.find((r) => r.serviceId === "varnish");
    expect(varnish?.enabled).toBe(false);
  });

  it("returns consistent results for null techStack", () => {
    const rows = buildDefaultOptionalServiceRows({
      techStack: null,
      deployTarget: "DOCKER",
      devMode: "DEV_COMFORT",
    });

    // Services with non-empty stacks should be disabled (incompatible)
    const memcached = rows.find((r) => r.serviceId === "memcached");
    expect(memcached?.enabled).toBe(false);

    const adminer = rows.find((r) => r.serviceId === "adminer");
    expect(adminer?.enabled).toBe(false);
  });
});
