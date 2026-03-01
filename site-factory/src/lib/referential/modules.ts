/**
 * Catalogue de modules — Référentiel v2 (source unique de vérité)
 *
 * Ce fichier fusionne les définitions de :
 *  - qualification.ts (MODULE_RULES : requalification, groupes, icônes)
 *  - offers/offers.ts (MODULES : pricing byStack, compatibilité, détails)
 *
 * Un seul endroit pour ajouter/modifier un module.
 */

import type { Category } from "./maintenance-tiers";

// ── Types ────────────────────────────────────────────────────────────

export type ModuleGroup = "ecommerce" | "contenu" | "technique" | "metier" | "premium";

export interface ModuleSetupTier {
  id: string;
  name: string;
  description: string;
  /** Prix setup HT (€) — référence WordPress */
  priceSetup: number;
  /** Si ce tier requalifie, catégorie cible */
  requalifiesTo?: Category;
}

export interface ModuleSubscriptionTier {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
}

export interface ModuleDef {
  /** Identifiant unique (ex: "module-multi-langue") */
  id: string;
  /** Nom d'affichage */
  name: string;
  /** Description courte */
  description: string;
  /** Points détaillés */
  details: string[];

  // ── Qualification ──────────────────────────────────────────────────

  /** Catégorie minimum d'éligibilité */
  minCategory: Category;
  /** Si structurant, requalifie vers cette catégorie (null = pas de requalification) */
  requalifiesTo: Category | null;
  /** Ce module est-il structurant ? */
  isStructurant: boolean;

  // ── Pricing ────────────────────────────────────────────────────────

  /** Prix HT setup (référence WordPress) */
  priceSetup: number;
  /** Prix max si fourchette */
  priceSetupMax: number | null;
  /**
   * Coefficient prix pour les stacks non-WP.
   * ×1.0 = même prix, ×1.5 = surcoût modéré, ×2.0+ = surcoût fort.
   * WordPress = toujours ×1.0.
   */
  jsMultiplier: number;
  /** Abonnement mensuel (0 si pas d'abonnement) */
  priceMonthly: number;

  // ── Splits (mode sous-traitant) ────────────────────────────────────

  /** Split prestataire setup (%) */
  splitPrestataireSetup: number;
  /** Split prestataire mensuel (%) */
  splitPrestataireMonthly: number;

  // ── UI ─────────────────────────────────────────────────────────────

  /** Groupe pour l'affichage */
  group: ModuleGroup;
  /** Icône Lucide */
  icon: string;
  /** Note WordPress (d'où vient la fonctionnalité côté WP) */
  wpNote: string;

  // ── Tiers optionnels ───────────────────────────────────────────────

  /** Niveaux de setup (complexité variable) */
  setupTiers?: ModuleSetupTier[];
  /** Formules d'abonnement (paliers mensuels) */
  subscriptionTiers?: ModuleSubscriptionTier[];
}

// ── Catalogue ────────────────────────────────────────────────────────

