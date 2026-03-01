"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import {
  MODULE_CATALOG,
  normalizeModuleIds,
  type ModuleTierSelection,
} from "@/lib/qualification";
import type { ModuleId } from "@/lib/offers/offers";

// ── Types ──────────────────────────────────────────────────────────

export interface UseModulesReturn {
  selectedModules: Set<ModuleId>;
  tierSelections: Record<string, ModuleTierSelection>;
  setTierSelections: Dispatch<SetStateAction<Record<string, ModuleTierSelection>>>;
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

  const [tierSelections, setTierSelections] = useState<
    Record<string, ModuleTierSelection>
  >(() => {
    const initial: Record<string, ModuleTierSelection> = {};
    for (const id of normalizedInitialIds) {
      const mod = MODULE_CATALOG.find((m) => m.id === id);
      if (mod?.setupTiers || mod?.subscriptionTiers) {
        const sel: ModuleTierSelection = {};
        if (mod.setupTiers?.[0]) sel.setupTierId = mod.setupTiers[0].id;
        if (mod.subscriptionTiers?.[0]) sel.subTierId = mod.subscriptionTiers[0].id;
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
        setTierSelections((ts) => {
          const { [id]: _, ...rest } = ts;
          return rest;
        });
      } else {
        next.add(id);
        if (mod?.setupTiers || mod?.subscriptionTiers) {
          setTierSelections((ts) => {
            const sel: ModuleTierSelection = {};
            if (mod.setupTiers?.[0]) sel.setupTierId = mod.setupTiers[0].id;
            if (mod.subscriptionTiers?.[0]) sel.subTierId = mod.subscriptionTiers[0].id;
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

        setTierSelections((ts) => {
          const updated: Record<string, ModuleTierSelection> = { ...ts };
          for (const key of Object.keys(updated)) {
            if (!next.has(key as ModuleId)) {
              delete updated[key];
            }
          }

          for (const id of next) {
            if (!updated[id]) {
              const mod = MODULE_CATALOG.find((m) => m.id === id);
              if (mod?.setupTiers || mod?.subscriptionTiers) {
                const sel: ModuleTierSelection = {};
                if (mod.setupTiers?.[0]) sel.setupTierId = mod.setupTiers[0].id;
                if (mod.subscriptionTiers?.[0]) sel.subTierId = mod.subscriptionTiers[0].id;
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
    setTierSelections({});
  }, []);

  return {
    selectedModules,
    tierSelections,
    setTierSelections,
    toggleModule,
    syncModules,
    clearModules,
  };
}
