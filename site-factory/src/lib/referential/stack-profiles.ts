/**
 * Profils de stack — Référentiel v2
 *
 * Remplace le type TechStack à 4 valeurs par un registre extensible.
 * Chaque profil décrit les capacités, compatibilités et coefficients
 * d'un stack technique sans hardcoder la logique métier.
 *
 * Pour ajouter un nouveau stack :
 *  1. Ajouter un StackProfile dans STACK_PROFILES
 *  2. Mettre à jour le mapping implementation → profile si nécessaire
 *  3. Aucun changement dans le moteur de qualification
 */

import type { StackFamily } from "./stack-families";
import type { DeployTarget } from "./deploy-fees";

// ── Types ────────────────────────────────────────────────────────────

export type StackCapability =
  | "SSG"
  | "SSR"
  | "ISR"
  | "EDGE"
  | "API_ROUTES"
  | "PHP"
  | "NODE"
  | "PLUGIN_ECOSYSTEM"
  | "HEADLESS_CMS"
  | "ECOMMERCE"
  | "FULLSTACK"
  | "STATIC_ONLY";

/** Ancien type TechStack Prisma — maintenu pour rétro-compatibilité */
export type LegacyTechStack = "WORDPRESS" | "NEXTJS" | "NUXT" | "ASTRO";

export interface StackProfile {
  /** Identifiant unique du profil (ex: "wordpress", "nextjs", "astro") */
  id: string;
  /** Nom d'affichage */
  label: string;
  /** Famille technique (détermine le pricing de base) */
  family: StackFamily;
  /** Capacités du stack */
  capabilities: StackCapability[];
  /** Cibles de déploiement compatibles */
  hostingCompat: DeployTarget[];
  /**
   * Coefficient de complexité appliqué au budget de base.
   * WordPress = 1.0 (référence). Plus le stack demande de dev custom, plus le coeff est élevé.
   */
  complexityFactor: number;
  /**
   * Tier minimum de maintenance imposé par ce stack.
   * 0 = pas de plancher (maintenance déterminée par la catégorie).
   */
  maintenanceFloorTier: number;
  /** Mapping vers l'ancien TechStack Prisma (null si pas d'équivalent direct) */
  legacyTechStack: LegacyTechStack | null;
  /** Le stack dispose-t-il d'un écosystème de plugins/extensions ? */
  hasPluginEcosystem: boolean;
  /** Description courte pour l'UI */
  summary: string;
  /** Notes spécifiques pour les devis */
  pricingNotes: string[];
}

// ── Registre des profils ─────────────────────────────────────────────