export const MODULE_CATALOG: ModuleDef[] = [
  // ═══ Contenu & Marketing ═══════════════════════════════════════════

  {
    id: "module-multi-langue",
    name: "Multi-langue",
    description: "Gestion multi-langue complète.",
    details: [
      "Structure URLs par langue",
      "Gestion traductions contenus",
      "Balises hreflang et SEO",
    ],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 900,
    priceSetupMax: 1500,
    jsMultiplier: 1.8,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "contenu",
    icon: "Languages",
    wpNote: "WPML ou Polylang (gratuit/~50 €)",
  },
  {
    id: "module-newsletter-email-marketing",
    name: "Newsletter & email",
    description: "Collecte & envoi emails.",
    details: [
      "Collecte opt-in et segments",
      "Intégration outil email",
      "Templates et automations simples",
    ],
    minCategory: "CAT2",
    requalifiesTo: null,
    isStructurant: false,
    priceSetup: 500,
    priceSetupMax: null,
    jsMultiplier: 2.0,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "contenu",
    icon: "Mail",
    wpNote: "MC4WP / Mailchimp for WP (gratuit)",
  },
  {
    id: "module-marketing-traking",
    name: "Marketing & tracking",
    description: "GA4 / pixels / RGPD.",
    details: [
      "Plan de marquage (GA4, pixels)",
      "Consentement RGPD",
      "Suivi conversions et objectifs",
    ],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 600,
    priceSetupMax: null,
    jsMultiplier: 2.0,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "contenu",
    icon: "Target",
    wpNote: "GTM4WP + MonsterInsights (gratuit)",
  },

  // ═══ E-Commerce ════════════════════════════════════════════════════

  {
    id: "module-multi-devises",
    name: "Multi-devises",
    description: "Affichage multi-devises.",
    details: [
      "Affichage et conversion devises",
      "Taux de change et arrondis",
      "Checkout multi-devises",
    ],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 600,
    priceSetupMax: null,
    jsMultiplier: 2.0,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "ecommerce",
    icon: "Coins",
    wpNote: "Currency Switcher WooCommerce (gratuit)",
  },
  {
    id: "module-paiement",
    name: "Paiement sécurisé",
    description: "Stripe / 3DS / DSP2.",
    details: [
      "Configuration PSP (Stripe, Mollie, etc.)",
      "3DS/DSP2 et sécurisation",
      "Tests sandbox et parcours",
    ],
    minCategory: "CAT2",
    requalifiesTo: null,
    isStructurant: false,
    priceSetup: 600,
    priceSetupMax: null,
    jsMultiplier: 2.0,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "ecommerce",
    icon: "CreditCard",
    wpNote: "WooCommerce Stripe/Mollie (gratuit)",
  },
  {
    id: "module-livraison",
    name: "Livraison & logistique",
    description: "Zones, transporteurs, règles.",
    details: [
      "Zones, tarifs et transporteurs",
      "Règles de frais et poids",
      "Tests du parcours livraison",
    ],
    minCategory: "CAT2",
    requalifiesTo: null,
    isStructurant: false,
    priceSetup: 700,
    priceSetupMax: null,
    jsMultiplier: 2.0,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "ecommerce",
    icon: "Truck",
    wpNote: "WooCommerce Shipping (natif)",
  },
  {
    id: "module-tunnel-de-vente",
    name: "Tunnel de vente",
    description: "Parcours multi-étapes optimisé conversion.",
    details: [
      "Parcours multi-étapes optimisé",
      "Upsell, cross-sell et incentives",
      "Optimisations checkout",
    ],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 1000,
    priceSetupMax: null,
    jsMultiplier: 2.5,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "ecommerce",
    icon: "ShoppingCart",
    wpNote: "CartFlows / WooFunnels (gratuit)",
  },
  {
    id: "module-analytics-woo",
    name: "Analytics e-commerce",
    description: "Suivi ventes & conversion.",
    details: [
      "Tracking ventes et conversion",
      "Rapports et dashboards e-com",
      "Événements checkout et panier",
    ],
    minCategory: "CAT2",
    requalifiesTo: null,
    isStructurant: false,
    priceSetup: 500,
    priceSetupMax: null,
    jsMultiplier: 2.0,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "ecommerce",
    icon: "BarChart3",
    wpNote: "WooCommerce Analytics (natif)",
  },
  {
    id: "module-compte-client",
    name: "Compte client avancé",
    description: "Espace client enrichi.",
    details: [
      "Espace client personnalisé",
      "Historique commandes et retours",
      "Profil, adresses, préférences",
    ],
    minCategory: "CAT2",
    requalifiesTo: null,
    isStructurant: false,
    priceSetup: 800,
    priceSetupMax: null,
    jsMultiplier: 2.5,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "ecommerce",
    icon: "UserCircle",
    wpNote: "WooCommerce My Account (natif)",
  },

  // ═══ Technique ═════════════════════════════════════════════════════

  {
    id: "module-seo-avance",
    name: "SEO avancé",
    description: "Optimisations techniques SEO.",
    details: [
      "Audit technique et structure",
      "Optimisation metas, headings, schema",
      "Maillage interne et pages clés",
    ],
    minCategory: "CAT2",
    requalifiesTo: null,
    isStructurant: false,
    priceSetup: 500,
    priceSetupMax: null,
    jsMultiplier: 2.5,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "technique",
    icon: "Search",
    wpNote: "Yoast / Rank Math (gratuit)",
  },
  {
    id: "module-filtre-et-recherche",
    name: "Recherche & filtres",
    description: "Navigation avancée et filtres dynamiques.",
    details: [
      "Indexation contenus/produits",
      "Filtres multi-critères et tri",
      "UI de recherche avancée",
    ],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 800,
    priceSetupMax: null,
    jsMultiplier: 2.0,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "technique",
    icon: "Filter",
    wpNote: "SearchWP / FacetWP (payant ~150 €)",
  },
  {
    id: "module-dark-mode",
    name: "Dark mode",
    description: "Variation clair/sombre cohérente.",
    details: [
      "Bascule clair/sombre",
      "Respect des préférences système",
      "Styles adaptés sur templates clés",
    ],
    minCategory: "CAT2",
    requalifiesTo: null,
    isStructurant: false,
    priceSetup: 300,
    priceSetupMax: null,
    jsMultiplier: 1.0,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "technique",
    icon: "Moon",
    wpNote: "CSS + JS natif",
  },
  {
    id: "module-accessibilite-renforcee",
    name: "Accessibilité renforcée",
    description: "Améliorations RGAA / WCAG.",
    details: [
      "Audit contrastes et lisibilité",
      "Navigation clavier et ARIA",
      "Corrections sur composants critiques",
    ],
    minCategory: "CAT2",
    requalifiesTo: null,
    isStructurant: false,
    priceSetup: 600,
    priceSetupMax: null,
    jsMultiplier: 1.0,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "technique",
    icon: "Accessibility",
    wpNote: "Audit manuel (pas de plugin)",
  },
  {
    id: "module-connecteurs",
    name: "Connecteurs externes",
    description: "CRM, ERP, outils tiers.",
    details: [
      "Intégrations CRM/ERP/outils tiers",
      "Sync données et webhooks",
      "Automations de flux",
    ],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 800,
    priceSetupMax: null,
    jsMultiplier: 1.6,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "technique",
    icon: "Plug",
    wpNote: "Webhooks + Zapier/Make",
  },
  {
    id: "module-assistant-ia",
    name: "Assistant IA",
    description: "Assistant conversationnel contextualisé.",
    details: [
      "Assistant conversationnel contextualisé",
      "Base de connaissance et réponses",
      "Monitoring et modération",
    ],
    minCategory: "CAT2",
    requalifiesTo: "CAT2",
    isStructurant: true,
    priceSetup: 1500,
    priceSetupMax: null,
    jsMultiplier: 1.0,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 70,
    group: "technique",
    icon: "Bot",
    wpNote: "Dev custom (API OpenAI/Anthropic)",
    setupTiers: [
      {
        id: "ia-standard",
        name: "Standard",
        description: "Assistant simple : FAQ, orientation, réponses basiques",
        priceSetup: 1500,
        requalifiesTo: "CAT2",
      },
      {
        id: "ia-avance",
        name: "Avancé",
        description: "Logique métier, sources multiples, scénarios validés",
        priceSetup: 2400,
        requalifiesTo: "CAT3",
      },
    ],
    subscriptionTiers: [
      {
        id: "ia-starter",
        name: "Starter",
        description: "FAQ statique, orientation, redirection",
        priceMonthly: 49,
      },
      {
        id: "ia-business",
        name: "Business",
        description: "Base enrichie, suggestions produits, CTA contextualisés",
        priceMonthly: 99,
      },
      {
        id: "ia-premium",
        name: "Premium",
        description: "Scénarios conversationnels, segmentation, parcours guidés",
        priceMonthly: 149,
      },
    ],
  },

  // ═══ Métier / Réglementé ═══════════════════════════════════════════

  {
    id: "module-accises-fiscalite",
    name: "Accises & fiscalité",
    description: "Gestion fiscale réglementée.",
    details: [
      "Règles fiscales réglementées",
      "Mapping produits et taxes",
      "Tests de calcul",
    ],
    minCategory: "CAT3",
    requalifiesTo: "CAT3",
    isStructurant: true,
    priceSetup: 4000,
    priceSetupMax: null,
    jsMultiplier: 1.0,
    priceMonthly: 0,
    splitPrestataireSetup: 70,
    splitPrestataireMonthly: 0,
    group: "metier",
    icon: "Receipt",
    wpNote: "Dev custom (pas de plugin adapté)",
  },
  {
    id: "module-tarification-metier",
    name: "Tarification métier",
    description: "Règles de prix conditionnelles.",
    details: [
      "Règles de prix conditionnelles",
      "Segmentation clients",
      "Simulations et validations",
    ],
    minCategory: "CAT3",
    requalifiesTo: "CAT3",
    isStructurant: true,
    priceSetup: 3000,
    priceSetupMax: null,
    jsMultiplier: 1.0,
    priceMonthly: 0,
    splitPrestataireSetup: 70,
    splitPrestataireMonthly: 0,
    group: "metier",
    icon: "Calculator",
    wpNote: "Dev custom (règles métier)",
  },
  {
    id: "module-dashboard-personnalise",
    name: "Dashboard personnalisé",
    description: "Interface métier personnalisée.",
    details: [
      "KPIs et vues métier dédiées",
      "Accès et rôles",
      "Exports et rapports",
    ],
    minCategory: "CAT3",
    requalifiesTo: "CAT3",
    isStructurant: true,
    priceSetup: 3500,
    priceSetupMax: null,
    jsMultiplier: 1.0,
    priceMonthly: 0,
    splitPrestataireSetup: 70,
    splitPrestataireMonthly: 0,
    group: "metier",
    icon: "LayoutDashboard",
    wpNote: "Dev custom (pas de plugin)",
  },

  // ═══ Premium ═══════════════════════════════════════════════════════

  {
    id: "module-performance-avancee",
    name: "Performance avancée",
    description: "Optimisations critiques.",
    details: [
      "Audit performance approfondi",
      "CDN, cache multi-niveaux",
      "Optimisation images et critical CSS",
      "Tests avant/après",
    ],
    minCategory: "CAT4",
    requalifiesTo: "CAT4",
    isStructurant: true,
    priceSetup: 1500,
    priceSetupMax: null,
    jsMultiplier: 1.0,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "premium",
    icon: "Gauge",
    wpNote: "WP Rocket + config CDN",
  },
  {
    id: "module-architecture-headless",
    name: "Architecture headless",
    description: "Découplage front/back avec WordPress en back-office.",
    details: [
      "Découplage front/back et API WP exposée",
      "Auth, CORS et endpoints essentiels configurés",
      "Pipeline build/deploy front adapté",
    ],
    minCategory: "CAT4",
    requalifiesTo: "CAT4",
    isStructurant: true,
    priceSetup: 2000,
    priceSetupMax: null,
    jsMultiplier: 1.0,
    priceMonthly: 0,
    splitPrestataireSetup: 60,
    splitPrestataireMonthly: 0,
    group: "premium",
    icon: "Layers",
    wpNote: "Architecture découplée (custom)",
  },
];

