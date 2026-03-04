//src/lib/validators/project.ts
import { z } from "zod";

// ── Enums (alignés Prisma) ────────────────────────────────────────────
export const devModeEnum = z.enum(["DEV_COMFORT", "DEV_PROD_LIKE", "PROD"]);
export const projectTypeEnum = z.enum(["STARTER", "VITRINE", "BLOG", "ECOM", "APP"]);
export const projectStatusEnum = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);
export const techStackEnum = z.enum(["WORDPRESS", "NEXTJS", "NUXT", "ASTRO"]);
export const deployTargetEnum = z.enum(["DOCKER", "VERCEL", "SHARED_HOSTING"]);
export const hostingTargetEnum = z.enum([
  "SHARED_PHP",
  "MANAGED_WORDPRESS",
  "CLOUD_STATIC",
  "CLOUD_SSR",
  "VPS_DOCKER",
  "SAAS",
  "SPLIT_HEADLESS",
  "TO_CONFIRM",
]);
export const frontendStackEnum = z.enum(["NEXTJS", "NUXT", "ASTRO"]);
export const projectFamilyEnum = z.enum([
  "STATIC_SSG",
  "CMS_MONO",
  "CMS_HEADLESS",
  "COMMERCE_SAAS",
  "COMMERCE_SELF_HOSTED",
  "COMMERCE_HEADLESS",
  "APP_PLATFORM",
]);
export const projectImplementationEnum = z.enum([
  "ASTRO",
  "ELEVENTY",
  "HUGO",
  "JEKYLL",
  "GATSBY",
  "NEXT_SSG",
  "NUXT_SSG",
  "WORDPRESS",
  "GHOST",
  "CRAFT",
  "DRUPAL",
  "JOOMLA",
  "WEBFLOW",
  "WORDPRESS_HEADLESS",
  "WOOCOMMERCE_HEADLESS",
  "STRAPI",
  "CONTENTFUL",
  "SANITY",
  "PRISMIC",
  "DIRECTUS",
  "STORYBLOK",
  "SHOPIFY",
  "BIGCOMMERCE",
  "WEBFLOW_COMMERCE",
  "WOOCOMMERCE",
  "PRESTASHOP",
  "MAGENTO",
  "SHOPWARE",
  "SYLIUS",
  "SHOPIFY_HEADLESS",
  "MEDUSA",
  "COMMERCETOOLS",
  "SALEOR",
  "NEXTJS",
  "NUXT",
  "SVELTEKIT",
  "REMIX",
  "OTHER",
]);
export const projectFrontendImplementationEnum = z.enum([
  "NEXTJS",
  "NUXT",
  "ASTRO",
  "SVELTEKIT",
  "REMIX",
  "GATSBY",
  "OTHER",
]);
export const dbTypeEnum = z.enum(["MARIADB", "POSTGRESQL"]);
export const projectCategoryEnum = z.enum(["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"]);
export const maintenanceLevelEnum = z.enum([
  "MINIMAL",
  "STANDARD",
  "ADVANCED",
  "BUSINESS",
  "PREMIUM",
]);

export const trafficLevelEnum = z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]);
export const productBucketEnum = z.enum(["NONE", "SMALL", "MEDIUM", "LARGE"]);
export const dataSensitivityEnum = z.enum(["STANDARD", "SENSITIVE", "REGULATED"]);
export const scalabilityLevelEnum = z.enum(["FIXED", "GROWING", "ELASTIC"]);
export const editingFrequencyEnum = z.enum(["RARE", "REGULAR", "DAILY"]);
export const commerceModelEnum = z.enum(["SAAS", "SELF_HOSTED", "HEADLESS"]);
export const backendModeEnum = z.enum(["FULLSTACK", "SEPARATE"]);
export const backendFamilyEnum = z.enum(["BAAS_STANDARD", "BAAS_ADVANCED", "CUSTOM_API"]);



// ── Consts ────────────────────────────────────────────────────────────

/** Port range reserved for project dev servers */
export const PROJECT_PORT_MIN = 3001;
export const PROJECT_PORT_MAX = 3999;

// ── Sub-schemas (alignés tables Prisma) ───────────────────────────────