export const STACK_PROFILES: StackProfile[] = [
  // ─── WordPress & dérivés ───────────────────────────────────────────
  {
    id: "wordpress-minimal",
    label: "WordPress minimal",
    family: "CMS_SIMPLE",
    capabilities: ["PHP", "PLUGIN_ECOSYSTEM"],
    hostingCompat: ["DOCKER", "SHARED_HOSTING"],
    complexityFactor: 1.0,
    maintenanceFloorTier: 0,
    legacyTechStack: "WORDPRESS",
    hasPluginEcosystem: true,
    summary: "WordPress léger pour starter / pages simples.",
    pricingNotes: [
      "Configuration minimale",
      "Écosystème plugin disponible",
      "Base starter (×1.0)",
    ],
  },
  {
    id: "wordpress",
    label: "WordPress (classique)",
    family: "CMS_ADVANCED",
    capabilities: ["PHP", "PLUGIN_ECOSYSTEM"],
    hostingCompat: ["DOCKER", "SHARED_HOSTING"],
    complexityFactor: 1.0,
    maintenanceFloorTier: 1,
    legacyTechStack: "WORDPRESS",
    hasPluginEcosystem: true,
    summary: "CMS complet avec plugins, thèmes FSE, configuration.",
    pricingNotes: [
      "Plugins disponibles (gratuits/premium)",
      "Configuration et intégration rapide",
      "Coût référence (×1.0)",
    ],
  },
  {
    id: "wordpress-headless",
    label: "WordPress headless",
    family: "HEADLESS_INTEGRATION",
    capabilities: ["PHP", "PLUGIN_ECOSYSTEM", "HEADLESS_CMS", "API_ROUTES"],
    hostingCompat: ["DOCKER", "SHARED_HOSTING"],
    complexityFactor: 1.6,
    maintenanceFloorTier: 4,
    legacyTechStack: "WORDPRESS",
    hasPluginEcosystem: true,
    summary: "WordPress en API + frontend JS séparé.",
    pricingNotes: [
      "Découplage front/back",
      "API, auth, CORS, cache",
      "Surcoût coordination (×1.6)",
    ],
  },
  {
    id: "woocommerce",
    label: "WooCommerce",
    family: "ECOMMERCE_STANDARD",
    capabilities: ["PHP", "PLUGIN_ECOSYSTEM", "ECOMMERCE"],
    hostingCompat: ["DOCKER", "SHARED_HOSTING"],
    complexityFactor: 1.0,
    maintenanceFloorTier: 2,
    legacyTechStack: "WORDPRESS",
    hasPluginEcosystem: true,
    summary: "E-commerce WordPress complet.",
    pricingNotes: [
      "Plugins WooCommerce disponibles",
      "Paramétrage checkout/produits",
      "Coût référence e-commerce (×1.0)",
    ],
  },
  {
    id: "woocommerce-headless",
    label: "WooCommerce headless",
    family: "ECOMMERCE_HEADLESS",
    capabilities: ["PHP", "PLUGIN_ECOSYSTEM", "ECOMMERCE", "HEADLESS_CMS", "API_ROUTES"],
    hostingCompat: ["DOCKER", "SHARED_HOSTING"],
    complexityFactor: 1.8,
    maintenanceFloorTier: 4,
    legacyTechStack: "WORDPRESS",
    hasPluginEcosystem: true,
    summary: "E-commerce headless WooCommerce.",
    pricingNotes: [
      "Checkout et panier custom",
      "API WooCommerce + front JS",
      "Surcoût le plus élevé (×1.8)",
    ],
  },

  // ─── Frameworks JS ─────────────────────────────────────────────────
  {
    id: "nextjs",
    label: "Next.js",
    family: "SSR_FRAMEWORK",
    capabilities: ["SSG", "SSR", "ISR", "EDGE", "API_ROUTES", "NODE", "FULLSTACK"],
    hostingCompat: ["DOCKER", "VERCEL"],
    complexityFactor: 1.3,
    maintenanceFloorTier: 1,
    legacyTechStack: "NEXTJS",
    hasPluginEcosystem: false,
    summary: "Framework React full-stack (SSR/SSG/ISR).",
    pricingNotes: [
      "Développement front/back custom",
      "Pas de plugins équivalents WP",
      "Surcoût notable (×1.3)",
    ],
  },
  {
    id: "nuxt",
    label: "Nuxt",
    family: "SSR_FRAMEWORK",
    capabilities: ["SSG", "SSR", "ISR", "EDGE", "API_ROUTES", "NODE", "FULLSTACK"],
    hostingCompat: ["DOCKER", "VERCEL"],
    complexityFactor: 1.3,
    maintenanceFloorTier: 1,
    legacyTechStack: "NUXT",
    hasPluginEcosystem: false,
    summary: "Framework Vue full-stack (SSR/SSG).",
    pricingNotes: [
      "Développement front/back custom",
      "Pas de plugins équivalents WP",
      "Surcoût notable (×1.3)",
    ],
  },
  {
    id: "astro",
    label: "Astro",
    family: "SSG_JAMSTACK",
    capabilities: ["SSG", "SSR", "NODE", "STATIC_ONLY"],
    hostingCompat: ["DOCKER", "VERCEL"],
    complexityFactor: 1.2,
    maintenanceFloorTier: 0,
    legacyTechStack: "ASTRO",
    hasPluginEcosystem: false,
    summary: "Framework SSG-first avec islands architecture.",
    pricingNotes: [
      "Développement custom",
      "Moins de complexité runtime",
      "Surcoût modéré (×1.2)",
    ],
  },
  {
    id: "sveltekit",
    label: "SvelteKit",
    family: "SSR_FRAMEWORK",
    capabilities: ["SSG", "SSR", "API_ROUTES", "NODE", "FULLSTACK"],
    hostingCompat: ["DOCKER", "VERCEL"],
    complexityFactor: 1.3,
    maintenanceFloorTier: 1,
    legacyTechStack: null,
    hasPluginEcosystem: false,
    summary: "Framework Svelte full-stack.",
    pricingNotes: [
      "Développement custom complet",
      "Écosystème plus restreint",
      "Surcoût notable (×1.3)",
    ],
  },
  {
    id: "remix",
    label: "Remix",
    family: "SSR_FRAMEWORK",
    capabilities: ["SSR", "API_ROUTES", "NODE", "FULLSTACK"],
    hostingCompat: ["DOCKER", "VERCEL"],
    complexityFactor: 1.3,
    maintenanceFloorTier: 1,
    legacyTechStack: "NEXTJS",
    hasPluginEcosystem: false,
    summary: "Framework React SSR orienté web standards.",
    pricingNotes: [
      "Développement custom complet",
      "Architecture loaders/actions",
      "Surcoût notable (×1.3)",
    ],
  },

  // ─── CMS headless tiers ────────────────────────────────────────────
  {
    id: "strapi",
    label: "Strapi",
    family: "HEADLESS_INTEGRATION",
    capabilities: ["API_ROUTES", "NODE", "HEADLESS_CMS"],
    hostingCompat: ["DOCKER"],
    complexityFactor: 1.4,
    maintenanceFloorTier: 4,
    legacyTechStack: "NEXTJS",
    hasPluginEcosystem: true,
    summary: "CMS headless Node.js auto-hébergé.",
    pricingNotes: [
      "API auto-générée",
      "Back-office inclus",
      "Nécessite frontend séparé (×1.4)",
    ],
  },

  // ─── E-commerce tiers ──────────────────────────────────────────────
  {
    id: "prestashop",
    label: "PrestaShop",
    family: "ECOMMERCE_STANDARD",
    capabilities: ["PHP", "PLUGIN_ECOSYSTEM", "ECOMMERCE"],
    hostingCompat: ["DOCKER", "SHARED_HOSTING"],
    complexityFactor: 1.0,
    maintenanceFloorTier: 2,
    legacyTechStack: "WORDPRESS",
    hasPluginEcosystem: true,
    summary: "E-commerce PHP open source.",
    pricingNotes: [
      "Modules disponibles (marketplace)",
      "Solution e-commerce mature",
      "Coût référence e-commerce (×1.0)",
    ],
  },
  {
    id: "shopify",
    label: "Shopify",
    family: "ECOMMERCE_STANDARD",
    capabilities: ["ECOMMERCE"],
    hostingCompat: [],
    complexityFactor: 0.8,
    maintenanceFloorTier: 1,
    legacyTechStack: null,
    hasPluginEcosystem: true,
    summary: "E-commerce SaaS clé en main.",
    pricingNotes: [
      "Configuration thème + apps",
      "Hébergement inclus (SaaS)",
      "Coût réduit (×0.8)",
    ],
  },
  {
    id: "shopify-headless",
    label: "Shopify headless (Hydrogen)",
    family: "ECOMMERCE_HEADLESS",
    capabilities: ["ECOMMERCE", "SSR", "NODE", "HEADLESS_CMS"],
    hostingCompat: ["DOCKER", "VERCEL"],
    complexityFactor: 1.6,
    maintenanceFloorTier: 4,
    legacyTechStack: "NEXTJS",
    hasPluginEcosystem: false,
    summary: "Storefront custom Shopify (Hydrogen/Remix).",
    pricingNotes: [
      "Storefront custom React",
      "API Storefront Shopify",
      "Surcoût élevé (×1.6)",
    ],
  },
  {
    id: "medusa",
    label: "Medusa",
    family: "ECOMMERCE_HEADLESS",
    capabilities: ["ECOMMERCE", "API_ROUTES", "NODE", "HEADLESS_CMS"],
    hostingCompat: ["DOCKER"],
    complexityFactor: 1.8,
    maintenanceFloorTier: 4,
    legacyTechStack: "NEXTJS",
    hasPluginEcosystem: false,
    summary: "E-commerce headless open source Node.js.",
    pricingNotes: [
      "Backend e-commerce Node.js",
      "Nécessite frontend custom",
      "Surcoût élevé (×1.8)",
    ],
  },
];