// ── Lookups ──────────────────────────────────────────────────────────

export const MODULE_IDS = MODULE_CATALOG.map((m) => m.id);

export const MODULE_BY_ID: Record<string, ModuleDef> = Object.fromEntries(
  MODULE_CATALOG.map((m) => [m.id, m]),
);

export const MODULE_GROUPS: Record<ModuleGroup, string> = {
  ecommerce: "E-Commerce",
  contenu: "Contenu & Marketing",
  technique: "Technique",
  metier: "Métier / Réglementé",
  premium: "Premium",
};

// ── Helpers ──────────────────────────────────────────────────────────

export function getModuleById(id: string): ModuleDef | null {
  return MODULE_BY_ID[id] ?? null;
}

export function getModulesByGroup(): Record<ModuleGroup, ModuleDef[]> {
  const groups: Record<ModuleGroup, ModuleDef[]> = {
    ecommerce: [],
    contenu: [],
    technique: [],
    metier: [],
    premium: [],
  };
  for (const mod of MODULE_CATALOG) {
    groups[mod.group].push(mod);
  }
  return groups;
}

export function getStructurantModules(): ModuleDef[] {
  return MODULE_CATALOG.filter((m) => m.isStructurant);
}

/**
 * Legacy module ID normalization.
 * Les anciens IDs (sans préfixe "module-") sont mappés vers les nouveaux.
 */
