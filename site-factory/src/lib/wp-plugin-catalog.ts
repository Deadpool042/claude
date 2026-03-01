// src/lib/wp-plugin-catalog.ts
import type { HostingCapability, HostingProfileId } from "@/lib/hosting-profiles";
import type { PluginCategory, WpFeature } from "@/lib/wp-features";

export type PluginWeight = "light" | "medium" | "heavy";

export interface WpPluginCandidate {
  slug: string;
  label: string;
  category: PluginCategory;
  features: WpFeature[];

  freemium: boolean;
  weight: PluginWeight;

  // compat rules
  requiresCaps?: HostingCapability[];
  disallowProfiles?: HostingProfileId[];
  preferProfiles?: HostingProfileId[];

  conflictsWith?: string[]; // slugs
  notes?: string;

  // recommended but optional (won't block preset)
  optional?: boolean;
}

export const WP_PLUGIN_CATALOG: WpPluginCandidate[] = [
  // ── Security headers ───────────────────────────────────────────────
  {
    slug: "headers-security-advanced-hsts-wp",
    label: "Headers Security Advanced & HSTS",
    category: "securite",
    features: ["security_headers"],
    freemium: false,
    weight: "light",
    notes: "Gère les headers sécurité (CSP/HSTS/XFO/XCTO…).",
  },

  // ── WAF / security ────────────────────────────────────────────────
  {
    slug: "better-wp-security",
    label: "Solid Security (iThemes)",
    category: "securite",
    features: ["waf_security"],
    freemium: true,
    weight: "medium",
    optional: true,
    disallowProfiles: ["SHARED_CHEAP", "WPENGINE", "KINSTA"],
    notes: "Suite de sécurité OSS. À éviter sur mutualisé cheap et certains managed.",
  },
  {
    slug: "all-in-one-wp-security-and-firewall",
    label: "All In One WP Security & Firewall",
    category: "securite",
    features: ["waf_security"],
    freemium: true,
    weight: "medium",
    preferProfiles: ["LOCAL_DOCKER", "VPS_SELF_HOSTED", "SHARED_STANDARD", "SHARED_LITESPEED", "CLOUDFLARE_FRONT"],
    notes: "Pare-feu applicatif OSS sans clé API.",
  },
  {
    slug: "limit-login-attempts-reloaded",
    label: "Limit Login Attempts Reloaded",
    category: "securite",
    features: ["waf_security"],
    freemium: true,
    weight: "light",
    optional: true,
    notes: "Anti brute-force très léger (complément possible).",
  },

  // ── Cookie consent / RGPD ──────────────────────────────────────────
  {
    slug: "complianz-gdpr",
    label: "Complianz – RGPD/CCPA Cookie Consent",
    category: "rgpd",
    features: ["cookie_consent"],
    freemium: true,
    weight: "medium",
    notes: "Bandeau consentement + catégories + registre (souvent suffisant en freemium).",
  },
  {
    slug: "cookie-notice",
    label: "Cookie Notice & Compliance",
    category: "rgpd",
    features: ["cookie_consent"],
    freemium: true,
    weight: "light",
    optional: true,
    notes: "Alternative plus légère (moins “compliance” que Complianz).",
  },

  // ── Page cache / performance ───────────────────────────────────────
  {
    slug: "litespeed-cache",
    label: "LiteSpeed Cache",
    category: "performance",
    features: ["page_cache", "image_optimization"],
    freemium: false,
    weight: "medium",
    requiresCaps: ["litespeed_server"],
    preferProfiles: ["SHARED_LITESPEED"],
    notes: "Le bon choix si serveur LiteSpeed (LSCache natif).",
  },
  {
    slug: "wp-super-cache",
    label: "WP Super Cache",
    category: "performance",
    features: ["page_cache"],
    freemium: false,
    weight: "light",
    disallowProfiles: ["WP_MANAGED_GENERIC", "WPENGINE", "KINSTA"],
    notes: "Cache page simple. Inutile (ou déconseillé) sur managed avec cache serveur.",
  },
  {
    slug: "autoptimize",
    label: "Autoptimize",
    category: "performance",
    features: ["asset_optimization"],
    freemium: true,
    weight: "medium",
    optional: true,
    disallowProfiles: ["WPENGINE", "KINSTA"],
    notes: "Optimisations front (minify/aggregate). À activer finement, éviter double-optimizations en managed.",
  },

  // ── Image optimization ─────────────────────────────────────────────
  {
    slug: "imagify",
    label: "Imagify",
    category: "performance",
    features: ["image_optimization"],
    freemium: true,
    weight: "light",
    optional: true,
    notes: "Compression WebP/AVIF via service. Bien quand l’hébergeur n’optimise pas.",
  },
  {
    slug: "webp-express",
    label: "WebP Express",
    category: "performance",
    features: ["image_optimization"],
    freemium: false,
    weight: "medium",
    optional: true,
    notes: "Alternative sans SaaS, mais dépend serveur (htaccess/rewrites).",
  },

  // ── Anti-spam ──────────────────────────────────────────────────────
  {
    slug: "antispam-bee",
    label: "Antispam Bee",
    category: "anti-spam",
    features: ["antispam"],
    freemium: false,
    weight: "light",
    notes: "Très bon anti-spam simple, RGPD-friendly, sans captcha tiers.",
  },
  {
    slug: "wp-armour",
    label: "WP Armour – Honeypot Anti Spam",
    category: "anti-spam",
    features: ["antispam"],
    freemium: true,
    weight: "light",
    optional: true,
    notes: "Honeypot léger (utile surtout sur formulaires).",
  },

  // ── SEO ────────────────────────────────────────────────────────────
  {
    slug: "wordpress-seo",
    label: "Yoast SEO",
    category: "seo",
    features: ["seo", "sitemaps"],
    freemium: true,
    weight: "medium",
    notes: "SEO standard. Freemium suffisant pour vitrine/blog classique.",
  },
  {
    slug: "seo-by-rank-math",
    label: "Rank Math SEO",
    category: "seo",
    features: ["seo", "sitemaps"],
    freemium: true,
    weight: "medium",
    optional: true,
    conflictsWith: ["wordpress-seo"],
    notes: "Alternative à Yoast. Ne pas installer les deux.",
  },

  // ── Forms ───────────────────────────────────────────────────────────
  {
    slug: "contact-form-7",
    label: "Contact Form 7",
    category: "formulaire",
    features: ["forms"],
    freemium: false,
    weight: "light",
    notes: "Simple, extensible, très répandu.",
  },
  {
    slug: "flamingo",
    label: "Flamingo",
    category: "formulaire",
    features: ["forms_storage"],
    freemium: false,
    weight: "light",
    notes: "Stockage des formulaires (complément CF7).",
  },
  {
    slug: "wpforms-lite",
    label: "WPForms Lite",
    category: "formulaire",
    features: ["forms"],
    freemium: true,
    weight: "medium",
    optional: true,
    conflictsWith: ["contact-form-7"],
    notes: "Alternative plus “builder”, parfois plus simple pour clients (lite).",
  },

  // ── Redirects ───────────────────────────────────────────────────────
  {
    slug: "redirection",
    label: "Redirection",
    category: "redirections",
    features: ["redirects"],
    freemium: false,
    weight: "light",
    notes: "301/302 + logs 404. Standard, fiable.",
  },

  // ── SMTP ────────────────────────────────────────────────────────────
  {
    slug: "wp-mail-smtp",
    label: "WP Mail SMTP",
    category: "email",
    features: ["smtp"],
    freemium: true,
    weight: "light",
    optional: true,
    notes: "Améliore la délivrabilité. Sur certains hosts SMTP sortant peut être bloqué.",
  },
  {
    slug: "post-smtp",
    label: "Post SMTP",
    category: "email",
    features: ["smtp"],
    freemium: true,
    weight: "medium",
    optional: true,
    notes: "Alternative SMTP avec outils de debug.",
  },

  // ── Maintenance / debug ───────────────────────────────────────────
  {
    slug: "health-check",
    label: "Health Check & Troubleshooting",
    category: "maintenance",
    features: ["health_check"],
    freemium: false,
    weight: "light",
    notes: "Diagnostic WordPress officiel (santé du site).",
  },
  {
    slug: "query-monitor",
    label: "Query Monitor",
    category: "maintenance",
    features: ["debug_monitor"],
    freemium: false,
    weight: "light",
    optional: true,
    notes: "Debug non-prod uniquement.",
  },

  // ── TOC ─────────────────────────────────────────────────────────────
  {
    slug: "easy-table-of-contents",
    label: "Easy Table of Contents",
    category: "contenu",
    features: ["toc"],
    freemium: true,
    weight: "light",
    optional: true,
    notes: "Table des matières pour contenus longs (blog).",
  },

  // ── Ecommerce ───────────────────────────────────────────────────────
  {
    slug: "woocommerce",
    label: "WooCommerce",
    category: "ecommerce",
    features: ["ecommerce"],
    freemium: false,
    weight: "heavy",
    notes: "Standard e-commerce. Lourd par nature (prévoir hébergement adapté).",
  },
  {
    slug: "woo-stripe-payment",
    label: "Stripe for WooCommerce",
    category: "ecommerce",
    features: ["payment_stripe"],
    freemium: true,
    weight: "medium",
    optional: true,
    notes: "Paiement Stripe. À activer seulement si Stripe retenu.",
  },

  // ── Analytics ───────────────────────────────────────────────────────
  {
    slug: "site-kit-by-google",
    label: "Site Kit by Google",
    category: "analytics",
    features: ["analytics"],
    freemium: false,
    weight: "medium",
    optional: true,
    notes: "Analytics/Search Console/Ads. Peut être plus lourd qu’une intégration manuelle.",
  },
];
