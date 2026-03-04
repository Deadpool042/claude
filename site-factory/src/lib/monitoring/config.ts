import type { HostingProfileId } from "@/lib/hosting";

export type ThresholdDirection = "gt" | "lt";

export type Threshold = {
  ok: number;
  warn: number;
  direction: ThresholdDirection;
};

export type MetricStatus = "ok" | "warn" | "ko" | "na";

export type MonitoringWindows = {
  httpMinutes: number;
  trafficMinutes: number;
  securityMinutes: number;
  mailMinutes: number;
};

export const MONITORING_WINDOWS: MonitoringWindows = {
  httpMinutes: 15,
  trafficMinutes: 15,
  securityMinutes: 15,
  mailMinutes: 30,
};

export type MonitoringCadence = {
  http: number;
  perf: number;
  mail: number;
  traffic: number;
  security: number;
  wpMeta: number;
  cron: number;
};

export const MONITORING_CADENCE_MINUTES: MonitoringCadence = {
  http: 5,
  perf: 5,
  mail: 30,
  traffic: 15,
  security: 15,
  wpMeta: 360,
  cron: 15,
};

export const MONITORING_THRESHOLDS = {
  successRate: { ok: 99.9, warn: 99.0, direction: "gt" },
  latencyP95Ms: { ok: 800, warn: 1500, direction: "lt" },
  errorRate5xx: { ok: 0.5, warn: 2.0, direction: "lt" },
  mailErrorRate: { ok: 1, warn: 5, direction: "lt" },
  mailLatencyMs: { ok: 2000, warn: 5000, direction: "lt" },
  rate4xx: { ok: 10, warn: 20, direction: "lt" },
  rate401: { ok: 5, warn: 15, direction: "lt" },
  rate403: { ok: 5, warn: 15, direction: "lt" },
  rate429: { ok: 5, warn: 15, direction: "lt" },
  loginFails: { ok: 50, warn: 200, direction: "lt" },
  xmlrpcHits: { ok: 20, warn: 100, direction: "lt" },
} as const satisfies Record<string, Threshold>;

type ThresholdKey = keyof typeof MONITORING_THRESHOLDS;
type ThresholdOverrides = Partial<Record<ThresholdKey, Threshold>>;

