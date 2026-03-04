//src/lib/referential/complexity-index.ts
/**
 * Complexity Index (CI) — Référentiel v2
 *
 * Implémentation de la formule CI définie dans complexity-index.md :
 *   CI = SA + DE + (CB × 1.5) + (SD × 1.5)
 *
 * Axes :
 *   SA = Surface applicative (1-5)    — étendue fonctionnelle
 *   DE = Dépendances externes (1-5)   — intégrations tierces
 *   CB = Criticité business (1-5)     — impact commercial/légal
 *   SD = Sensibilité des données (1-5) — protection requise
 *
 * Plage : 5 (min) → 25 (max)
 *
 * Seuils de catégorie :
 *   CI ≤ 7   → CAT0 (Starter)
 *   CI ≤ 10  → CAT1 (Standard)
 *   CI ≤ 15  → CAT2 (Avancé)
 *   CI ≤ 20  → CAT3 (Métier)
 *   CI > 20  → CAT4 (Premium)
 *
 * NOTE : Le CI est un outil de pré-qualification. La catégorie finale
 * peut être requalifiée vers le haut par les modules structurants,
 * les contraintes métier et le plancher stack.
 */

import type { Category } from "./maintenance-cat";

// ── Types ────────────────────────────────────────────────────────────

/** Scores des 4 axes du CI (chacun de 1 à 5) */
export interface CIAxes {
  /** Surface applicative — étendue fonctionnelle du projet */
  sa: number;
  /** Dépendances externes — nombre et criticité des intégrations tierces */
  de: number;
  /** Criticité business — impact commercial et légal */
  cb: number;
  /** Sensibilité des données — niveau de protection requis */
  sd: number;
}

export interface CIResult {
  /** Score brut (5-25) */
  score: number;
  /** Catégorie déduite du CI seul */
  category: Category;
  /** Détail par axe */
  axes: CIAxes;
  /** Le CI est-il au-dessus du seuil critique (> 20) ? */
  isCritical: boolean;
}

// ── Constantes ───────────────────────────────────────────────────────

export const CI_MIN = 5;
export const CI_MAX = 25;
export const CI_AXIS_MIN = 1;
export const CI_AXIS_MAX = 5;

/** Poids des axes dans la formule CI */
export const CI_WEIGHTS = {
  sa: 1.0,
  de: 1.0,
  cb: 1.5,
  sd: 1.5,
} as const;

/** Seuils CI → Catégorie */
export const CI_THRESHOLDS: Array<{ max: number; category: Category }> = [
  { max: 7, category: "CAT0" },
  { max: 10, category: "CAT1" },
  { max: 15, category: "CAT2" },
  { max: 20, category: "CAT3" },
  { max: Infinity, category: "CAT4" },
];

// ── Labels ───────────────────────────────────────────────────────────

export const CI_AXIS_LABELS: Record<keyof CIAxes, string> = {
  sa: "Surface applicative",
  de: "Dépendances externes",
  cb: "Criticité business",
  sd: "Sensibilité des données",
};

export const CI_AXIS_DESCRIPTIONS: Record<keyof CIAxes, string[]> = {
  sa: [
    "1 — Mini-site, 1-3 pages (landing page, site one-page)",
    "2 — Site simple, structure standard (vitrine 5-10 pages, blog simple)",
    "3 — Site structuré, contenus diversifiés (blog multi-catégories, catalogue)",
    "4 — Application avec logique métier (e-commerce avancé, portail client)",
    "5 — Plateforme complexe multi-fonctions (marketplace, SaaS)",
  ],
  de: [
    "1 — Aucune dépendance externe (site statique autonome)",
    "2 — 1-2 services simples (formulaire de contact, analytics)",
    "3 — 3-5 services ou 1 service critique (CRM, newsletter, paiement)",
    "4 — Multi-services avec orchestration (ERP + CRM + emailing + paiement)",
    "5 — Écosystème complexe, APIs critiques (multi-APIs, webhooks, temps réel)",
  ],
  cb: [
    "1 — Impact négligeable (site personnel, projet interne)",
    "2 — Présence en ligne standard (vitrine d'entreprise, blog d'information)",
    "3 — Canal de vente ou de conversion (e-commerce simple, lead generation)",
    "4 — Revenus significatifs dépendants du site (e-commerce fort volume, SaaS)",
    "5 — Impact légal ou réglementaire (données financières, accises)",
  ],
  sd: [
    "1 — Données publiques uniquement (site vitrine sans formulaire)",
    "2 — Données personnelles basiques (formulaire de contact, newsletter)",
    "3 — Données personnelles étendues + comptes (comptes utilisateurs, commandes)",
    "4 — Données financières ou sensibles (paiement en ligne, données bancaires)",
    "5 — Données hautement sensibles (santé, réglementées, KYC)",
  ],
};

// ── Impact CI des modules ────────────────────────────────────────────

