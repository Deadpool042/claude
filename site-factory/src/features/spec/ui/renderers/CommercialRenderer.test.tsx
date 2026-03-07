// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommercialRenderer } from "./CommercialRenderer";

describe("CommercialRenderer", () => {
  it("updates stack deploy compatibility entries from the extracted section", async () => {
    const onChange = vi.fn();

    render(
      <CommercialRenderer
        value={{
          version: "1.0.0",
          basePackageBandsByCategory: {
            CAT0: { from: 1000, to: 2000 },
          },
          maintenanceByCategory: {
            CAT0: {
              label: "Basique",
              monthly: 100,
              shortLabel: "Basic",
              splitPrestataire: 50,
              scope: [],
            },
          },
          stackDeployCompat: {
            WORDPRESS: ["DOCKER"],
          },
          rules: {
            modulePriceMustStayProportionateToBase: true,
            preferPluginWhenCheaperStableLowRisk: true,
            pluginPreferenceThresholds: {
              maxMonthlyPluginCost: 120,
              maxDependencyRisk: "LOW",
            },
          },
        }}
        onChange={onChange}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("tab", { name: /Compatibilité stack/ }));

    fireEvent.change(await screen.findByDisplayValue("DOCKER"), {
      target: { value: "KUBERNETES" },
    });

    const nextValue = onChange.mock.calls.at(-1)?.[0] as {
      stackDeployCompat: Record<string, string[]>;
    };

    expect(nextValue.stackDeployCompat.WORDPRESS).toEqual(["KUBERNETES"]);
  });

  it("updates nested pricing rules from the extracted rules section", async () => {
    const onChange = vi.fn();

    render(
      <CommercialRenderer
        value={{
          version: "1.0.0",
          basePackageBandsByCategory: {
            CAT0: { from: 1000, to: 2000 },
          },
          maintenanceByCategory: {
            CAT0: {
              label: "Basique",
              monthly: 100,
              shortLabel: "Basic",
              splitPrestataire: 50,
              scope: [],
            },
          },
          rules: {
            modulePriceMustStayProportionateToBase: true,
            preferPluginWhenCheaperStableLowRisk: true,
            pluginPreferenceThresholds: {
              maxMonthlyPluginCost: 120,
              maxDependencyRisk: "LOW",
            },
          },
        }}
        onChange={onChange}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("tab", { name: /Règles tarifaires/ }));

    fireEvent.change(await screen.findByDisplayValue("120"), {
      target: { value: "150" },
    });

    const nextValue = onChange.mock.calls.at(-1)?.[0] as {
      rules: {
        pluginPreferenceThresholds: {
          maxMonthlyPluginCost: number;
          maxDependencyRisk: string;
        };
      };
    };

    expect(nextValue.rules.pluginPreferenceThresholds.maxMonthlyPluginCost).toBe(150);
    expect(nextValue.rules.pluginPreferenceThresholds.maxDependencyRisk).toBe("LOW");
  });
});
