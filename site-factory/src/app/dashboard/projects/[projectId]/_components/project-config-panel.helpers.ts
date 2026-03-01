import {
  SERVICE_CATALOG,
  type ServiceId,
  type StackLiteral,
  type ServiceEnv,
} from "@/lib/service-catalog";
import type { ProjectConfigPanelProps } from "./project-config-panel.types";

export function envBadgeVariant(env: ServiceEnv): "default" | "secondary" | "outline" {
  switch (env) {
    case "dev":
      return "secondary";
    case "prod":
      return "outline";
    case "both":
      return "default";
  }
}

/** Map service catalog IDs to existing config fields */
export function isServiceEnabled(args: {
  svcId: ServiceId;
  database: ProjectConfigPanelProps["database"];
  enabledServiceIds: string[];
  techStack: StackLiteral | null;
}): boolean {
  const { svcId, database, enabledServiceIds, techStack } = args;

  if (svcId === "db-mariadb") {
    if (database) return database.dbType === "MARIADB";
    return techStack === "WORDPRESS";
  }

  if (svcId === "db-postgresql") {
    if (database) return database.dbType === "POSTGRESQL";
    return techStack === "NEXTJS";
  }

  return enabledServiceIds.includes(svcId);
}

export function buildEnabledSet(args: {
  database: ProjectConfigPanelProps["database"];
  enabledServiceIds: string[];
  techStack: StackLiteral | null;
}): Set<ServiceId> {
  const { database, enabledServiceIds, techStack } = args;

  const set = new Set<ServiceId>();
  for (const svc of SERVICE_CATALOG) {
    if (isServiceEnabled({ svcId: svc.id, database, enabledServiceIds, techStack })) {
      set.add(svc.id);
    }
  }
  return set;
}

export function serializeEnvVars(vars: { key: string; value: string }[]): string {
  const entries = vars
    .filter((v) => v.key.trim() !== "")
    .map((v) => [v.key.trim(), v.value] as const);

  return entries.length > 0 ? JSON.stringify(Object.fromEntries(entries)) : "";
}