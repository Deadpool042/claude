import {
  Activity,
  AlarmClock,
  BarChart3,
  Database,
  FileText,
  LayoutDashboard,
  Plug,
  TestTube2,
} from "lucide-react";
import type { DevMode } from "../types";

export const LOG_TYPE_OPTIONS = [
  "maintenance",
  "http",
  "docker",
  "wordpress",
  "infra",
  "security",
  "audit",
] as const;

export const LOG_TYPE_LABELS: Record<string, string> = {
  maintenance: "Maintenance",
  http: "HTTP",
  docker: "Docker",
  wordpress: "WordPress",
  infra: "Infra",
  security: "Securite",
  audit: "Audit",
};

export const LOG_LEVEL_OPTIONS = ["all", "debug", "info", "warn", "error"] as const;
export const LOG_ENV_OPTIONS = ["all", "dev", "prod-like", "prod"] as const;

export const DEV_MODE_OPTIONS: Array<{ id: DevMode; label: string }> = [
  { id: "DEV_COMFORT", label: "Dev local" },
  { id: "DEV_PROD_LIKE", label: "Dev prod-like" },
  { id: "PROD", label: "Prod" },
];

export const MAINTENANCE_TABS = [
  { id: "overview", label: "Apercu", icon: LayoutDashboard },
  { id: "mu", label: "MU-plugins", icon: Plug },
  { id: "tests", label: "Tests", icon: TestTube2 },
  { id: "monitoring", label: "Monitoring", icon: Activity },
  { id: "cron", label: "Cron", icon: AlarmClock },
  { id: "backups", label: "Sauvegardes", icon: Database },
  { id: "logs", label: "Logs", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export function formatEnv(devMode?: DevMode | null) {
  switch (devMode) {
    case "DEV_PROD_LIKE":
      return { label: "Prod-like", hint: "Environnement proche production." };
    case "PROD":
      return { label: "Production", hint: "En ligne (placeholder pour l'instant)." };
    case "DEV_COMFORT":
    default:
      return { label: "Dev local", hint: "Tests et debug disponibles." };
  }
}
