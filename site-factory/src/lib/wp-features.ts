// src/lib/wp-features.ts
// ── WP "features" (what we want), not "plugins" (how we do it) ─────────

export type PluginCategory =
  | "securite"
  | "rgpd"
  | "performance"
  | "anti-spam"
  | "seo"
  | "formulaire"
  | "redirections"
  | "email"
  | "ecommerce"
  | "contenu"
  | "analytics"
  | "maintenance"
  | "autre";

export const PLUGIN_CATEGORY_LABELS: Record<PluginCategory, string> = {
  securite: "Sécurité",
  rgpd: "RGPD & Cookies",
  performance: "Performance",
  "anti-spam": "Anti-spam",
  seo: "SEO",
  formulaire: "Formulaires",
  redirections: "Redirections",
  email: "Email",
  ecommerce: "E-commerce",
  contenu: "Contenu",
  analytics: "Analytics",
  maintenance: "Maintenance",
  autre: "Autre",
};

export const PLUGIN_CATEGORY_EMOJI: Record<PluginCategory, string> = {
  securite: "🔐",
  rgpd: "🍪",
  performance: "⚡",
  "anti-spam": "🛡️",
  seo: "📈",
  formulaire: "📝",
  redirections: "🔀",
  email: "✉️",
  ecommerce: "🛒",
  contenu: "📄",
  analytics: "📊",
  maintenance: "🧰",
  autre: "🔧",
};

// A small, stable set of features your presets can ask for.
export type WpFeature =
  | "security_headers"
  | "waf_security"
  | "cookie_consent"
  | "page_cache"
  | "asset_optimization"
  | "image_optimization"
  | "seo"
  | "sitemaps"
  | "forms"
  | "forms_storage"
  | "redirects"
  | "smtp"
  | "backups"
  | "monitoring"
  | "antispam"
  | "captcha"
  | "health_check"
  | "debug_monitor"
  | "toc"
  | "ecommerce"
  | "payment_stripe"
  | "analytics";

export const INFRA_FEATURES = ["backups", "monitoring", "captcha"] as const;
export type WpInfraFeature = (typeof INFRA_FEATURES)[number];

export const NON_PLUGIN_FEATURES: WpFeature[] = [...INFRA_FEATURES];

export const WP_FEATURE_LABELS: Record<WpFeature, string> = {
  security_headers: "Sécurité + headers",
  waf_security: "WAF / anti-brute-force",
  cookie_consent: "RGPD / cookies",
  page_cache: "Cache page",
  asset_optimization: "Optimisation assets",
  image_optimization: "Optimisation images",
  seo: "SEO",
  sitemaps: "Sitemaps XML",
  forms: "Formulaires",
  forms_storage: "Stockage formulaires",
  redirects: "Redirections",
  smtp: "SMTP",
  backups: "Sauvegardes",
  monitoring: "Monitoring",
  antispam: "Anti-spam",
  captcha: "Captcha simple",
  health_check: "Health Check",
  debug_monitor: "Debug (Query Monitor)",
  toc: "Table des matières",
  ecommerce: "WooCommerce",
  payment_stripe: "Paiement Stripe",
  analytics: "Analytics",
};
