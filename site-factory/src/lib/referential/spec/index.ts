import { loadReferentialSpec } from "./load";

export * from "./types";
export {
  classificationSchema,
  cmsSpecSchema,
  featuresSpecSchema,
  pluginsSpecSchema,
  modulesSpecSchema,
  decisionRulesSpecSchema,
  commercialSpecSchema,
  customStacksSpecSchema,
  stackProfilesSpecSchema,
  infraServicesSpecSchema,
} from "./schema";
export { loadReferentialSpec };

const SPEC = loadReferentialSpec();

export const SPEC_VERSION = SPEC.decisionRules.version;
export const SPEC_CMS = SPEC.cms.cms;
export const SPEC_FEATURES = SPEC.features.features;
export const SPEC_PLUGINS = SPEC.plugins.plugins;
export const SPEC_MODULES = SPEC.modules.modules;
export const SPEC_DECISION_RULES = SPEC.decisionRules;
export const SPEC_COMMERCIAL = SPEC.commercial;
export const SPEC_CUSTOM_STACKS = SPEC.customStacks;
export const SPEC_STACK_PROFILES = SPEC.stackProfiles!;
export const SPEC_INFRA_SERVICES = SPEC.infraServices;

export function getSpec() {
  return SPEC;
}
