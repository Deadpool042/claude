import type { DevMode } from "@/generated/prisma/client";
import type { DeployTargetLiteral, StackLiteral } from "@/lib/service-catalog";

export interface ProjectConfigPanelProps {
  projectId: string;
  techStack: StackLiteral | null;
  deployTarget: DeployTargetLiteral;
  devMode: DevMode;

  database: {
    dbType: string;
    dbVersion: string;
    dbName: string | null;
    dbUser: string | null;
    dbPassword: string | null;
  } | null;

  wpConfig: {
    phpVersion: string;
    wpSiteTitle: string | null;
    wpAdminUser: string | null;
    wpAdminPassword: string | null;
    wpAdminEmail: string | null;
  } | null;

  nextConfig: {
    nodeVersion: string;
    envVarsJson: string | null;
  } | null;

  enabledServiceIds: string[];
}

export type ActiveProfile = "dev" | "prod-like" | null;
