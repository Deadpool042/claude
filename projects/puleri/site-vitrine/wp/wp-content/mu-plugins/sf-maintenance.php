<?php
/**
 * Plugin Name: SF Maintenance Tools
 * Description: Monitoring and backups for local/prod-like environments.
 */

function sf_maintenance_is_production(): bool {
  if (function_exists('wp_get_environment_type')) {
    return wp_get_environment_type() === 'production';
  }
  return (getenv('APP_ENV') ?: '') === 'production';
}

function sf_maintenance_backup_root(): string {
  $root = getenv('SF_BACKUP_ROOT');
  return $root ? rtrim($root, '/') : '/var/www/backup';
}

function sf_maintenance_project_context(array $assoc_args): array {
  $client = $assoc_args['client'] ?? getenv('SF_CLIENT_SLUG') ?? '';
  $project = $assoc_args['project'] ?? getenv('SF_PROJECT_SLUG') ?? '';
  return [$client, $project];
}

function sf_maintenance_backup_base(string $client, string $project): string {
  return sf_maintenance_backup_root() . '/' . $client . '/' . $project;
}

function sf_maintenance_ensure_dir(string $path): void {
  if (!is_dir($path)) {
    wp_mkdir_p($path);
  }
}

function sf_maintenance_read_meta(string $base): array {
  $file = $base . '/meta.json';
  if (!file_exists($file)) {
    return [];
  }
  $raw = file_get_contents($file);
  $decoded = json_decode($raw ?: '', true);
  return is_array($decoded) ? $decoded : [];
}

function sf_maintenance_write_meta(string $base, array $data): array {
  $file = $base . '/meta.json';
  $existing = sf_maintenance_read_meta($base);
  $merged = array_merge($existing, $data);
  file_put_contents($file, wp_json_encode($merged, JSON_PRETTY_PRINT));
  return $merged;
}

function sf_maintenance_prune(string $dir, int $keep): void {
  if (!is_dir($dir)) {
    return;
  }
  $files = glob($dir . '/*');
  if (!is_array($files)) {
    return;
  }
  usort($files, function ($a, $b) {
    return filemtime($b) <=> filemtime($a);
  });
  $to_delete = array_slice($files, $keep);
  foreach ($to_delete as $path) {
    if (is_file($path)) {
      @unlink($path);
    }
  }
}

function sf_maintenance_run_wp_cli(string $command): void {
  if (class_exists('WP_CLI')) {
    WP_CLI::runcommand($command);
    return;
  }

  $cmd = '/usr/local/bin/wp ' . $command . ' --allow-root';
  @exec($cmd, $output, $exit_code);
  if ((int) $exit_code !== 0) {
    throw new RuntimeException('WP CLI command failed.');
  }
}

function sf_maintenance_backup_db(string $db_dir, string $stamp): string {
  $file = $db_dir . '/db-' . $stamp . '.sql';
  sf_maintenance_run_wp_cli('db export ' . escapeshellarg($file) . ' --add-drop-table');
  return $file;
}

function sf_maintenance_backup_uploads(string $uploads_dir, string $stamp): string {
  $upload = wp_get_upload_dir();
  $source = $upload['basedir'] ?? '';
  if (!$source || !is_dir($source)) {
    throw new RuntimeException('Uploads directory not found.');
  }

  if (class_exists('ZipArchive')) {
    $file = $uploads_dir . '/uploads-' . $stamp . '.zip';
    $zip = new ZipArchive();
    if ($zip->open($file, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
      throw new RuntimeException('Unable to create zip.');
    }
    $iterator = new RecursiveIteratorIterator(
      new RecursiveDirectoryIterator($source, FilesystemIterator::SKIP_DOTS),
      RecursiveIteratorIterator::SELF_FIRST
    );
    foreach ($iterator as $item) {
      $path = $item->getPathname();
      $relative = ltrim(str_replace($source, '', $path), '/');
      if ($item->isDir()) {
        $zip->addEmptyDir($relative);
      } else {
        $zip->addFile($path, $relative);
      }
    }
    $zip->close();
    return $file;
  }

  $file = $uploads_dir . '/uploads-' . $stamp . '.tar';
  $tar = new PharData($file);
  $tar->buildFromDirectory($source);
  return $file;
}

function sf_maintenance_clear_dir(string $dir): void {
  if (!is_dir($dir)) {
    return;
  }
  $iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
    RecursiveIteratorIterator::CHILD_FIRST
  );
  foreach ($iterator as $item) {
    $path = $item->getPathname();
    if ($item->isDir()) {
      @rmdir($path);
    } else {
      @unlink($path);
    }
  }
}

