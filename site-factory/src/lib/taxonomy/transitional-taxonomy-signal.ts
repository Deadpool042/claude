import type {
  BackendFamily,
  Category,
  DataSensitivity,
  ScalabilityLevel,
  TrafficLevel,
} from "@/lib/referential";
import type {
  CanonicalProjectTaxonomy,
  LegacyProjectType,
  TaxonomyDisambiguationSignal,
} from "./runtime-taxonomy-mapping";

/**
 * Phase C (transitoire):
 * signal metier explicite pour lever les ambiguities de taxonomie cible
 * tant que les enums runtime legacy restent en place.
 */
export const TAXONOMY_SIGNAL_VALUES = [
  "SITE_VITRINE",
  "SITE_BUSINESS",
  "MVP_SAAS",
  "APP_METIER",
] as const satisfies readonly TaxonomyDisambiguationSignal[];

const TAXONOMY_SIGNAL_SET = new Set<string>(TAXONOMY_SIGNAL_VALUES);
const QUALIFICATION_TAXONOMY_SIGNAL_ENVELOPE_KIND =
  "SITE_FACTORY_TAXONOMY_SIGNAL_V1";
const BUSINESS_CATEGORIES = new Set<Category>(["CAT2", "CAT3", "CAT4"]);
const HIGH_TRAFFIC_LEVELS = new Set<TrafficLevel>(["HIGH", "VERY_HIGH"]);
const APP_METIER_SCALABILITY = new Set<ScalabilityLevel>(["ELASTIC"]);
const APP_METIER_DATA_SENSITIVITY = new Set<DataSensitivity>(["REGULATED"]);
const APP_METIER_BACKEND_FAMILIES = new Set<BackendFamily>(["CUSTOM_API"]);

export const TAXONOMY_SIGNAL_LABELS: Record<
  TaxonomyDisambiguationSignal,
  string
> = {
  SITE_VITRINE: "Site vitrine simple",
  SITE_BUSINESS: "Site business (acquisition/conversion)",
  MVP_SAAS: "MVP SaaS",
  APP_METIER: "Application métier",
};

export const TAXONOMY_SIGNAL_DESCRIPTIONS: Record<
  TaxonomyDisambiguationSignal,
  string
> = {
  SITE_VITRINE: "Presence, credibilite, contenu informatif et time-to-market.",
  SITE_BUSINESS: "Objectifs business actifs: leads, conversion, automatisations.",
  MVP_SAAS: "Validation rapide d'un produit SaaS avec perimetre initial limite.",
  APP_METIER: "Digitalisation d'un process metier avec contraintes fonctionnelles fortes.",
};

export const CANONICAL_TAXONOMY_LABELS: Record<
  CanonicalProjectTaxonomy,
  string
> = {
  SITE_VITRINE: "Site vitrine",
  SITE_BUSINESS: "Site business",
  ECOMMERCE: "E-commerce",
  MVP_SAAS: "MVP SaaS",
  APP_METIER: "Application métier",
};

const SITE_SIGNAL_OPTIONS = [
  {
    value: "SITE_VITRINE",
    label: TAXONOMY_SIGNAL_LABELS.SITE_VITRINE,
    description: TAXONOMY_SIGNAL_DESCRIPTIONS.SITE_VITRINE,
  },
  {
    value: "SITE_BUSINESS",
    label: TAXONOMY_SIGNAL_LABELS.SITE_BUSINESS,
    description: TAXONOMY_SIGNAL_DESCRIPTIONS.SITE_BUSINESS,
  },
] as const;

const APP_SIGNAL_OPTIONS = [
  {
    value: "MVP_SAAS",
    label: TAXONOMY_SIGNAL_LABELS.MVP_SAAS,
    description: TAXONOMY_SIGNAL_DESCRIPTIONS.MVP_SAAS,
  },
  {
    value: "APP_METIER",
    label: TAXONOMY_SIGNAL_LABELS.APP_METIER,
    description: TAXONOMY_SIGNAL_DESCRIPTIONS.APP_METIER,
  },
] as const;

export interface TaxonomySignalOption {
  value: TaxonomyDisambiguationSignal;
  label: string;
  description: string;
}

export function parseTaxonomyDisambiguationSignal(
  value: string | null | undefined,
): TaxonomyDisambiguationSignal | null {
  if (!value) return null;
  const candidate = value.trim();
  if (!candidate) return null;
  if (!TAXONOMY_SIGNAL_SET.has(candidate)) return null;
  return candidate as TaxonomyDisambiguationSignal;
}

export function isTaxonomySignalCompatibleWithProjectType(
  projectType: LegacyProjectType | null,
  signal: TaxonomyDisambiguationSignal,
): boolean {
  if (projectType === "VITRINE" || projectType === "BLOG") {
    return signal === "SITE_VITRINE" || signal === "SITE_BUSINESS";
  }
  if (projectType === "APP") {
    return signal === "MVP_SAAS" || signal === "APP_METIER";
  }
  return false;
}

