/**
 * Familles techniques — Référentiel v2 (spec-driven)
 *
 * Dérivé de Docs/_spec/stack-profiles.json (families + projectFamilyMapping).
 * Les données ne sont plus hardcodées ici — elles proviennent du spec JSON.
 *
 * Principe : "On facture la complexité fonctionnelle, pas le logo du framework."
 */

import { SPEC_STACK_PROFILES } from "./spec";

// ── Types ────────────────────────────────────────────────────────────

export type StackFamily = (typeof _familyIds)[number];

// ── Données dérivées du spec ─────────────────────────────────────────

const _families = SPEC_STACK_PROFILES.families;
const _familyIds = _families.map((f) => f.id) as [string, ...string[]];

/**
 * Prix de base "à partir de" par famille technique (HT, en euros).
 */
export const FAMILY_BASE_PRICING = Object.fromEntries(
  _families.map((f) => [f.id, { from: f.basePrice.from, label: f.basePrice.label }]),
) as Record<StackFamily, { from: number; label: string }>;

/**
 * Labels d'affichage par famille.
 */
export const STACK_FAMILY_LABELS = Object.fromEntries(
  _families.map((f) => [f.id, f.label]),
) as Record<StackFamily, string>;

/**
 * Tier minimum de maintenance imposé par la famille technique.
 * 0 = pas de plancher (tier déterminé par la qualification fonctionnelle)
 */
export const FAMILY_MAINTENANCE_FLOOR = Object.fromEntries(
  _families.map((f) => [f.id, f.maintenanceFloor]),
) as Record<StackFamily, number>;

// ── Mapping ProjectFamily (Prisma) → StackFamily ─────────────────────

/**
 * Mapping entre la valeur Prisma ProjectFamily et la StackFamily du référentiel v2.
 */
export const PROJECT_FAMILY_TO_STACK_FAMILY: Record<string, StackFamily> =
  SPEC_STACK_PROFILES.projectFamilyMapping as Record<string, StackFamily>;

/**
 * Résout la StackFamily à partir d'une ProjectFamily Prisma.
 * Fallback sur CMS_ADVANCED si non trouvé.
 */
export function resolveStackFamily(projectFamily: string): StackFamily {
  return PROJECT_FAMILY_TO_STACK_FAMILY[projectFamily] ?? ("CMS_ADVANCED" as StackFamily);
}