export const runtimeInputSchema = z
  .object({
    port: z
      .number()
      .int("Le port doit être un entier")
      .min(PROJECT_PORT_MIN, `Le port minimum est ${String(PROJECT_PORT_MIN)}`)
      .max(PROJECT_PORT_MAX, `Le port maximum est ${String(PROJECT_PORT_MAX)}`)
      .nullable()
      .default(null),
    localHost: z.string().nullable().default(null),
  })
  .optional();

export const databaseInputSchema = z
  .object({
    dbType: dbTypeEnum.default("MARIADB"),
    dbVersion: z.string().min(1).default("11"),
    dbName: z.string().nullable().default(null),
    dbUser: z.string().nullable().default(null),
    dbPassword: z.string().nullable().default(null),
  })
  .optional();

export const wpConfigInputSchema = z
  .object({
    phpVersion: z.string().min(1).default("8.3"),
    wpHeadless: z.boolean().default(false),
    frontendStack: frontendStackEnum
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),

    wpSiteTitle: z.string().nullable().default(null),
    wpAdminUser: z.string().nullable().default(null),
    wpAdminPassword: z.string().nullable().default(null),
    wpAdminEmail: z.string().nullable().default(null),

    wpPermalinkStructure: z.string().nullable().default("/%postname%/"),
    wpDefaultPages: z.string().nullable().default(null), // JSON text
    wpPlugins: z.string().nullable().default(null), // JSON text
    wpTheme: z.string().nullable().default(null),
  })
  .optional();

export const nextConfigInputSchema = z
  .object({
    nodeVersion: z.string().min(1).default("22"),
    envVarsJson: z.string().nullable().default(null), // JSON text
  })
  .optional();

/**
 * Services optionnels (ProjectService)
 * IMPORTANT: On ne met PAS db-mariadb / db-postgresql ici.
 * La DB vient de ProjectDatabase.
 */
export const enabledServiceIdsSchema = z.array(z.string()).optional();

// ── Create ────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
  clientId: z.string().min(1, "Le client est requis"),
  devMode: devModeEnum.default("DEV_COMFORT"),

  type: projectTypeEnum.default("VITRINE"),
  description: z
    .string()
    .max(2000, "La description ne doit pas dépasser 2000 caractères")
    .optional()
    .transform((v) => v?.trim() || undefined),

  domain: z
  .string()
  .nullable()
  .default(null)
  .transform((v) => {
    if (v === null) return null;
    const s = v.trim();
    return s === "" ? null : s;
  }),
  gitRepo: z
    .string()
    .url("URL Git invalide")
    .optional()
    .or(z.literal(""))
    .transform((v) => v?.trim() || undefined),

  techStack: techStackEnum.optional(),
  deployTarget: deployTargetEnum.default("DOCKER"),
  hostingTarget: hostingTargetEnum.default("TO_CONFIRM"),
  hostingTargetBack: hostingTargetEnum.optional(),
  hostingTargetFront: hostingTargetEnum.optional(),
  projectFamily: projectFamilyEnum.optional(),
  projectImplementation: projectImplementationEnum.optional(),
  projectImplementationId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
  projectImplementationLabel: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
  projectFrontendImplementation: projectFrontendImplementationEnum
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  projectFrontendImplementationLabel: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
  hostingProviderId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),

  category: projectCategoryEnum
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v)),

  // Sub models
  runtime: runtimeInputSchema,
  database: databaseInputSchema,
  wpConfig: wpConfigInputSchema,
  nextConfig: nextConfigInputSchema,

  // Services optionnels
  enabledServiceIds: enabledServiceIdsSchema,

  // Qualification (1:1)
  qualification: z
    .object({
      modules: z.string().optional(), // JSON text
      maintenanceLevel: maintenanceLevelEnum.optional(),
      estimatedBudget: z.number().int().nonnegative().optional(),
      trafficLevel: trafficLevelEnum.optional(),
      productCount: productBucketEnum.optional(),
      dataSensitivity: dataSensitivityEnum.optional(),
      scalabilityLevel: scalabilityLevelEnum.optional(),
      needsEditing: z.boolean().optional(),
      editingFrequency: editingFrequencyEnum.optional(),
      headlessRequired: z.boolean().optional(),
      commerceModel: commerceModelEnum.optional(),
      backendMode: backendModeEnum.optional(),
      backendFamily: backendFamilyEnum.optional(),
      backendOpsHeavy: z.boolean().optional(),
      ciScore: z.number().optional(),
      ciCategory: projectCategoryEnum.optional(),
      ciAxesJson: z.string().optional(),
    })
    .optional(),
});