export function normalizeTaxonomySignalForProjectType(
  projectType: LegacyProjectType | null,
  signal: TaxonomyDisambiguationSignal | null | undefined,
): TaxonomyDisambiguationSignal | null {
  if (!signal) return null;
  return isTaxonomySignalCompatibleWithProjectType(projectType, signal)
    ? signal
    : null;
}

export function resolveDefaultTaxonomySignalForProjectType(
  projectType: LegacyProjectType | null,
): TaxonomyDisambiguationSignal | null {
  if (projectType === "VITRINE" || projectType === "BLOG") {
    return "SITE_VITRINE";
  }
  if (projectType === "APP") {
    return "MVP_SAAS";
  }
  return null;
}

export function getTaxonomySignalOptionsForProjectType(
  projectType: LegacyProjectType | null,
): readonly TaxonomySignalOption[] {
  if (projectType === "VITRINE" || projectType === "BLOG") {
    return SITE_SIGNAL_OPTIONS;
  }
  if (projectType === "APP") {
    return APP_SIGNAL_OPTIONS;
  }
  return [];
}

export type TaxonomySignalResolutionSource =
  | "persisted"
  | "inferred"
  | "default"
  | "none";

export const TAXONOMY_SIGNAL_SOURCE_LABELS: Record<
  TaxonomySignalResolutionSource,
  string
> = {
  persisted: "persisté",
  inferred: "déduit du contexte",
  default: "par défaut",
  none: "absent",
};

export interface TaxonomySignalRuntimeContext {
  projectType: LegacyProjectType | null;
  persistedSignal?: TaxonomyDisambiguationSignal | null;
  category?: Category | null;
  selectedModulesCount?: number | null;
  modulesJson?: string | null;
  trafficLevel?: TrafficLevel | null;
  needsEditing?: boolean | null;
  dataSensitivity?: DataSensitivity | null;
  scalabilityLevel?: ScalabilityLevel | null;
  backendFamily?: BackendFamily | null;
  backendOpsHeavy?: boolean | null;
}

export interface TaxonomySignalResolution {
  signal: TaxonomyDisambiguationSignal | null;
  source: TaxonomySignalResolutionSource;
}

