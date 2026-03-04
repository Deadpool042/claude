import {
  IMPLEMENTATION_OPTIONS,
  type ImplementationSupport,
} from "@/lib/project-choices";
import type {
  ProjectFrontendImplementationInput,
  ProjectImplementationInput,
  HostingTargetInput,
} from "@/lib/validators";
import type { WizardTypeStackState, HostingSelectionMode } from "./types";

const PHP_BACKEND_IMPLEMENTATIONS = new Set<ProjectImplementationInput>([
  "WORDPRESS",
  "WORDPRESS_HEADLESS",
  "WOOCOMMERCE",
  "WOOCOMMERCE_HEADLESS",
  "PRESTASHOP",
  "MAGENTO",
  "SHOPWARE",
  "SYLIUS",
]);

const STATIC_FRONT_IMPLEMENTATIONS = new Set<ProjectFrontendImplementationInput>([
  "ASTRO",
  "GATSBY",
]);

function getImplementationSupport(
  implementation: ProjectImplementationInput | null,
): ImplementationSupport | null {
  if (!implementation) return null;
  return IMPLEMENTATION_OPTIONS.find((item) => item.value === implementation)?.support ?? null;
}

export function isSaasCommerce(state: WizardTypeStackState): boolean {
  return state.projectType === "ECOM" && state.commerceModel === "SAAS";
}

export function isHeadlessArchitecture(state: WizardTypeStackState): boolean {
  return (
    state.headlessRequired ||
    state.commerceModel === "HEADLESS" ||
    state.projectFamily === "CMS_HEADLESS" ||
    state.projectFamily === "COMMERCE_HEADLESS"
  );
}

export function isAppSplit(state: WizardTypeStackState): boolean {
  return state.projectType === "APP" && state.backendMode === "SEPARATE";
}

export function isBackendManaged(state: WizardTypeStackState): boolean {
  if (isSaasCommerce(state)) return true;
  if (isAppSplit(state)) {
    return state.backendFamily != null && state.backendFamily !== "CUSTOM_API";
  }
  if (isHeadlessArchitecture(state)) {
    return getImplementationSupport(state.projectImplementation) === "SAAS";
  }
  return false;
}

export function deriveHostingSelectionMode(
  state: WizardTypeStackState,
): HostingSelectionMode {
  if (isSaasCommerce(state) && !isHeadlessArchitecture(state)) return "NONE";
  if (isHeadlessArchitecture(state) || isAppSplit(state)) {
    return isBackendManaged(state) ? "FRONT_ONLY" : "SPLIT";
  }
  return "SINGLE";
}

export function resolveDefaultFrontHosting(
  state: WizardTypeStackState,
): HostingTargetInput {
  if (
    state.projectFrontendImplementation &&
    STATIC_FRONT_IMPLEMENTATIONS.has(state.projectFrontendImplementation)
  ) {
    return "CLOUD_STATIC";
  }
  return "CLOUD_SSR";
}

export function resolveDefaultBackHosting(
  state: WizardTypeStackState,
): HostingTargetInput {
  if (
    state.projectFamily === "CMS_MONO" ||
    state.projectFamily === "COMMERCE_SELF_HOSTED"
  ) {
    return "SHARED_PHP";
  }
  if (
    state.projectImplementation &&
    PHP_BACKEND_IMPLEMENTATIONS.has(state.projectImplementation)
  ) {
    return "SHARED_PHP";
  }
  return "VPS_DOCKER";
}
