/**
 * Grille de maintenance — Référentiel v2 (spec-driven)
 *
 * Dérivé de Docs/_spec/commercial.json (maintenanceByCategory).
 * 5 niveaux de maintenance alignés sur les 5 catégories (Cat 0 → Cat 4).
 *
 * ⚠ Les prix proviennent du spec JSON (source de vérité unique).
 *   Si les prix doivent changer, mettre à jour commercial.json.
 */

import { SPEC_COMMERCIAL } from "./spec";

// ── Types ────────────────────────────────────────────────────────────

export type MaintenanceCat = "MINIMAL" | "STANDARD" | "ADVANCED" | "BUSINESS" | "PREMIUM";
export type Category = "CAT0" | "CAT1" | "CAT2" | "CAT3" | "CAT4";

export interface MaintenanceCatDef {
  id: MaintenanceCat;
  label: string;
  shortLabel: string;
  /** Prix mensuel HT en euros */
  priceMonthly: number;
  /** Affichage formaté */
  priceLabel: string;
  /** Catégorie associée */
  category: Category;
  /** Index numérique (0-4) pour comparaisons */
  catIndex: number;
  /** Périmètre inclus */
  scope: string[];
  /** Split prestataire en mode sous-traitant (%) */
  splitPrestataire: number;
}

// ── Données dérivées du spec ─────────────────────────────────────────

export const CATEGORY_ORDER: Category[] = ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"];

const _spec = SPEC_COMMERCIAL.maintenanceByCategory;

export const MAINTENANCE_CATS: MaintenanceCatDef[] = CATEGORY_ORDER.map((cat, idx) => {
  const entry = _spec[cat]!;
  const id = (entry.id ?? cat) as MaintenanceCat;
  const monthly = entry.monthly;
  const isLast = idx === CATEGORY_ORDER.length - 1;
  return {
    id,
    label: entry.label,
    shortLabel: entry.shortLabel ?? `Cat ${idx}`,
    priceMonthly: monthly,
    priceLabel: isLast ? `à partir de ${monthly} €/mois` : `${monthly} €/mois`,
    category: cat,
    catIndex: idx,
    scope: entry.scope ?? [],
    splitPrestataire: entry.splitPrestataire ?? 70,
  };
});

// ── Lookups ──────────────────────────────────────────────────────────

export const MAINTENANCE_CAT_BY_ID: Record<MaintenanceCat, MaintenanceCatDef> =
  Object.fromEntries(MAINTENANCE_CATS.map((t) => [t.id, t])) as Record<
    MaintenanceCat,
    MaintenanceCatDef
  >;

export const MAINTENANCE_CAT_BY_CATEGORY: Record<Category, MaintenanceCatDef> =
  Object.fromEntries(MAINTENANCE_CATS.map((t) => [t.category, t])) as Record<
    Category,
    MaintenanceCatDef
  >;

export const MAINTENANCE_CAT_ORDER: MaintenanceCat[] =
  MAINTENANCE_CATS.map((t) => t.id);

// ── Labels (rétro-compatibilité) ─────────────────────────────────────

export const MAINTENANCE_LABELS: Record<MaintenanceCat, string> =
  Object.fromEntries(MAINTENANCE_CATS.map((t) => [t.id, t.label])) as Record<MaintenanceCat, string>;

export const MAINTENANCE_PRICES: Record<MaintenanceCat, string> =
  Object.fromEntries(MAINTENANCE_CATS.map((t) => [t.id, `${t.priceMonthly} €/mois`])) as Record<MaintenanceCat, string>;

export const CATEGORY_LABELS: Record<Category, string> =
  Object.fromEntries(MAINTENANCE_CATS.map((t) => [t.category, `Cat.${t.catIndex} — ${t.label}`])) as Record<Category, string>;

export const CATEGORY_SHORT: Record<Category, string> =
  Object.fromEntries(MAINTENANCE_CATS.map((t) => [t.category, `Cat.${t.catIndex}`])) as Record<Category, string>;

// UI colors — non-spec, hardcoded
export const CATEGORY_COLORS: Record<Category, string> = {
  CAT0: "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-950/30 dark:border-slate-800",
  CAT1: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800",
  CAT2: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800",
  CAT3: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800",
  CAT4: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800",
};

// ── Mapping catégorie → maintenance ──────────────────────────────────

export const CATEGORY_MAINTENANCE: Record<Category, MaintenanceCat> =
  Object.fromEntries(MAINTENANCE_CATS.map((t) => [t.category, t.id])) as Record<Category, MaintenanceCat>;

// ── Helpers ──────────────────────────────────────────────────────────

export function categoryIndex(cat: Category): number {
  return CATEGORY_ORDER.indexOf(cat);
}

export function maxCategory(a: Category, b: Category): Category {
  return categoryIndex(a) >= categoryIndex(b) ? a : b;
}

export function indexToCategory(index: number): Category {
  const clamped = Math.max(0, Math.min(4, index));
  return CATEGORY_ORDER[clamped];
}

export function getMaintenanceForCategory(cat: Category): MaintenanceCatDef {
  return MAINTENANCE_CAT_BY_CATEGORY[cat];
}

export function getMaintenancePrice(cat: Category): number {
  return MAINTENANCE_CAT_BY_CATEGORY[cat].priceMonthly;
}
