/**
 * Frais de déploiement — Référentiel v2
 *
 * Forfaits de mise en production (one-shot) par cible de déploiement.
 * Couvre le travail de déploiement initial : DNS, SSL, CI/CD, containers, etc.
 */

// ── Types ────────────────────────────────────────────────────────────

export type DeployTarget = "DOCKER" | "VERCEL" | "SHARED_HOSTING";

export interface DeployFeeDef {
  id: DeployTarget;
  label: string;
  /** Forfait one-shot HT (€) */
  cost: number;
  /** Description du périmètre inclus */
  scope: string[];
}

export interface DeployFeeHeadless {
  id: string;
  deployTarget: DeployTarget;
  label: string;
  /** Forfait one-shot HT (€) pour architectures headless (2 services) */
  cost: number;
}

// ── Données ──────────────────────────────────────────────────────────

export const DEPLOY_FEES: Record<DeployTarget, DeployFeeDef> = {
  SHARED_HOSTING: {
    id: "SHARED_HOSTING",
    label: "Mutualisé (o2switch, OVH...)",
    cost: 200,
    scope: [
      "Upload FTP / cPanel",
      "Configuration DNS",
      "SSL Let's Encrypt",
      "Configuration PHP",
    ],
  },
  VERCEL: {
    id: "VERCEL",
    label: "Vercel / Cloud",
    cost: 150,
    scope: [
      "Configuration projet Vercel",
      "Variables d'environnement",
      "Custom domain",
      "Preview branches",
    ],
  },
  DOCKER: {
    id: "DOCKER",
    label: "Docker / VPS",
    cost: 500,
    scope: [
      "Dockerfile + docker-compose",
      "Reverse proxy (Traefik / Nginx)",
      "CI/CD pipeline",
      "Sauvegardes automatiques",
      "Monitoring basique",
    ],
  },
};

/** Forfaits spéciaux pour les architectures headless (2 services) */
export const DEPLOY_FEES_HEADLESS: DeployFeeHeadless[] = [
  {
    id: "headless_split",
    deployTarget: "SHARED_HOSTING",
    label: "Split : mutualisé (WP) + Vercel (frontend)",
    cost: 350,
  },
  {
    id: "headless_unified",
    deployTarget: "DOCKER",
    label: "Docker unifié (WP + frontend)",
    cost: 500,
  },
];

// ── Coûts d'hébergement indicatifs (à la charge du client) ───────────

export const HOSTING_COSTS: Record<DeployTarget, { label: string; range: string }> = {
  SHARED_HOSTING: {
    label: "Mutualisé (o2switch, OVH...)",
    range: "3–10 €/mois",
  },
  VERCEL: {
    label: "Vercel / Cloud",
    range: "0–20 €/mois",
  },
  DOCKER: {
    label: "VPS géré",
    range: "15–50 €/mois",
  },
};

export const HOSTING_COSTS_HEADLESS: Record<DeployTarget, { label: string; range: string }> = {
  SHARED_HOSTING: {
    label: "Split : mutualisé (WP) + Vercel (frontend)",
    range: "3–30 €/mois",
  },
  DOCKER: {
    label: "Unifié : VPS (WP + frontend)",
    range: "15–50 €/mois",
  },
  VERCEL: {
    label: "—",
    range: "N/A",
  },
};

// -- Coût plateforme Saas (ex. Shopify) — à la charge du client

export const SAAS_COSTS: Record<string, { label: string; range: string }> = {
  SHOPIFY: {
    label: "Shopify",
    range: "29–299 $/mois",
  },
  BIGCOMMERCE: {
    label: "BigCommerce",
    range: "29–299 $/mois",
  },
  WEBFLOW_COMMERCE: {
    label: "Webflow Commerce",
    range: "29–212 $/mois",
  },
};

// ── Labels ───────────────────────────────────────────────────────────

export const DEPLOY_TARGET_LABELS: Record<DeployTarget, string> = {
  DOCKER: "Docker / VPS",
  VERCEL: "Vercel / Cloud",
  SHARED_HOSTING: "Mutualisé",
  
};

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Résout le coût de mise en production selon la cible et le mode headless.
 */
export function getDeployCost(deployTarget: DeployTarget, isHeadless: boolean): number {
  if (isHeadless) {
    const headlessFee = DEPLOY_FEES_HEADLESS.find((f) => f.deployTarget === deployTarget);
    return headlessFee?.cost ?? DEPLOY_FEES[deployTarget].cost;
  }
  return DEPLOY_FEES[deployTarget].cost;
}

/**
 * Compatibilité stack ↔ déploiement.
 *
 * - Mutualisé : PHP uniquement → WordPress classique
 * - Vercel : Serverless → Next.js, Nuxt, Astro
 * - Docker : Tout fonctionne
 */
export const STACK_DEPLOY_COMPAT: Record<string, DeployTarget[]> = {
  WORDPRESS: ["DOCKER", "SHARED_HOSTING"],
  NEXTJS: ["DOCKER", "VERCEL"],
  NUXT: ["DOCKER", "VERCEL"],
  ASTRO: ["DOCKER", "VERCEL"],
};

/**
 * Résout les cibles de déploiement autorisées.
 */
export function getAllowedDeployTargets(
  legacyTechStack: string,
  isHeadless: boolean,
): DeployTarget[] {
  if (legacyTechStack === "WORDPRESS" && isHeadless) {
    return ["SHARED_HOSTING", "DOCKER"];
  }
  return STACK_DEPLOY_COMPAT[legacyTechStack] ?? ["DOCKER"];
}
