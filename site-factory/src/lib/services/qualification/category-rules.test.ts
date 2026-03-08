import { describe, expect, it } from "vitest";
import {
  CONSTRAINT_MIN_CATEGORY_INDEX,
  indexToCategory,
} from "@/lib/referential";
import { resolveBaseCategoryRules } from "./category-rules";

describe("resolveBaseCategoryRules", () => {
  it("starts BLOG at CAT0", () => {
    const result = resolveBaseCategoryRules({
      projectType: "BLOG",
      techStack: "WORDPRESS",
      wpHeadless: false,
      constraints: undefined,
    });

    expect(result.initialCategory).toBe("CAT0");
  });

  it("raises non-WordPress e-commerce to at least CAT3 before modules", () => {
    const result = resolveBaseCategoryRules({
      projectType: "ECOM",
      techStack: "NEXTJS",
      wpHeadless: false,
      constraints: undefined,
    });

    expect(result.finalCategoryBeforeModules).toBe("CAT3");
  });

  it("applies the current stack floor for WordPress headless", () => {
    const result = resolveBaseCategoryRules({
      projectType: "VITRINE",
      techStack: "WORDPRESS",
      wpHeadless: true,
      constraints: undefined,
    });

    expect(result.stackFloorCategory).toBe("CAT4");
    expect(result.finalCategoryBeforeModules).toBe("CAT4");
  });

  it("applies the configured scalability constraint floor", () => {
    const expectedConstraintCategory = indexToCategory(
      CONSTRAINT_MIN_CATEGORY_INDEX.scalabilityLevel.ELASTIC,
    );

    const result = resolveBaseCategoryRules({
      projectType: "BLOG",
      techStack: "WORDPRESS",
      wpHeadless: false,
      constraints: {
        scalabilityLevel: "ELASTIC",
      },
    });

    expect(result.categoryAfterConstraintRules).toBe(expectedConstraintCategory);
  });
});