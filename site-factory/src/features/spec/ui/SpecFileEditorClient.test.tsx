// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SpecFileEditorClient } from "./SpecFileEditorClient";

const replaceMock = vi.fn();
const searchParamGetMock = vi.fn(() => null);

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => ({ get: searchParamGetMock }),
}));

vi.mock("@/features/spec/ui/SpecFormEditor", () => ({
  SpecFormEditor: () => <div>Formulaire spec</div>,
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

describe("SpecFileEditorClient", () => {
  it("covers detail to edit navigation", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (resolveUrl(input) === "/api/spec/cms.json") {
        return jsonResponse({
          name: "cms.json",
          content: {
            version: "1",
            _meta: {
              purpose: "Catalogue CMS de test.",
            },
            cms: [
              {
                id: "wordpress",
                kind: "CONTENT",
                type: "MONOLITHIC",
                extensionModel: "plugins",
              },
            ],
          },
          raw: "{}",
        });
      }

      throw new Error(`Unexpected fetch: ${resolveUrl(input)}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<SpecFileEditorClient specFile="cms.json" />);

    expect(await screen.findByText("Catalogue CMS de test.")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "Édition" })[0]);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/spec/cms.json?view=edit");
    });

    expect(await screen.findByText("Édition visuelle")).toBeTruthy();
    expect(screen.getByText("Formulaire spec")).toBeTruthy();
  });
});
