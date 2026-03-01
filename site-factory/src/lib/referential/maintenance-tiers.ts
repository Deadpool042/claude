/**
 * Grille de maintenance — Référentiel v2
 *
 * 5 niveaux de maintenance alignés sur les 5 catégories (Tier 0 → Tier 4).
 * Chaque tier a un prix mensuel fixe, un périmètre défini et un split
 * prestataire/agence pour le mode sous-traitant.
 *
 * Nouveaux tarifs v2 : 79 / 109 / 139 / 169 / 209 €/mois
 */

// ── Types ────────────────────────────────────────────────────────────

export type MaintenanceTier = "MINIMAL" | "STANDARD" | "ADVANCED" | "BUSINESS" | "PREMIUM";
export type Category = "CAT0" | "CAT1" | "CAT2" | "CAT3" | "CAT4";

export interface MaintenanceTierDef {
  id: MaintenanceTier;
  label: string;
  shortLabel: string;
  /** Prix mensuel HT en euros */
  priceMonthly: number;
  /** Affichage formaté */
  priceLabel: string;
  /** Catégorie associée */
  category: Category;
  /** Tier numérique (0-4) pour comparaisons */
  tierIndex: number;
  /** Périmètre inclus */
  scope: string[];
  /** Split prestataire en mode sous-traitant (%) */
  splitPrestataire: number;
}

// ── Données ──────────────────────────────────────────────────────────

export const MAINTENANCE_TIERS: MaintenanceTierDef[] = [
  {
    id: "MINIMAL",
    label: "Minimal",
    shortLabel: "Tier 0",
    priceMonthly: 79,
    priceLabel: "79 €/mois",
    category: "CAT0",
    tierIndex: 0,
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
    shortLabel: "Tier 1",
    priceMonthly: 109,
    priceLabel: "109 €/mois",
    category: "CAT1",
    tierIndex: 1,
    scope: [
      "Tout Tier 0",
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
    shortLabel: "Tier 2",
    priceMonthly: 139,
    priceLabel: "139 €/mois",
    category: "CAT2",
    tierIndex: 2,
    scope: [
      "Tout Tier 1",
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
    shortLabel: "Tier 3",
    priceMonthly: 169,
    priceLabel: "169 €/mois",
    category: "CAT3",
    tierIndex: 3,
    scope: [
      "Tout Tier 2",
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
    shortLabel: "Tier 4",
    priceMonthly: 209,
    priceLabel: "à partir de 209 €/mois",
    category: "CAT4",
    tierIndex: 4,
    scope: [
      "Tout Tier 3",
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

export const MAINTENANCE_TIER_BY_ID: Record<MaintenanceTier, MaintenanceTierDef> =
  Object.fromEntries(MAINTENANCE_TIERS.map((t) => [t.id, t])) as Record<
    MaintenanceTier,
    MaintenanceTierDef
  >;

export const MAINTENANCE_TIER_BY_CATEGORY: Record<Category, MaintenanceTierDef> =
  Object.fromEntries(MAINTENANCE_TIERS.map((t) => [t.category, t])) as Record<
    Category,
    MaintenanceTierDef
  >;

export const MAINTENANCE_TIER_ORDER: MaintenanceTier[] = [
  "MINIMAL",
  "STANDARD",
  "ADVANCED",
  "BUSINESS",
  "PREMIUM",
];

export const CATEGORY_ORDER: Category[] = ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"];

// ── Labels (rétro-compatibilité) ─────────────────────────────────────

export const MAINTENANCE_LABELS: Record<MaintenanceTier, string> = {
  MINIMAL: "Minimal",
  STANDARD: "Standard",
  ADVANCED: "Avancée",
  BUSINESS: "Métier renforcée",
  PREMIUM: "Premium",
};

export const MAINTENANCE_PRICES: Record<MaintenanceTier, string> = {
  MINIMAL: "79 €/mois",
  STANDARD: "109 €/mois",
  ADVANCED: "139 €/mois",
  BUSINESS: "169 €/mois",
  PREMIUM: "à partir de 209 €/mois",
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

export const CATEGORY_MAINTENANCE: Record<Category, MaintenanceTier> = {
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

export function tierIndexToCategory(index: number): Category {
  const clamped = Math.max(0, Math.min(4, index));
  return CATEGORY_ORDER[clamped];
}

export function getMaintenanceForCategory(cat: Category): MaintenanceTierDef {
  return MAINTENANCE_TIER_BY_CATEGORY[cat];
}

export function getMaintenancePrice(cat: Category): number {
  return MAINTENANCE_TIER_BY_CATEGORY[cat].priceMonthly;
}
