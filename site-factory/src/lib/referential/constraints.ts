//src/lib/referential/constraints.ts
/**
 * Contraintes métier du projet — Référentiel v2
 *
 * Nouvelles dimensions de qualification qui complètent le type fonctionnel
 * pour déterminer la catégorie et le stack approprié.
 */

// ── Types ────────────────────────────────────────────────────────────

import type { BackendFamily } from "./backend";

/** Niveau de trafic attendu */
export type TrafficLevel = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

/** Panier produits (e-commerce) */
export type ProductBucket = "NONE" | "SMALL" | "MEDIUM" | "LARGE";

/** Fréquence d'édition des contenus */
export type EditingFrequency = "RARE" | "REGULAR" | "DAILY";

/** Sensibilité des données manipulées */
export type DataSensitivity = "STANDARD" | "SENSITIVE" | "REGULATED";

/** Besoin de scalabilité */
export type ScalabilityLevel = "FIXED" | "GROWING" | "ELASTIC";

/** Modèle e-commerce */
export type CommerceModel = "SAAS" | "SELF_HOSTED" | "HEADLESS";

/** Contraintes métier complètes d'un projet */
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

// ── Labels ───────────────────────────────────────────────────────────

export const TRAFFIC_LEVEL_LABELS: Record<TrafficLevel, string> = {
  LOW: "< 5 000 visites/mois",
  MEDIUM: "5 000 – 50 000 visites/mois",
  HIGH: "50 000 – 500 000 visites/mois",
  VERY_HIGH: "> 500 000 visites/mois",
};

export const PRODUCT_BUCKET_LABELS: Record<ProductBucket, string> = {
  NONE: "Aucun (pas d'e-commerce)",
  SMALL: "< 100 produits",
  MEDIUM: "100 – 1 000 produits",
  LARGE: "> 1 000 produits",
};

export const EDITING_FREQUENCY_LABELS: Record<EditingFrequency, string> = {
  RARE: "Rarement (< 1 fois/mois)",
  REGULAR: "Régulièrement (1–4 fois/mois)",
  DAILY: "Quotidiennement",
};

export const DATA_SENSITIVITY_LABELS: Record<DataSensitivity, string> = {
  STANDARD: "Standard (RGPD basique)",
  SENSITIVE: "Sensible (données personnelles, paiement)",
  REGULATED: "Réglementé (santé, finance, juridique)",
};

export const SCALABILITY_LEVEL_LABELS: Record<ScalabilityLevel, string> = {
  FIXED: "Fixe (trafic stable)",
  GROWING: "Croissant (augmentation progressive)",
  ELASTIC: "Élastique (pics, saisonnalité)",
};

export const COMMERCE_MODEL_LABELS: Record<CommerceModel, string> = {
  SAAS: "SaaS (Shopify, BigCommerce...)",
  SELF_HOSTED: "Auto-hébergé (WooCommerce, PrestaShop...)",
  HEADLESS: "Headless (Medusa, Saleor, Shopify H2...)",
};

// ── Impact sur la catégorie ──────────────────────────────────────────

/**
 * Chaque contrainte peut imposer une catégorie minimum.
 * Ces valeurs sont utilisées par le moteur de qualification pour
 * requalifier le projet vers le haut si nécessaire.
 */
export const CONSTRAINT_MIN_CATEGORY_INDEX = {
  trafficLevel: { LOW: 0, MEDIUM: 1, HIGH: 2, VERY_HIGH: 3 },
  productCount: { NONE: 0, SMALL: 2, MEDIUM: 2, LARGE: 3 },
  dataSensitivity: { STANDARD: 0, SENSITIVE: 2, REGULATED: 3 },
  scalabilityLevel: { FIXED: 0, GROWING: 1, ELASTIC: 3 },
} as const;
