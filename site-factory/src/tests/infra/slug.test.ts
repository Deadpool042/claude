import { generateSlug } from "@/lib/slug";
import { describe, it, expect } from "vitest";

describe("generateSlug", () => {
  it("converts to lowercase", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("mon super site")).toBe("mon-super-site");
  });

  it("removes accents", () => {
    expect(generateSlug("Café Résumé")).toBe("cafe-resume");
    expect(generateSlug("éàüöñ")).toBe("eauon");
  });

  it("removes special characters", () => {
    expect(generateSlug("hello@world!")).toBe("hello-world");
    expect(generateSlug("foo & bar")).toBe("foo-bar");
  });

  it("collapses consecutive hyphens", () => {
    expect(generateSlug("foo---bar")).toBe("foo-bar");
    expect(generateSlug("a  -  b")).toBe("a-b");
  });

  it("trims leading and trailing hyphens", () => {
    expect(generateSlug("-hello-")).toBe("hello");
    expect(generateSlug("  hello  ")).toBe("hello");
    expect(generateSlug("---test---")).toBe("test");
  });

  it("handles already clean slugs", () => {
    expect(generateSlug("my-clean-slug")).toBe("my-clean-slug");
  });

  it("handles numbers", () => {
    expect(generateSlug("Site 2024")).toBe("site-2024");
    expect(generateSlug("123")).toBe("123");
  });

  it("handles empty-ish input", () => {
    expect(generateSlug("")).toBe("");
    expect(generateSlug("---")).toBe("");
  });
});