const THRESHOLD_OVERRIDES: Partial<Record<HostingProfileId, ThresholdOverrides>> = {
  LOCAL_DOCKER: {
    successRate: { ok: 99, warn: 95, direction: "gt" },
    latencyP95Ms: { ok: 1200, warn: 2500, direction: "lt" },
    errorRate5xx: { ok: 1, warn: 5, direction: "lt" },
    mailErrorRate: { ok: 2, warn: 8, direction: "lt" },
    mailLatencyMs: { ok: 3000, warn: 8000, direction: "lt" },
    rate4xx: { ok: 15, warn: 30, direction: "lt" },
    rate401: { ok: 10, warn: 25, direction: "lt" },
    rate403: { ok: 10, warn: 25, direction: "lt" },
    rate429: { ok: 10, warn: 25, direction: "lt" },
    loginFails: { ok: 100, warn: 300, direction: "lt" },
    xmlrpcHits: { ok: 50, warn: 150, direction: "lt" },
  },
  VPS_SELF_HOSTED: {
    successRate: { ok: 99.9, warn: 99.5, direction: "gt" },
    latencyP95Ms: { ok: 900, warn: 1700, direction: "lt" },
    errorRate5xx: { ok: 0.5, warn: 2, direction: "lt" },
    mailErrorRate: { ok: 1, warn: 4, direction: "lt" },
    mailLatencyMs: { ok: 2500, warn: 6000, direction: "lt" },
    rate401: { ok: 5, warn: 12, direction: "lt" },
    rate403: { ok: 5, warn: 12, direction: "lt" },
    rate429: { ok: 5, warn: 12, direction: "lt" },
    loginFails: { ok: 80, warn: 200, direction: "lt" },
    xmlrpcHits: { ok: 20, warn: 80, direction: "lt" },
  },
  SHARED_CHEAP: {
    successRate: { ok: 99, warn: 98, direction: "gt" },
    latencyP95Ms: { ok: 1500, warn: 3000, direction: "lt" },
    errorRate5xx: { ok: 1, warn: 4, direction: "lt" },
    mailErrorRate: { ok: 2, warn: 8, direction: "lt" },
    mailLatencyMs: { ok: 4000, warn: 9000, direction: "lt" },
    rate4xx: { ok: 15, warn: 30, direction: "lt" },
    rate401: { ok: 8, warn: 20, direction: "lt" },
    rate403: { ok: 8, warn: 20, direction: "lt" },
    rate429: { ok: 8, warn: 20, direction: "lt" },
    loginFails: { ok: 150, warn: 400, direction: "lt" },
    xmlrpcHits: { ok: 60, warn: 180, direction: "lt" },
  },
  SHARED_STANDARD: {
    successRate: { ok: 99.5, warn: 99, direction: "gt" },
    latencyP95Ms: { ok: 1200, warn: 2500, direction: "lt" },
    errorRate5xx: { ok: 0.8, warn: 3, direction: "lt" },
    mailErrorRate: { ok: 1.5, warn: 6, direction: "lt" },
    mailLatencyMs: { ok: 3000, warn: 7000, direction: "lt" },
    rate4xx: { ok: 12, warn: 25, direction: "lt" },
    rate401: { ok: 6, warn: 18, direction: "lt" },
    rate403: { ok: 6, warn: 18, direction: "lt" },
    rate429: { ok: 6, warn: 18, direction: "lt" },
    loginFails: { ok: 120, warn: 300, direction: "lt" },
    xmlrpcHits: { ok: 40, warn: 120, direction: "lt" },
  },
  SHARED_LITESPEED: {
    successRate: { ok: 99.7, warn: 99.2, direction: "gt" },
    latencyP95Ms: { ok: 1000, warn: 2000, direction: "lt" },
    errorRate5xx: { ok: 0.7, warn: 2.5, direction: "lt" },
    rate4xx: { ok: 12, warn: 22, direction: "lt" },
    rate401: { ok: 6, warn: 16, direction: "lt" },
    rate403: { ok: 6, warn: 16, direction: "lt" },
    rate429: { ok: 6, warn: 16, direction: "lt" },
    loginFails: { ok: 100, warn: 250, direction: "lt" },
    xmlrpcHits: { ok: 30, warn: 100, direction: "lt" },
  },
  WP_MANAGED_GENERIC: {
    successRate: { ok: 99.95, warn: 99.7, direction: "gt" },
    latencyP95Ms: { ok: 700, warn: 1200, direction: "lt" },
    errorRate5xx: { ok: 0.3, warn: 1.5, direction: "lt" },
    mailErrorRate: { ok: 1, warn: 3, direction: "lt" },
    mailLatencyMs: { ok: 2000, warn: 5000, direction: "lt" },
    rate4xx: { ok: 8, warn: 15, direction: "lt" },
    rate401: { ok: 4, warn: 10, direction: "lt" },
    rate403: { ok: 4, warn: 10, direction: "lt" },
    rate429: { ok: 4, warn: 10, direction: "lt" },
    loginFails: { ok: 40, warn: 120, direction: "lt" },
    xmlrpcHits: { ok: 10, warn: 50, direction: "lt" },
  },
  WPENGINE: {
    successRate: { ok: 99.97, warn: 99.8, direction: "gt" },
    latencyP95Ms: { ok: 600, warn: 1100, direction: "lt" },
    errorRate5xx: { ok: 0.2, warn: 1.0, direction: "lt" },
    rate4xx: { ok: 8, warn: 12, direction: "lt" },
    rate401: { ok: 4, warn: 9, direction: "lt" },
    rate403: { ok: 4, warn: 9, direction: "lt" },
    rate429: { ok: 4, warn: 9, direction: "lt" },
    loginFails: { ok: 30, warn: 100, direction: "lt" },
    xmlrpcHits: { ok: 5, warn: 30, direction: "lt" },
  },
  KINSTA: {
    successRate: { ok: 99.97, warn: 99.8, direction: "gt" },
    latencyP95Ms: { ok: 600, warn: 1100, direction: "lt" },
    errorRate5xx: { ok: 0.2, warn: 1.0, direction: "lt" },
    rate4xx: { ok: 8, warn: 12, direction: "lt" },
    rate401: { ok: 4, warn: 9, direction: "lt" },
    rate403: { ok: 4, warn: 9, direction: "lt" },
    rate429: { ok: 4, warn: 9, direction: "lt" },
    loginFails: { ok: 30, warn: 100, direction: "lt" },
    xmlrpcHits: { ok: 5, warn: 30, direction: "lt" },
  },
  CLOUDFLARE_FRONT: {
    successRate: { ok: 99.95, warn: 99.8, direction: "gt" },
    latencyP95Ms: { ok: 500, warn: 900, direction: "lt" },
    errorRate5xx: { ok: 0.3, warn: 1.5, direction: "lt" },
    rate4xx: { ok: 8, warn: 15, direction: "lt" },
    rate401: { ok: 4, warn: 10, direction: "lt" },
    rate403: { ok: 4, warn: 10, direction: "lt" },
    rate429: { ok: 4, warn: 10, direction: "lt" },
    loginFails: { ok: 40, warn: 120, direction: "lt" },
    xmlrpcHits: { ok: 5, warn: 30, direction: "lt" },
  },
};

