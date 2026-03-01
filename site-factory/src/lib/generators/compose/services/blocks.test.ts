import { describe, it, expect } from "vitest";
import {
  phpMyAdminBlock,
  redisBlock,
  mailpitBlock,
  adminerBlock,
  memcachedBlock,
  elasticsearchBlock,
  meilisearchBlock,
  minioBlock,
  rabbitmqBlock,
  varnishBlock,
  grafanaBlock,
} from "./blocks";
import { dbServiceBlock } from "./db";

// Helper: join block lines and check basic YAML structure
function joinBlock(lines: string[]): string {
  return lines.join("\n");
}

describe("dbServiceBlock", () => {
  describe("MariaDB", () => {
    const result = dbServiceBlock("myapp-dev", {
      dbType: "MARIADB",
      dbVersion: "11",
      dbName: "wp_myapp",
      dbUser: "wordpress",
      dbPassword: "secret",
    });

    it("uses mariadb image with correct version", () => {
      const yaml = joinBlock(result.service);
      expect(yaml).toContain("image: mariadb:11");
    });

    it("sets MARIADB_ env vars", () => {
      const yaml = joinBlock(result.service);
      expect(yaml).toContain('MARIADB_DATABASE: "wp_myapp"');
      expect(yaml).toContain('MARIADB_USER: "wordpress"');
      expect(yaml).toContain('MARIADB_PASSWORD: "secret"');
      expect(yaml).toContain('MARIADB_ROOT_PASSWORD: "secret_root"');
    });

    it("uses mysql volume path", () => {
      const yaml = joinBlock(result.service);
      expect(yaml).toContain("myapp-dev_db_data:/var/lib/mysql");
    });

    it("includes healthcheck with innodb_initialized", () => {
      const yaml = joinBlock(result.service);
      expect(yaml).toContain("innodb_initialized");
    });

    it("creates volume definition", () => {
      expect(joinBlock(result.volumes)).toContain("myapp-dev_db_data:");
    });

    it("returns empty envForApp for MariaDB", () => {
      expect(result.envForApp).toEqual({});
    });
  });

  describe("PostgreSQL", () => {
    const result = dbServiceBlock("myapp-dev", {
      dbType: "POSTGRESQL",
      dbVersion: "17",
      dbName: "mydb",
      dbUser: "appuser",
      dbPassword: "pgpass",
    });

    it("uses postgres alpine image", () => {
      const yaml = joinBlock(result.service);
      expect(yaml).toContain("image: postgres:17-alpine");
    });

    it("sets POSTGRES_ env vars", () => {
      const yaml = joinBlock(result.service);
      expect(yaml).toContain('POSTGRES_DB: "mydb"');
      expect(yaml).toContain('POSTGRES_USER: "appuser"');
      expect(yaml).toContain('POSTGRES_PASSWORD: "pgpass"');
    });

    it("uses postgresql volume path", () => {
      const yaml = joinBlock(result.service);
      expect(yaml).toContain("myapp-dev_db_data:/var/lib/postgresql/data");
    });

    it("includes pg_isready healthcheck", () => {
      const yaml = joinBlock(result.service);
      expect(yaml).toContain("pg_isready -U appuser");
    });

    it("exports DATABASE_URL in envForApp", () => {
      expect(result.envForApp.DATABASE_URL).toBe(
        "postgresql://appuser:pgpass@myapp-dev-db:5432/mydb",
      );
    });
  });

  describe("null fallbacks", () => {
    const result = dbServiceBlock("test-dev", {
      dbType: "MARIADB",
      dbVersion: "11",
      dbName: null,
      dbUser: null,
      dbPassword: null,
    });

    it("uses fallback dbName based on slug", () => {
      const yaml = joinBlock(result.service);
      expect(yaml).toContain('MARIADB_DATABASE: "db_test_dev"');
    });

    it("uses fallback dbUser", () => {
      const yaml = joinBlock(result.service);
      expect(yaml).toContain('MARIADB_USER: "app"');
    });

    it("uses fallback dbPassword", () => {
      const yaml = joinBlock(result.service);
      expect(yaml).toContain('MARIADB_PASSWORD: "app"');
    });
  });
});

