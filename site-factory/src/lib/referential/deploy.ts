/**
 * Frais de déploiement — Référentiel v3 (spec-driven, source unique)
 *
 * Dérivé de Docs/_spec/commercial.json (deployFees, hostingCosts, saasCosts, stackDeployCompat).
 * Les variantes headless sont intégrées dans chaque cible via le sous-objet `headless`.
 */

import { SPEC_COMMERCIAL } from "./spec";

// ── Types ────────────────────────────────────────────────────────────

export type DeployTarget = "DOCKER" | "VERCEL" | "SHARED_HOSTING";
export type DeployComplexity = "LOW" | "MEDIUM" | "HIGH";

export interface DeployFeeDef {
  id: DeployTarget;
  label: string;
  description: string;
  cost: number;
  complexity: DeployComplexity;
  scope: string[];
  headless?: {
    label: string;
    description: string;
    cost: number;
    complexity: DeployComplexity;
    scope: string[];
  };
}

export interface DeployFeeHeadless {
  id: string;
  deployTarget: DeployTarget;
  label: string;
  cost: number;
}

export interface HostingCostDef {
  label: string;
  description: string;
  range: { min: number; max: number };
  rangeLabel: string;
  headless?: {
    label: string;
    description: string;
    range: { min: number; max: number };
    rangeLabel: string;
  };
}

// ── Données dérivées du spec ─────────────────────────────────────────

const _deployFees = SPEC_COMMERCIAL.deployFees ?? {};
const _hostingCosts = SPEC_COMMERCIAL.hostingCosts ?? {};
const _saasCosts = SPEC_COMMERCIAL.saasCosts ?? {};
const _stackDeployCompat = SPEC_COMMERCIAL.stackDeployCompat ?? {};

function formatRange(r: { min: number; max: number }): string {
  return `${r.min}–${r.max} €/mois`;
}

export const DEPLOY_FEES = Object.fromEntries(
  Object.entries(_deployFees).map(([key, val]) => {
    const v = val as { id: string; label: string; description?: string; cost: number; complexity?: string; scope: string[]; headless?: { label: string; description?: string; cost: number; complexity?: string; scope: string[] } };
    const entry: DeployFeeDef = {
      id: key as DeployTarget,
      label: v.label,
      description: v.description ?? "",
      cost: v.cost,
      complexity: (v.complexity as DeployComplexity) ?? "MEDIUM",
      scope: v.scope,
    };
    if (v.headless) {
      entry.headless = {
        label: v.headless.label,
        description: v.headless.description ?? "",
        cost: v.headless.cost,
        complexity: (v.headless.complexity as DeployComplexity) ?? "HIGH",
        scope: v.headless.scope,
      };
    }
    return [key, entry];
  }),
) as Record<DeployTarget, DeployFeeDef>;

/** Rétro-compatible : liste plate des frais headless dérivée de deployFees.*.headless */
export const DEPLOY_FEES_HEADLESS: DeployFeeHeadless[] = Object.entries(DEPLOY_FEES)
  .filter(([, v]) => v.headless != null)
  .map(([key, v]) => ({
    id: `headless_${key.toLowerCase()}`,
    deployTarget: key as DeployTarget,
    label: v.headless!.label,
    cost: v.headless!.cost,
  }));

export const HOSTING_COSTS = Object.fromEntries(
  Object.entries(_hostingCosts).map(([key, val]) => {
    const v = val as { label: string; description?: string; range: { min: number; max: number }; headless?: { label: string; description?: string; range: { min: number; max: number } } };
    const entry: HostingCostDef = {
      label: v.label,
      description: v.description ?? "",
      range: v.range,
      rangeLabel: formatRange(v.range),
    };
    if (v.headless) {
      entry.headless = {
        label: v.headless.label,
        description: v.headless.description ?? "",
        range: v.headless.range,
        rangeLabel: formatRange(v.headless.range),
      };
    }
    return [key, entry];
  }),
) as Record<DeployTarget, HostingCostDef>;

/** Rétro-compatible : Record headless dérivé de hostingCosts.*.headless */
export const HOSTING_COSTS_HEADLESS: Record<DeployTarget, { label: string; range: string; description: string }> = Object.fromEntries(
  Object.entries(HOSTING_COSTS).map(([key, v]) => [
    key,
    v.headless
      ? { label: v.headless.label, range: v.headless.rangeLabel, description: v.headless.description }
      : { label: "—", range: "N/A", description: "Non applicable" },
  ]),
) as Record<DeployTarget, { label: string; range: string; description: string }>;

export const SAAS_COSTS: Record<string, { label: string; range: string }> = _saasCosts as Record<string, { label: string; range: string }>;

// ── Labels ───────────────────────────────────────────────────────────

export const DEPLOY_TARGET_LABELS: Record<DeployTarget, string> = Object.fromEntries(
  Object.entries(DEPLOY_FEES).map(([key, val]) => [key, val.label]),
) as Record<DeployTarget, string>;

// ── Helpers ──────────────────────────────────────────────────────────

export function getDeployCost(deployTarget: DeployTarget, isHeadless: boolean): number {
  const fee = DEPLOY_FEES[deployTarget];
  if (isHeadless && fee.headless) {
    return fee.headless.cost;
  }
  return fee.cost;
}

export const STACK_DEPLOY_COMPAT: Record<string, DeployTarget[]> = Object.fromEntries(
  Object.entries(_stackDeployCompat).map(([key, val]) => [key, val as DeployTarget[]]),
);

export function getAllowedDeployTargets(
  legacyTechStack: string,
  isHeadless: boolean,
): DeployTarget[] {
  if (legacyTechStack === "WORDPRESS" && isHeadless) {
    return ["SHARED_HOSTING", "DOCKER"];
  }
  return (STACK_DEPLOY_COMPAT[legacyTechStack] as DeployTarget[]) ?? ["DOCKER"];
}
