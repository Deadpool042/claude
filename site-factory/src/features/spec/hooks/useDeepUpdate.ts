import { useCallback } from "react";
import type { JsonValue, JsonPath } from "../logic/spec-types";

/**
 * Deep immutable updater for nested JSON structures.
 * Used by renderers that need to update values at arbitrary paths.
 */
export function useDeepUpdate(
  root: Record<string, JsonValue>,
  onChange: (value: JsonValue) => void,
) {
  return useCallback(
    (path: JsonPath, val: JsonValue) => {
      if (path.length === 0) {
        onChange(val);
        return;
      }

      const set = (obj: JsonValue, p: JsonPath, v: JsonValue): JsonValue => {
        if (p.length === 0) return v;
        const [head, ...rest] = p;
        if (Array.isArray(obj)) {
          const c = [...obj];
          c[head as number] = set(c[head as number], rest, v);
          return c;
        }
        if (obj && typeof obj === "object") {
          const r = obj as Record<string, JsonValue>;
          return { ...r, [head as string]: set(r[head as string], rest, v) };
        }
        return obj;
      };

      onChange(set(root as JsonValue, path, val));
    },
    [root, onChange],
  );
}
