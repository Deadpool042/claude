import type { ComposeMode, ComposeProjectInput } from "./types";
import { parseEnvVars } from "./shared/env";
import { composeHeader } from "./shared/header";
import { stackSlugForMode } from "@/lib/docker";
import { isServiceEnabledForMode } from "./services/enabled";
import { dbServiceBlock } from "./services/db";
import {
  adminerBlock,
  elasticsearchBlock,
  grafanaBlock,
  mailpitBlock,
  meilisearchBlock,
  memcachedBlock,
  minioBlock,
  rabbitmqBlock,
  redisBlock,
} from "./services/blocks";

export function nextjsCompose(input: ComposeProjectInput, mode: ComposeMode): string {
  const next = input.nextConfig ?? { nodeVersion: "22", envVarsJson: null };
  const db = input.database;
  const stackSlug = stackSlugForMode(input.projectSlug, mode);

  const nodeVersion = next.nodeVersion;
  const customEnv = parseEnvVars(next.envVarsJson);

  const enabled = (id: string) =>
    isServiceEnabledForMode(id, input.enabledServiceIds, input.deployTarget, mode);

  const appEnv: Record<string, string> = {
    PORT: String(input.port),
    NODE_ENV: mode === "dev" ? "development" : "production",
    ...customEnv,
  };

  const services: string[] = [];
  const allVolumes: string[] = [];
  let needsInternal = false;

  let dbBlock: ReturnType<typeof dbServiceBlock> | null = null;
  if (db) {
    dbBlock = dbServiceBlock(stackSlug, db);
    Object.assign(appEnv, dbBlock.envForApp);
    needsInternal = true;
  }

  if (enabled("redis")) {
    appEnv.REDIS_URL = `redis://${stackSlug}-redis:6379`;
    needsInternal = true;
  }
  if (enabled("grafana")) {
    appEnv.GRAFANA_URL = `http://${stackSlug}-grafana:3000`;
    needsInternal = true;
  }
  if (enabled("memcached")) {
    appEnv.MEMCACHED_HOST = `${stackSlug}-memcached`;
    appEnv.MEMCACHED_PORT = "11211";
    needsInternal = true;
  }
  if (enabled("mailpit")) {
    appEnv.SMTP_HOST = `${stackSlug}-mailpit`;
    appEnv.SMTP_PORT = "1025";
    needsInternal = true;
  }
  if (enabled("elasticsearch")) {
    appEnv.ELASTICSEARCH_URL = `http://${stackSlug}-elasticsearch:9200`;
    needsInternal = true;
  }
  if (enabled("meilisearch")) {
    appEnv.MEILI_HOST = `http://${stackSlug}-meilisearch:7700`;
    needsInternal = true;
  }
  if (enabled("minio")) {
    appEnv.S3_ENDPOINT = `http://${stackSlug}-minio:9000`;
    appEnv.S3_ACCESS_KEY = "minioadmin";
    appEnv.S3_SECRET_KEY = "minioadmin";
    needsInternal = true;
  }
  if (enabled("rabbitmq")) {
    appEnv.AMQP_URL = `amqp://guest:guest@${stackSlug}-rabbitmq:5672`;
    needsInternal = true;
  }

  const appNetworks = ["      - proxy"];
  if (needsInternal) appNetworks.push(`      - ${stackSlug}_internal`);

  services.push(
    `  ${stackSlug}:`,
    `    image: node:${nodeVersion}-alpine`,
    "    restart: unless-stopped",
    "    working_dir: /app",
    "    command: npm start",
    ...(db ? ["    depends_on:", `      ${stackSlug}-db:`, "        condition: service_healthy"] : []),
    "    environment:",
    ...Object.entries(appEnv).map(([k, v]) => `      ${k}: "${v}"`),
    "    volumes:",
    `      - ../../../projects/${input.clientSlug}/${input.projectSlug}:/app`,
    "    networks:",
    ...appNetworks,
    "",
  );

  if (dbBlock) {
    services.push(...dbBlock.service);
    allVolumes.push(...dbBlock.volumes);
  }

  if (enabled("redis")) {
    services.push(...redisBlock(stackSlug));
    allVolumes.push(`  ${stackSlug}_redis_data:`, "    driver: local");
  }
  if (enabled("mailpit")) services.push(...mailpitBlock(stackSlug));
  if (enabled("adminer")) services.push(...adminerBlock(stackSlug));
  if (enabled("memcached")) services.push(...memcachedBlock(stackSlug));
  if (enabled("elasticsearch")) {
    services.push(...elasticsearchBlock(stackSlug));
    allVolumes.push(`  ${stackSlug}_es_data:`, "    driver: local");
  }
  if (enabled("meilisearch")) {
    services.push(...meilisearchBlock(stackSlug));
    allVolumes.push(`  ${stackSlug}_meili_data:`, "    driver: local");
  }
  if (enabled("minio")) {
    services.push(...minioBlock(stackSlug));
    allVolumes.push(`  ${stackSlug}_minio_data:`, "    driver: local");
  }
  if (enabled("rabbitmq")) {
    services.push(...rabbitmqBlock(stackSlug));
    allVolumes.push(`  ${stackSlug}_rabbitmq_data:`, "    driver: local");
  }
  if (enabled("grafana")) {
    services.push(...grafanaBlock(stackSlug));
    allVolumes.push(`  ${stackSlug}_grafana_data:`, "    driver: local");
  }

  const lines = [composeHeader(input, mode), "services:", ...services];

  if (allVolumes.length > 0) lines.push("volumes:", ...allVolumes, "");

  lines.push("networks:", "  proxy:", "    external: true");

  if (needsInternal) {
    lines.push(
      `  ${stackSlug}_internal:`,
      `    name: ${stackSlug}_internal`,
      "    driver: bridge",
    );
  }

  lines.push("");
  return lines.join("\n");
}