interface TaxonomySignalEnvelopeV1 {
  kind: typeof QUALIFICATION_TAXONOMY_SIGNAL_ENVELOPE_KIND;
  version: 1;
  taxonomySignal: TaxonomyDisambiguationSignal;
  ciAxes: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseJson(value: string | null | undefined): unknown | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function parseTaxonomySignalEnvelope(
  value: unknown,
): TaxonomySignalEnvelopeV1 | null {
  if (!isRecord(value)) return null;
  if (value.kind !== QUALIFICATION_TAXONOMY_SIGNAL_ENVELOPE_KIND) return null;
  if (value.version !== 1) return null;
  if (typeof value.taxonomySignal !== "string") return null;

  const parsedSignal = parseTaxonomyDisambiguationSignal(value.taxonomySignal);
  if (!parsedSignal) return null;

  return {
    kind: QUALIFICATION_TAXONOMY_SIGNAL_ENVELOPE_KIND,
    version: 1,
    taxonomySignal: parsedSignal,
    ciAxes: value.ciAxes ?? null,
  };
}

function toFiniteCount(value: unknown): number | null {
  if (typeof value !== "number") return null;
  if (!Number.isFinite(value)) return null;
  if (value < 0) return 0;
  return Math.floor(value);
}

function parseSelectedModulesCount(modulesJson: string | null | undefined): number | null {
  const parsed = parseJson(modulesJson);
  if (!Array.isArray(parsed)) return null;
  return parsed.length;
}

function resolveSelectedModulesCount(
  context: TaxonomySignalRuntimeContext,
): number | null {
  const explicitCount = toFiniteCount(context.selectedModulesCount);
  if (explicitCount != null) return explicitCount;
  return parseSelectedModulesCount(context.modulesJson ?? null);
}

function inferSiteTaxonomySignal(
  context: TaxonomySignalRuntimeContext,
): TaxonomyDisambiguationSignal | null {
  const selectedModulesCount = resolveSelectedModulesCount(context);
  const category = context.category ?? null;
  const trafficLevel = context.trafficLevel ?? null;

  const isBusinessDriven =
    (category ? BUSINESS_CATEGORIES.has(category) : false) ||
    (trafficLevel ? HIGH_TRAFFIC_LEVELS.has(trafficLevel) : false) ||
    (selectedModulesCount != null && selectedModulesCount >= 2);

  if (isBusinessDriven) {
    return "SITE_BUSINESS";
  }

  const hasSignals =
    category != null ||
    trafficLevel != null ||
    context.needsEditing != null ||
    selectedModulesCount != null;

  return hasSignals ? "SITE_VITRINE" : null;
}

function inferAppTaxonomySignal(
  context: TaxonomySignalRuntimeContext,
): TaxonomyDisambiguationSignal | null {
  const selectedModulesCount = resolveSelectedModulesCount(context);
  const backendFamily = context.backendFamily ?? null;
  const backendOpsHeavy = context.backendOpsHeavy ?? null;
  const dataSensitivity = context.dataSensitivity ?? null;
  const scalabilityLevel = context.scalabilityLevel ?? null;

  const isBusinessCriticalApp =
    (backendFamily
      ? APP_METIER_BACKEND_FAMILIES.has(backendFamily)
      : false) ||
    backendOpsHeavy === true ||
    (dataSensitivity
      ? APP_METIER_DATA_SENSITIVITY.has(dataSensitivity)
      : false) ||
    (scalabilityLevel
      ? APP_METIER_SCALABILITY.has(scalabilityLevel)
      : false);

  if (isBusinessCriticalApp) {
    return "APP_METIER";
  }

  const hasSignals =
    backendFamily != null ||
    backendOpsHeavy != null ||
    dataSensitivity != null ||
    scalabilityLevel != null ||
    selectedModulesCount != null;

  return hasSignals ? "MVP_SAAS" : null;
}

export function inferTaxonomySignalFromRuntimeContext(
  context: TaxonomySignalRuntimeContext,
): TaxonomyDisambiguationSignal | null {
  if (context.projectType === "VITRINE" || context.projectType === "BLOG") {
    return inferSiteTaxonomySignal(context);
  }
  if (context.projectType === "APP") {
    return inferAppTaxonomySignal(context);
  }
  return null;
}

export function resolveTaxonomySignalFromRuntimeContext(
  context: TaxonomySignalRuntimeContext,
): TaxonomySignalResolution {
  const persisted = normalizeTaxonomySignalForProjectType(
    context.projectType,
    context.persistedSignal ?? null,
  );
  if (persisted) {
    return { signal: persisted, source: "persisted" };
  }

  const inferred = normalizeTaxonomySignalForProjectType(
    context.projectType,
    inferTaxonomySignalFromRuntimeContext(context),
  );
  if (inferred) {
    return { signal: inferred, source: "inferred" };
  }

  const fallback = resolveDefaultTaxonomySignalForProjectType(
    context.projectType,
  );
  if (fallback) {
    return { signal: fallback, source: "default" };
  }

  return { signal: null, source: "none" };
}

export function readPersistedTaxonomySignalFromCiAxesJson(
  ciAxesJson: string | null | undefined,
): TaxonomyDisambiguationSignal | null {
  const parsed = parseJson(ciAxesJson);
  const envelope = parseTaxonomySignalEnvelope(parsed);
  if (!envelope) return null;
  return envelope.taxonomySignal;
}

/**
 * Phase Prisma minimale:
 * priorise la colonne dédiée puis bascule sur le fallback transitoire ciAxesJson.
 */
export function readPersistedTaxonomySignalDualSource(input: {
  projectType: LegacyProjectType | null;
  taxonomySignal: TaxonomyDisambiguationSignal | string | null | undefined;
  ciAxesJson: string | null | undefined;
}): TaxonomyDisambiguationSignal | null {
  const dedicatedSignal = normalizeTaxonomySignalForProjectType(
    input.projectType,
    parseTaxonomyDisambiguationSignal(input.taxonomySignal),
  );
  if (dedicatedSignal) {
    return dedicatedSignal;
  }

  return normalizeTaxonomySignalForProjectType(
    input.projectType,
    readPersistedTaxonomySignalFromCiAxesJson(input.ciAxesJson),
  );
}

export function readCiAxesPayloadFromCiAxesJson(
  ciAxesJson: string | null | undefined,
): unknown {
  const parsed = parseJson(ciAxesJson);
  if (parsed == null) return null;
  const envelope = parseTaxonomySignalEnvelope(parsed);
  if (!envelope) return parsed;
  return envelope.ciAxes ?? null;
}

function safeStringify(value: unknown): string | null {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === "string" ? serialized : null;
  } catch {
    return null;
  }
}

export function serializeQualificationCiAxesJson(input: {
  taxonomySignal: TaxonomyDisambiguationSignal | null;
  ciAxes?: unknown;
  previousCiAxesJson?: string | null;
}): string | null {
  const ciAxes =
    input.ciAxes !== undefined
      ? input.ciAxes
      : readCiAxesPayloadFromCiAxesJson(input.previousCiAxesJson ?? null);

  if (!input.taxonomySignal) {
    if (ciAxes == null) return null;
    return safeStringify(ciAxes);
  }

  const envelope: TaxonomySignalEnvelopeV1 = {
    kind: QUALIFICATION_TAXONOMY_SIGNAL_ENVELOPE_KIND,
    version: 1,
    taxonomySignal: input.taxonomySignal,
    ciAxes: ciAxes ?? null,
  };
  return safeStringify(envelope);
}
