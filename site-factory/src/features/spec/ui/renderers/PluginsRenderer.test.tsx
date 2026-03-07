// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PluginsRenderer } from "./PluginsRenderer";
import type { JsonValue, PluginItem } from "../../logic/spec-types";

describe("PluginsRenderer", () => {
  it("updates the correct plugin after filtering the list", () => {
    const onChange = vi.fn();
    const plugins: PluginItem[] = [
      {
        id: "plugin.alpha",
        label: "Alpha Plugin",
        description: "Desc Alpha",
        featureIds: ["feature.ALPHA"],
        cmsIds: ["cms.WORDPRESS"],
        pricingMode: "FREE",
      },
      {
        id: "plugin.bravo",
        label: "Bravo Plugin",
        description: "Desc Bravo",
        featureIds: ["feature.BRAVO"],
        cmsIds: ["cms.SHOPIFY"],
        pricingMode: "PAID",
        billingCycle: "MONTHLY",
        priceMonthlyMin: 19,
        priceMonthlyMax: 29,
      },
    ];

    render(
      <PluginsRenderer
        value={{ version: "1.0.0", plugins } as unknown as JsonValue}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/Rechercher/), {
      target: { value: "Bravo" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Développer Bravo Plugin/ }));

    fireEvent.change(screen.getByDisplayValue("Desc Bravo"), {
      target: { value: "Desc Bravo updated" },
    });

    const nextValue = onChange.mock.calls.at(-1)?.[0] as {
      plugins: PluginItem[];
    };

    expect(nextValue.plugins[0]?.description).toBe("Desc Alpha");
    expect(nextValue.plugins[1]?.description).toBe("Desc Bravo updated");
  });
});