function sf_maintenance_is_valid_relative_path(string $path): bool {
  $clean = trim($path);
  if ($clean === '') {
    return false;
  }
  if (str_starts_with($clean, '/') || str_contains($clean, '..')) {
    return false;
  }
  return (bool) preg_match('/^[a-zA-Z0-9._\\/\\-]+$/', $clean);
}

function sf_maintenance_resolve_backup_file(string $base, string $relative, string $label): string {
  $relative = ltrim($relative, '/');
  if (!sf_maintenance_is_valid_relative_path($relative)) {
    throw new RuntimeException($label . ' invalide.');
  }
  $path = $base . '/' . $relative;
  $normalized_base = rtrim(wp_normalize_path($base), '/') . '/';
  $normalized_path = wp_normalize_path($path);
  if (strpos($normalized_path, $normalized_base) !== 0) {
    throw new RuntimeException($label . ' invalide.');
  }
  if (!file_exists($path)) {
    throw new RuntimeException($label . ' introuvable.');
  }
  return $path;
}

function sf_maintenance_restore_db(string $file): void {
  sf_maintenance_run_wp_cli('db import ' . escapeshellarg($file));
  sf_maintenance_run_wp_cli('cache flush');
}

function sf_maintenance_restore_uploads(string $file): void {
  $upload = wp_get_upload_dir();
  $target = $upload['basedir'] ?? '';
  if (!$target || !is_dir($target)) {
    throw new RuntimeException('Uploads directory not found.');
  }
  sf_maintenance_clear_dir($target);

  $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
  if ($ext === 'zip') {
    if (!class_exists('ZipArchive')) {
      throw new RuntimeException('ZipArchive indisponible.');
    }
    $zip = new ZipArchive();
    if ($zip->open($file) !== true) {
      throw new RuntimeException('Unable to open zip.');
    }
    $zip->extractTo($target);
    $zip->close();
    return;
  }

  if ($ext === 'tar') {
    $tar = new PharData($file);
    $tar->extractTo($target, null, true);
    return;
  }

  throw new RuntimeException('Archive uploads invalide.');
}

function sf_maintenance_regenerate_media(): ?string {
  $command = 'media regenerate --yes --only-missing';

  if (class_exists('WP_CLI')) {
    $result = WP_CLI::runcommand($command, [
      'return' => 'all',
      'exit_error' => false,
    ]);
    if (is_array($result)) {
      $stderr = trim((string) ($result['stderr'] ?? ''));
      $return_code = (int) ($result['return_code'] ?? 0);
      if ($return_code !== 0) {
        return $stderr !== '' ? $stderr : 'Regeneration medias echouee.';
      }
      return $stderr !== '' ? $stderr : null;
    }
    return null;
  }

  try {
    sf_maintenance_run_wp_cli($command);
  } catch (Throwable $e) {
    return $e->getMessage();
  }
  return null;
}

function sf_maintenance_cleanup_missing_media(int $limit = 500): array {
  $checked = 0;
  $removed = 0;
  $page = 1;
  $per_page = 100;
  $has_more = true;

  while ($has_more && $checked < $limit) {
    $query = new WP_Query([
      'post_type' => 'attachment',
      'post_status' => 'any',
      'fields' => 'ids',
      'posts_per_page' => $per_page,
      'paged' => $page,
      'no_found_rows' => true,
    ]);

    if (!$query->have_posts()) {
      break;
    }

    foreach ($query->posts as $id) {
      $checked++;
      $file = get_attached_file($id);
      if (!$file || !file_exists($file)) {
        wp_delete_attachment($id, true);
        $removed++;
      }
      if ($checked >= $limit) {
        $has_more = false;
        break;
      }
    }

    $page++;
  }

  return [
    'checked' => $checked,
    'removed' => $removed,
    'truncated' => $checked >= $limit,
  ];
}

