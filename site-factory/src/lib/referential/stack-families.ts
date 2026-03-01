/**
 * Familles techniques — Référentiel v2
 *
 * Le pricing de création est désormais indexé sur la famille technique,
 * pas sur le stack spécifique. Le stack influence via un coefficient (complexityFactor)
 * mais la base est déterminée par la famille.
 *
 * Principe : "On facture la complexité fonctionnelle, pas le logo du framework."
 */

// ── Types ────────────────────────────────────────────────────────────

export type StackFamily =
  | "CMS_SIMPLE"
  | "CMS_ADVANCED"
  | "SSG_JAMSTACK"
  | "SSR_FRAMEWORK"
  | "HEADLESS_INTEGRATION"
  | "ECOMMERCE_STANDARD"
  | "ECOMMERCE_HEADLESS"
  | "APP_CUSTOM";

// ── Pricing par famille ──────────────────────────────────────────────

/**
 * Prix de base "à partir de" par famille technique (HT, en euros).
 *
 * Ce prix correspond au socle : structure, base technique, pages essentielles.
 * Les modules, la mise en production et la maintenance s'ajoutent en plus.
 */
export const FAMILY_BASE_PRICING: Record<StackFamily, { from: number; label: string }> = {
  CMS_SIMPLE: {
    from: 1200,
    label: "CMS simple (WordPress, Ghost...)",
  },
  CMS_ADVANCED: {
    from: 1800,
    label: "CMS avancé (WordPress configuré, Craft...)",
  },
  SSG_JAMSTACK: {
    from: 2000,
    label: "SSG / JAMstack (Astro, Eleventy, Hugo...)",
  },
  SSR_FRAMEWORK: {
    from: 2500,
    label: "Framework SSR (Next.js, Nuxt, SvelteKit...)",
  },
  HEADLESS_INTEGRATION: {
    from: 3500,
    label: "Headless CMS + frontend (WP headless, Strapi + Next...)",
  },
  ECOMMERCE_STANDARD: {
    from: 3500,
    label: "E-commerce standard (WooCommerce, PrestaShop, Shopify...)",
  },
  ECOMMERCE_HEADLESS: {
    from: 5500,
    label: "E-commerce headless (Medusa, Saleor, Shopify H2...)",
  },
  APP_CUSTOM: {
    from: 4500,
    label: "Application / Plateforme custom",
  },
};

// ── Labels ───────────────────────────────────────────────────────────

export const STACK_FAMILY_LABELS: Record<StackFamily, string> = {
  CMS_SIMPLE: "CMS simple",
  CMS_ADVANCED: "CMS avancé",
  SSG_JAMSTACK: "SSG / JAMstack",
  SSR_FRAMEWORK: "Framework SSR",
  HEADLESS_INTEGRATION: "Intégration headless",
  ECOMMERCE_STANDARD: "E-commerce standard",
  ECOMMERCE_HEADLESS: "E-commerce headless",
  APP_CUSTOM: "App / Plateforme",
};

// ── Tier plancher par famille ────────────────────────────────────────

/**
 * Tier minimum de maintenance imposé par la famille technique.
 * Certaines familles sont intrinsèquement plus complexes à maintenir.
 *
 * 0 = pas de plancher (tier déterminé par la qualification fonctionnelle)
 */
export const FAMILY_MAINTENANCE_FLOOR: Record<StackFamily, number> = {
  CMS_SIMPLE: 0,
  CMS_ADVANCED: 0,
  SSG_JAMSTACK: 0,
  SSR_FRAMEWORK: 0,
  HEADLESS_INTEGRATION: 4,
  ECOMMERCE_STANDARD: 0,
  ECOMMERCE_HEADLESS: 4,
  APP_CUSTOM: 4,
};

// ── Mapping ProjectFamily (Prisma) → StackFamily ─────────────────────

/**
 * Mapping entre la valeur Prisma ProjectFamily et la StackFamily du référentiel v2.
 * Permet la compatibilité avec les données existantes.
 */
export const PROJECT_FAMILY_TO_STACK_FAMILY: Record<string, StackFamily> = {
  STATIC_SSG: "SSG_JAMSTACK",
  CMS_MONO: "CMS_ADVANCED",
  CMS_HEADLESS: "HEADLESS_INTEGRATION",
  COMMERCE_SAAS: "ECOMMERCE_STANDARD",
  COMMERCE_SELF_HOSTED: "ECOMMERCE_STANDARD",
  COMMERCE_HEADLESS: "ECOMMERCE_HEADLESS",
  APP_PLATFORM: "APP_CUSTOM",
};

/**
 * Résout la StackFamily à partir d'une ProjectFamily Prisma.
 * Fallback sur CMS_ADVANCED si non trouvé.
 */
export function resolveStackFamily(projectFamily: string): StackFamily {
  return PROJECT_FAMILY_TO_STACK_FAMILY[projectFamily] ?? "CMS_ADVANCED";
}
