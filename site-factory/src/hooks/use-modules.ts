"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import {
  MODULE_CATALOG,
  normalizeModuleIds,
} from "@/lib/referential";
import type { ModuleCatSelection } from "@/lib/qualification-runtime";
import type { ModuleId } from "@/lib/offers";

// ── Types ──────────────────────────────────────────────────────────

export interface UseModulesReturn {
  selectedModules: Set<ModuleId>;
  catSelections: Record<string, ModuleCatSelection>;
  setCatSelections: Dispatch<SetStateAction<Record<string, ModuleCatSelection>>>;
  toggleModule: (id: ModuleId) => void;
  syncModules: (options: {
    allowedIds?: ModuleId[];
    mandatoryIds?: ModuleId[];
    selectedIds?: ModuleId[];
  }) => void;
  clearModules: () => void;
}

// ── Hook ───────────────────────────────────────────────────────────

export function useModules(initialModuleIds: string[] = []): UseModulesReturn {
  const normalizedInitialIds = normalizeModuleIds(initialModuleIds);
  const [selectedModules, setSelectedModules] = useState<Set<ModuleId>>(
    () => new Set(normalizedInitialIds),
  );

  const [catSelections, setCatSelections] = useState<
    Record<string, ModuleCatSelection>
  >(() => {
    const initial: Record<string, ModuleCatSelection> = {};
    for (const id of normalizedInitialIds) {
      const mod = MODULE_CATALOG.find((m) => m.id === id);
      if (mod?.setupCats || mod?.subscriptionCats) {
        const sel: ModuleCatSelection = {};
        if (mod.setupCats?.[0]) sel.setupCatId = mod.setupCats[0].id;
        if (mod.subscriptionCats?.[0]) sel.subCatId = mod.subscriptionCats[0].id;
        initial[id] = sel;
      }
    }
    return initial;
  });

  const toggleModule = useCallback((id: ModuleId) => {
    const mod = MODULE_CATALOG.find((m) => m.id === id);
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setCatSelections((ts) => {
          const { [id]: _, ...rest } = ts;
          return rest;
        });
      } else {
        next.add(id);
        if (mod?.setupCats || mod?.subscriptionCats) {
          setCatSelections((ts) => {
            const sel: ModuleCatSelection = {};
            if (mod.setupCats?.[0]) sel.setupCatId = mod.setupCats[0].id;
            if (mod.subscriptionCats?.[0]) sel.subCatId = mod.subscriptionCats[0].id;
            return { ...ts, [id]: sel };
          });
        }
      }
      return next;
    });
  }, []);

  const syncModules = useCallback(
    (options: {
      allowedIds?: ModuleId[];
      mandatoryIds?: ModuleId[];
      selectedIds?: ModuleId[];
    }) => {
      const allowed = options.allowedIds ?? null;
      const mandatory = options.mandatoryIds ?? [];
      const selected = options.selectedIds ?? [];

      setSelectedModules((prev) => {
        const next = new Set(prev);

        if (allowed) {
          for (const id of Array.from(next)) {
            if (!allowed.includes(id)) {
              next.delete(id);
            }
          }
        }

        for (const id of mandatory) {
          next.add(id);
        }

        for (const id of selected) {
          if (!allowed || allowed.includes(id)) {
            next.add(id);
          }
        }

        setCatSelections((ts) => {
          const updated: Record<string, ModuleCatSelection> = { ...ts };
          for (const key of Object.keys(updated)) {
            if (!next.has(key as ModuleId)) {
              delete updated[key];
            }
          }

          for (const id of next) {
            if (!updated[id]) {
              const mod = MODULE_CATALOG.find((m) => m.id === id);
              if (mod?.setupCats || mod?.subscriptionCats) {
                const sel: ModuleCatSelection = {};
                if (mod.setupCats?.[0]) sel.setupCatId = mod.setupCats[0].id;
                if (mod.subscriptionCats?.[0]) sel.subCatId = mod.subscriptionCats[0].id;
                updated[id] = sel;
              }
            }
          }

          return updated;
        });

        return next;
      });
    },
    [],
  );

  const clearModules = useCallback(() => {
    setSelectedModules(new Set());
    setCatSelections({});
  }, []);

  return {
    selectedModules,
    catSelections,
    setCatSelections,
    toggleModule,
    syncModules,
    clearModules,
  };
}