function sf_maintenance_run_health(string $base): array {
  global $wpdb;
  $stamp = gmdate('Ymd-His');
  $db_ok = method_exists($wpdb, 'check_connection') ? (bool) $wpdb->check_connection() : true;
  $cron_ok = !(defined('DISABLE_WP_CRON') && DISABLE_WP_CRON);
  $fs_ok = wp_is_writable(WP_CONTENT_DIR);
  $uploads = wp_get_upload_dir();
  $uploads_ok = isset($uploads['basedir']) ? wp_is_writable($uploads['basedir']) : false;

  $details = [
    'db_ok' => $db_ok,
    'cron_ok' => $cron_ok,
    'fs_ok' => $fs_ok,
    'uploads_ok' => $uploads_ok,
    'php_version' => PHP_VERSION,
    'wp_version' => get_bloginfo('version'),
    'site_url' => get_option('siteurl'),
  ];
  $ok = $db_ok && $cron_ok && $fs_ok && $uploads_ok;
  $monitor_dir = $base . '/monitoring';
  sf_maintenance_ensure_dir($monitor_dir);
  file_put_contents(
    $monitor_dir . '/health-' . $stamp . '.json',
    wp_json_encode($details, JSON_PRETTY_PRINT)
  );
  sf_maintenance_prune($monitor_dir, 30);
  $payload = [
    'last_health_at' => gmdate('c'),
    'last_health_ok' => $ok,
    'last_health_details' => $details,
  ];
  return sf_maintenance_write_meta($base, $payload);
}

function sf_maintenance_run_backup(string $base, string $type, int $keep): array {
  $stamp = gmdate('Ymd-His');
  $db_dir = $base . '/db';
  $uploads_dir = $base . '/uploads';
  sf_maintenance_ensure_dir($db_dir);
  sf_maintenance_ensure_dir($uploads_dir);

  $files = [
    'db' => null,
    'uploads' => null,
    'type' => $type,
  ];

  if ($type === 'db' || $type === 'full') {
    $files['db'] = sf_maintenance_backup_db($db_dir, $stamp);
    sf_maintenance_prune($db_dir, $keep);
  }

  if ($type === 'uploads' || $type === 'full') {
    $files['uploads'] = sf_maintenance_backup_uploads($uploads_dir, $stamp);
    sf_maintenance_prune($uploads_dir, $keep);
  }

  $payload = [
    'last_backup_at' => gmdate('c'),
    'last_backup_files' => $files,
    'last_backup_keep' => $keep,
  ];
  return sf_maintenance_write_meta($base, $payload);
}

function sf_maintenance_status(string $base): array {
  $meta = sf_maintenance_read_meta($base);
  $meta['next_backup_at'] = null;
  $meta['next_health_at'] = null;

  $next_backup = wp_next_scheduled('sf_backup_event');
  $next_health = wp_next_scheduled('sf_health_event');
  if ($next_backup) {
    $meta['next_backup_at'] = gmdate('c', (int) $next_backup);
  }
  if ($next_health) {
    $meta['next_health_at'] = gmdate('c', (int) $next_health);
  }
  return $meta;
}

function sf_maintenance_schedule_events(): void {
  if (sf_maintenance_is_production()) {
    return;
  }
  if (!wp_next_scheduled('sf_backup_event')) {
    wp_schedule_event(time() + 300, 'daily', 'sf_backup_event');
  }
  if (!wp_next_scheduled('sf_health_event')) {
    wp_schedule_event(time() + 300, 'hourly', 'sf_health_event');
  }
}

add_action('init', 'sf_maintenance_schedule_events');

add_action('sf_backup_event', function () {
  [$client, $project] = sf_maintenance_project_context([]);
  if (!$client || !$project) {
    return;
  }
  $base = sf_maintenance_backup_base($client, $project);
  sf_maintenance_ensure_dir($base);
  try {
    sf_maintenance_run_backup($base, 'full', (int) (getenv('SF_BACKUP_KEEP') ?: 14));
  } catch (Throwable $e) {
    error_log('SF backup cron failed: ' . $e->getMessage());
  }
});

add_action('sf_health_event', function () {
  [$client, $project] = sf_maintenance_project_context([]);
  if (!$client || !$project) {
    return;
  }
  $base = sf_maintenance_backup_base($client, $project);
  sf_maintenance_ensure_dir($base);
  try {
    sf_maintenance_run_health($base);
  } catch (Throwable $e) {
    error_log('SF health cron failed: ' . $e->getMessage());
  }
});

