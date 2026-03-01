import { describe, it, expect } from "vitest";
import {
  stackSlugForMode,
  localHostBase,
  localHostForMode,
  localServiceHost,
} from "./names";

describe("stackSlugForMode", () => {
  it("appends -dev for dev mode", () => {
    expect(stackSlugForMode("monsite", "dev")).toBe("monsite-dev");
  });

  it("appends -prod-like for prod-like mode", () => {
    expect(stackSlugForMode("monsite", "prod-like")).toBe("monsite-prod-like");
  });

  it("returns bare slug for prod mode", () => {
    expect(stackSlugForMode("monsite", "prod")).toBe("monsite");
  });
});

describe("localHostBase", () => {
  it("combines client-project-dev for dev mode", () => {
    expect(localHostBase("acme", "blog", "dev")).toBe("acme-blog-dev");
  });

  it("combines client-project-prod-like for prod-like mode", () => {
    expect(localHostBase("acme", "blog", "prod-like")).toBe(
      "acme-blog-prod-like",
    );
  });

  it("returns just projectSlug for prod mode", () => {
    expect(localHostBase("acme", "blog", "prod")).toBe("blog");
  });
});

describe("localHostForMode", () => {
  it("appends .localhost", () => {
    expect(localHostForMode("acme", "blog", "dev")).toBe(
      "acme-blog-dev.localhost",
    );
  });

  it("works for prod-like", () => {
    expect(localHostForMode("acme", "blog", "prod-like")).toBe(
      "acme-blog-prod-like.localhost",
    );
  });

  it("works for prod", () => {
    expect(localHostForMode("acme", "blog", "prod")).toBe("blog.localhost");
  });
});

describe("localServiceHost", () => {
  it("prefixes the service name", () => {
    expect(localServiceHost("pma", "acme", "blog", "dev")).toBe(
      "pma-acme-blog-dev.localhost",
    );
  });

  it("works for mail prefix", () => {
    expect(localServiceHost("mail", "acme", "blog", "dev")).toBe(
      "mail-acme-blog-dev.localhost",
    );
  });
});