// export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// ── Update ────────────────────────────────────────────────────────────

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
  type: projectTypeEnum,
  status: projectStatusEnum,
  description: z
    .string()
    .max(2000, "La description ne doit pas dépasser 2000 caractères")
    .optional()
    .transform((v) => v?.trim() || undefined),

  domain: z
  .string()
  .nullable()
  .default(null)
  .transform((v) => {
    if (v === null) return null;
    const s = v.trim();
    return s === "" ? null : s;
  }),
  gitRepo: z
    .string()
    .url("URL Git invalide")
    .optional()
    .or(z.literal(""))
    .transform((v) => v?.trim() || undefined),

  techStack: techStackEnum.optional(),
  deployTarget: deployTargetEnum,
  hostingTarget: hostingTargetEnum.optional(),
  hostingTargetBack: hostingTargetEnum.optional(),
  hostingTargetFront: hostingTargetEnum.optional(),
  projectFamily: projectFamilyEnum.optional(),
  projectImplementation: projectImplementationEnum.optional(),
  projectImplementationId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
  projectImplementationLabel: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
  projectFrontendImplementation: projectFrontendImplementationEnum
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  projectFrontendImplementationLabel: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
  hostingProviderId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  category: projectCategoryEnum
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v)),

  // Sub models (optionnels en update)
  runtime: runtimeInputSchema,
  database: databaseInputSchema,
  wpConfig: wpConfigInputSchema,
  nextConfig: nextConfigInputSchema,
  enabledServiceIds: enabledServiceIdsSchema,

  qualification: z
    .object({
      modules: z.string().optional(),
      maintenanceLevel: maintenanceLevelEnum.optional(),
      estimatedBudget: z.number().int().nonnegative().optional(),
      trafficLevel: trafficLevelEnum.optional(),
      productCount: productBucketEnum.optional(),
      dataSensitivity: dataSensitivityEnum.optional(),
      scalabilityLevel: scalabilityLevelEnum.optional(),
      needsEditing: z.boolean().optional(),
      editingFrequency: editingFrequencyEnum.optional(),
      headlessRequired: z.boolean().optional(),
      commerceModel: commerceModelEnum.optional(),
      backendMode: backendModeEnum.optional(),
      backendFamily: backendFamilyEnum.optional(),
      backendOpsHeavy: z.boolean().optional(),
      ciScore: z.number().optional(),
      ciCategory: projectCategoryEnum.optional(),
      ciAxesJson: z.string().optional(),
    })
    .optional(),
});

// export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// ── Labels ────────────────────────────────────────────────────────────

export const PROJECT_TYPE_LABELS: Record<z.infer<typeof projectTypeEnum>, string> =
  {
    STARTER: "Starter",
    VITRINE: "Vitrine",
    BLOG: "Blog",
    ECOM: "E-commerce",
    APP: "Application",
  };

export const PROJECT_STATUS_LABELS: Record<
  z.infer<typeof projectStatusEnum>,
  string
> = {
  DRAFT: "Brouillon",
  ACTIVE: "Actif",
  ARCHIVED: "Archivé",
};

export const TECH_STACK_LABELS: Record<z.infer<typeof techStackEnum>, string> = {
  WORDPRESS: "WordPress",
  NEXTJS: "Next.js",
  NUXT: "Nuxt",
  ASTRO: "Astro",
};

export const HOSTING_TARGET_LABELS: Record<z.infer<typeof hostingTargetEnum>, string> = {
  SHARED_PHP: "Mutualisé PHP",
  MANAGED_WORDPRESS: "Managed WordPress",
  CLOUD_STATIC: "Cloud statique",
  CLOUD_SSR: "Cloud SSR / Edge",
  VPS_DOCKER: "VPS / Docker",
  SAAS: "SaaS",
  SPLIT_HEADLESS: "Split headless (CMS + front)",
  TO_CONFIRM: "À confirmer",
};

