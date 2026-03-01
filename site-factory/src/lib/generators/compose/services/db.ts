import type { DatabaseConfig } from "../types";

export function dbServiceBlock(
  slug: string,
  db: DatabaseConfig,
): { service: string[]; volumes: string[]; envForApp: Record<string, string> } {
  const dbName = db.dbName ?? `db_${slug.replace(/-/g, "_")}`;
  const dbUser = db.dbUser ?? "app";
  const dbPassword = db.dbPassword ?? "app";
  const isPostgres = db.dbType === "POSTGRESQL";

  const envForApp: Record<string, string> = {};
  const service: string[] = [];
  const volumes: string[] = [];

  if (isPostgres) {
    service.push(
      `  ${slug}-db:`,
      `    image: postgres:${db.dbVersion}-alpine`,
      "    restart: unless-stopped",
      "    environment:",
      `      POSTGRES_DB: "${dbName}"`,
      `      POSTGRES_USER: "${dbUser}"`,
      `      POSTGRES_PASSWORD: "${dbPassword}"`,
      "    healthcheck:",
      `      test: ["CMD-SHELL", "pg_isready -U ${dbUser}"]`,
      "      interval: 5s",
      "      timeout: 5s",
      "      retries: 10",
      "      start_period: 30s",
      "    volumes:",
      `      - ${slug}_db_data:/var/lib/postgresql/data`,
      "    networks:",
      `      - ${slug}_internal`,
      "",
    );
    volumes.push(`  ${slug}_db_data:`, "    driver: local");
    envForApp.DATABASE_URL = `postgresql://${dbUser}:${dbPassword}@${slug}-db:5432/${dbName}`;
  } else {
    service.push(
      `  ${slug}-db:`,
      `    image: mariadb:${db.dbVersion}`,
      "    restart: unless-stopped",
      "    environment:",
      `      MARIADB_DATABASE: "${dbName}"`,
      `      MARIADB_USER: "${dbUser}"`,
      `      MARIADB_PASSWORD: "${dbPassword}"`,
      `      MARIADB_ROOT_PASSWORD: "${dbPassword}_root"`,
      "    healthcheck:",
      '      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]',
      "      interval: 5s",
      "      timeout: 5s",
      "      retries: 10",
      "      start_period: 30s",
      "    volumes:",
      `      - ${slug}_db_data:/var/lib/mysql`,
      "    networks:",
      `      - ${slug}_internal`,
      "",
    );
    volumes.push(`  ${slug}_db_data:`, "    driver: local");
  }

  return { service, volumes, envForApp };
}