// ── Lookups ──────────────────────────────────────────────────────────

export const STACK_PROFILE_BY_ID: Record<string, StackProfile> = Object.fromEntries(
  STACK_PROFILES.map((p) => [p.id, p]),
);

/**
 * Mapping implementation Prisma → stack profile ID.
 * Utilisé pour résoudre le profil à partir de la valeur projectImplementation.
 */
export const IMPLEMENTATION_TO_PROFILE: Record<string, string> = {
  // CMS monolithique
  WORDPRESS: "wordpress",
  GHOST: "wordpress",
  CRAFT: "wordpress",
  DRUPAL: "wordpress",
  JOOMLA: "wordpress",
  WEBFLOW: "wordpress",

  // Headless CMS
  WORDPRESS_HEADLESS: "wordpress-headless",
  WOOCOMMERCE_HEADLESS: "woocommerce-headless",
  STRAPI: "strapi",
  CONTENTFUL: "strapi",
  SANITY: "strapi",
  PRISMIC: "strapi",
  DIRECTUS: "strapi",
  STORYBLOK: "strapi",

  // SSG
  ASTRO: "astro",
  ELEVENTY: "astro",
  HUGO: "astro",
  JEKYLL: "astro",
  GATSBY: "astro",
  NEXT_SSG: "astro",
  NUXT_SSG: "astro",

  // Frameworks SSR
  NEXTJS: "nextjs",
  NUXT: "nuxt",
  SVELTEKIT: "sveltekit",
  REMIX: "remix",

  // Commerce SaaS
  SHOPIFY: "shopify",
  BIGCOMMERCE: "shopify",
  WEBFLOW_COMMERCE: "shopify",

  // Commerce self-hosted
  WOOCOMMERCE: "woocommerce",
  PRESTASHOP: "prestashop",
  MAGENTO: "prestashop",
  SHOPWARE: "prestashop",
  SYLIUS: "prestashop",

  // Commerce headless
  SHOPIFY_HEADLESS: "shopify-headless",
  MEDUSA: "medusa",
  COMMERCETOOLS: "medusa",
  SALEOR: "medusa",
};

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Résout le StackProfile à partir d'une implementation Prisma.
 */
