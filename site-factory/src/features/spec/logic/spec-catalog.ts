import type {
  JsonValue,
  SpecFileInfo,
  SpecGovernanceEntry,
  SpecOverviewSummary,
  SpecSectionKind,
  SpecSectionSummary,
} from "./spec-types";
import { buildSpecDetailSections } from "./spec-detail-sections";
import { getSpecReadingEntry } from "./spec-docs";

type JsonRecord = Record<string, JsonValue>;

type ResolvedText = {
  value: string;
  source: string;
};

type ResolvedList = {
  value: string[];
  source: string;
};

function isJsonRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim().length > 0,
  );
}

function getMeta(content: unknown): JsonRecord | null {
  if (!isJsonRecord(content)) {
    return null;
  }
  const meta = content._meta;
  return isJsonRecord(meta) ? meta : null;
}

function getRootRecord(content: unknown): JsonRecord | null {
  return isJsonRecord(content) ? content : null;
}

function inferSectionKind(value: JsonValue): SpecSectionKind {
  if (Array.isArray(value)) {
    if (
      value.every(
        (entry) => entry !== null && typeof entry === "object" && !Array.isArray(entry),
      )
    ) {
      return "collection";
    }
    return "list";
  }

  if (value !== null && typeof value === "object") {
    const childValues = Object.values(value);
    if (
      childValues.length > 0 &&
      childValues.every(
        (entry) => entry !== null && typeof entry === "object" && !Array.isArray(entry),
      )
    ) {
      return "dictionary";
    }
    return "object";
  }

  return "scalar";
}

function summarizeSampleKeys(value: JsonValue): string[] {
  if (Array.isArray(value) && value.length > 0) {
    const first = value.find(
      (entry) => entry !== null && typeof entry === "object" && !Array.isArray(entry),
    );
    if (first && isJsonRecord(first)) {
      return Object.keys(first).slice(0, 4);
    }
    return [];
  }

  if (!isJsonRecord(value)) {
    return [];
  }

  const childValues = Object.values(value);
  const firstChild = childValues.find(
    (entry) => entry !== null && typeof entry === "object" && !Array.isArray(entry),
  );
  if (firstChild && isJsonRecord(firstChild)) {
    return Object.keys(firstChild).slice(0, 4);
  }
  return Object.keys(value).slice(0, 4);
}

function summarizeCount(kind: SpecSectionKind, value: JsonValue): number | null {
  if (Array.isArray(value)) {
    return value.length;
  }
  if (kind === "dictionary" || kind === "object") {
    return isJsonRecord(value) ? Object.keys(value).length : null;
  }
  return null;
}

function getSections(content: unknown): SpecSectionSummary[] {
  const root = getRootRecord(content);
  if (!root) {
    return [];
  }

  return Object.entries(root)
    .filter(([key]) => key !== "_meta")
    .map(([key, value]) => {
      const kind = inferSectionKind(value);
      return {
        key,
        kind,
        count: summarizeCount(kind, value),
        sampleKeys: summarizeSampleKeys(value),
      };
    });
}

function getRequiredTopLevelKeys(meta: JsonRecord | null): string[] {
  if (!meta) {
    return [];
  }
  const shape = meta.shape;
  if (!isJsonRecord(shape)) {
    return [];
  }
  return readStringArray(shape.requiredTopLevel);
}

function getVersion(content: unknown, meta: JsonRecord | null): string | null {
  const root = getRootRecord(content);
  return readString(root?.version) ?? readString(meta?.version);
}

function resolveSummary(specFile: string, meta: JsonRecord | null): ResolvedText {
  const summary = readString(meta?.purpose);
  if (summary) {
    return {
      value: summary,
      source: `Docs/_spec/${specFile}::_meta.purpose`,
    };
  }
  return {
    value: "Aucun resume disponible.",
    source: "Aucune metadonnee embarquee disponible",
  };
}

function resolveConsumers(specFile: string, meta: JsonRecord | null): ResolvedList {
  const consumers = readStringArray(meta?.consumedBy);
  if (consumers.length > 0) {
    return {
      value: consumers,
      source: `Docs/_spec/${specFile}::_meta.consumedBy`,
    };
  }
  return {
    value: [],
    source: "Aucun consommateur declare dans _meta",
  };
}

function buildGovernance(
  specFile: string,
  summary: ResolvedText,
  consumers: ResolvedList,
): SpecGovernanceEntry[] {
  return [
    {
      label: "Resume humain",
      source: summary.source,
      description:
        "Le catalogue et la vue detail reprennent ce resume en priorite depuis les metadonnees embarquees.",
    },
    {
      label: "Consommateurs",
      source: consumers.source,
      description:
        "La liste des consommateurs techniques provient de _meta pour limiter la duplication documentaire.",
    },
    {
      label: "Cadre de lecture",
      source: "features/spec/logic/spec-docs.ts",
      description:
        "Le registre UI fournit le domaine, la couverture, les relations et la checklist de lecture.",
    },
    {
      label: "Structure detaillee",
      source: `Docs/_spec/${specFile}`,
      description:
        "Les vues detaillees et les sections top-level sont derivees directement du contenu JSON courant.",
    },
  ];
}

function getPrimaryItemCount(sections: SpecSectionSummary[]): number | null {
  const firstStructuredSection = sections.find(
    (section) => section.kind === "collection" || section.kind === "dictionary",
  );
  if (firstStructuredSection?.count !== null && firstStructuredSection !== undefined) {
    return firstStructuredSection.count;
  }
  return sections[0]?.count ?? null;
}

export function buildSpecOverview(
  specFile: string,
  content: unknown,
): SpecOverviewSummary {
  const meta = getMeta(content);
  const readingEntry = getSpecReadingEntry(specFile);
  const summary = resolveSummary(specFile, meta);
  const consumers = resolveConsumers(specFile, meta);
  const sections = getSections(content);

  return {
    domain: readingEntry.domain,
    coverage: readingEntry.coverage,
    role: readingEntry.role,
    summary: summary.value,
    version: getVersion(content, meta),
    consumers: consumers.value,
    relatedSpecs: readingEntry.relationships,
    concepts: readingEntry.concepts,
    editGuide: readingEntry.editGuide,
    impactWarning: readingEntry.impactWarning,
    requiredTopLevelKeys: getRequiredTopLevelKeys(meta),
    governance: buildGovernance(specFile, summary, consumers),
    detailSections: buildSpecDetailSections(specFile, content),
    sections,
  };
}

type SpecCatalogInfoInput = Pick<SpecFileInfo, "name" | "label" | "size" | "lastModified">;

export function buildSpecCatalogEntry(
  file: SpecCatalogInfoInput,
  content: unknown,
): SpecFileInfo {
  const overview = buildSpecOverview(file.name, content);

  return {
    ...file,
    domain: overview.domain,
    coverage: overview.coverage,
    role: overview.role,
    summary: overview.summary,
    relatedSpecs: overview.relatedSpecs.map((relation) => relation.spec),
    topLevelKeys: overview.sections.map((section) => section.key),
    itemCount: getPrimaryItemCount(overview.sections),
    version: overview.version,
  };
}
