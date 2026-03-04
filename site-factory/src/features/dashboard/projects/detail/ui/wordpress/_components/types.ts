// ── WordPress Toolbox — shared types & constants ──────────────────────

import type { HostingProfileId } from "@/lib/hosting";
import type { PluginCategory, WpFeature } from "@/lib/wp";
import type { WpInfraStatus } from "@/lib/wp";
import type { DevMode } from "@/generated/prisma/client";

export type { DevMode, HostingProfileId };

export interface WpPage {
  ID: number;
  post_title: string;
  post_status: string;
}

export interface WpPlugin {
  name: string;
  status: string;
  version: string;
  update?: string;
}

export interface WpTheme {
  name: string;
  status: string;
  version: string;
}

export interface WpCronEvent {
  hook: string;
  next_run: string;
  next_run_relative?: string;
  schedule?: string;
  interval?: string;
  args?: string;
}

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogEnv = "dev" | "prod-like" | "prod";

export interface MaintenanceLogEntry {
  ts: string;
  level: LogLevel;
  env: LogEnv;
  type: string;
  source: string;
  service?: string;
  message: string;
  meta?: Record<string, unknown>;
  raw?: string;
}

export type HoneypotCheck = {
  cf7Active: boolean;
  muPluginPresent: boolean;
  checkedAt: string;
};

export type HoneypotTest = {
  ok: boolean;
  message: string;
  details?: {
    cf7Active: boolean;
    emptyPass: boolean | null;
    filledBlocked: boolean | null;
  };
  testedAt: string;
};

export interface LogFilters {
  date: string;
  types: string[];
  level: LogLevel | "all";
  env: LogEnv | "all";
  service: string | "all";
  search: string;
}

export interface MonitoringSnapshot {
  available: boolean;
  windowMinutes: number;
  generatedAt: string;
  series?: {
    total: number[];
    successRate: Array<number | null>;
    errorRate5xx: Array<number | null>;
    p95Ms: Array<number | null>;
  };
  http: {
    total: number;
    successRate: number | null;
    errorRate5xx: number | null;
    p95Ms: number | null;
    avgMs: number | null;
    statusCounts: {
      s2xx: number;
      s3xx: number;
      s4xx: number;
      s5xx: number;
    };
  };
  traffic: {
    rpsAvg: number | null;
    rpsPeak: number | null;
    rate4xx: number | null;
    topRoutes: Array<{ path: string; count: number }>;
  };
  security: {
    rate401: number | null;
    rate403: number | null;
    rate429: number | null;
    loginFails: number;
    xmlrpcHits: number;
  };
  mail: {
    lastSendAt?: string | null;
    errorRate?: number | null;
    latencyMs?: number | null;
    note?: string | null;
  };
}

export interface WpInfo {
  deployTarget: HostingProfileId 
  permalink: string;
  pages: WpPage[];
  plugins: WpPlugin[];
  themes: WpTheme[];
  siteUrl: string;
}

export interface SoclePluginExpectation {
  slug: string;
  label: string;
  category: PluginCategory;
  optional: boolean;
  reason: string;
}

export interface SocleSnapshot {
  features: WpFeature[];
  plugins: SoclePluginExpectation[];
  warnings: string[];
  themeExpected: string | null;
  infraStatus: WpInfraStatus;
}

export interface MaintenanceStatus {
  last_health_at?: string;
  last_health_ok?: boolean;
  last_health_details?: {
    db_ok?: boolean;
    cron_ok?: boolean;
    fs_ok?: boolean;
    uploads_ok?: boolean;
    php_version?: string;
    wp_version?: string;
    site_url?: string;
  };
  last_backup_at?: string;
  last_backup_files?: {
    db?: string | null;
    uploads?: string | null;
    type?: string;
  };
  last_backup_keep?: number;
  last_restore_at?: string;
  last_restore_type?: string;
  last_restore_files?: {
    db?: string | null;
    uploads?: string | null;
  };
  last_restore_ok?: boolean;
  last_restore_error?: string | null;
  last_restore_warning?: string | null;
  last_restore_cleanup?: {
    checked: number;
    removed: number;
    truncated: boolean;
  } | null;
  next_health_at?: string | null;
  next_backup_at?: string | null;
}

export type BackupFileKind = "db" | "uploads";

export interface BackupFile {
  name: string;
  path: string;
  size: number;
  modifiedAt: string;
  kind: BackupFileKind;
}

export interface BackupEntry {
  stamp: string;
  createdAt: string;
  db?: BackupFile;
  uploads?: BackupFile;
}

export type RuntimeMode = "dev" | "prod-like" | "prod";
export type RuntimeStatusState =
  | "running"
  | "partial"
  | "stopped"
  | "no_compose"
  | "prod"
  | "unknown";

export interface RuntimeStatus {
  mode: RuntimeMode;
  status: RuntimeStatusState;
  composeExists: boolean;
  runningCount: number;
  totalCount: number;
  updatedAt?: string;
}

export interface WpToolboxProps {
  projectId: string;
  projectType?: string;
  isRunning?: boolean;
  hostingProfileId: HostingProfileId;
  devMode?: DevMode | null;
  socle?: SocleSnapshot | null;
}

export type TabId =
  | "presets"
  | "socle"
  | "maintenance"
  | "permalinks"
  | "pages"
  | "plugins"
  | "themes"
  | "search";

export const PERMALINK_PRESETS = [
  { label: "Simple", value: "" },
  { label: "Nom de l'article", value: "/%postname%/" },
  { label: "Jour et nom", value: "/%year%/%monthnum%/%day%/%postname%/" },
  { label: "Mois et nom", value: "/%year%/%monthnum%/%postname%/" },
  { label: "Numérique", value: "/archives/%post_id%" },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────

export function formatInstalls(n: number): string {
  if (n >= 1_000_000) return `${String(Math.round(n / 1_000_000))}M+`;
  if (n >= 1_000) return `${String(Math.round(n / 1_000))}k+`;
  return String(n);
}
