import type { DatabaseConfig } from "../types";

export function phpMyAdminBlock(slug: string, db: DatabaseConfig): string[] {
  return [
    `  ${slug}-pma:`,
    "    image: phpmyadmin:latest",
    "    restart: unless-stopped",
    "    environment:",
    `      PMA_HOST: ${slug}-db`,
    `      MYSQL_ROOT_PASSWORD: "${(db.dbPassword ?? "app")}_root"`,
    "    networks:",
    "      - proxy",
    `      - ${slug}_internal`,
    "",
  ];
}

export function redisBlock(slug: string): string[] {
  return [
    `  ${slug}-redis:`,
    "    image: redis:7-alpine",
    "    restart: unless-stopped",
    "    volumes:",
    `      - ${slug}_redis_data:/data`,
    "    networks:",
    `      - ${slug}_internal`,
    "",
  ];
}

export function mailpitBlock(slug: string): string[] {
  return [
    `  ${slug}-mailpit:`,
    "    image: axllent/mailpit:latest",
    "    restart: unless-stopped",
    "    networks:",
    "      - proxy",
    `      - ${slug}_internal`,
    "",
  ];
}

export function adminerBlock(slug: string): string[] {
  return [
    `  ${slug}-adminer:`,
    "    image: adminer:latest",
    "    restart: unless-stopped",
    "    environment:",
    `      ADMINER_DEFAULT_SERVER: ${slug}-db`,
    "    networks:",
    "      - proxy",
    `      - ${slug}_internal`,
    "",
  ];
}

export function memcachedBlock(slug: string): string[] {
  return [
    `  ${slug}-memcached:`,
    "    image: memcached:1-alpine",
    "    restart: unless-stopped",
    "    networks:",
    `      - ${slug}_internal`,
    "",
  ];
}

export function elasticsearchBlock(slug: string): string[] {
  return [
    `  ${slug}-elasticsearch:`,
    "    image: elasticsearch:8.17.0",
    "    restart: unless-stopped",
    "    environment:",
    "      discovery.type: single-node",
    '      xpack.security.enabled: "false"',
    '      ES_JAVA_OPTS: "-Xms256m -Xmx512m"',
    "    volumes:",
    `      - ${slug}_es_data:/usr/share/elasticsearch/data`,
    "    networks:",
    `      - ${slug}_internal`,
    "",
  ];
}

export function meilisearchBlock(slug: string): string[] {
  return [
    `  ${slug}-meilisearch:`,
    "    image: getmeili/meilisearch:latest",
    "    restart: unless-stopped",
    "    environment:",
    "      MEILI_NO_ANALYTICS: true",
    "    volumes:",
    `      - ${slug}_meili_data:/meili_data`,
    "    networks:",
    `      - ${slug}_internal`,
    "",
  ];
}

export function minioBlock(slug: string): string[] {
  return [
    `  ${slug}-minio:`,
    "    image: minio/minio:latest",
    "    restart: unless-stopped",
    '    command: server /data --console-address ":9001"',
    "    environment:",
    "      MINIO_ROOT_USER: minioadmin",
    "      MINIO_ROOT_PASSWORD: minioadmin",
    "    volumes:",
    `      - ${slug}_minio_data:/data`,
    "    networks:",
    "      - proxy",
    `      - ${slug}_internal`,
    "",
  ];
}

export function rabbitmqBlock(slug: string): string[] {
  return [
    `  ${slug}-rabbitmq:`,
    "    image: rabbitmq:3-management-alpine",
    "    restart: unless-stopped",
    "    environment:",
    "      RABBITMQ_DEFAULT_USER: guest",
    "      RABBITMQ_DEFAULT_PASS: guest",
    "    volumes:",
    `      - ${slug}_rabbitmq_data:/var/lib/rabbitmq`,
    "    networks:",
    "      - proxy",
    `      - ${slug}_internal`,
    "",
  ];
}

export function varnishBlock(slug: string): string[] {
  return [
    `  ${slug}-varnish:`,
    "    image: varnish:7-alpine",
    "    restart: unless-stopped",
    "    tmpfs: /var/lib/varnish/varnishd:exec",
    "    environment:",
    `      VARNISH_BACKEND_HOST: ${slug}`,
    "      VARNISH_BACKEND_PORT: 80",
    "    networks:",
    "      - proxy",
    `      - ${slug}_internal`,
    "",
  ];
}

export function grafanaBlock(slug: string): string[] {
  return [
    `  ${slug}-grafana:`,
    "    image: grafana/grafana:latest",
    "    restart: unless-stopped",
    "    environment:",
    "      GF_SECURITY_ADMIN_USER: admin",
    "      GF_SECURITY_ADMIN_PASSWORD: admin",
    "    volumes:",
    `      - ${slug}_grafana_data:/var/lib/grafana`,
    "    networks:",
    "      - proxy",
    `      - ${slug}_internal`,
    "",
  ];
}