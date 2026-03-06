import type { Category } from "./maintenance-cat";
import { SPEC_MODULES } from "./spec";

export type ModuleGroup = "ecommerce" | "contenu" | "technique" | "metier" | "premium";

export interface ModuleSetupLevel {
  id: string;
  name: string;
  description: string;
  priceSetup: number;
  requalifiesTo?: Category;
}

export interface ModuleSubscriptionLevel {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
}

export interface ModuleDef {
  id: string;
  name: string;
  description: string;
  details: string[];
  minCategory: Category;
  requalifiesTo: Category | null;
  isStructurant: boolean;
  priceSetup: number;
  priceSetupMax: number | null;
  jsMultiplier: number;
  priceMonthly: number;
  splitPrestataireSetup: number;
  splitPrestataireMonthly: number;
  group: ModuleGroup;
  icon: string;
  wpNote: string;
  setupCats?: ModuleSetupLevel[];
  subscriptionCats?: ModuleSubscriptionLevel[];
}

// \u2500\u2500 Donn\u00e9es d\u00e9riv\u00e9es du spec \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export const MODULE_CATALOG: ModuleDef[] = SPEC_MODULES.map((m) => {
  const base: ModuleDef = {
    id: m.id,
    name: m.label,
    description: m.description ?? "",
    details: m.details ?? [],
    minCategory: (m.minCategory ?? "CAT2") as Category,
    requalifiesTo: (m.requalifiesTo ?? null) as Category | null,
    isStructurant: m.isStructurant ?? false,
    priceSetup: m.priceSetupMin,
    priceSetupMax: m.priceSetupMax ?? null,
    jsMultiplier: m.jsMultiplier ?? 1.0,
    priceMonthly: m.priceMonthlyMin ?? 0,
    splitPrestataireSetup: m.splitPrestataireSetup ?? 60,
    splitPrestataireMonthly: m.splitPrestataireMonthly ?? 70,
    group: (m.group ?? "technique") as ModuleGroup,
    icon: m.icon ?? "Box",
    wpNote: m.wpNote ?? "",
  };
  if (m.setupTiers) {
    base.setupCats = m.setupTiers.map((t) => {
      const level: ModuleSetupLevel = {
        id: t.id,
        name: t.name,
        description: t.description,
        priceSetup: t.priceSetup,
      };
      if (t.requalifiesTo) {
        level.requalifiesTo = t.requalifiesTo as Category;
      }
      return level;
    });
  }
  if (m.subscriptionTiers) {
    base.subscriptionCats = m.subscriptionTiers.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      priceMonthly: t.priceMonthly,
    }));
  }
  return base;
});

// \u2500\u2500 Lookups \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export const MODULE_IDS = MODULE_CATALOG.map((m) => m.id);

export const MODULE_BY_ID: Record<string, ModuleDef> = Object.fromEntries(
  MODULE_CATALOG.map((m) => [m.id, m]),
);

export const MODULE_GROUPS: Record<ModuleGroup, string> = {
  ecommerce: "E-Commerce",
  contenu: "Contenu & Marketing",
  technique: "Technique",
  metier: "M\u00e9tier / R\u00e9glement\u00e9",
  premium: "Premium",
};

// \u2500\u2500 Helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export function getModuleById(id: string): ModuleDef | null {
  return MODULE_BY_ID[id] ?? null;
}

export function getModulesByGroup(): Record<ModuleGroup, ModuleDef[]> {
  const groups: Record<ModuleGroup, ModuleDef[]> = {
    ecommerce: [],
    contenu: [],
    technique: [],
    metier: [],
    premium: [],
  };
  for (const mod of MODULE_CATALOG) {
    groups[mod.group].push(mod);
  }
  return groups;
}

export function getStructurantModules(): ModuleDef[] {
  return MODULE_CATALOG.filter((m) => m.isStructurant);
}

export function normalizeModuleId(id: string): string | null {
  return MODULE_BY_ID[id] ? id : null;
}

export function normalizeModuleIds(ids: string[]): string[] {
  const normalized: string[] = [];
  for (const id of ids) {
    const next = normalizeModuleId(id);
    if (next && !normalized.includes(next)) {
      normalized.push(next);
    }
  }
  return normalized;
}

export function normalizeCanonicalModuleIds(ids: string[]): string[] {
  return normalizeModuleIds(ids);
}
