export type SpecResourceKey = "features" | "modules" | "domains" | "prompts";

export type SpecResourceConfig = {
  key: SpecResourceKey;
  label: string;
  specFile: string | null;
  status: "enabled" | "planned";
  notes?: string;
};

export const SPEC_RESOURCES: SpecResourceConfig[] = [
  {
    key: "features",
    label: "Features",
    specFile: "features.json",
    status: "enabled",
  },
  {
    key: "modules",
    label: "Modules",
    specFile: "modules.json",
    status: "enabled",
  },
  {
    key: "domains",
    label: "Domains",
    specFile: null,
    status: "planned",
    notes: "Enum derive des specs (FEATURE_DOMAINS).",
  },
  {
    key: "prompts",
    label: "Prompt specs",
    specFile: null,
    status: "planned",
    notes: "A definir via Docs/interne/prompts ou spec dediee.",
  },
];