export function getStackProfile(implementation: string): StackProfile | null {
  const profileId = IMPLEMENTATION_TO_PROFILE[implementation];
  if (!profileId) return null;
  return STACK_PROFILE_BY_ID[profileId] ?? null;
}

/**
 * Résout le StackProfile à partir du legacy TechStack + contexte.
 * Utilisé pour la rétro-compatibilité avec le système actuel.
 */
export function getStackProfileFromLegacy(
  techStack: LegacyTechStack,
  projectType: string,
  wpHeadless: boolean,
): StackProfile {
  if (techStack === "WORDPRESS") {
    if (wpHeadless) {
      return projectType === "ECOM"
        ? STACK_PROFILE_BY_ID["woocommerce-headless"]
        : STACK_PROFILE_BY_ID["wordpress-headless"];
    }
    if (projectType === "ECOM") {
      return STACK_PROFILE_BY_ID["woocommerce"];
    }
    if (projectType === "STARTER") {
      return STACK_PROFILE_BY_ID["wordpress-minimal"];
    }
    return STACK_PROFILE_BY_ID["wordpress"];
  }

  const profileId = techStack.toLowerCase();
  return STACK_PROFILE_BY_ID[profileId] ?? STACK_PROFILE_BY_ID["wordpress"];
}

/**
 * Retourne le coefficient de complexité pour un stack.
 * Compatible avec l'ancien format STACK_MULTIPLIER.
 */
export function getComplexityFactor(
  techStack: LegacyTechStack,
  projectType: string,
  wpHeadless: boolean,
): number {
  const profile = getStackProfileFromLegacy(techStack, projectType, wpHeadless);
  return profile.complexityFactor;
}

/**
 * Retourne tous les profils d'une famille donnée.
 */
export function getProfilesByFamily(family: StackFamily): StackProfile[] {
  return STACK_PROFILES.filter((p) => p.family === family);
}
