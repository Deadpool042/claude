// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SpecListClient } from "./SpecListClient";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("SpecListClient", () => {
  it("loads the catalog and exposes detail/edit links", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          files: [
            {
              name: "cms.json",
              label: "CMS de test",
              size: 1024,
              lastModified: "2026-03-01T10:00:00.000Z",
              domain: "Architecture",
              coverage: "CMS et supports",
              role: "Catalogue CMS",
              summary: "Vue de test",
              relatedSpecs: ["features.json"],
              topLevelKeys: ["cms", "_meta"],
              itemCount: 1,
              version: "1.0.0",
            },
          ],
        }),
      ),
    );

    render(<SpecListClient />);

    expect(await screen.findByText("CMS de test")).toBeTruthy();
    expect(screen.getByText("Catalogue CMS")).toBeTruthy();

    const readLink = screen.getByRole("link", { name: "Vue détaillée" });
    const editLink = screen.getByRole("link", { name: /Édition/ });

    expect(readLink.getAttribute("href")).toBe("/dashboard/spec/cms.json");
    expect(editLink.getAttribute("href")).toBe("/dashboard/spec/cms.json?view=edit");
  });
});
