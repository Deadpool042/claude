import type {
  HostingTargetInput,
  ProjectFamilyInput,
  ProjectImplementationInput,
  ProjectFrontendImplementationInput,
} from "@/lib/validators/project";
import type { ProjectType, TechStack } from "@/lib/qualification";

export type ImplementationSupport = "SUPPORTED" | "EXTERNAL" | "SAAS";
export type EditingFrequency = "RARE" | "REGULAR" | "DAILY";
export type CommerceModel = "SAAS" | "SELF_HOSTED" | "HEADLESS";

export type HostingTargetOption = {
  value: HostingTargetInput;
  label: string;
  description: string;
};

export type FamilyOption = {
  value: ProjectFamilyInput;
  label: string;
  description: string;
};

export type ImplementationOption = {
  value: ProjectImplementationInput;
  label: string;
  family: ProjectFamilyInput;
  support: ImplementationSupport;
};

export type FrontendOption = {
  value: ProjectFrontendImplementationInput;
  label: string;
  support: ImplementationSupport;
};

export type FrontendStackValue = "NEXTJS" | "NUXT" | "ASTRO";

export const HOSTING_TARGET_OPTIONS: HostingTargetOption[] = [
  {
    value: "SHARED_PHP",
    label: "Mutualisé PHP",
    description: "Hébergement mutualisé classique (o2switch, OVH...).",
  },
  {
    value: "CLOUD_STATIC",
    label: "Cloud statique",
    description: "Netlify, Cloudflare Pages, GitHub Pages.",
  },
  {
    value: "CLOUD_SSR",
    label: "Cloud SSR / Edge",
    description: "Vercel, Render, Railway, etc.",
  },
  {
    value: "VPS_DOCKER",
    label: "VPS / Docker",
    description: "Infra auto-hébergée, tout stack.",
  },
  {
    value: "TO_CONFIRM",
    label: "À confirmer",
    description: "Choix provisoire, toutes options visibles.",
  },
];

export const HOSTING_TARGET_BACK_OPTIONS = HOSTING_TARGET_OPTIONS.filter((opt) =>
  ["SHARED_PHP", "CLOUD_SSR", "VPS_DOCKER", "TO_CONFIRM"].includes(opt.value),
);

export const HOSTING_TARGET_FRONT_OPTIONS = HOSTING_TARGET_OPTIONS.filter((opt) =>
  ["CLOUD_STATIC", "CLOUD_SSR", "VPS_DOCKER", "TO_CONFIRM"].includes(opt.value),
);

/** Hosting autorisés par type fonctionnel (filtre métier) */
export const HOSTING_BY_PROJECT_TYPE: Record<ProjectType, HostingTargetInput[]> = {
  STARTER: ["SHARED_PHP", "CLOUD_STATIC", "VPS_DOCKER", "TO_CONFIRM"],
  BLOG: [
    "SHARED_PHP",
    "CLOUD_STATIC",
    "CLOUD_SSR",
    "VPS_DOCKER",
    "TO_CONFIRM",
  ],
  VITRINE: [
    "SHARED_PHP",
    "CLOUD_STATIC",
    "CLOUD_SSR",
    "VPS_DOCKER",
    "TO_CONFIRM",
  ],
  ECOM: [
    "SHARED_PHP",
    "CLOUD_SSR",
    "VPS_DOCKER",
    "TO_CONFIRM",
  ],
  APP: ["CLOUD_SSR", "VPS_DOCKER", "TO_CONFIRM"],
};

export const PROJECT_FAMILY_OPTIONS: FamilyOption[] = [
  {
    value: "STATIC_SSG",
    label: "Statique / SSG",
    description: "Site simple, export statique.",
  },
  {
    value: "CMS_MONO",
    label: "CMS monolithique",
    description: "CMS complet avec back-office intégré.",
  },
  {
    value: "CMS_HEADLESS",
    label: "Headless CMS",
    description: "CMS API + front séparé.",
  },
  {
    value: "COMMERCE_SAAS",
    label: "Commerce SaaS",
    description: "Shopify, BigCommerce, Webflow e‑commerce.",
  },
  {
    value: "COMMERCE_SELF_HOSTED",
    label: "Commerce auto‑hébergé",
    description: "WooCommerce, PrestaShop, Magento...",
  },
  {
    value: "COMMERCE_HEADLESS",
    label: "Commerce headless",
    description: "Commerce API + front séparé.",
  },
  {
    value: "APP_PLATFORM",
    label: "App / Plateforme",
    description: "Application web avancée.",
  },
];