/**
 * Impact additionnel de chaque module sur le CI.
 * Utilisé pour estimer le CI quand les axes manuels ne sont pas renseignés.
 */
/**
 * Impact additionnel de chaque module sur le CI.
 *
 * Modules documentés (complexity-index.md) :
 *   Multi-langue      : SA +1, DE +1         → CI +2
 *   Paiement          : DE +1, CB +1, SD +1  → CI +4
 *   Newsletter        : DE +1                → CI +1
 *   Tunnel conversion : SA +1, CB +1         → CI +2.5
 *   Accises/fiscalité : CB +2, SD +1         → CI +4.5
 *   Tarification      : SA +1, CB +1         → CI +2.5
 *   Headless          : SA +1, DE +2         → CI +3
 *   Connecteurs       : DE +2                → CI +2
 *   Dashboard perso   : SA +2                → CI +2
 *   Assistant IA      : DE +1, SA +1         → CI +2
 *   Performance       : (pas d'impact direct)
 *
 * Modules non documentés : impacts estimés (à valider).
 */
export const MODULE_CI_IMPACTS: Record<string, Partial<CIAxes>> = {
  "module.B2B_COMMERCE": { sa: 1, de: 1, cb: 1 },
  "module.MARKETPLACE": { sa: 2, de: 2, cb: 2, sd: 1 },
  "module.LOGISTICS_ORCHESTRATION": { de: 2, cb: 1 },
  "module.ADVANCED_PRICING": { sa: 1, cb: 1 },
  "module.MARKETING_AUTOMATION": { de: 1, cb: 1 },
  "module.PRODUCT_RECOMMENDATION": { sa: 1, de: 1, cb: 1 },
  "module.BUSINESS_ANALYTICS": { sa: 1, de: 1 },
  "module.ERP_INTEGRATIONS": { de: 2, cb: 1, sd: 1 },
  "module.MULTI_CATALOG": { sa: 1, de: 1 },
  "module.MULTI_STORE_ORCHESTRATION": { sa: 2, de: 2, cb: 1 },
  "module.CMS_AUGMENTATION": { sa: 1 },
  "module.IDENTITY_SSO": { de: 1, sd: 2 },
};

// ── Calcul ───────────────────────────────────────────────────────────

function clampAxis(value: number): number {
  return Math.max(CI_AXIS_MIN, Math.min(CI_AXIS_MAX, Math.round(value)));
}

/**
 * Calcule le Complexity Index à partir des 4 axes.
 *
 * CI = SA × 1.0 + DE × 1.0 + CB × 1.5 + SD × 1.5
 */
export function computeCI(axes: CIAxes): CIResult {
  const sa = clampAxis(axes.sa);
  const de = clampAxis(axes.de);
  const cb = clampAxis(axes.cb);
  const sd = clampAxis(axes.sd);

  const score = Number(
    (sa * CI_WEIGHTS.sa + de * CI_WEIGHTS.de + cb * CI_WEIGHTS.cb + sd * CI_WEIGHTS.sd).toFixed(1),
  );

  let category: Category = "CAT4";
  for (const { max, category: cat } of CI_THRESHOLDS) {
    if (score <= max) {
      category = cat;
      break;
    }
  }

  return {
    score,
    category,
    axes: { sa, de, cb, sd },
    isCritical: score > 20,
  };
}

/**
 * Estime les axes CI automatiquement à partir du type de projet,
 * des modules sélectionnés et des contraintes.
 *
 * Utilisé quand l'utilisateur ne saisit pas les axes manuellement.
 */
export function estimateCIAxes(params: {
  projectType: string;
  moduleIds: string[];
}): CIAxes {
  // Axes de base par type de projet
  // BLOG/VITRINE démarrent au minimum (CI=5 → CAT0) — les modules et contraintes escaladent
  const baseAxes: Record<string, CIAxes> = {
    BLOG: { sa: 1, de: 1, cb: 1, sd: 1 },
    VITRINE: { sa: 1, de: 1, cb: 1, sd: 1 },
    ECOM: { sa: 3, de: 2, cb: 3, sd: 3 },
    APP: { sa: 4, de: 3, cb: 3, sd: 4 },
  };

  const axes = { ...(baseAxes[params.projectType] ?? baseAxes.VITRINE) };

  // Ajouter l'impact des modules
  for (const moduleId of params.moduleIds) {
    const impact = MODULE_CI_IMPACTS[moduleId];
    if (impact) {
      if (impact.sa) axes.sa += impact.sa;
      if (impact.de) axes.de += impact.de;
      if (impact.cb) axes.cb += impact.cb;
      if (impact.sd) axes.sd += impact.sd;
    }
  }

  // Clamper les valeurs
  return {
    sa: clampAxis(axes.sa),
    de: clampAxis(axes.de),
    cb: clampAxis(axes.cb),
    sd: clampAxis(axes.sd),
  };
}
