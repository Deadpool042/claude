"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { getSpecializedRenderer } from "./renderers";
import { RootKeySection } from "./form-fields";
import type { JsonValue, JsonPath, SpecFormEditorProps } from "../logic/spec-types";
import { FIELD_TOOLTIPS } from "../logic/field-tooltips";
import { setAtPath, deleteAtPath } from "../logic/spec-helpers";

// ── Main component ───────────────────────────────

export function SpecFormEditor({ value, onChange, specFile }: SpecFormEditorProps) {
  const [search, setSearch] = useState("");

  // Check for specialized renderer
  const SpecializedRenderer = specFile
    ? getSpecializedRenderer(specFile)
    : null;

  const handleUpdate = useCallback(
    (path: JsonPath, newVal: JsonValue) => {
      onChange(setAtPath(value, path, newVal));
    },
    [value, onChange],
  );

  const handleDelete = useCallback(
    (path: JsonPath) => {
      onChange(deleteAtPath(value, path));
    },
    [value, onChange],
  );

  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Ce fichier ne peut pas être édité visuellement (racine non-objet).
      </div>
    );
  }

  // Use specialized renderer if available
  if (SpecializedRenderer) {
    return (
      <TooltipProvider>
        <SpecializedRenderer value={value} onChange={onChange} />
      </TooltipProvider>
    );
  }

  const tooltips = specFile ? FIELD_TOOLTIPS[specFile] : undefined;
  const rootObj = value as Record<string, JsonValue>;
  const rootKeys = Object.keys(rootObj);
  const filtered = search
    ? rootKeys.filter((k) =>
        k.toLowerCase().includes(search.toLowerCase()),
      )
    : rootKeys;

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer les sections…"
            className="h-8 pl-8 text-xs"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground/60">
            Aucune section pour &laquo; {search} &raquo;
          </div>
        ) : (
          filtered.map((key) => {
            const tip = tooltips?.[key];
            return (
              <RootKeySection
                key={key}
                sectionKey={key}
                value={rootObj[key]}
                path={[key]}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                {...(tip ? { tooltip: tip } : {})}
              />
            );
          })
        )}
      </div>
    </TooltipProvider>
  );
}
