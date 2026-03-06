import { normalizeModuleIds, type ProjectType } from "@/lib/referential";
import {
  normalizeTaxonomySignalForProjectType,
  parseTaxonomyDisambiguationSignal,
  resolveLegacyProjectTypeFromOfferCategory,
  type TaxonomyDisambiguationSignal,
} from "@/lib/taxonomy";
import type {
  ModuleId,
  OfferCategory,
  Stack as OfferStack,
} from "@/lib/offers";
import type {
  HostingTargetInput,
  ProjectFamilyInput,
  ProjectImplementationInput,
} from "@/lib/validators";
import type { WizardQueryPrefill } from "./wizard-types";

interface SearchParamsLike {
  get(name: string): string | null;
}

export interface OfferPrefillResolution {
  projectType: ProjectType;
  taxonomySignal: TaxonomyDisambiguationSignal | null;
  projectFamily: ProjectFamilyInput;
  projectImplementation: ProjectImplementationInput;
  shouldPrefillFrontendImplementation: boolean;
  hostingTarget: HostingTargetInput | null;
  hostingTargetBack: HostingTargetInput | null;
  hostingTargetFront: HostingTargetInput | null;
  offerModules: ModuleId[];
}

const OFFER_STACKS: OfferStack[] = [
  "WORDPRESS",
  "NEXTJS",
  "NUXT",
  "ASTRO",
  "WORDPRESS_HEADLESS",
  "WOOCOMMERCE",
  "WOOCOMMERCE_HEADLESS",
];

const OFFER_STACK_MAP: Record<
  OfferStack,
  { family: ProjectFamilyInput; implementation: ProjectImplementationInput }
> = {
  WORDPRESS: { family: "CMS_MONO", implementation: "WORDPRESS" },
  WORDPRESS_HEADLESS: {
    family: "CMS_HEADLESS",
    implementation: "WORDPRESS_HEADLESS",
  },
  WOOCOMMERCE: {
    family: "COMMERCE_SELF_HOSTED",
    implementation: "WOOCOMMERCE",
  },
  WOOCOMMERCE_HEADLESS: {
    family: "COMMERCE_HEADLESS",
    implementation: "WOOCOMMERCE_HEADLESS",
  },
  NEXTJS: { family: "APP_PLATFORM", implementation: "NEXTJS" },
  NUXT: { family: "APP_PLATFORM", implementation: "NUXT" },
  ASTRO: { family: "STATIC_SSG", implementation: "ASTRO" },
};

const OFFER_HOSTING_TARGET: Record<string, HostingTargetInput> = {
  shared: "SHARED_PHP",
  vercel: "CLOUD_SSR",
  docker_vps: "VPS_DOCKER",
  headless_unified: "VPS_DOCKER",
};

function isOfferCategory(value: string | null): value is OfferCategory {
  return (
    value === "VITRINE_BLOG" ||
    value === "ECOMMERCE" ||
    value === "APP_CUSTOM"
  );
}

function isOfferStack(value: string | null): value is OfferStack {
  return Boolean(value && OFFER_STACKS.includes(value as OfferStack));
}

export function parseWizardQueryPrefill(
  searchParams: SearchParamsLike,
): WizardQueryPrefill {
  return {
    defaultClientId: searchParams.get("clientId") ?? "",
    prefillName: searchParams.get("name") ?? "",
    prefillDescription: searchParams.get("description") ?? "",
    prefillDomain: searchParams.get("domain") ?? "",
    prefillPort: searchParams.get("port") ?? "",
    prefillGitRepo: searchParams.get("gitRepo") ?? "",
    offerModulesParam: searchParams.get("offerModules") ?? "",
    offerProjectTypeParam: searchParams.get("offerProjectType"),
    offerStackParam: searchParams.get("offerStack"),
    offerDeploymentParam: searchParams.get("offerDeployment"),
    offerTaxonomySignalParam: searchParams.get("taxonomySignal"),
  };
}

export function parseOfferModules(offerModulesParam: string): ModuleId[] {
  if (!offerModulesParam) return [];
  return normalizeModuleIds(
    offerModulesParam
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ) as ModuleId[];
}

export function resolveOfferPrefill(
  queryPrefill: Pick<
    WizardQueryPrefill,
    | "offerProjectTypeParam"
    | "offerStackParam"
    | "offerDeploymentParam"
    | "offerTaxonomySignalParam"
    | "offerModulesParam"
  >,
): OfferPrefillResolution | null {
  if (
    !isOfferCategory(queryPrefill.offerProjectTypeParam) ||
    !isOfferStack(queryPrefill.offerStackParam)
  ) {
    return null;
  }

  const projectType = resolveLegacyProjectTypeFromOfferCategory(
    queryPrefill.offerProjectTypeParam,
  );
  const explicitSignal = parseTaxonomyDisambiguationSignal(
    queryPrefill.offerTaxonomySignalParam,
  );
  const taxonomySignal = explicitSignal
    ? normalizeTaxonomySignalForProjectType(projectType, explicitSignal)
    : null;

  const mappedStack = OFFER_STACK_MAP[queryPrefill.offerStackParam];
  const mappedHosting = queryPrefill.offerDeploymentParam
    ? OFFER_HOSTING_TARGET[queryPrefill.offerDeploymentParam] ?? null
    : null;

  let hostingTarget = mappedHosting;
  let hostingTargetBack: HostingTargetInput | null = null;
  let hostingTargetFront: HostingTargetInput | null = null;

  if (queryPrefill.offerDeploymentParam === "headless_split") {
    hostingTarget = "TO_CONFIRM";
    hostingTargetBack = "SHARED_PHP";
    hostingTargetFront = "CLOUD_SSR";
  }

  return {
    projectType,
    taxonomySignal,
    projectFamily: mappedStack.family,
    projectImplementation: mappedStack.implementation,
    shouldPrefillFrontendImplementation:
      mappedStack.family === "CMS_HEADLESS" ||
      mappedStack.family === "COMMERCE_HEADLESS",
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    offerModules: parseOfferModules(queryPrefill.offerModulesParam),
  };
}
