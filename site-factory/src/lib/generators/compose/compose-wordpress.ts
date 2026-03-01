import type { ComposeMode, ComposeProjectInput, DatabaseConfig } from "./types";
import { parseEnvVars } from "./shared/env";
import { composeHeader } from "./shared/header";
import { localHostForMode, stackSlugForMode } from "@/lib/docker/names";
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
  phpMyAdminBlock,
  rabbitmqBlock,
  redisBlock,
  varnishBlock,
} from "./services/blocks";

// ── WP-CLI Auto-Install Script ─────────────────────────────────────────

export interface WpSetupOptions {
  permalink?: string | null;
  pages?: Array<{ title: string; slug: string; isFrontPage?: boolean; content?: string }>;
  plugins?: Array<{ slug: string; activate?: boolean }>;
  theme?: string | null;
}

export function wpSetupScript(opts?: WpSetupOptions): string {
  const lines: string[] = [
    "#!/bin/bash",
    "set -euo pipefail",
    "",
    "# Fix Apache ServerName warning",
    "echo 'ServerName localhost' >> /etc/apache2/apache2.conf",
    "",
    "# Enable Apache SSL for local HTTPS loopback checks",
    "if command -v a2enmod >/dev/null 2>&1; then",
    "  if [ -f /etc/apache2/sites-available/default-ssl.conf ]; then",
    "    if [ ! -f /etc/ssl/certs/ssl-cert-snakeoil.pem ] || [ ! -f /etc/ssl/private/ssl-cert-snakeoil.key ]; then",
    "      if command -v openssl >/dev/null 2>&1; then",
    "        openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \\",
    "          -keyout /etc/ssl/private/ssl-cert-snakeoil.key \\",
    "          -out /etc/ssl/certs/ssl-cert-snakeoil.pem \\",
    "          -subj \"/CN=localhost\" >/dev/null 2>&1 || true",
    "      fi",
    "    fi",
    "    if [ -f /etc/ssl/certs/ssl-cert-snakeoil.pem ] && [ -f /etc/ssl/private/ssl-cert-snakeoil.key ]; then",
    "      a2enmod ssl >/dev/null 2>&1 || true",
    "      a2ensite default-ssl >/dev/null 2>&1 || true",
    "    fi",
    "  fi",
    "fi",
    "",
    "cd /var/www/html",
    "",
    "# ── Copy WordPress files from bundled tarball ──",
    'if [ ! -e wp-includes/version.php ]; then',
    '  echo "📦 Extracting WordPress files..."',
    "  cp -a /usr/src/wordpress/. /var/www/html/",
    "  chown -R www-data:www-data /var/www/html/wp-admin /var/www/html/wp-includes || true",
    "fi",
    "",
    "# ── Install WP-CLI if not present ──",
    "if ! command -v wp >/dev/null 2>&1; then",
    '  echo "📦 Installing WP-CLI..."',
    "  curl -sSf https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar -o /usr/local/bin/wp",
    "  chmod +x /usr/local/bin/wp",
    "fi",
    "",
    "# ── Install MariaDB client (mysqldump/mysql) if missing ──",
    "if ! command -v mysqldump >/dev/null 2>&1; then",
    '  echo "📦 Installing MariaDB client..."',
    "  apt-get update -qq",
    "  apt-get install -y --no-install-recommends mariadb-client",
    "  rm -rf /var/lib/apt/lists/*",
    "fi",
    "",
    "# ── Repair legacy broken injection (\\$_SERVER) BEFORE anything else ──",
    "if [ -f wp-config.php ] && grep -q '\\\\$_SERVER' wp-config.php; then",
    '  echo "🧩 Fixing legacy escaped \\$_SERVER in wp-config.php..."',
    "  perl -pi -e 's/\\\\\\\\\\$_SERVER/\\$_SERVER/g' wp-config.php",
    "fi",
    "",
    "# ── If wp-config.php exists but is invalid PHP, recreate it ──",
    "if [ -f wp-config.php ] && ! php -l wp-config.php >/dev/null 2>&1; then",
    '  echo "❌ wp-config.php is invalid PHP. Recreating it..."',
    "  rm -f wp-config.php",
    "fi",
    "",
    "# ── Create wp-config.php via WP-CLI if not present ──",
    'if [ ! -f wp-config.php ]; then',
    '  echo "⚙️  Creating wp-config.php..."',
    "  wp config create \\",
    '    --dbname="${WORDPRESS_DB_NAME}" \\',
    '    --dbuser="${WORDPRESS_DB_USER}" \\',
    '    --dbpass="${WORDPRESS_DB_PASSWORD}" \\',
    '    --dbhost="${WORDPRESS_DB_HOST}" \\',
    "    --allow-root",
    "fi",
    "",
    "# ── Inject extra config include BEFORE wp-settings.php loads ──",
    "if [ -f wp-config.php ] && ! grep -q 'wp-config.extra.php' wp-config.php; then",
    '  echo "🔧 Injecting wp-config.extra.php include..."',
    "  tmp=\"$(mktemp)\"",
    "  awk '",
    "    /require_once ABSPATH .*wp-settings\\.php/ {",
    "      print \"// Load extra config (mounted from repo)\"",
    "      print \"if (file_exists(__DIR__ . \\\"/wp-config.extra.php\\\")) {\"",
    "      print \"  require __DIR__ . \\\"/wp-config.extra.php\\\";\"",
    "      print \"}\"",
    "    }",
    "    { print }",
    "  ' wp-config.php > \"$tmp\" && mv \"$tmp\" wp-config.php",
    "fi",
    "",
    "# ── Ensure wp-config.php permissions for Apache ──",
    "if [ -f wp-config.php ]; then",
    "  chown www-data:www-data wp-config.php || true",
    "  chmod 644 wp-config.php || true",
    "fi",
    "",
    "# ── Sync sf-tt5 theme from repo mount if missing ──",
    "if [ -d \"/opt/sf-themes/sf-tt5\" ] && [ ! -d \"wp-content/themes/sf-tt5\" ]; then",
    "  cp -a /opt/sf-themes/sf-tt5 \"wp-content/themes/sf-tt5\"",
    "  chown -R www-data:www-data \"wp-content/themes/sf-tt5\" || true",
    "fi",
    "",
    "# ── Final safety: ensure wp-config.php is valid PHP ──",
    "if [ -f wp-config.php ] && ! php -l wp-config.php >/dev/null 2>&1; then",
    '  echo "❌ wp-config.php invalid after injection. Showing context:"',
    "  nl -ba wp-config.php | sed -n '1,180p' || true",
    "  exit 1",
    "fi",
    "",
    "# ── Wait for database (MariaDB only in this script) ──",
    'echo "⏳ Waiting for database..."',
    "max_tries=30",
    "count=0",
    "until php -r \"\\$c=@new mysqli(getenv('WORDPRESS_DB_HOST'), getenv('WORDPRESS_DB_USER'), getenv('WORDPRESS_DB_PASSWORD'), getenv('WORDPRESS_DB_NAME')); if(\\$c->connect_errno) exit(1);\" >/dev/null 2>&1; do",
    "  count=$((count + 1))",
    "  if [ \"$count\" -ge \"$max_tries\" ]; then",
    "    echo \"❌ Database not reachable after ${max_tries} attempts\"",
    "    exit 1",
    "  fi",
    "  sleep 2",
    "done",
    'echo "✅ Database ready"',
    "",
    "# ── Install WordPress if not yet installed ──",
    "if ! wp core is-installed --allow-root >/dev/null 2>&1; then",
    '  echo "🚀 Installing WordPress..."',
    "  wp core install \\",
    '    --url="${WP_URL:-http://localhost}" \\',
    '    --title="${WP_TITLE:-Mon Site}" \\',
    '    --admin_user="${WP_ADMIN_USER:-admin}" \\',
    '    --admin_password="${WP_ADMIN_PASSWORD:-admin}" \\',
    '    --admin_email="${WP_ADMIN_EMAIL:-admin@example.com}" \\',
    "    --skip-email \\",
    "    --allow-root",
    "",
    "  wp language core install fr_FR --allow-root >/dev/null 2>&1 || true",
    "  wp site switch-language fr_FR --allow-root >/dev/null 2>&1 || true",
    "",
    "  wp post delete 1 --force --allow-root >/dev/null 2>&1 || true",
    "  wp post delete 2 --force --allow-root >/dev/null 2>&1 || true",
    "",
  ];

  const permalink = opts?.permalink ?? "/%postname%/";
  lines.push(
    "  # Set permalink structure",
    `  wp rewrite structure "${permalink}" --allow-root`,
    "  wp rewrite flush --allow-root",
    "",
  );

  if (opts?.pages?.length) {
    lines.push("  # ── Create preset pages ──");
    let hasFront = false;

    for (const page of opts.pages) {
      const escapedTitle = page.title.replace(/"/g, '\\"');
      const contentArg = page.content
        ? ` --post_content='${page.content.replace(/'/g, "'\\''")}'`
        : "";

      if (page.isFrontPage) {
        hasFront = true;
        lines.push(
          `  FRONT_PAGE_ID=$(wp post create --post_type=page --post_title="${escapedTitle}" --post_name="${page.slug}" --post_status=publish${contentArg} --porcelain --allow-root)`,
        );
      } else {
        lines.push(
          `  wp post create --post_type=page --post_title="${escapedTitle}" --post_name="${page.slug}" --post_status=publish${contentArg} --allow-root`,
        );
      }
    }

    if (hasFront) {
      lines.push(
        "",
        '  wp option update show_on_front "page" --allow-root',
        '  wp option update page_on_front "$FRONT_PAGE_ID" --allow-root',
      );
    }

    lines.push("");
  }

  if (opts?.plugins?.length) {
    lines.push("  # ── Install plugins ──");
    for (const plugin of opts.plugins) {
      const activateFlag = plugin.activate !== false ? " --activate" : "";
      lines.push(
        `  wp plugin install ${plugin.slug}${activateFlag} --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin ${plugin.slug} skipped"`,
      );
    }
    lines.push("");
  }

  if (opts?.theme) {
    lines.push(
      "  # ── Install & activate theme ──",
      `  if [ -d "wp-content/themes/${opts.theme}" ]; then`,
      `    wp theme activate ${opts.theme} --allow-root >/dev/null 2>&1 || echo "⚠️ Theme ${opts.theme} skipped"`,
      "  else",
      `    wp theme install ${opts.theme} --activate --allow-root >/dev/null 2>&1 || echo "⚠️ Theme ${opts.theme} skipped"`,
      "  fi",
      "",
    );
  }

  lines.push(
    '  echo "✅ WordPress installed successfully!"',
    "else",
    '  echo "WordPress is already installed"',
    "fi",
    "",
    "# ── Ensure parent theme exists (required for sf-tt5) ──",
    "if [ ! -d \"wp-content/themes/twentytwentyfive\" ]; then",
    "  wp theme install twentytwentyfive --allow-root >/dev/null 2>&1 || true",
    "fi",
    "",
    ...(opts?.theme
      ? [
          "  # ── Ensure theme stays active ──",
          `  if [ -d "wp-content/themes/${opts.theme}" ]; then`,
          `    wp theme activate ${opts.theme} --allow-root >/dev/null 2>&1 || true`,
          "  fi",
          "",
        ]
      : []),
    "# ── Activate SF TT5 child theme if present ──",
    "if [ -d \"wp-content/themes/sf-tt5\" ] && wp core is-installed --allow-root >/dev/null 2>&1; then",
    "  wp theme activate sf-tt5 --allow-root >/dev/null 2>&1 || true",
    "fi",
    "",
    "# ── Remove default plugins not used (Akismet, Hello Dolly) ──",
    "wp plugin delete akismet hello --allow-root >/dev/null 2>&1 || true",
    "",
    "chown -R www-data:www-data /var/www/html/wp-content || true",
    "find /var/www/html/wp-content -type d -exec chmod 755 {} \\; || true",
    "find /var/www/html/wp-content -type f -exec chmod 644 {} \\; || true",
    "",
    "exec apache2-foreground",
    "",
  );

  return lines.join("\n");
}

// ── Headless frontend ─────────────────────────────────────────────────

function frontendImageAndCommand(frontendStack: string, nodeVersion: string): { image: string; command: string } {
  switch (frontendStack) {
    case "NUXT":
      return { image: `node:${nodeVersion}-alpine`, command: "npx nuxi start" };
    case "ASTRO":
      return { image: `node:${nodeVersion}-alpine`, command: "npm start" };
    case "NEXTJS":
    default:
      return { image: `node:${nodeVersion}-alpine`, command: "npm start" };
  }
}

function headlessFrontendBlock(
  serviceSlug: string,
  projectSlug: string,
  clientSlug: string,
  host: string,
  port: number,
  frontendStack: string,
  nodeVersion: string,
): string[] {
  const { image, command } = frontendImageAndCommand(frontendStack, nodeVersion);
  return [
    `  ${serviceSlug}-front:`,
    `    image: ${image}`,
    "    restart: unless-stopped",
    "    working_dir: /app",
    `    command: ${command}`,
    "    environment:",
    `      PORT: "${String(port)}"`,
    '      NODE_ENV: "production"',
    `      WORDPRESS_API_URL: "http://${serviceSlug}/wp-json"`,
    `      NEXT_PUBLIC_WORDPRESS_URL: "https://${host}"`,
    "    volumes:",
    `      - ../../../projects/${clientSlug}/${projectSlug}-front:/app`,
    "    networks:",
    "      - proxy",
    `      - ${serviceSlug}_internal`,
    "",
  ];
}

// ── WordPress compose ──────────────────────────────────────────────────

export function wordpressCompose(input: ComposeProjectInput, mode: ComposeMode): string {
  const wp = input.wpConfig;
  const stackSlug = stackSlugForMode(input.projectSlug, mode);
  const host = input.domain ?? localHostForMode(input.clientSlug, input.projectSlug, mode);
  const isHeadless = wp?.wpHeadless === true;

  // WP: DB required. If missing in DB table, fallback to MariaDB defaults.
  const db: DatabaseConfig =
    input.database ?? { dbType: "MARIADB", dbVersion: "11", dbName: null, dbUser: null, dbPassword: null };

  const phpVersion = wp?.phpVersion ?? "8.3";
  const dbName = db.dbName ?? `wp_${input.projectSlug.replace(/-/g, "_")}`;
  const dbUser = db.dbUser ?? "wordpress";
  const dbPassword = db.dbPassword ?? "wordpress";
  const appEnv = mode === "dev" ? "local" : mode === "prod-like" ? "prod-like" : "production";

  const enabled = (id: string) =>
    isServiceEnabledForMode(id, input.enabledServiceIds, input.deployTarget, mode);

  const dbBlock = dbServiceBlock(stackSlug, { ...db, dbName, dbUser, dbPassword });

  const projectRoot = `../../../projects/${input.clientSlug}/${input.projectSlug}`;
  const wpExtraConfig =
    mode === "dev"
      ? `${projectRoot}/wp/wp-config.extra.local.php`
      : mode === "prod-like"
        ? `${projectRoot}/wp/wp-config.extra.prod-like.php`
        : null;
  const themeSourceRoot = `../../../assets/wp/theme-child/sf-tt5`;
  const backupRoot = `../../../backup`;
  const wpDevVolumes =
    mode === "dev" || mode === "prod-like"
      ? [
          `      - ${projectRoot}/wp/wp-content:/var/www/html/wp-content`,
          ...(wpExtraConfig ? [`      - ${wpExtraConfig}:/var/www/html/wp-config.extra.php:ro`] : []),
          ...(!isHeadless ? [`      - ${themeSourceRoot}:/opt/sf-themes/sf-tt5:ro`] : []),
          `      - ${backupRoot}:/var/www/backup`,
        ]
      : [];

  const customEnv = parseEnvVars(input.nextConfig?.envVarsJson ?? null);

  const wpEnv: Record<string, string> = {
    WORDPRESS_DB_HOST: `${stackSlug}-db`,
    WORDPRESS_DB_NAME: dbName,
    WORDPRESS_DB_USER: dbUser,
    WORDPRESS_DB_PASSWORD: dbPassword,
    WP_URL: `https://${host}`,
    WP_TITLE: wp?.wpSiteTitle ?? input.projectSlug,
    WP_ADMIN_USER: wp?.wpAdminUser ?? "admin",
    WP_ADMIN_PASSWORD: wp?.wpAdminPassword ?? "admin",
    WP_ADMIN_EMAIL: wp?.wpAdminEmail ?? "admin@example.com",
    APP_ENV: appEnv,
    SF_CLIENT_SLUG: input.clientSlug,
    SF_PROJECT_SLUG: input.projectSlug,
    SF_BACKUP_ROOT: "/var/www/backup",
    SF_BACKUP_KEEP: "14",
    ...customEnv,
  };

  if (enabled("redis")) wpEnv.WP_REDIS_HOST = `${stackSlug}-redis`;
  if (enabled("memcached")) wpEnv.WP_MEMCACHED_HOST = `${stackSlug}-memcached`;
  if (enabled("mailpit")) {
    wpEnv.WORDPRESS_SMTP_HOST = `${stackSlug}-mailpit`;
    wpEnv.WORDPRESS_SMTP_PORT = "1025";
  }
  if (enabled("elasticsearch")) wpEnv.ELASTICSEARCH_URL = `http://${stackSlug}-elasticsearch:9200`;
  if (enabled("minio")) {
    wpEnv.S3_ENDPOINT = `http://${stackSlug}-minio:9000`;
    wpEnv.S3_ACCESS_KEY = "minioadmin";
    wpEnv.S3_SECRET_KEY = "minioadmin";
  }

  const extraHosts =
    mode === "dev" || mode === "prod-like"
      ? ["    extra_hosts:", `      - "${host}:host-gateway"`]
      : [];

  const services: string[] = [
    `  ${stackSlug}:`,
    `    image: wordpress:php${phpVersion}-apache`,
    "    restart: unless-stopped",
    "    depends_on:",
    `      ${stackSlug}-db:`,
    "        condition: service_healthy",
    "    environment:",
    ...Object.entries(wpEnv).map(([k, v]) => `      ${k}: "${v}"`),
    "    volumes:",
    `      - ${stackSlug}_wp_data:/var/www/html`,
    `      - ${projectRoot}/docker/wp-setup.sh:/usr/local/bin/wp-setup.sh:ro`,
    ...wpDevVolumes,
    ...extraHosts,
    "    networks:",
    "      - proxy",
    `      - ${stackSlug}_internal`,
    '    command: ["wp-setup.sh"]',
    "",
    ...dbBlock.service,
  ];

  // Optional services
  if (enabled("phpmyadmin") && db.dbType === "MARIADB") services.push(...phpMyAdminBlock(stackSlug, db));
  if (enabled("redis")) services.push(...redisBlock(stackSlug));
  if (enabled("mailpit")) services.push(...mailpitBlock(stackSlug));
  if (enabled("adminer")) services.push(...adminerBlock(stackSlug));
  if (enabled("memcached")) services.push(...memcachedBlock(stackSlug));
  if (enabled("elasticsearch")) services.push(...elasticsearchBlock(stackSlug));
  if (enabled("meilisearch")) services.push(...meilisearchBlock(stackSlug));
  if (enabled("minio")) services.push(...minioBlock(stackSlug));
  if (enabled("rabbitmq")) services.push(...rabbitmqBlock(stackSlug));
  if (enabled("varnish")) services.push(...varnishBlock(stackSlug));
  if (enabled("grafana")) services.push(...grafanaBlock(stackSlug));

  // Headless frontend container
  if (isHeadless) {
    const frontendStack = wp.frontendStack ?? "NEXTJS";
    const nodeVersion = input.nextConfig?.nodeVersion ?? "22";
    services.push(
      ...headlessFrontendBlock(stackSlug, input.projectSlug, input.clientSlug, host, input.port, frontendStack, nodeVersion),
    );
  }

  const allVolumes = [
    `  ${stackSlug}_wp_data:`,
    "    driver: local",
    ...dbBlock.volumes,
  ];

  if (enabled("redis")) allVolumes.push(`  ${stackSlug}_redis_data:`, "    driver: local");
  if (enabled("elasticsearch")) allVolumes.push(`  ${stackSlug}_es_data:`, "    driver: local");
  if (enabled("meilisearch")) allVolumes.push(`  ${stackSlug}_meili_data:`, "    driver: local");
  if (enabled("minio")) allVolumes.push(`  ${stackSlug}_minio_data:`, "    driver: local");
  if (enabled("rabbitmq")) allVolumes.push(`  ${stackSlug}_rabbitmq_data:`, "    driver: local");
  if (enabled("grafana")) allVolumes.push(`  ${stackSlug}_grafana_data:`, "    driver: local");

  return [
    composeHeader(input, mode),
    "services:",
    ...services,
    "volumes:",
    ...allVolumes,
    "",
    "networks:",
    "  proxy:",
    "    external: true",
    `  ${stackSlug}_internal:`,
    `    name: ${stackSlug}_internal`,
    "    driver: bridge",
    "",
  ].join("\n");
}
