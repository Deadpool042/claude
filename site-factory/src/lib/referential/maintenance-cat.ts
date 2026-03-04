//src/lib/referential/maintenance-cat.ts
/**
 * Grille de maintenance — Référentiel v2
 *
 * 5 niveaux de maintenance alignés sur les 5 catégories (Cat 0 → Cat 4).
 * Chaque catégorie a un prix mensuel fixe, un périmètre défini et un split
 * prestataire/agence pour le mode sous-traitant.
 *
 * Tarifs : 39 / 69 / 109 / 139 / à partir de 179 €/mois
 */

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

// ── Données ──────────────────────────────────────────────────────────

export const MAINTENANCE_CATS: MaintenanceCatDef[] = [
  {
    id: "MINIMAL",
    label: "Minimal",
    shortLabel: "Cat 0",
    priceMonthly: 39,
    priceLabel: "39 €/mois",
    category: "CAT0",
    catIndex: 0,
    scope: [
      "Monitoring uptime",
      "Sauvegardes automatiques (hebdomadaire)",
      "Mises à jour core (trimestriel)",
      "Support email (48h)",
    ],
    splitPrestataire: 70,
  },
  {
    id: "STANDARD",
    label: "Standard",
    shortLabel: "Cat 1",
    priceMonthly: 69,
    priceLabel: "69 €/mois",
    category: "CAT1",
    catIndex: 1,
    scope: [
      "Tout Cat 0",
      "Mises à jour core + plugins (mensuel)",
      "Sauvegardes automatiques (quotidien)",
      "Rapport mensuel",
      "Support email (24h)",
    ],
    splitPrestataire: 70,
  },
  {
    id: "ADVANCED",
    label: "Avancée",
    shortLabel: "Cat 2",
    priceMonthly: 109,
    priceLabel: "109 €/mois",
    category: "CAT2",
    catIndex: 2,
    scope: [
      "Tout Cat 1",
      "Mises à jour bimensuelles",
      "Audit sécurité (trimestriel)",
      "Monitoring performance",
      "Support email prioritaire (12h)",
      "1 intervention corrective/mois",
    ],
    splitPrestataire: 70,
  },
  {
    id: "BUSINESS",
    label: "Métier renforcée",
    shortLabel: "Cat 3",
    priceMonthly: 139,
    priceLabel: "139 €/mois",
    category: "CAT3",
    catIndex: 3,
    scope: [
      "Tout Cat 2",
      "Mises à jour hebdomadaires",
      "Audit sécurité (mensuel)",
      "Monitoring avancé (APM)",
      "Support prioritaire (4h)",
      "2 interventions correctives/mois",
      "Rapport détaillé mensuel",
    ],
    splitPrestataire: 70,
  },
  {
    id: "PREMIUM",
    label: "Premium",
    shortLabel: "Cat 4",
    priceMonthly: 179,
    priceLabel: "à partir de 179 €/mois",
    category: "CAT4",
    catIndex: 4,
    scope: [
      "Tout Cat 3",
      "Mises à jour en continu",
      "Audit sécurité + pentest",
      "SLA garanti",
      "Support dédié (2h)",
      "Interventions illimitées",
      "Comité technique mensuel",
    ],
    splitPrestataire: 60,
  },
];

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

export const MAINTENANCE_CAT_ORDER: MaintenanceCat[] = [
  "MINIMAL",
  "STANDARD",
  "ADVANCED",
  "BUSINESS",
  "PREMIUM",
];

export const CATEGORY_ORDER: Category[] = ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"];

// ── Labels (rétro-compatibilité) ─────────────────────────────────────

export const MAINTENANCE_LABELS: Record<MaintenanceCat, string> = {
  MINIMAL: "Minimal",
  STANDARD: "Standard",
  ADVANCED: "Avancée",
  BUSINESS: "Métier renforcée",
  PREMIUM: "Premium",
};

export const MAINTENANCE_PRICES: Record<MaintenanceCat, string> = {
  MINIMAL: "29 €/mois",
  STANDARD: "59 €/mois",
  ADVANCED: "129 €/mois",
  BUSINESS: "249 €/mois",
  PREMIUM: "490 €/mois",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  CAT0: "Cat.0 — Starter",
  CAT1: "Cat.1 — Standard",
  CAT2: "Cat.2 — Avancé",
  CAT3: "Cat.3 — Métier",
  CAT4: "Cat.4 — Premium",
};

export const CATEGORY_SHORT: Record<Category, string> = {
  CAT0: "Cat.0",
  CAT1: "Cat.1",
  CAT2: "Cat.2",
  CAT3: "Cat.3",
  CAT4: "Cat.4",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  CAT0: "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-950/30 dark:border-slate-800",
  CAT1: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800",
  CAT2: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800",
  CAT3: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800",
  CAT4: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800",
};

// ── Mapping catégorie → maintenance ──────────────────────────────────

export const CATEGORY_MAINTENANCE: Record<Category, MaintenanceCat> = {
  CAT0: "MINIMAL",
  CAT1: "STANDARD",
  CAT2: "ADVANCED",
  CAT3: "BUSINESS",
  CAT4: "PREMIUM",
};

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

/** Alias de compatibilité: Use indexToCategory */
// export const tierIndexToCategory = indexToCategory;

export function getMaintenanceForCategory(cat: Category): MaintenanceCatDef {
  return MAINTENANCE_CAT_BY_CATEGORY[cat];
}

export function getMaintenancePrice(cat: Category): number {
  return MAINTENANCE_CAT_BY_CATEGORY[cat].priceMonthly;
}
