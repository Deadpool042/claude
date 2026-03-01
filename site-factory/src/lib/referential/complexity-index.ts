/**
 * Complexity Index (CI) — Référentiel v2
 *
 * Implémentation de la formule CI définie dans complexity-index.md :
 *   CI = SA + DE + (CB × 1.5) + (SD × 1.5)
 *
 * Axes :
 *   SA = Structure & Architecture (1-5)
 *   DE = Design & Expérience (1-5)
 *   CB = Contenu & Back-office (1-5)
 *   SD = Spécificités & Données (1-5)
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

import type { Category } from "./maintenance-tiers";

// ── Types ────────────────────────────────────────────────────────────

/** Scores des 4 axes du CI (chacun de 1 à 5) */
export interface CIAxes {
  /** Structure & Architecture */
  sa: number;
  /** Design & Expérience */
  de: number;
  /** Contenu & Back-office */
  cb: number;
  /** Spécificités & Données */
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
  sa: "Structure & Architecture",
  de: "Design & Expérience",
  cb: "Contenu & Back-office",
  sd: "Spécificités & Données",
};

export const CI_AXIS_DESCRIPTIONS: Record<keyof CIAxes, string[]> = {
  sa: [
    "1 — Site one-page ou < 5 pages statiques",
    "2 — Site multi-pages avec navigation standard",
    "3 — Architecture multi-templates, formulaires complexes",
    "4 — Architecture découplée, multi-zones, API custom",
    "5 — SPA/SSR avancé, micro-services, CDN multi-régions",
  ],
  de: [
    "1 — Template standard, pas de personnalisation",
    "2 — Personnalisation légère (couleurs, typo, logo)",
    "3 — Design sur-mesure, animations, responsive avancé",
    "4 — Design system complet, composants interactifs",
    "5 — Design immersif, 3D, transitions complexes, A/B testing",
  ],
  cb: [
    "1 — Contenu statique, pas de back-office",
    "2 — CMS basique (pages, articles)",
    "3 — CMS avancé (CPT, taxonomies, ACF, médias)",
    "4 — Multi-langue, workflows éditoriaux, rôles",
    "5 — DAM, PIM, workflows approbation, contenus dynamiques",
  ],
  sd: [
    "1 — Pas de données spécifiques",
    "2 — Formulaire de contact, newsletter",
    "3 — E-commerce simple, comptes clients, analytics",
    "4 — Multi-devises, fiscalité, connecteurs CRM/ERP",
    "5 — Données réglementées, calculs métier, IA, temps réel",
  ],
};

// ── Impact CI des modules ────────────────────────────────────────────

/**
 * Impact additionnel de chaque module sur le CI.
 * Utilisé pour estimer le CI quand les axes manuels ne sont pas renseignés.
 */
export const MODULE_CI_IMPACTS: Record<string, Partial<CIAxes>> = {
  "module-multi-langue": { cb: 1, sd: 0.5 },
  "module-multi-devises": { sd: 1 },
  "module-paiement": { sd: 0.5 },
  "module-livraison": { sd: 0.5 },
  "module-tunnel-de-vente": { sa: 0.5, sd: 0.5 },
  "module-analytics-woo": { sd: 0.5 },
  "module-compte-client": { sa: 0.5, sd: 0.5 },
  "module-newsletter-email-marketing": { sd: 0.5 },
  "module-marketing-traking": { sd: 0.5 },
  "module-seo-avance": { cb: 0.5 },
  "module-filtre-et-recherche": { sa: 0.5, de: 0.5 },
  "module-dark-mode": { de: 0.5 },
  "module-accessibilite-renforcee": { de: 0.5 },
  "module-connecteurs": { sa: 0.5, sd: 1 },
  "module-assistant-ia": { sa: 1, sd: 1 },
  "module-accises-fiscalite": { sd: 1.5 },
  "module-tarification-metier": { sd: 1.5 },
  "module-dashboard-personnalise": { sa: 1, de: 0.5 },
  "module-performance-avancee": { sa: 1.5 },
  "module-architecture-headless": { sa: 2 },
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
  const baseAxes: Record<string, CIAxes> = {
    STARTER: { sa: 1, de: 1, cb: 1, sd: 1 },
    BLOG: { sa: 2, de: 2, cb: 2, sd: 1 },
    VITRINE: { sa: 2, de: 2, cb: 2, sd: 1 },
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
