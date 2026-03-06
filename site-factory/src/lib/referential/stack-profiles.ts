/**
 * Profils de stack — Référentiel v2 (spec-driven)
 *
 * Dérivé de Docs/_spec/stack-profiles.json (profiles + implementationMapping).
 * Les données ne sont plus hardcodées ici — elles proviennent du spec JSON.
 *
 * Pour ajouter un nouveau stack :
 *  1. Modifier Docs/_spec/stack-profiles.json
 *  2. Lancer pnpm spec:sync
 *  3. Aucun changement dans le moteur de qualification
 */

import type { StackFamily } from "./stack-families";
import type { DeployTarget } from "./deploy";
import { SPEC_STACK_PROFILES } from "./spec";

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
  id: string;
  label: string;
  family: StackFamily;
  capabilities: StackCapability[];
  hostingCompat: DeployTarget[];
  complexityFactor: number;
  maintenanceFloorIndex: number;
  legacyTechStack: LegacyTechStack | null;
  hasPluginEcosystem: boolean;
  summary: string;
  pricingNotes: string[];
}

// ── Données dérivées du spec ─────────────────────────────────────────

export const STACK_PROFILES: StackProfile[] = SPEC_STACK_PROFILES.profiles.map((p) => ({
  id: p.id,
  label: p.label,
  family: p.family as StackFamily,
  capabilities: p.capabilities as StackCapability[],
  hostingCompat: p.hostingCompat as DeployTarget[],
  complexityFactor: p.complexityFactor,
  maintenanceFloorIndex: p.maintenanceFloorIndex,
  legacyTechStack: (p.legacyTechStack as LegacyTechStack) ?? null,
  hasPluginEcosystem: p.hasPluginEcosystem,
  summary: p.summary,
  pricingNotes: p.pricingNotes,
}));

// ── Lookups ──────────────────────────────────────────────────────────

export const STACK_PROFILE_BY_ID: Record<string, StackProfile> = Object.fromEntries(
  STACK_PROFILES.map((p) => [p.id, p]),
);

/**
 * Mapping implementation Prisma → stack profile ID.
 */
export const IMPLEMENTATION_TO_PROFILE: Record<string, string> =
  SPEC_STACK_PROFILES.implementationMapping;

// ── Helpers ──────────────────────────────────────────────────────────

export function getStackProfile(implementation: string): StackProfile | null {
  const profileId = IMPLEMENTATION_TO_PROFILE[implementation];
  if (!profileId) return null;
  return STACK_PROFILE_BY_ID[profileId] ?? null;
}

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
    return STACK_PROFILE_BY_ID["wordpress-minimal"];
  }

  const profileId = techStack.toLowerCase();
  return STACK_PROFILE_BY_ID[profileId] ?? STACK_PROFILE_BY_ID["wordpress"];
}

export function getComplexityFactor(
  techStack: LegacyTechStack,
  projectType: string,
  wpHeadless: boolean,
): number {
  const profile = getStackProfileFromLegacy(techStack, projectType, wpHeadless);
  return profile.complexityFactor;
}

export function getProfilesByFamily(family: StackFamily): StackProfile[] {
  return STACK_PROFILES.filter((p) => p.family === family);
}
