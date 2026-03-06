import type {
  CommercialSpec,
  ConstraintDef as SpecConstraintDef,
  DecisionMatrixEntry,
  DecisionMatrixRow,
  FeatureSpecItem,
  InfraServicesSpec,
  ModuleSpecItem,
  PluginSpecItem,
  StackProfilesSpec,
} from "@/lib/referential/spec/types";

// ── Shared types for the spec editor feature ────

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonPath = (string | number)[];

export interface SpecRendererProps {
  value: JsonValue;
  onChange: (value: JsonValue) => void;
}

export interface SpecFormEditorProps {
  value: JsonValue;
  onChange: (value: JsonValue) => void;
  specFile?: string;
}

export type SpecSectionKind =
  | "collection"
  | "dictionary"
  | "object"
  | "list"
  | "scalar";

export interface SpecSectionSummary {
  key: string;
  kind: SpecSectionKind;
  count: number | null;
  sampleKeys: string[];
}

export interface SpecGovernanceEntry {
  label: string;
  source: string;
  description: string;
}

export interface SpecDetailMetric {
  label: string;
  value: string;
  tone?: "default" | "accent" | "warning";
}

export interface SpecDetailSection {
  title: string;
  description: string;
  metrics: SpecDetailMetric[];
  tags: string[];
}

export interface SpecOverviewSummary {
  domain: string;
  coverage: string;
  role: string;
  summary: string;
  version: string | null;
  consumers: string[];
  relatedSpecs: Array<{ spec: string; description: string }>;
  concepts: Array<{ term: string; definition: string }>;
  editGuide: string[];
  impactWarning: string | null;
  requiredTopLevelKeys: string[];
  governance: SpecGovernanceEntry[];
  detailSections: SpecDetailSection[];
  sections: SpecSectionSummary[];
}

export type MatrixRow = DecisionMatrixRow;
export type MatrixEntry = DecisionMatrixEntry;

export type PluginItem = PluginSpecItem;
export type FeatureItem = FeatureSpecItem;
export type ModuleItem = ModuleSpecItem;

export type ConstraintDef = SpecConstraintDef;

export type PriceBand = CommercialSpec["basePackageBandsByCategory"][keyof CommercialSpec["basePackageBandsByCategory"]];
export type MaintenancePlan = CommercialSpec["maintenanceByCategory"][keyof CommercialSpec["maintenanceByCategory"]];
export type DeployFee = NonNullable<CommercialSpec["deployFees"]>[string];
export type HostingCost = NonNullable<CommercialSpec["hostingCosts"]>[string];
export type SaasCost = NonNullable<CommercialSpec["saasCosts"]>[string];

// ── Stack Profiles ──

export type StackFamily = StackProfilesSpec["families"][number];
export type StackProfile = StackProfilesSpec["profiles"][number];

// ── Infra Services ──

export type InfraServiceUIItem = InfraServicesSpec["services"][number];
export type InfraServiceCategoryUI = InfraServicesSpec["categories"][number];

export interface SpecFileInfo {
  name: string;
  label: string;
  size: number;
  lastModified: string;
  domain: string;
  coverage: string;
  role: string;
  summary: string;
  relatedSpecs: string[];
  topLevelKeys: string[];
  itemCount: number | null;
  version: string | null;
}