describe("service blocks", () => {
  const slug = "myapp-dev";

  it("phpMyAdminBlock contains correct service name and PMA_HOST", () => {
    const yaml = joinBlock(
      phpMyAdminBlock(slug, {
        dbType: "MARIADB",
        dbVersion: "11",
        dbName: "db",
        dbUser: "u",
        dbPassword: "p",
      }),
    );
    expect(yaml).toContain(`${slug}-pma:`);
    expect(yaml).toContain("image: phpmyadmin:latest");
    expect(yaml).toContain(`PMA_HOST: ${slug}-db`);
  });

  it("redisBlock contains correct service and volume", () => {
    const yaml = joinBlock(redisBlock(slug));
    expect(yaml).toContain(`${slug}-redis:`);
    expect(yaml).toContain("image: redis:7-alpine");
    expect(yaml).toContain(`${slug}_redis_data:/data`);
  });

  it("mailpitBlock contains correct service", () => {
    const yaml = joinBlock(mailpitBlock(slug));
    expect(yaml).toContain(`${slug}-mailpit:`);
    expect(yaml).toContain("image: axllent/mailpit:latest");
  });

  it("adminerBlock contains correct service and default server", () => {
    const yaml = joinBlock(adminerBlock(slug));
    expect(yaml).toContain(`${slug}-adminer:`);
    expect(yaml).toContain(`ADMINER_DEFAULT_SERVER: ${slug}-db`);
  });

  it("memcachedBlock contains correct service", () => {
    const yaml = joinBlock(memcachedBlock(slug));
    expect(yaml).toContain(`${slug}-memcached:`);
    expect(yaml).toContain("image: memcached:1-alpine");
  });

  it("elasticsearchBlock contains correct config", () => {
    const yaml = joinBlock(elasticsearchBlock(slug));
    expect(yaml).toContain(`${slug}-elasticsearch:`);
    expect(yaml).toContain("discovery.type: single-node");
    expect(yaml).toContain(`${slug}_es_data:`);
  });

  it("meilisearchBlock contains correct config", () => {
    const yaml = joinBlock(meilisearchBlock(slug));
    expect(yaml).toContain(`${slug}-meilisearch:`);
    expect(yaml).toContain(`${slug}_meili_data:/meili_data`);
  });

  it("minioBlock contains correct config", () => {
    const yaml = joinBlock(minioBlock(slug));
    expect(yaml).toContain(`${slug}-minio:`);
    expect(yaml).toContain("MINIO_ROOT_USER: minioadmin");
    expect(yaml).toContain(`${slug}_minio_data:/data`);
  });

  it("rabbitmqBlock contains correct config", () => {
    const yaml = joinBlock(rabbitmqBlock(slug));
    expect(yaml).toContain(`${slug}-rabbitmq:`);
    expect(yaml).toContain("RABBITMQ_DEFAULT_USER: guest");
    expect(yaml).toContain(`${slug}_rabbitmq_data:`);
  });

  it("varnishBlock points to correct backend", () => {
    const yaml = joinBlock(varnishBlock(slug));
    expect(yaml).toContain(`${slug}-varnish:`);
    expect(yaml).toContain(`VARNISH_BACKEND_HOST: ${slug}`);
    expect(yaml).toContain("VARNISH_BACKEND_PORT: 80");
  });

  it("grafanaBlock contains correct config", () => {
    const yaml = joinBlock(grafanaBlock(slug));
    expect(yaml).toContain(`${slug}-grafana:`);
    expect(yaml).toContain("GF_SECURITY_ADMIN_USER: admin");
    expect(yaml).toContain(`${slug}_grafana_data:`);
  });
});