export const IMPLEMENTATION_OPTIONS: ImplementationOption[] = [
  // Statique / SSG
  { value: "ASTRO", label: "Astro", family: "STATIC_SSG", support: "SUPPORTED" },
  { value: "ELEVENTY", label: "Eleventy", family: "STATIC_SSG", support: "EXTERNAL" },
  { value: "HUGO", label: "Hugo", family: "STATIC_SSG", support: "EXTERNAL" },
  { value: "JEKYLL", label: "Jekyll", family: "STATIC_SSG", support: "EXTERNAL" },
  { value: "GATSBY", label: "Gatsby", family: "STATIC_SSG", support: "EXTERNAL" },
  { value: "NEXT_SSG", label: "Next.js (SSG)", family: "STATIC_SSG", support: "EXTERNAL" },
  { value: "NUXT_SSG", label: "Nuxt (SSG)", family: "STATIC_SSG", support: "EXTERNAL" },

  // CMS monolithique
  { value: "WORDPRESS", label: "WordPress", family: "CMS_MONO", support: "SUPPORTED" },
  { value: "GHOST", label: "Ghost", family: "CMS_MONO", support: "EXTERNAL" },
  { value: "CRAFT", label: "Craft CMS", family: "CMS_MONO", support: "EXTERNAL" },
  { value: "DRUPAL", label: "Drupal", family: "CMS_MONO", support: "EXTERNAL" },
  { value: "JOOMLA", label: "Joomla", family: "CMS_MONO", support: "EXTERNAL" },
  { value: "WEBFLOW", label: "Webflow", family: "CMS_MONO", support: "SAAS" },

  // Headless CMS
  {
    value: "WORDPRESS_HEADLESS",
    label: "WordPress headless",
    family: "CMS_HEADLESS",
    support: "SUPPORTED",
  },
  {
    value: "WOOCOMMERCE_HEADLESS",
    label: "WooCommerce headless",
    family: "COMMERCE_HEADLESS",
    support: "SUPPORTED",
  },
  { value: "STRAPI", label: "Strapi", family: "CMS_HEADLESS", support: "EXTERNAL" },
  { value: "CONTENTFUL", label: "Contentful", family: "CMS_HEADLESS", support: "EXTERNAL" },
  { value: "SANITY", label: "Sanity", family: "CMS_HEADLESS", support: "EXTERNAL" },
  { value: "PRISMIC", label: "Prismic", family: "CMS_HEADLESS", support: "EXTERNAL" },
  { value: "DIRECTUS", label: "Directus", family: "CMS_HEADLESS", support: "EXTERNAL" },
  { value: "STORYBLOK", label: "Storyblok", family: "CMS_HEADLESS", support: "EXTERNAL" },

  // Commerce SaaS
  { value: "SHOPIFY", label: "Shopify", family: "COMMERCE_SAAS", support: "SAAS" },
  { value: "BIGCOMMERCE", label: "BigCommerce", family: "COMMERCE_SAAS", support: "SAAS" },
  {
    value: "WEBFLOW_COMMERCE",
    label: "Webflow E‑commerce",
    family: "COMMERCE_SAAS",
    support: "SAAS",
  },

  // Commerce self-hosted
  {
    value: "WOOCOMMERCE",
    label: "WooCommerce",
    family: "COMMERCE_SELF_HOSTED",
    support: "SUPPORTED",
  },
  {
    value: "PRESTASHOP",
    label: "PrestaShop",
    family: "COMMERCE_SELF_HOSTED",
    support: "SUPPORTED",
  },
  { value: "MAGENTO", label: "Magento", family: "COMMERCE_SELF_HOSTED", support: "EXTERNAL" },
  { value: "SHOPWARE", label: "Shopware", family: "COMMERCE_SELF_HOSTED", support: "EXTERNAL" },
  { value: "SYLIUS", label: "Sylius", family: "COMMERCE_SELF_HOSTED", support: "EXTERNAL" },

  // Commerce headless
  {
    value: "SHOPIFY_HEADLESS",
    label: "Shopify headless",
    family: "COMMERCE_HEADLESS",
    support: "SAAS",
  },
  { value: "MEDUSA", label: "Medusa", family: "COMMERCE_HEADLESS", support: "EXTERNAL" },
  {
    value: "COMMERCETOOLS",
    label: "Commercetools",
    family: "COMMERCE_HEADLESS",
    support: "EXTERNAL",
  },
  { value: "SALEOR", label: "Saleor", family: "COMMERCE_HEADLESS", support: "EXTERNAL" },

  // App / plateforme
  { value: "NEXTJS", label: "Next.js", family: "APP_PLATFORM", support: "SUPPORTED" },
  { value: "NUXT", label: "Nuxt", family: "APP_PLATFORM", support: "SUPPORTED" },
  { value: "SVELTEKIT", label: "SvelteKit", family: "APP_PLATFORM", support: "EXTERNAL" },
  { value: "REMIX", label: "Remix", family: "APP_PLATFORM", support: "EXTERNAL" },
  { value: "OTHER", label: "Autre", family: "APP_PLATFORM", support: "EXTERNAL" },
];

