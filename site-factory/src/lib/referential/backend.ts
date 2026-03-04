//script:src/lib/referential/backend.ts
export type BackendFamily = "BAAS_STANDARD" | "BAAS_ADVANCED" | "CUSTOM_API" ;

export const BACKEND_FAMILY_LABELS: Record<BackendFamily, string> = {
  BAAS_STANDARD: "BaaS standard",
  BAAS_ADVANCED: "BaaS avancé",
  CUSTOM_API: "Backend API custom",
};

export const BACKEND_FAMILY_DESCRIPTIONS: Record<BackendFamily, string> = {
  BAAS_STANDARD: "Supabase, Firebase, Appwrite Cloud.",
  BAAS_ADVANCED: "RLS/ACL avancés, multi-tenant strict, audit logs.",
  CUSTOM_API: "NestJS, Symfony API, Django.",
};

export const BACKEND_FAMILY_COEFFICIENTS: Record<BackendFamily, number> = {
  BAAS_STANDARD: 1.0,
  BAAS_ADVANCED: 1.15,
  CUSTOM_API: 1.3,
};

export const BACKEND_OPS_HEAVY_COEFFICIENT = 0.1;

export function getBackendMultiplier(
  family?: BackendFamily | null,
  opsHeavy?: boolean,
): number {
  if (!family) return 1;
  const base = BACKEND_FAMILY_COEFFICIENTS[family] ?? 1;
  return opsHeavy ? base + BACKEND_OPS_HEAVY_COEFFICIENT : base;
}