export const PROJECT_FAMILY_LABELS: Record<z.infer<typeof projectFamilyEnum>, string> = {
  STATIC_SSG: "Statique / SSG",
  CMS_MONO: "CMS monolithique",
  CMS_HEADLESS: "Headless CMS",
  COMMERCE_SAAS: "Commerce SaaS",
  COMMERCE_SELF_HOSTED: "Commerce auto-hébergé",
  COMMERCE_HEADLESS: "Commerce headless",
  APP_PLATFORM: "App / Plateforme",
};

export const PROJECT_IMPLEMENTATION_LABELS: Record<
  z.infer<typeof projectImplementationEnum>,
  string
> = {
  ASTRO: "Astro",
  ELEVENTY: "Eleventy",
  HUGO: "Hugo",
  JEKYLL: "Jekyll",
  GATSBY: "Gatsby",
  NEXT_SSG: "Next.js (SSG)",
  NUXT_SSG: "Nuxt (SSG)",
  WORDPRESS: "WordPress",
  GHOST: "Ghost",
  CRAFT: "Craft CMS",
  DRUPAL: "Drupal",
  JOOMLA: "Joomla",
  WEBFLOW: "Webflow",
  WORDPRESS_HEADLESS: "WordPress headless",
  WOOCOMMERCE_HEADLESS: "WooCommerce headless",
  STRAPI: "Strapi",
  CONTENTFUL: "Contentful",
  SANITY: "Sanity",
  PRISMIC: "Prismic",
  DIRECTUS: "Directus",
  STORYBLOK: "Storyblok",
  SHOPIFY: "Shopify",
  BIGCOMMERCE: "BigCommerce",
  WEBFLOW_COMMERCE: "Webflow E-commerce",
  WOOCOMMERCE: "WooCommerce",
  PRESTASHOP: "PrestaShop",
  MAGENTO: "Magento",
  SHOPWARE: "Shopware",
  SYLIUS: "Sylius",
  SHOPIFY_HEADLESS: "Shopify headless",
  MEDUSA: "Medusa",
  COMMERCETOOLS: "Commercetools",
  SALEOR: "Saleor",
  NEXTJS: "Next.js",
  NUXT: "Nuxt",
  SVELTEKIT: "SvelteKit",
  REMIX: "Remix",
  OTHER: "Autre",
};

export const PROJECT_FRONTEND_IMPLEMENTATION_LABELS: Record<
  z.infer<typeof projectFrontendImplementationEnum>,
  string
> = {
  NEXTJS: "Next.js",
  NUXT: "Nuxt",
  ASTRO: "Astro",
  SVELTEKIT: "SvelteKit",
  REMIX: "Remix",
  GATSBY: "Gatsby",
  OTHER: "Autre",
};

export const DEPLOY_TARGET_LABELS: Record<
  z.infer<typeof deployTargetEnum>,
  string
> = {
  DOCKER: "Docker (auto-hébergé)",
  VERCEL: "Vercel",
  SHARED_HOSTING: "Hébergement mutualisé",
};

export const FRONTEND_STACK_LABELS: Record<
  z.infer<typeof frontendStackEnum>,
  string
> = {
  NEXTJS: "Next.js",
  NUXT: "Nuxt",
  ASTRO: "Astro",
};

export type CreateProjectInput = z.input<typeof createProjectSchema>;   // ce que tu peux recevoir (avant defaults)
export type CreateProjectData  = z.output<typeof createProjectSchema>;  // ce que tu as APRÈS safeParse (defaults appliqués)

export type UpdateProjectInput = z.input<typeof updateProjectSchema>;
export type UpdateProjectData  = z.output<typeof updateProjectSchema>;

// Bonus unions “propres” (si tu veux)
export type ProjectTypeInput = z.infer<typeof projectTypeEnum>;
export type TechStackInput = z.infer<typeof techStackEnum>;
export type DeployTargetInput = z.infer<typeof deployTargetEnum>;
export type FrontendStackInput = z.infer<typeof frontendStackEnum>;
export type HostingTargetInput = z.infer<typeof hostingTargetEnum>;
export type BackendModeInput = z.infer<typeof backendModeEnum>;
export type ProjectFamilyInput = z.infer<typeof projectFamilyEnum>;
export type ProjectImplementationInput = z.infer<typeof projectImplementationEnum>;
export type ProjectFrontendImplementationInput = z.infer<typeof projectFrontendImplementationEnum>;