export const FRONTEND_IMPLEMENTATIONS: FrontendOption[] = [
  { value: "NEXTJS", label: "Next.js", support: "SUPPORTED" },
  { value: "NUXT", label: "Nuxt", support: "SUPPORTED" },
  { value: "ASTRO", label: "Astro", support: "SUPPORTED" },
  { value: "SVELTEKIT", label: "SvelteKit", support: "EXTERNAL" },
  { value: "REMIX", label: "Remix", support: "EXTERNAL" },
  { value: "GATSBY", label: "Gatsby", support: "EXTERNAL" },
  { value: "OTHER", label: "Autre", support: "EXTERNAL" },
];

export const SUPPORT_BADGE_LABELS: Record<ImplementationSupport, string> = {
  SUPPORTED: "Supporté",
  EXTERNAL: "Externe",
  SAAS: "SaaS",
};

export const HOSTING_ALLOWED_FAMILIES: Record<HostingTargetInput, ProjectFamilyInput[]> = {
  SHARED_PHP: ["STATIC_SSG", "CMS_MONO", "COMMERCE_SELF_HOSTED"],
  // Legacy: managed hosting is handled at provider level, but we keep compat.
  MANAGED_WORDPRESS: ["CMS_MONO"],
  CLOUD_STATIC: ["STATIC_SSG"],
  CLOUD_SSR: ["APP_PLATFORM"],
  VPS_DOCKER: [
    "STATIC_SSG",
    "CMS_MONO",
    "CMS_HEADLESS",
    "COMMERCE_SAAS",
    "COMMERCE_SELF_HOSTED",
    "COMMERCE_HEADLESS",
    "APP_PLATFORM",
  ],
  // Legacy: SaaS / split headless are handled in constraints, not infra.
  SAAS: ["COMMERCE_SAAS", "CMS_MONO"],
  SPLIT_HEADLESS: ["CMS_HEADLESS", "COMMERCE_HEADLESS"],
  TO_CONFIRM: [
    "STATIC_SSG",
    "CMS_MONO",
    "CMS_HEADLESS",
    "COMMERCE_SAAS",
    "COMMERCE_SELF_HOSTED",
    "COMMERCE_HEADLESS",
    "APP_PLATFORM",
  ],
};

export function filterHostingTargetsByProjectType(
  hostingTargets: HostingTargetInput[],
  projectType: ProjectType | null,
): HostingTargetInput[] {
  if (!projectType) return hostingTargets;
  const allowed = HOSTING_BY_PROJECT_TYPE[projectType] ?? hostingTargets;
  const filtered = hostingTargets.filter((h) => allowed.includes(h));
  return filtered.length > 0 ? filtered : allowed;
}

