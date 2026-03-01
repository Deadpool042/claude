import { INFRA_FEATURES, type WpInfraFeature } from "@/lib/wp-features";

export const INFRA_STATUS_VALUES = ["todo", "done"] as const;
export type WpInfraStatusValue = (typeof INFRA_STATUS_VALUES)[number];
export type WpInfraStatus = Partial<Record<WpInfraFeature, WpInfraStatusValue>>;

const INFRA_FEATURES_SET = new Set<WpInfraFeature>(INFRA_FEATURES);
const INFRA_STATUS_SET = new Set<WpInfraStatusValue>(INFRA_STATUS_VALUES);

export function buildDefaultInfraStatus(): WpInfraStatus {
  const status: WpInfraStatus = {};
  for (const feature of INFRA_FEATURES) {
    status[feature] = "todo";
  }
  return status;
}

export function parseInfraStatus(raw?: string | null): WpInfraStatus | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

    const status: WpInfraStatus = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!INFRA_FEATURES_SET.has(key as WpInfraFeature)) continue;
      if (!INFRA_STATUS_SET.has(value as WpInfraStatusValue)) continue;
      status[key as WpInfraFeature] = value as WpInfraStatusValue;
    }

    return Object.keys(status).length > 0 ? status : null;
  } catch {
    return null;
  }
}

export function normalizeInfraStatus(
  status: WpInfraStatus | null
): { status: WpInfraStatus; changed: boolean } {
  const normalized: WpInfraStatus = {};
  let changed = false;

  if (status) {
    for (const [key, value] of Object.entries(status)) {
      if (!INFRA_FEATURES_SET.has(key as WpInfraFeature)) continue;
      if (!INFRA_STATUS_SET.has(value as WpInfraStatusValue)) continue;
      normalized[key as WpInfraFeature] = value as WpInfraStatusValue;
    }
  }

  for (const feature of INFRA_FEATURES) {
    if (!normalized[feature]) {
      normalized[feature] = "todo";
      changed = true;
    }
  }

  return { status: normalized, changed };
}
