#!/bin/bash
set -euo pipefail

# Fix Apache ServerName warning
echo 'ServerName localhost' >> /etc/apache2/apache2.conf

# Enable Apache SSL for local HTTPS loopback checks
if command -v a2enmod >/dev/null 2>&1; then
  if [ -f /etc/apache2/sites-available/default-ssl.conf ]; then
    if [ ! -f /etc/ssl/certs/ssl-cert-snakeoil.pem ] || [ ! -f /etc/ssl/private/ssl-cert-snakeoil.key ]; then
      if command -v openssl >/dev/null 2>&1; then
        openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
          -keyout /etc/ssl/private/ssl-cert-snakeoil.key \
          -out /etc/ssl/certs/ssl-cert-snakeoil.pem \
          -subj "/CN=localhost" >/dev/null 2>&1 || true
      fi
    fi
    if [ -f /etc/ssl/certs/ssl-cert-snakeoil.pem ] && [ -f /etc/ssl/private/ssl-cert-snakeoil.key ]; then
      a2enmod ssl >/dev/null 2>&1 || true
      a2ensite default-ssl >/dev/null 2>&1 || true
    fi
  fi
fi

cd /var/www/html

# ── Copy WordPress files from bundled tarball ──
if [ ! -e wp-includes/version.php ]; then
  echo "📦 Extracting WordPress files..."
  cp -a /usr/src/wordpress/. /var/www/html/
  chown -R www-data:www-data /var/www/html/wp-admin /var/www/html/wp-includes || true
fi

# ── Install WP-CLI if not present ──
if ! command -v wp >/dev/null 2>&1; then
  echo "📦 Installing WP-CLI..."
  curl -sSf https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar -o /usr/local/bin/wp
  chmod +x /usr/local/bin/wp
fi

