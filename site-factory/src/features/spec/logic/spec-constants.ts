// ── Pure constants shared across spec editor components ──

export const CMS_IDS = [
  "cms.WORDPRESS",
  "cms.WOOCOMMERCE",
  "cms.PRESTASHOP",
  "cms.SHOPIFY",
  "cms.DRUPAL",
  "cms.HEADLESS",
] as const;

export const CMS_SHORT: Record<string, string> = {
  "cms.WORDPRESS": "WP",
  "cms.WOOCOMMERCE": "Woo",
  "cms.PRESTASHOP": "Presta",
  "cms.SHOPIFY": "Shopify",
  "cms.DRUPAL": "Drupal",
  "cms.HEADLESS": "Headless",
};

export const CLASSIFICATIONS = [
  "CMS_NATIVE",
  "PLUGIN_INTEGRATION",
  "FRAMEWORK_MODULE",
  "CUSTOM_APP",
  "THEME_FEATURE",
] as const;

export const CLASS_COLORS: Record<string, string> = {
  CMS_NATIVE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  PLUGIN_INTEGRATION: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  FRAMEWORK_MODULE: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  CUSTOM_APP: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  THEME_FEATURE: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export const CLASS_SHORT: Record<string, string> = {
  CMS_NATIVE: "Natif",
  PLUGIN_INTEGRATION: "Plugin",
  FRAMEWORK_MODULE: "Module",
  CUSTOM_APP: "Custom",
  THEME_FEATURE: "Thème",
};

// ── Feature domains & types ──

export const FEATURE_DOMAINS = [
  "CONTENT",
  "ECOMMERCE",
  "ANALYTICS",
  "MARKETING",
  "INTEGRATION",
  "SECURITY",
  "THEME",
] as const;

export const DOMAIN_LABELS: Record<string, string> = {
  CONTENT: "Contenu",
  ECOMMERCE: "E-commerce",
  ANALYTICS: "Analytics",
  MARKETING: "Marketing",
  INTEGRATION: "Intégration",
  SECURITY: "Sécurité",
  THEME: "Thème",
};

export const DOMAIN_COLORS: Record<string, string> = {
  CONTENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ECOMMERCE: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  ANALYTICS: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  MARKETING: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  INTEGRATION: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  SECURITY: "bg-red-500/20 text-red-400 border-red-500/30",
  THEME: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export const FEATURE_TYPES = [
  "CMS",
  "COMMERCE",
  "ANALYTICS",
  "MARKETING",
  "UX",
] as const;

export const FEATURE_TYPE_LABELS: Record<string, string> = {
  CMS: "CMS",
  COMMERCE: "Commerce",
  ANALYTICS: "Analytics",
  MARKETING: "Marketing",
  UX: "UX / Thème",
};

// ── Plugin pricing ──

export const PRICING_MODES = ["FREE", "PAID", "MIXED"] as const;

export const PRICING_COLORS: Record<string, string> = {
  FREE: "bg-emerald-500/20 text-emerald-400",
  PAID: "bg-amber-500/20 text-amber-400",
  MIXED: "bg-sky-500/20 text-sky-400",
};

export const BILLING_CYCLES = ["MONTHLY", "ANNUAL", "ONE_TIME", "USAGE_BASED"] as const;

export const BILLING_CYCLE_LABELS: Record<string, string> = {
  MONTHLY: "Mensuel",
  ANNUAL: "Annuel",
  ONE_TIME: "Achat unique",
  USAGE_BASED: "À l'usage",
};

export const AMORTIZATION_MODES = ["ONE_SHOT", "MONTHLY_SPREAD"] as const;

export const AMORTIZATION_LABELS: Record<string, string> = {
  ONE_SHOT: "One-shot (coût projet)",
  MONTHLY_SPREAD: "Lissé au mensuel",
};

// ── Module groups ──

export const MODULE_GROUPS = [
  "ecommerce",
  "metier",
  "contenu",
  "technique",
] as const;

export const MODULE_GROUP_LABELS: Record<string, string> = {
  ecommerce: "E-commerce",
  metier: "Métier",
  contenu: "Contenu",
  technique: "Technique",
};

export const MODULE_GROUP_COLORS: Record<string, string> = {
  ecommerce: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  metier: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  contenu: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  technique: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export const CATEGORY_LABELS: Record<string, string> = {
  CAT0: "CAT0 — Basique",
  CAT1: "CAT1 — Standard",
  CAT2: "CAT2 — Avancé",
  CAT3: "CAT3 — Complexe",
  CAT4: "CAT4 — Enterprise",
};

export const CATEGORY_COLORS: Record<string, string> = {
  CAT0: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CAT1: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  CAT2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  CAT3: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  CAT4: "bg-red-500/20 text-red-400 border-red-500/30",
};

// ── Commercial sections ──

export const COMMERCIAL_SECTIONS = [
  "basePackageBandsByCategory",
  "maintenanceByCategory",
  "deployFees",
  "hostingCosts",
  "saasCosts",
  "stackDeployCompat",
  "annexCosts",
  "rules",
] as const;

export const COMMERCIAL_SECTION_LABELS: Record<string, string> = {
  basePackageBandsByCategory: "Forfaits de base",
  maintenanceByCategory: "Maintenance",
  deployFees: "Déploiement",
  hostingCosts: "Hébergement",
  saasCosts: "Coûts SaaS",
  stackDeployCompat: "Compatibilité stack",
  annexCosts: "Coûts annexes",
  rules: "Règles tarifaires",
};

export const COMMERCIAL_SECTION_ICONS: Record<string, string> = {
  basePackageBandsByCategory: "💰",
  maintenanceByCategory: "🔧",
  deployFees: "🚀",
  hostingCosts: "🖥️",
  saasCosts: "📦",
  stackDeployCompat: "⚙️",
  annexCosts: "📋",
  rules: "⚖️",
};
