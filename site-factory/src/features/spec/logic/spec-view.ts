export const SPEC_VIEWS = ["overview", "edit"] as const;

export type SpecView = (typeof SPEC_VIEWS)[number];

export function normalizeSpecView(value: string | null | undefined): SpecView {
  return value === "edit" ? "edit" : "overview";
}

export function buildSpecViewHref(specFile: string, view: SpecView): string {
  const encoded = encodeURIComponent(specFile);
  if (view === "overview") {
    return `/dashboard/spec/${encoded}`;
  }
  return `/dashboard/spec/${encoded}?view=${view}`;
}