if (defined('WP_CLI') && WP_CLI) {
  WP_CLI::add_command('sf health-check', function ($args, $assoc_args) {
    [$client, $project] = sf_maintenance_project_context($assoc_args);
    if (!$client || !$project) {
      WP_CLI::error('Client ou projet manquant.');
    }
    $base = sf_maintenance_backup_base($client, $project);
    sf_maintenance_ensure_dir($base);
    $meta = sf_maintenance_run_health($base);
    WP_CLI::line(wp_json_encode($meta));
  });

  WP_CLI::add_command('sf backup', function ($args, $assoc_args) {
    [$client, $project] = sf_maintenance_project_context($assoc_args);
    if (!$client || !$project) {
      WP_CLI::error('Client ou projet manquant.');
    }
    $type = $assoc_args['type'] ?? 'full';
    $keep = (int) ($assoc_args['keep'] ?? getenv('SF_BACKUP_KEEP') ?: 14);
    if (!in_array($type, ['full', 'db', 'uploads'], true)) {
      WP_CLI::error('Type invalide. Valeurs: full, db, uploads.');
    }
    $base = sf_maintenance_backup_base($client, $project);
    sf_maintenance_ensure_dir($base);
    $meta = sf_maintenance_run_backup($base, $type, $keep);
    WP_CLI::line(wp_json_encode($meta));
  });

  WP_CLI::add_command('sf restore', function ($args, $assoc_args) {
    [$client, $project] = sf_maintenance_project_context($assoc_args);
    if (!$client || !$project) {
      WP_CLI::error('Client ou projet manquant.');
    }
    $type = $assoc_args['type'] ?? '';
    $db_rel = $assoc_args['db'] ?? null;
    $uploads_rel = $assoc_args['uploads'] ?? null;

    if ($type === '') {
      if ($db_rel && $uploads_rel) {
        $type = 'full';
      } elseif ($db_rel) {
        $type = 'db';
      } elseif ($uploads_rel) {
        $type = 'uploads';
      }
    }

    if (!in_array($type, ['full', 'db', 'uploads'], true)) {
      WP_CLI::error('Type invalide. Valeurs: full, db, uploads.');
    }

    if (($type === 'db' || $type === 'full') && !$db_rel) {
      WP_CLI::error('Fichier DB requis.');
    }
    if (($type === 'uploads' || $type === 'full') && !$uploads_rel) {
      WP_CLI::error('Fichier uploads requis.');
    }

    $base = sf_maintenance_backup_base($client, $project);
    sf_maintenance_ensure_dir($base);

    $resolved_db = $db_rel ? sf_maintenance_resolve_backup_file($base, $db_rel, 'DB') : null;
    $resolved_uploads = $uploads_rel
      ? sf_maintenance_resolve_backup_file($base, $uploads_rel, 'Uploads')
      : null;

    try {
      $warnings = [];
      $cleanup = null;
      if ($resolved_db) {
        sf_maintenance_restore_db($resolved_db);
      }
      if ($resolved_uploads) {
        sf_maintenance_restore_uploads($resolved_uploads);
        $regen_warning = sf_maintenance_regenerate_media();
        if ($regen_warning) {
          $warnings[] = 'Regeneration medias: ' . $regen_warning;
        }
        $cleanup = sf_maintenance_cleanup_missing_media();
        if (($cleanup['removed'] ?? 0) > 0) {
          $warnings[] = 'Medias orphelins supprimes: ' . (string) $cleanup['removed'];
        }
      }

      $meta = sf_maintenance_write_meta($base, [
        'last_restore_at' => gmdate('c'),
        'last_restore_type' => $type,
        'last_restore_files' => [
          'db' => $resolved_db,
          'uploads' => $resolved_uploads,
        ],
        'last_restore_ok' => true,
        'last_restore_error' => null,
        'last_restore_warning' => $warnings ? implode(' | ', $warnings) : null,
        'last_restore_cleanup' => $cleanup ?? null,
      ]);
      WP_CLI::line(wp_json_encode($meta));
    } catch (Throwable $e) {
      sf_maintenance_write_meta($base, [
        'last_restore_at' => gmdate('c'),
        'last_restore_type' => $type,
        'last_restore_files' => [
          'db' => $resolved_db,
          'uploads' => $resolved_uploads,
        ],
        'last_restore_ok' => false,
        'last_restore_error' => $e->getMessage(),
        'last_restore_warning' => null,
        'last_restore_cleanup' => null,
      ]);
      WP_CLI::error($e->getMessage());
    }
  });

  WP_CLI::add_command('sf maintenance-status', function ($args, $assoc_args) {
    [$client, $project] = sf_maintenance_project_context($assoc_args);
    if (!$client || !$project) {
      WP_CLI::error('Client ou projet manquant.');
    }
    $base = sf_maintenance_backup_base($client, $project);
    sf_maintenance_ensure_dir($base);
    $meta = sf_maintenance_status($base);
    WP_CLI::line(wp_json_encode($meta));
  });
}