/** Familles autorisées par type fonctionnel (filtre métier). */
export const FAMILY_BY_PROJECT_TYPE: Record<ProjectType, ProjectFamilyInput[]> = {
  STARTER: ["STATIC_SSG", "CMS_MONO"],
  BLOG: ["STATIC_SSG", "CMS_MONO", "CMS_HEADLESS"],
  VITRINE: ["STATIC_SSG", "CMS_MONO", "CMS_HEADLESS"],
  ECOM: ["COMMERCE_SAAS", "COMMERCE_SELF_HOSTED", "COMMERCE_HEADLESS"],
  APP: ["APP_PLATFORM"],
};

export function filterFamiliesByProjectType(
  families: ProjectFamilyInput[],
  projectType: ProjectType | null,
): ProjectFamilyInput[] {
  if (!projectType) return families;
  const allowed = FAMILY_BY_PROJECT_TYPE[projectType] ?? [];
  return families.filter((f) => allowed.includes(f));
}

/**
 * Hosting autorisés pour un type fonctionnel et réellement compatibles
 * avec au moins une famille permise par ce type.
 */
export function filterHostingTargetsForProjectType(
  projectType: ProjectType | null,
): HostingTargetInput[] {
  const all = HOSTING_TARGET_OPTIONS.map((opt) => opt.value);
  if (!projectType) return all;

  const allowedHosting = HOSTING_BY_PROJECT_TYPE[projectType] ?? all;
  const allowedFamilies = FAMILY_BY_PROJECT_TYPE[projectType] ?? [];

  return allowedHosting.filter((hosting) => {
    const families = HOSTING_ALLOWED_FAMILIES[hosting] ?? [];
    return families.some((f) => allowedFamilies.includes(f));
  });
}

export function getImplementationOptions(
  family: ProjectFamilyInput,
  supportFilter: "supported" | "all" = "supported",
): ImplementationOption[] {
  const options = IMPLEMENTATION_OPTIONS.filter((item) => item.family === family);
  if (supportFilter === "all") return options;
  return options.filter((item) => item.support === "SUPPORTED");
}

export function getFrontImplementationOptions(
  supportFilter: "supported" | "all" = "supported",
): FrontendOption[] {
  if (supportFilter === "all") return FRONTEND_IMPLEMENTATIONS;
  return FRONTEND_IMPLEMENTATIONS.filter((item) => item.support === "SUPPORTED");
}

export function isImplementationSupported(value: ProjectImplementationInput): boolean {
  return (
    IMPLEMENTATION_OPTIONS.find((item) => item.value === value)?.support === "SUPPORTED"
  );
}

export function isFrontendSupported(value: ProjectFrontendImplementationInput): boolean {
  return (
    FRONTEND_IMPLEMENTATIONS.find((item) => item.value === value)?.support === "SUPPORTED"
  );
}

export function resolveDefaultImplementation(
  family: ProjectFamilyInput,
): ProjectImplementationInput {
  const preferred = IMPLEMENTATION_OPTIONS.find(
    (item) => item.family === family && item.support === "SUPPORTED",
  );
  return preferred?.value ?? IMPLEMENTATION_OPTIONS.find((item) => item.family === family)?.value ?? "OTHER";
}

export function resolveDefaultFrontend(): ProjectFrontendImplementationInput {
  return "NEXTJS";
}

export function resolveFamilyFromInputs(params: {
  projectType: ProjectType;
  needsEditing: boolean;
  editingFrequency: EditingFrequency;
  commerceModel?: CommerceModel | null;
  headlessRequired: boolean;
}): ProjectFamilyInput {
  const {
    projectType,
    needsEditing,
    editingFrequency,
    commerceModel,
    headlessRequired,
  } = params;

  if (projectType === "STARTER") {
    if (!needsEditing) return "STATIC_SSG";
    if (editingFrequency === "RARE") return "STATIC_SSG";
    return "CMS_MONO";
  }

  if (projectType === "APP") return "APP_PLATFORM";

  if (projectType === "ECOM") {
    if (commerceModel === "SAAS") return "COMMERCE_SAAS";
    if (commerceModel === "HEADLESS") return "COMMERCE_HEADLESS";
    return "COMMERCE_SELF_HOSTED";
  }

  if (headlessRequired) return "CMS_HEADLESS";

  if (!needsEditing) return "STATIC_SSG";

  if ((projectType === "VITRINE" || projectType === "BLOG") && editingFrequency === "RARE") {
    return "STATIC_SSG";
  }

  return "CMS_MONO";
}

