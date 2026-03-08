//src/lib/referential/index.ts
/**
 * Référentiel métier v2 — Barrel export
 *
 * Point d'entrée unique pour tout le référentiel.
 * Import recommandé : import { ... } from "@/lib/referential";
 */

// ── Contraintes métier ───────────────────────────────────────────────
export {
  type TrafficLevel,
  type ProductBucket,
  type EditingFrequency,
  type DataSensitivity,
  type ScalabilityLevel,
  type CommerceModel,
  type ProjectConstraints,
  DEFAULT_CONSTRAINTS,
  TRAFFIC_LEVEL_LABELS,
  PRODUCT_BUCKET_LABELS,
  EDITING_FREQUENCY_LABELS,
  DATA_SENSITIVITY_LABELS,
  SCALABILITY_LEVEL_LABELS,
  COMMERCE_MODEL_LABELS,
  CONSTRAINT_MIN_CATEGORY_INDEX,
} from "./constraints";

// ── Backend (App Custom) ─────────────────────────────────────────────
export {
  type BackendFamily,
  BACKEND_FAMILY_LABELS,
  BACKEND_FAMILY_DESCRIPTIONS,
  BACKEND_FAMILY_COEFFICIENTS,
  BACKEND_OPS_HEAVY_COEFFICIENT,
  getBackendMultiplier,
} from "./backend";

// ── Familles techniques ──────────────────────────────────────────────
export {
  type StackFamily,
  FAMILY_BASE_PRICING,
  STACK_FAMILY_LABELS,
  FAMILY_MAINTENANCE_FLOOR,
  PROJECT_FAMILY_TO_STACK_FAMILY,
  resolveStackFamily,
} from "./stack-families";

// ── Maintenance & Catégories ─────────────────────────────────────────
export {
  type MaintenanceCat,
  type Category,
  type MaintenanceCatDef,
  MAINTENANCE_CATS,
  MAINTENANCE_CAT_BY_ID,
  MAINTENANCE_CAT_BY_CATEGORY,
  MAINTENANCE_CAT_ORDER,
  CATEGORY_ORDER,
  MAINTENANCE_LABELS,
  MAINTENANCE_PRICES,
  CATEGORY_LABELS,
  CATEGORY_SHORT,
  CATEGORY_COLORS,
  CATEGORY_MAINTENANCE,
  categoryIndex,
  maxCategory,
  indexToCategory,
  getMaintenanceForCategory,
  getMaintenancePrice,
} from "./maintenance-cat";

// ── Complexity Index ─────────────────────────────────────────────────
export {
  type CIAxes,
  type CIResult,
  CI_MIN,
  CI_MAX,
  CI_AXIS_MIN,
  CI_AXIS_MAX,
  CI_WEIGHTS,
  CI_THRESHOLDS,
  CI_AXIS_LABELS,
  CI_AXIS_DESCRIPTIONS,
  MODULE_CI_IMPACTS,
  computeCI,
  estimateCIAxes,
} from "./complexity-index";

// ── Frais de déploiement ─────────────────────────────────────────────
export {
  type DeployTarget,
  type DeployFeeDef,
  type DeployFeeHeadless,
  type HostingCostDef,
  type DeployComplexity,
  DEPLOY_FEES,
  DEPLOY_FEES_HEADLESS,
  HOSTING_COSTS,
  HOSTING_COSTS_HEADLESS,
  DEPLOY_TARGET_LABELS,
  getDeployCost,
  STACK_DEPLOY_COMPAT,
  getAllowedDeployTargets,
} from "./deploy";

// ── Profils de stack ─────────────────────────────────────────────────
export {
  type StackCapability,
  type LegacyTechStack,
  type StackProfile,
  STACK_PROFILES,
  STACK_PROFILE_BY_ID,
  IMPLEMENTATION_TO_PROFILE,
  getStackProfile,
  getStackProfileFromLegacy,
  getComplexityFactor,
  getProfilesByFamily,
} from "./stack-profiles";

// ── Modules ──────────────────────────────────────────────────────────
export {
  type ModuleGroup,
  type ModuleSetupLevel,
  type ModuleSubscriptionLevel,
  type ModuleDef,
  MODULE_CATALOG,
  MODULE_IDS,
  MODULE_BY_ID,
  MODULE_GROUPS,
  getModuleById,
  getModulesByGroup,
  getStructurantModules,
  normalizeModuleId,
  normalizeModuleIds,
  normalizeCanonicalModuleIds,
} from "./modules";

export {
  type ProjectType,
  PROJECT_TYPE_LABELS,
  PROJECT_TYPE_OPTIONS,
} from "./project";

// ── Sortie canonique de décision (Lot 1) ─────────────────────────────
export {
  type SolutionFamily,
  type DeliveryModel,
  type MutualizationLevel,
  type ImplementationStrategy,
  type TechnicalProfile,
  type CommercialProfile,
  type DecisionLegacyMapping,
  type CanonicalDecisionOutput,
} from "./engine/decision-output";

// ── Spec-first (Docs/_spec) ──────────────────────────────────────────
export {
  SPEC_VERSION,
  SPEC_CMS,
  SPEC_FEATURES,
  SPEC_PLUGINS,
  SPEC_MODULES,
  SPEC_DECISION_RULES,
  SPEC_INFRA_SERVICES,
  getSpec,
  loadReferentialSpec,
} from "./spec";

export type {
  Classification,
  MatrixClassification,
  CmsSpecItem,
  FeatureSpecItem,
  PluginSpecItem,
  ModuleSpecItem,
  DecisionMatrixEntry,
  DecisionMatrixRow,
  ProjectFlags,
  ResolveFeatureInput,
  ResolveFeatureOutput,
  FullSpec,
  InfraServiceItem,
  InfraServiceCategory,
  InfraServicesSpec,
} from "./spec";

export { resolveFeature } from "./engine/resolve-feature";

export {
  estimateQuoteFromSpec,
  type QuoteEstimate,
  type QuoteEstimateInput,
} from "./engine/estimate-quote";

export {
  estimatePluginSubscriptions,
  type PluginSubscriptionEstimate,
  type PluginSubscriptionEstimateInput,
} from "./engine/estimate-plugin-subscriptions";

/**
 * Ce référentiel métier est conçu pour être découplé de toute logique
 * d'implémentation spécifique (ex: CMS, e-commerce, etc.).
 *
 * Il doit rester un ensemble de définitions, constantes et fonctions pures.
 * Toute logique métier plus complexe (ex: règles de catégorisation,
 * calculs composites, etc.) doit idéalement être placée dans des services
 * dédiés qui consomment ce référentiel.
 */