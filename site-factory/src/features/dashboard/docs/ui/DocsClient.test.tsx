// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DocsClient } from "./DocsClient";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

describe("DocsClient", () => {
  it("loads docs, opens another document, and toggles a favorite", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = resolveUrl(input);

      if (url === "/api/docs") {
        return jsonResponse({
          docs: [
            {
              id: "produit/guide-acme.md",
              title: "Guide Acme",
              category: "Produit",
              categoryKey: "produit",
              tags: ["intro"],
              updatedAt: "2026-03-01T10:00:00.000Z",
            },
            {
              id: "technique/checklist-beta.md",
              title: "Checklist Beta",
              category: "Technique",
              categoryKey: "technique",
              tags: ["ops"],
              updatedAt: "2026-03-02T10:00:00.000Z",
            },
          ],
        });
      }

      if (url === "/api/docs/produit/guide-acme.md") {
        return jsonResponse({
          doc: {
            id: "produit/guide-acme.md",
            title: "Guide Acme",
            category: "Produit",
            categoryKey: "produit",
            tags: ["intro"],
            updatedAt: "2026-03-01T10:00:00.000Z",
            content: "# Guide Acme\n\nContenu Acme",
          },
        });
      }

      if (url === "/api/docs/technique/checklist-beta.md") {
        return jsonResponse({
          doc: {
            id: "technique/checklist-beta.md",
            title: "Checklist Beta",
            category: "Technique",
            categoryKey: "technique",
            tags: ["ops"],
            updatedAt: "2026-03-02T10:00:00.000Z",
            content: "# Checklist Beta\n\nContenu Beta",
          },
        });
      }

      if (url === "/api/docs/favorites" && init?.method === "POST") {
        return jsonResponse({ ok: true });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <DocsClient
        projects={[
          {
            id: "project-1",
            name: "Acme",
            slug: "acme",
            type: "VITRINE",
            techStack: "WORDPRESS",
            modules: [],
            docs: [],
            favorites: [],
          },
        ]}
        globalFavorites={[]}
      />,
    );

    expect(await screen.findByText("Contenu Acme")).toBeTruthy();

    const betaRowLabel = screen.getByText("Checklist Beta");
    const betaRow = betaRowLabel.closest('[role="button"]');

    fireEvent.click(betaRowLabel);
    expect(await screen.findByText("Contenu Beta")).toBeTruthy();

    expect(betaRow).toBeTruthy();

    fireEvent.click(
      within(betaRow as HTMLElement).getByRole("button", {
        name: "Ajouter aux favoris",
      }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/docs/favorites",
        expect.objectContaining({ method: "POST" }),
      );
    });

    const favoriteCall = fetchMock.mock.calls.find(
      ([input, init]) =>
        resolveUrl(input) === "/api/docs/favorites" && init?.method === "POST",
    );

    expect(favoriteCall).toBeTruthy();
    expect(
      JSON.parse(String(favoriteCall?.[1]?.body)),
    ).toMatchObject({
      docId: "technique/checklist-beta.md",
      scope: "global",
      action: "add",
    });
  });
});
