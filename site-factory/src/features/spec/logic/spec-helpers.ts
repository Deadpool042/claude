import type { JsonValue, JsonPath } from "./spec-types";
import { capitalizeFirst, splitCamelCase } from "@/shared/lib/text";

// ── Immutable path operations ────────────────────

export function setAtPath(root: JsonValue, path: JsonPath, val: JsonValue): JsonValue {
  if (path.length === 0) return val;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const c = [...root];
    c[head as number] = setAtPath(c[head as number], rest, val);
    return c;
  }
  if (root && typeof root === "object") {
    const r = root as Record<string, JsonValue>;
    return { ...r, [head as string]: setAtPath(r[head as string], rest, val) };
  }
  return root;
}

export function deleteAtPath(root: JsonValue, path: JsonPath): JsonValue {
  if (path.length === 0) return root;
  if (path.length === 1) {
    const k = path[0];
    if (Array.isArray(root)) {
      const c = [...root];
      c.splice(k as number, 1);
      return c;
    }
    if (root && typeof root === "object") {
      const c = { ...(root as Record<string, JsonValue>) };
      delete c[k as string];
      return c;
    }
    return root;
  }
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const c = [...root];
    c[head as number] = deleteAtPath(c[head as number], rest);
    return c;
  }
  if (root && typeof root === "object") {
    const r = root as Record<string, JsonValue>;
    return { ...r, [head as string]: deleteAtPath(r[head as string], rest) };
  }
  return root;
}

// ── Auto-detection ───────────────────────────────

/** Scan an array of objects to find string fields with limited distinct values → enum */
export function detectEnumFields(
  items: Record<string, JsonValue>[],
): Record<string, string[]> {
  if (items.length < 2) return {};
  const result: Record<string, string[]> = {};
  const allKeys = new Set<string>();
  for (const item of items)
    for (const k of Object.keys(item)) allKeys.add(k);

  for (const key of allKeys) {
    const vals = items
      .map((it) => it[key])
      .filter(
        (v): v is string =>
          typeof v === "string" && v.trim().length > 0,
      );
    if (vals.length < 2) continue;
    const distinct = [...new Set(vals)];
    if (distinct.length <= 20 && distinct.length < vals.length * 0.8) {
      result[key] = distinct.sort();
    }
  }
  return result;
}

export function buildItemTemplate(
  items: Record<string, JsonValue>[],
): Record<string, JsonValue> {
  const template: Record<string, JsonValue> = {};
  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      if (!(key in template)) {
        template[key] = value;
        continue;
      }
      if (template[key] === null && value !== null) {
        template[key] = value;
      }
    }
  }
  return template;
}

/** Detect {from,to} or {min,max} range pair objects */
export function isRangePair(
  obj: Record<string, JsonValue>,
): { lo: string; hi: string; extra: string[] } | null {
  const keys = Object.keys(obj);
  const nums = keys.filter((k) => typeof obj[k] === "number");
  const other = keys.filter((k) => typeof obj[k] !== "number");
  if (nums.includes("from") && nums.includes("to") && keys.length <= 4)
    return { lo: "from", hi: "to", extra: other };
  if (nums.includes("min") && nums.includes("max") && keys.length <= 4)
    return { lo: "min", hi: "max", extra: other };
  return null;
}

export function formatLabel(key: string): string {
  return capitalizeFirst(splitCamelCase(key).replace(/_/g, " "));
}

export function getItemSummary(item: Record<string, JsonValue>): string {
  for (const k of ["label", "name", "title"]) {
    if (typeof item[k] === "string" && (item[k] as string).length > 0)
      return item[k] as string;
  }
  if (typeof item.id === "string") return item.id as string;
  return `{${Object.keys(item).length} champs}`;
}

export function getItemId(item: Record<string, JsonValue>): string | null {
  return typeof item.id === "string" ? (item.id as string) : null;
}

export function createDefaultItem(
  template: Record<string, JsonValue>,
): Record<string, JsonValue> {
  const r: Record<string, JsonValue> = {};
  for (const [k, v] of Object.entries(template)) {
    if (typeof v === "string") r[k] = "";
    else if (typeof v === "number") r[k] = 0;
    else if (typeof v === "boolean") r[k] = false;
    else if (v === null) r[k] = null;
    else if (Array.isArray(v)) r[k] = [];
    else if (typeof v === "object") r[k] = createDefaultItem(v as Record<string, JsonValue>);
  }
  return r;
}

// ── Formatting ───────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