export function resolveImplementationFromFamily(
  family: ProjectFamilyInput,
  supportFilter: "supported" | "all" = "supported",
): ProjectImplementationInput {
  const options = getImplementationOptions(family, supportFilter);
  return options[0]?.value ?? resolveDefaultImplementation(family);
}

export function resolveTechStackFromImplementation(
  implementation: ProjectImplementationInput | null,
  frontend: ProjectFrontendImplementationInput | null,
): { techStack: TechStack | null; wpHeadless: boolean; frontendStack: FrontendStackValue | null } {
  if (!implementation) {
    return { techStack: null, wpHeadless: false, frontendStack: null };
  }

  switch (implementation) {
    case "WORDPRESS":
    case "WOOCOMMERCE":
    case "PRESTASHOP":
    case "MAGENTO":
    case "SHOPWARE":
    case "SYLIUS":
      return { techStack: "WORDPRESS", wpHeadless: false, frontendStack: null };
    case "WORDPRESS_HEADLESS": {
      const front = resolveFrontendStack(frontend);
      return { techStack: "WORDPRESS", wpHeadless: true, frontendStack: front };
    }
    case "WOOCOMMERCE_HEADLESS": {
      const front = resolveFrontendStack(frontend);
      return { techStack: "WORDPRESS", wpHeadless: true, frontendStack: front };
    }
    case "GHOST":
    case "CRAFT":
    case "DRUPAL":
    case "JOOMLA":
    case "WEBFLOW":
      return { techStack: "WORDPRESS", wpHeadless: false, frontendStack: null };
    case "NEXTJS":
    case "NEXT_SSG":
    case "REMIX":
      return { techStack: "NEXTJS", wpHeadless: false, frontendStack: null };
    case "NUXT":
    case "NUXT_SSG":
      return { techStack: "NUXT", wpHeadless: false, frontendStack: null };
    case "ASTRO":
    case "ELEVENTY":
    case "HUGO":
    case "JEKYLL":
    case "GATSBY":
      return { techStack: "ASTRO", wpHeadless: false, frontendStack: null };
    case "SHOPIFY":
    case "BIGCOMMERCE":
    case "WEBFLOW_COMMERCE":
      return { techStack: "WORDPRESS", wpHeadless: false, frontendStack: null };
    case "STRAPI":
    case "CONTENTFUL":
    case "SANITY":
    case "PRISMIC":
    case "DIRECTUS":
    case "STORYBLOK":
      return { techStack: "NEXTJS", wpHeadless: false, frontendStack: null };
    case "SHOPIFY_HEADLESS":
    case "MEDUSA":
    case "COMMERCETOOLS":
    case "SALEOR": {
      const front = resolveFrontendStack(frontend);
      return { techStack: "NEXTJS", wpHeadless: false, frontendStack: front };
    }
    default:
      return { techStack: null, wpHeadless: false, frontendStack: null };
  }
}

export function resolveFrontendStack(
  frontend: ProjectFrontendImplementationInput | null,
): FrontendStackValue | null {
  if (!frontend) return null;
  if (frontend === "NEXTJS") return "NEXTJS";
  if (frontend === "NUXT") return "NUXT";
  if (frontend === "ASTRO") return "ASTRO";
  return "NEXTJS";
}

export function resolveDeployTargetFromHosting(
  hostingTarget: HostingTargetInput | null,
  fallback: "DOCKER" | "VERCEL" | "SHARED_HOSTING" = "DOCKER",
): "DOCKER" | "VERCEL" | "SHARED_HOSTING" {
  if (!hostingTarget) return fallback;
  switch (hostingTarget) {
    case "SHARED_PHP":
    case "MANAGED_WORDPRESS":
      return "SHARED_HOSTING";
    case "CLOUD_STATIC":
    case "CLOUD_SSR":
      return "VERCEL";
    case "VPS_DOCKER":
      return "DOCKER";
    case "SPLIT_HEADLESS":
      return "SHARED_HOSTING";
    default:
      return fallback;
  }
}