type CadenceOverrides = Partial<MonitoringCadence>;
const CADENCE_OVERRIDES: Partial<Record<HostingProfileId, CadenceOverrides>> = {
  LOCAL_DOCKER: { http: 10, perf: 10, traffic: 20, security: 20, mail: 60, wpMeta: 720, cron: 30 },
  SHARED_CHEAP: { http: 10, perf: 10, traffic: 20, security: 20, mail: 60, wpMeta: 720, cron: 30 },
  SHARED_STANDARD: { http: 7, perf: 7, traffic: 20, security: 20, mail: 45, wpMeta: 480, cron: 20 },
  SHARED_LITESPEED: { http: 7, perf: 7, traffic: 15, security: 15, mail: 45, wpMeta: 480, cron: 20 },
  WP_MANAGED_GENERIC: { http: 5, perf: 5, traffic: 10, security: 10, mail: 30, wpMeta: 360, cron: 15 },
  WPENGINE: { http: 4, perf: 4, traffic: 10, security: 10, mail: 30, wpMeta: 360, cron: 15 },
  KINSTA: { http: 4, perf: 4, traffic: 10, security: 10, mail: 30, wpMeta: 360, cron: 15 },
  CLOUDFLARE_FRONT: { http: 3, perf: 3, traffic: 10, security: 10, mail: 30, wpMeta: 360, cron: 15 },
};

type WindowOverrides = Partial<MonitoringWindows>;
const WINDOW_OVERRIDES: Partial<Record<HostingProfileId, WindowOverrides>> = {
  LOCAL_DOCKER: { httpMinutes: 30, trafficMinutes: 30, securityMinutes: 30 },
  SHARED_CHEAP: { httpMinutes: 30, trafficMinutes: 30, securityMinutes: 30 },
  SHARED_STANDARD: { httpMinutes: 20, trafficMinutes: 20, securityMinutes: 20 },
  SHARED_LITESPEED: { httpMinutes: 20, trafficMinutes: 20, securityMinutes: 20 },
  WP_MANAGED_GENERIC: { httpMinutes: 10, trafficMinutes: 10, securityMinutes: 10 },
  WPENGINE: { httpMinutes: 10, trafficMinutes: 10, securityMinutes: 10 },
  KINSTA: { httpMinutes: 10, trafficMinutes: 10, securityMinutes: 10 },
  CLOUDFLARE_FRONT: { httpMinutes: 10, trafficMinutes: 10, securityMinutes: 10 },
};

function mergeThresholds(
  overrides?: ThresholdOverrides,
): Record<ThresholdKey, Threshold> {
  const next = { ...MONITORING_THRESHOLDS } as Record<ThresholdKey, Threshold>;
  if (!overrides) return next;
  for (const key of Object.keys(overrides) as ThresholdKey[]) {
    const value = overrides[key];
    if (value) next[key] = value;
  }
  return next;
}

export function resolveMonitoringProfile(profileId?: HostingProfileId | null) {
  const thresholds = mergeThresholds(
    profileId ? THRESHOLD_OVERRIDES[profileId] : undefined,
  );
  const cadence = {
    ...MONITORING_CADENCE_MINUTES,
    ...(profileId ? CADENCE_OVERRIDES[profileId] : undefined),
  };
  const windows = {
    ...MONITORING_WINDOWS,
    ...(profileId ? WINDOW_OVERRIDES[profileId] : undefined),
  };
  return { thresholds, cadence, windows };
}

export function evaluateThreshold(
  value: number | null | undefined,
  threshold: Threshold,
): MetricStatus {
  if (value === null || value === undefined || Number.isNaN(value)) return "na";
  if (threshold.direction === "gt") {
    if (value >= threshold.ok) return "ok";
    if (value >= threshold.warn) return "warn";
    return "ko";
  }
  if (value <= threshold.ok) return "ok";
  if (value <= threshold.warn) return "warn";
  return "ko";
}
