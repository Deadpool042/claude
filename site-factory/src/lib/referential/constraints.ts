/**
 * Contraintes métier du projet — Référentiel v2 (spec-driven)
 *
 * Dérivé de Docs/_spec/decision-rules.json (constraints).
 * Les labels et minCategoryIndex proviennent du spec JSON.
 */

import type { BackendFamily } from "./backend";
import { SPEC_DECISION_RULES } from "./spec";

// ── Types ────────────────────────────────────────────────────────────

export type TrafficLevel = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
export type ProductBucket = "NONE" | "SMALL" | "MEDIUM" | "LARGE";
export type EditingFrequency = "RARE" | "REGULAR" | "DAILY";
export type DataSensitivity = "STANDARD" | "SENSITIVE" | "REGULATED";
export type ScalabilityLevel = "FIXED" | "GROWING" | "ELASTIC";
export type CommerceModel = "SAAS" | "SELF_HOSTED" | "HEADLESS";

export interface ProjectConstraints {
  trafficLevel: TrafficLevel;
  productCount: ProductBucket;
  needsEditing: boolean;
  editingFrequency: EditingFrequency;
  headlessRequired: boolean;
  dataSensitivity: DataSensitivity;
  scalabilityLevel: ScalabilityLevel;
  commerceModel?: CommerceModel | null;
  backendFamily?: BackendFamily | null;
  backendOpsHeavy?: boolean;
}

// ── Valeurs par défaut ───────────────────────────────────────────────

export const DEFAULT_CONSTRAINTS: ProjectConstraints = {
  trafficLevel: "LOW",
  productCount: "NONE",
  needsEditing: true,
  editingFrequency: "REGULAR",
  headlessRequired: false,
  dataSensitivity: "STANDARD",
  scalabilityLevel: "FIXED",
  commerceModel: null,
  backendFamily: null,
  backendOpsHeavy: false,
};

// ── Données dérivées du spec ─────────────────────────────────────────

const _constraints = SPEC_DECISION_RULES.constraints ?? {};

export const TRAFFIC_LEVEL_LABELS: Record<TrafficLevel, string> =
  (_constraints.trafficLevel?.labels ?? {}) as Record<TrafficLevel, string>;

export const PRODUCT_BUCKET_LABELS: Record<ProductBucket, string> =
  (_constraints.productCount?.labels ?? {}) as Record<ProductBucket, string>;

export const EDITING_FREQUENCY_LABELS: Record<EditingFrequency, string> =
  (_constraints.editingFrequency?.labels ?? {}) as Record<EditingFrequency, string>;

export const DATA_SENSITIVITY_LABELS: Record<DataSensitivity, string> =
  (_constraints.dataSensitivity?.labels ?? {}) as Record<DataSensitivity, string>;

export const SCALABILITY_LEVEL_LABELS: Record<ScalabilityLevel, string> =
  (_constraints.scalabilityLevel?.labels ?? {}) as Record<ScalabilityLevel, string>;

export const COMMERCE_MODEL_LABELS: Record<CommerceModel, string> =
  (_constraints.commerceModel?.labels ?? {}) as Record<CommerceModel, string>;

// ── Impact sur la catégorie ──────────────────────────────────────────

export const CONSTRAINT_MIN_CATEGORY_INDEX = {
  trafficLevel: (_constraints.trafficLevel?.minCategoryIndex ?? { LOW: 0, MEDIUM: 1, HIGH: 2, VERY_HIGH: 3 }),
  productCount: (_constraints.productCount?.minCategoryIndex ?? { NONE: 0, SMALL: 2, MEDIUM: 2, LARGE: 3 }),
  dataSensitivity: (_constraints.dataSensitivity?.minCategoryIndex ?? { STANDARD: 0, SENSITIVE: 2, REGULATED: 3 }),
  scalabilityLevel: (_constraints.scalabilityLevel?.minCategoryIndex ?? { FIXED: 0, GROWING: 1, ELASTIC: 3 }),
} as const;
