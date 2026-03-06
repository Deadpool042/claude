import type { SelectOption } from "@/shared/components/form/FieldSelect";
import type { FeatureItem, ModuleItem } from "../logic/spec-types";

type RefItem = {
  id: string;
  label?: string;
  name?: string;
};

export type SpecReferenceIssue = {
  path: string;
  message: string;
};

export function buildSelectOptions(items: RefItem[], sort = true): SelectOption[] {
  const options = items.map((item) => ({
    value: item.id,
    label: item.label ?? item.name ?? item.id,
  }));
  if (!sort) return options;
  return [...options].sort((a, b) => a.label.localeCompare(b.label, "fr"));
}

export function normalizeSpecId(raw: string, prefix?: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (prefix && trimmed.toLowerCase().startsWith(`${prefix.toLowerCase()}.`)) return trimmed;
  if (trimmed.includes(".")) return trimmed;

  const normalized = trimmed
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  return prefix ? `${prefix}.${normalized}` : normalized;
}

export function validateSpecReferences(
  resource: "features" | "modules",
  item: FeatureItem | ModuleItem,
  featureIds: Set<string>,
): SpecReferenceIssue[] {
  const issues: SpecReferenceIssue[] = [];

  if (resource === "features") {
    const feature = item as FeatureItem;
    const deps = feature.dependencies ?? [];
    deps.forEach((dep, idx) => {
      if (dep === feature.id) {
        issues.push({
          path: `dependencies[${idx}]`,
          message: "Une feature ne peut pas dependre d'elle-meme",
        });
      } else if (!featureIds.has(dep)) {
        issues.push({
          path: `dependencies[${idx}]`,
          message: `Feature inconnue: ${dep}`,
        });
      }
    });
  }

  if (resource === "modules") {
    const moduleItem = item as ModuleItem;
    const featureRefs = moduleItem.featureIds ?? [];
    featureRefs.forEach((fid, idx) => {
      if (!featureIds.has(fid)) {
        issues.push({
          path: `featureIds[${idx}]`,
          message: `Feature inconnue: ${fid}`,
        });
      }
    });
  }

  return issues;
}

export function mapSpecToFormValues(
  resource: "features" | "modules",
  item: FeatureItem | ModuleItem,
): FeatureItem | ModuleItem {
  if (resource === "features") {
    const feature = item as FeatureItem;
    return {
      ...feature,
      dependencies: feature.dependencies ?? [],
      tags: feature.tags ?? [],
    } satisfies FeatureItem;
  }

  const moduleItem = item as ModuleItem;
  return {
    ...moduleItem,
    details: moduleItem.details ?? [],
    featureIds: moduleItem.featureIds ?? [],
  } satisfies ModuleItem;
}

export function mapFormValuesToSpecPayload(
  resource: "features" | "modules",
  item: FeatureItem | ModuleItem,
): FeatureItem | ModuleItem {
  if (resource === "features") {
    const feature = item as FeatureItem;
    const dependencies = (feature.dependencies ?? [])
      .map((dep) => normalizeSpecId(dep, "feature"))
      .filter(Boolean);
    const tags = (feature.tags ?? []).map((tag) => tag.trim()).filter(Boolean);

    return {
      ...feature,
      label: feature.label.trim(),
      description: feature.description.trim(),
      dependencies,
      tags,
    } satisfies FeatureItem;
  }

  const moduleItem = item as ModuleItem;
  const featureIds = (moduleItem.featureIds ?? [])
    .map((fid) => normalizeSpecId(fid, "feature"))
    .filter(Boolean);
  const details = (moduleItem.details ?? []).map((d) => d.trim()).filter(Boolean);

  return {
    ...moduleItem,
    label: moduleItem.label.trim(),
    description: moduleItem.description.trim(),
    featureIds,
    details,
  } satisfies ModuleItem;
}