# ── Install MariaDB client (mysqldump/mysql) if missing ──
if ! command -v mysqldump >/dev/null 2>&1; then
  echo "📦 Installing MariaDB client..."
  apt-get update -qq
  apt-get install -y --no-install-recommends mariadb-client
  rm -rf /var/lib/apt/lists/*
fi

# ── Repair legacy broken injection (\$_SERVER) BEFORE anything else ──
if [ -f wp-config.php ] && grep -q '\\$_SERVER' wp-config.php; then
  echo "🧩 Fixing legacy escaped \$_SERVER in wp-config.php..."
  perl -pi -e 's/\\\\\$_SERVER/\$_SERVER/g' wp-config.php
fi

# ── If wp-config.php exists but is invalid PHP, recreate it ──
if [ -f wp-config.php ] && ! php -l wp-config.php >/dev/null 2>&1; then
  echo "❌ wp-config.php is invalid PHP. Recreating it..."
  rm -f wp-config.php
fi

# ── Create wp-config.php via WP-CLI if not present ──
if [ ! -f wp-config.php ]; then
  echo "⚙️  Creating wp-config.php..."
  wp config create \
    --dbname="${WORDPRESS_DB_NAME}" \
    --dbuser="${WORDPRESS_DB_USER}" \
    --dbpass="${WORDPRESS_DB_PASSWORD}" \
    --dbhost="${WORDPRESS_DB_HOST}" \
    --allow-root
fi

# ── Inject extra config include BEFORE wp-settings.php loads ──
if [ -f wp-config.php ] && ! grep -q 'wp-config.extra.php' wp-config.php; then
  echo "🔧 Injecting wp-config.extra.php include..."
  tmp="$(mktemp)"
  awk '
    /require_once ABSPATH .*wp-settings\.php/ {
      print "// Load extra config (mounted from repo)"
      print "if (file_exists(__DIR__ . \"/wp-config.extra.php\")) {"
      print "  require __DIR__ . \"/wp-config.extra.php\";"
      print "}"
    }
    { print }
  ' wp-config.php > "$tmp" && mv "$tmp" wp-config.php
fi

# ── Ensure wp-config.php permissions for Apache ──
if [ -f wp-config.php ]; then
  chown www-data:www-data wp-config.php || true
  chmod 644 wp-config.php || true
fi

# ── Sync sf-tt5 theme from repo mount if missing ──
if [ -d "/opt/sf-themes/sf-tt5" ] && [ ! -d "wp-content/themes/sf-tt5" ]; then
  cp -a /opt/sf-themes/sf-tt5 "wp-content/themes/sf-tt5"
  chown -R www-data:www-data "wp-content/themes/sf-tt5" || true
fi

# ── Final safety: ensure wp-config.php is valid PHP ──
if [ -f wp-config.php ] && ! php -l wp-config.php >/dev/null 2>&1; then
  echo "❌ wp-config.php invalid after injection. Showing context:"
  nl -ba wp-config.php | sed -n '1,180p' || true
  exit 1
fi

# ── Wait for database (MariaDB only in this script) ──
echo "⏳ Waiting for database..."
max_tries=30
count=0
until php -r "\$c=@new mysqli(getenv('WORDPRESS_DB_HOST'), getenv('WORDPRESS_DB_USER'), getenv('WORDPRESS_DB_PASSWORD'), getenv('WORDPRESS_DB_NAME')); if(\$c->connect_errno) exit(1);" >/dev/null 2>&1; do
  count=$((count + 1))
  if [ "$count" -ge "$max_tries" ]; then
    echo "❌ Database not reachable after ${max_tries} attempts"
    exit 1
  fi
  sleep 2
done
echo "✅ Database ready"

# ── Install WordPress if not yet installed ──
if ! wp core is-installed --allow-root >/dev/null 2>&1; then
  echo "🚀 Installing WordPress..."
  wp core install \
    --url="${WP_URL:-http://localhost}" \
    --title="${WP_TITLE:-Mon Site}" \
    --admin_user="${WP_ADMIN_USER:-admin}" \
    --admin_password="${WP_ADMIN_PASSWORD:-admin}" \
    --admin_email="${WP_ADMIN_EMAIL:-admin@example.com}" \
    --skip-email \
    --allow-root

  wp language core install fr_FR --allow-root >/dev/null 2>&1 || true
  wp site switch-language fr_FR --allow-root >/dev/null 2>&1 || true

  wp post delete 1 --force --allow-root >/dev/null 2>&1 || true
  wp post delete 2 --force --allow-root >/dev/null 2>&1 || true

  # Set permalink structure
  wp rewrite structure "/%year%/%monthnum%/%postname%/" --allow-root
  wp rewrite flush --allow-root

  # ── Create preset pages ──
  FRONT_PAGE_ID=$(wp post create --post_type=page --post_title="Accueil" --post_name="accueil" --post_status=publish --post_content='<!-- wp:paragraph --><p>Bienvenue sur notre site.</p><!-- /wp:paragraph -->' --porcelain --allow-root)
  wp post create --post_type=page --post_title="Contact" --post_name="contact" --post_status=publish --post_content='<!-- wp:paragraph --><p>N'\''hésitez pas à nous contacter.</p><!-- /wp:paragraph -->' --allow-root
  wp post create --post_type=page --post_title="Mentions légales" --post_name="mentions-legales" --post_status=publish --post_content='<!-- wp:paragraph --><p>Mentions légales…</p><!-- /wp:paragraph -->' --allow-root
  wp post create --post_type=page --post_title="Politique de confidentialité" --post_name="politique-de-confidentialite" --post_status=publish --post_content='<!-- wp:paragraph --><p>Politique de confidentialité…</p><!-- /wp:paragraph -->' --allow-root
  wp post create --post_type=page --post_title="À propos" --post_name="a-propos" --post_status=publish --allow-root

  wp option update show_on_front "page" --allow-root
  wp option update page_on_front "$FRONT_PAGE_ID" --allow-root

  # ── Install plugins ──
  wp plugin install antispam-bee --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin antispam-bee skipped"
  wp plugin install easy-table-of-contents --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin easy-table-of-contents skipped"
  wp plugin install wp-mail-smtp --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin wp-mail-smtp skipped"
  wp plugin install contact-form-7 --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin contact-form-7 skipped"
  wp plugin install flamingo --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin flamingo skipped"
  wp plugin install health-check --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin health-check skipped"
  wp plugin install query-monitor --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin query-monitor skipped"
  wp plugin install redirection --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin redirection skipped"
  wp plugin install cookie-notice --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin cookie-notice skipped"
  wp plugin install headers-security-advanced-hsts-wp --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin headers-security-advanced-hsts-wp skipped"
  wp plugin install all-in-one-wp-security-and-firewall --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin all-in-one-wp-security-and-firewall skipped"
  wp plugin install wordpress-seo --allow-root >/dev/null 2>&1 || echo "⚠️ Plugin wordpress-seo skipped"

  # ── Install & activate theme ──
  if [ -d "wp-content/themes/sf-tt5" ]; then
    wp theme activate sf-tt5 --allow-root >/dev/null 2>&1 || echo "⚠️ Theme sf-tt5 skipped"
  else
    wp theme install sf-tt5 --activate --allow-root >/dev/null 2>&1 || echo "⚠️ Theme sf-tt5 skipped"
  fi

  echo "✅ WordPress installed successfully!"
else
  echo "WordPress is already installed"
fi

# ── Ensure parent theme exists (required for sf-tt5) ──
if [ ! -d "wp-content/themes/twentytwentyfive" ]; then
  wp theme install twentytwentyfive --allow-root >/dev/null 2>&1 || true
fi

  # ── Ensure theme stays active ──
  if [ -d "wp-content/themes/sf-tt5" ]; then
    wp theme activate sf-tt5 --allow-root >/dev/null 2>&1 || true
  fi

# ── Activate SF TT5 child theme if present ──
if [ -d "wp-content/themes/sf-tt5" ] && wp core is-installed --allow-root >/dev/null 2>&1; then
  wp theme activate sf-tt5 --allow-root >/dev/null 2>&1 || true
fi

# ── Remove default plugins not used (Akismet, Hello Dolly) ──
wp plugin delete akismet hello --allow-root >/dev/null 2>&1 || true

chown -R www-data:www-data /var/www/html/wp-content || true
find /var/www/html/wp-content -type d -exec chmod 755 {} \; || true
find /var/www/html/wp-content -type f -exec chmod 644 {} \; || true

exec apache2-foreground
