/**
 * Complexity Index (CI) — Référentiel v2 (spec-driven)
 *
 * Dérivé de Docs/_spec/decision-rules.json (complexityIndex).
 *
 * CI = SA × 1.0 + DE × 1.0 + CB × 1.5 + SD × 1.5
 * Plage : 5 (min) → 25 (max)
 */

import type { Category } from "./maintenance-cat";
import { SPEC_DECISION_RULES } from "./spec";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CIAxes {
  sa: number;
  de: number;
  cb: number;
  sd: number;
}

export interface CIResult {
  score: number;
  category: Category;
  axes: CIAxes;
  isCritical: boolean;
}

// ── Données dérivées du spec ───────────────────────────────────────────────────────

const _ci = SPEC_DECISION_RULES.complexityIndex!;

export const CI_MIN = _ci.range?.min ?? 5;
export const CI_MAX = _ci.range?.max ?? 25;
export const CI_AXIS_MIN = _ci.axisRange?.min ?? 1;
export const CI_AXIS_MAX = _ci.axisRange?.max ?? 5;

export const CI_WEIGHTS = _ci.weights as Record<keyof CIAxes, number>;

export const CI_THRESHOLDS: Array<{ max: number; category: Category }> =
  _ci.thresholds.map((t) => ({
    max: t.max ?? Infinity,
    category: t.category as Category,
  }));

export const CI_AXIS_LABELS: Record<keyof CIAxes, string> =
  (_ci.axisLabels ?? {}) as Record<keyof CIAxes, string>;

export const CI_AXIS_DESCRIPTIONS: Record<keyof CIAxes, string[]> =
  (_ci.axisDescriptions ?? {}) as Record<keyof CIAxes, string[]>;

export const MODULE_CI_IMPACTS: Record<string, Partial<CIAxes>> =
  (_ci.moduleCIImpacts ?? {}) as Record<string, Partial<CIAxes>>;

const _baseAxes = (_ci.baseAxesByProjectType ?? {}) as Record<string, CIAxes>;

// ── Calcul ───────────────────────────────────────────────────────────────────

function clampAxis(value: number): number {
  return Math.max(CI_AXIS_MIN, Math.min(CI_AXIS_MAX, Math.round(value)));
}

export function computeCI(axes: CIAxes): CIResult {
  const sa = clampAxis(axes.sa);
  const de = clampAxis(axes.de);
  const cb = clampAxis(axes.cb);
  const sd = clampAxis(axes.sd);

  const score = Number(
    (sa * (CI_WEIGHTS.sa ?? 1) + de * (CI_WEIGHTS.de ?? 1) + cb * (CI_WEIGHTS.cb ?? 1.5) + sd * (CI_WEIGHTS.sd ?? 1.5)).toFixed(1),
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

export function estimateCIAxes(params: {
  projectType: string;
  moduleIds: string[];
}): CIAxes {
  const defaultBase: CIAxes = { sa: 1, de: 1, cb: 1, sd: 1 };
  const axes = { ...(_baseAxes[params.projectType] ?? _baseAxes.VITRINE ?? defaultBase) };

  for (const moduleId of params.moduleIds) {
    const impact = MODULE_CI_IMPACTS[moduleId];
    if (impact) {
      if (impact.sa) axes.sa += impact.sa;
      if (impact.de) axes.de += impact.de;
      if (impact.cb) axes.cb += impact.cb;
      if (impact.sd) axes.sd += impact.sd;
    }
  }

  return {
    sa: clampAxis(axes.sa),
    de: clampAxis(axes.de),
    cb: clampAxis(axes.cb),
    sd: clampAxis(axes.sd),
  };
}
