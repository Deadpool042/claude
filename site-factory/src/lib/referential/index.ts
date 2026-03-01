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
  CONSTRAINT_TIER_IMPACTS,
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
  type MaintenanceTier,
  type Category,
  type MaintenanceTierDef,
  MAINTENANCE_TIERS,
  MAINTENANCE_TIER_BY_ID,
  MAINTENANCE_TIER_BY_CATEGORY,
  MAINTENANCE_TIER_ORDER,
  CATEGORY_ORDER,
  MAINTENANCE_LABELS,
  MAINTENANCE_PRICES,
  CATEGORY_LABELS,
  CATEGORY_SHORT,
  CATEGORY_COLORS,
  CATEGORY_MAINTENANCE,
  categoryIndex,
  maxCategory,
  tierIndexToCategory,
  getMaintenanceForCategory,
  getMaintenancePrice,
} from "./maintenance-tiers";

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
  DEPLOY_FEES,
  DEPLOY_FEES_HEADLESS,
  HOSTING_COSTS,
  HOSTING_COSTS_HEADLESS,
  DEPLOY_TARGET_LABELS,
  getDeployCost,
  STACK_DEPLOY_COMPAT,
  getAllowedDeployTargets,
} from "./deploy-fees";

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
  type ModuleSetupTier,
  type ModuleSubscriptionTier,
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
} from "./modules";