const LEGACY_MODULE_ID_MAP: Record<string, string> = {
  "multi-langue": "module-multi-langue",
  "multi-devises": "module-multi-devises",
  paiement: "module-paiement",
  livraison: "module-livraison",
  "tunnel-vente": "module-tunnel-de-vente",
  "analytics-ecommerce": "module-analytics-woo",
  "assistant-ia": "module-assistant-ia",
  newsletter: "module-newsletter-email-marketing",
  "filtre-recherche": "module-filtre-et-recherche",
  "seo-avance": "module-seo-avance",
  "compte-client": "module-compte-client",
  "dark-mode": "module-dark-mode",
  accessibilite: "module-accessibilite-renforcee",
  connecteurs: "module-connecteurs",
  "marketing-tracking": "module-marketing-traking",
  "accises-fiscalite": "module-accises-fiscalite",
  "tarification-metier": "module-tarification-metier",
  "dashboard-personnalise": "module-dashboard-personnalise",
  "performance-avancee": "module-performance-avancee",
  "architecture-headless": "module-architecture-headless",
};

export function normalizeModuleId(id: string): string | null {
  if (MODULE_BY_ID[id]) return id;
  return LEGACY_MODULE_ID_MAP[id] ?? null;
}

export function normalizeModuleIds(ids: string[]): string[] {
  const normalized: string[] = [];
  for (const id of ids) {
    const next = normalizeModuleId(id);
    if (next && !normalized.includes(next)) {
      normalized.push(next);
    }
  }
  return normalized;
}
