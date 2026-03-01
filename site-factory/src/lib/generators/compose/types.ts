import type { DevMode, DeployTarget, TechStack } from "@/generated/prisma/client";

export interface DatabaseConfig {
  dbType: "MARIADB" | "POSTGRESQL";
  dbVersion: string;
  dbName: string | null;
  dbUser: string | null;
  dbPassword: string | null;
}

export interface WordpressConfigInput {
  phpVersion: string;
  wpHeadless: boolean;
  frontendStack: string | null;

  wpSiteTitle: string | null;
  wpAdminUser: string | null;
  wpAdminPassword: string | null;
  wpAdminEmail: string | null;

  wpPermalinkStructure: string | null;
  wpDefaultPages: string | null;
  wpPlugins: string | null;
  wpTheme: string | null;
}

export interface NextjsConfigInput {
  nodeVersion: string;
  envVarsJson: string | null;
}

export interface ComposeProjectInput {
  projectSlug: string;
  clientSlug: string;
  port: number;
  domain: string | null;
  type: string;

  techStack: TechStack | null;
  deployTarget: DeployTarget;
  devMode: DevMode;

  /** enabled optional service IDs from ProjectService (NO DB ids) */
  enabledServiceIds: Set<string>;

  /** Database config from ProjectDatabase (source of truth) */
  database: DatabaseConfig | null;

  wpConfig: WordpressConfigInput | null;
  nextConfig: NextjsConfigInput | null;
}

export type ComposeMode = "dev" | "prod-like" | "prod";

export function defaultComposeModeFromDevMode(devMode: DevMode): ComposeMode {
  switch (devMode) {
    case "DEV_COMFORT":
      return "dev";
    case "DEV_PROD_LIKE":
      return "prod-like";
    case "PROD":
    default:
      return "prod";
  }
}

/**
 * Règle simple “aujourd’hui” :
 * - prod compose (docker-compose.prod.yml) uniquement si deployTarget = DOCKER
 * - sinon, pas de prod compose (Vercel/shared = pas de docker compose prod)
 */
export function supportsProdCompose(deployTarget: DeployTarget): boolean {
  return deployTarget === "DOCKER";
}