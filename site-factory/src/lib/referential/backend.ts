/**
 * Familles backend — Référentiel v2 (spec-driven)
 *
 * Dérivé de Docs/_spec/decision-rules.json (backendFamilies, backendOpsHeavyCoefficient).
 */

import { SPEC_DECISION_RULES } from "./spec";

// ── Types ────────────────────────────────────────────────────────────

export type BackendFamily = "BAAS_STANDARD" | "BAAS_ADVANCED" | "CUSTOM_API";

// ── Données dérivées du spec ─────────────────────────────────────────

const _backendFamilies = SPEC_DECISION_RULES.backendFamilies ?? {};

export const BACKEND_FAMILY_LABELS: Record<BackendFamily, string> = Object.fromEntries(
  Object.entries(_backendFamilies).map(([k, v]) => [k, v.label]),
) as Record<BackendFamily, string>;

export const BACKEND_FAMILY_DESCRIPTIONS: Record<BackendFamily, string> = Object.fromEntries(
  Object.entries(_backendFamilies).map(([k, v]) => [k, v.description]),
) as Record<BackendFamily, string>;

export const BACKEND_FAMILY_COEFFICIENTS: Record<BackendFamily, number> = Object.fromEntries(
  Object.entries(_backendFamilies).map(([k, v]) => [k, v.coefficient]),
) as Record<BackendFamily, number>;

export const BACKEND_OPS_HEAVY_COEFFICIENT = SPEC_DECISION_RULES.backendOpsHeavyCoefficient ?? 0.1;

// ── Helpers ──────────────────────────────────────────────────────────

export function getBackendMultiplier(
  family?: BackendFamily | null,
  opsHeavy?: boolean,
): number {
  if (!family) return 1;
  const base = BACKEND_FAMILY_COEFFICIENTS[family] ?? 1;
  return opsHeavy ? base + BACKEND_OPS_HEAVY_COEFFICIENT : base;
}
