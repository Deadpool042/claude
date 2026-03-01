// src/lib/wp-presets.ts
import type { WpFeature } from "@/lib/wp-features";

export type ProjectPresetType = "STARTER" | "VITRINE" | "BLOG" | "ECOM" | "APP";

export interface PresetPage {
  title: string;
  slug: string;
  isFrontPage?: boolean;
  content?: string;
}

export interface WpPreset {
  type: ProjectPresetType;
  label: string;
  description: string;
  emoji: string;

  // What we want (resolver chooses plugins)
  baseFeatures: WpFeature[];
  typeFeatures: WpFeature[];
  features: WpFeature[];

  pages: PresetPage[];
  theme: string;
  permalink: string;
}

const THEME = "twentytwentyfive";

const COMMON_PAGES: PresetPage[] = [
  {
    title: "Accueil",
    slug: "accueil",
    isFrontPage: true,
    content: "<!-- wp:paragraph --><p>Bienvenue sur notre site.</p><!-- /wp:paragraph -->",
  },
  {
    title: "Contact",
    slug: "contact",
    content: "<!-- wp:paragraph --><p>N'hésitez pas à nous contacter.</p><!-- /wp:paragraph -->",
  },
  {
    title: "Mentions légales",
    slug: "mentions-legales",
    content: "<!-- wp:paragraph --><p>Mentions légales…</p><!-- /wp:paragraph -->",
  },
  {
    title: "Politique de confidentialité",
    slug: "politique-de-confidentialite",
    content: "<!-- wp:paragraph --><p>Politique de confidentialité…</p><!-- /wp:paragraph -->",
  },
];

const STARTER_PAGES: PresetPage[] = [
  {
    title: "Accueil",
    slug: "accueil",
    isFrontPage: true,
    content: "<!-- wp:paragraph --><p>Bienvenue sur notre site.</p><!-- /wp:paragraph -->",
  },
  {
    title: "Contact",
    slug: "contact",
    content: "<!-- wp:paragraph --><p>N'hésitez pas à nous contacter.</p><!-- /wp:paragraph -->",
  },
  {
    title: "Mentions légales",
    slug: "mentions-legales",
    content: "<!-- wp:paragraph --><p>Mentions légales…</p><!-- /wp:paragraph -->",
  },
];

const TYPE_PAGES: Record<ProjectPresetType, PresetPage[]> = {
  STARTER: [],
  VITRINE: [
    { title: "À propos", slug: "a-propos" },
    { title: "Nos services", slug: "nos-services" },
    { title: "Réalisations", slug: "realisations" },
  ],
  BLOG: [{ title: "À propos", slug: "a-propos" }],
  ECOM: [],
  APP: [{ title: "À propos", slug: "a-propos" }],
};

const TYPE_PERMALINK: Record<ProjectPresetType, string> = {
  STARTER: "/%postname%/",
  VITRINE: "/%postname%/",
  BLOG: "/%year%/%monthnum%/%postname%/",
  ECOM: "/%postname%/",
  APP: "/%postname%/",
};

// Base common features for ALL WP projects
const BASE_COMMON_FEATURES: WpFeature[] = [
  "security_headers",
  "waf_security",
  "cookie_consent",
  "seo",
  "sitemaps",
  "forms",
  "forms_storage",
  "redirects",
  "antispam",
  "captcha",
  "health_check",
  "debug_monitor",
  "smtp", // optional in resolver depending on host caps
  "backups",
  "monitoring",
  "image_optimization", // optional / host-dependent
  // NOTE: page_cache resolved depending on hosting profile (managed vs litespeed etc.)
  "page_cache",
];

const TYPE_FEATURES: Record<ProjectPresetType, WpFeature[]> = {
  STARTER: [],
  VITRINE: [],
  BLOG: ["toc"],
  ECOM: ["ecommerce", "payment_stripe"],
  APP: [],
};

function buildPreset(
  type: ProjectPresetType,
  label: string,
  description: string,
  emoji: string,
  basePages: PresetPage[] = COMMON_PAGES,
): WpPreset {
  const typeFeatures = TYPE_FEATURES[type];
  const baseFeatures = [...BASE_COMMON_FEATURES];

  return {
    type,
    label,
    description,
    emoji,
    baseFeatures,
    typeFeatures,
    features: [...baseFeatures, ...typeFeatures],
    pages: [...basePages, ...TYPE_PAGES[type]],
    theme: THEME,
    permalink: TYPE_PERMALINK[type],
  };
}

export const WP_PRESETS: Record<ProjectPresetType, WpPreset> = {
  STARTER: buildPreset("STARTER", "Starter", "Mini-site, socle technique", "✨", STARTER_PAGES),
  VITRINE: buildPreset("VITRINE", "Site vitrine", "Pages institutionnelles + socle technique", "🏢"),
  BLOG: buildPreset("BLOG", "Blog", "Articles, SEO, table des matières + socle technique", "📝"),
  ECOM: buildPreset("ECOM", "E-commerce", "WooCommerce + paiement Stripe + socle technique", "🛒"),
  APP: buildPreset("APP", "Application", "Config minimale + socle technique", "⚙️"),
};

export const WP_PRESET_LIST: WpPreset[] = [
  WP_PRESETS.STARTER,
  WP_PRESETS.VITRINE,
  WP_PRESETS.BLOG,
  WP_PRESETS.ECOM,
  WP_PRESETS.APP,
];

export function getPresetForType(type?: string | null): WpPreset {
  if (type && type in WP_PRESETS) return WP_PRESETS[type as ProjectPresetType];
  return WP_PRESETS.VITRINE;
}

export function serializePresetPages(pages: PresetPage[]): string {
  return JSON.stringify(pages);
}
