import { describe, expect, it } from "vitest";
import { isImplementationLiveEligible } from "@/lib/project-choices";

describe("implementation live eligibility", () => {
  it("accepts SaaS implementations for live qualification", () => {
    expect(isImplementationLiveEligible("SHOPIFY")).toBe(true);
    expect(isImplementationLiveEligible("BIGCOMMERCE")).toBe(true);
    expect(isImplementationLiveEligible("WEBFLOW_COMMERCE")).toBe(true);
  });

  it("keeps supported implementations eligible", () => {
    expect(isImplementationLiveEligible("WORDPRESS")).toBe(true);
    expect(isImplementationLiveEligible("WOOCOMMERCE")).toBe(true);
  });

  it("keeps external implementations out of live qualification", () => {
    expect(isImplementationLiveEligible("MEDUSA")).toBe(false);
    expect(isImplementationLiveEligible("CONTENTFUL")).toBe(false);
  });
});
