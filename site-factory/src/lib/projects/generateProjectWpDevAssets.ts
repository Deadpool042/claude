import { chmod, cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { wpSetupScript, type WpSetupOptions } from "@/lib/generators/compose/compose-wordpress";

const PROJECTS_ROOT = resolve(process.cwd(), "..", "projects");
const BACKUPS_ROOT = resolve(process.cwd(), "..", "backup");
const THEME_SOURCE_ROOT = resolve(
  process.cwd(),
  "..",
  "assets",
  "wp",
  "theme-child",
  "sf-tt5",
);
const MU_PLUGINS_SOURCE_ROOT = resolve(
  process.cwd(),
  "..",
  "assets",
  "wp",
  "mu-plugins",
);

type WpConfigInput = {
  wpPermalinkStructure?: string | null;
  wpDefaultPages?: string | null;
  wpPlugins?: string | null;
  wpTheme?: string | null;
};

const WP_CONFIG_EXTRA_LOCAL_TEMPLATE = `<?php

if (!defined('WP_DEBUG')) define('WP_DEBUG', true);
if (!defined('WP_DEBUG_LOG')) define('WP_DEBUG_LOG', true);
if (!defined('WP_DEBUG_DISPLAY')) define('WP_DEBUG_DISPLAY', true);
if (!defined('WP_ENVIRONMENT_TYPE')) define('WP_ENVIRONMENT_TYPE', 'local');

if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
  $_SERVER['HTTPS'] = 'on';
}

if (!defined('SITE_FACTORY_MODE')) define('SITE_FACTORY_MODE', 'local');
`;

const WP_CONFIG_EXTRA_PROD_LIKE_TEMPLATE = `<?php

if (!defined('WP_DEBUG')) define('WP_DEBUG', false);
if (!defined('WP_DEBUG_LOG')) define('WP_DEBUG_LOG', false);
if (!defined('WP_DEBUG_DISPLAY')) define('WP_DEBUG_DISPLAY', false);
if (!defined('WP_ENVIRONMENT_TYPE')) define('WP_ENVIRONMENT_TYPE', 'production');

if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
  $_SERVER['HTTPS'] = 'on';
}

if (!defined('SITE_FACTORY_MODE')) define('SITE_FACTORY_MODE', 'prod-like');
`;


async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

async function ensureFile(path: string, content: string, mode?: number): Promise<void> {
  if (await pathExists(path)) return;
  await writeFile(path, content, "utf-8");
  if (mode != null) {
    await chmod(path, mode);
  }
}

async function copyMissingRecursive(source: string, target: string): Promise<void> {
  if (!(await pathExists(target))) {
    await cp(source, target, { recursive: true });
    return;
  }

  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = resolve(source, entry.name);
    const targetPath = resolve(target, entry.name);

    if (entry.isDirectory()) {
      await copyMissingRecursive(sourcePath, targetPath);
    } else if (!(await pathExists(targetPath))) {
      await cp(sourcePath, targetPath);
    }
  }
}

async function copyRecursive(source: string, target: string): Promise<void> {
  await cp(source, target, { recursive: true, force: true });
}

export async function syncProjectWpMuPlugins(input: {
  clientSlug: string;
  projectSlug: string;
}): Promise<void> {
  if (!(await pathExists(MU_PLUGINS_SOURCE_ROOT))) return;

  const projectRoot = resolve(PROJECTS_ROOT, input.clientSlug, input.projectSlug);
  const muPluginsTarget = resolve(projectRoot, "wp", "wp-content", "mu-plugins");
  await ensureDir(muPluginsTarget);
  await copyRecursive(MU_PLUGINS_SOURCE_ROOT, muPluginsTarget);
}

async function ensureProjectBackupDirs(input: {
  clientSlug: string;
  projectSlug: string;
}): Promise<void> {
  const base = resolve(BACKUPS_ROOT, input.clientSlug, input.projectSlug);
  await ensureDir(resolve(base, "db"));
  await ensureDir(resolve(base, "uploads"));
  await ensureDir(resolve(base, "monitoring"));
}

export function buildWpSetupOptionsFromConfig(config?: WpConfigInput): WpSetupOptions {
  const setupOpts: WpSetupOptions = {
    permalink: config?.wpPermalinkStructure ?? "/%postname%/",
  };

  if (config?.wpDefaultPages) {
    try {
      setupOpts.pages = JSON.parse(config.wpDefaultPages) as NonNullable<WpSetupOptions["pages"]>;
    } catch {
      // ignore invalid JSON
    }
  }

  if (config?.wpPlugins) {
    try {
      setupOpts.plugins = JSON.parse(config.wpPlugins) as NonNullable<WpSetupOptions["plugins"]>;
    } catch {
      // ignore invalid JSON
    }
  }

  if (config?.wpTheme) {
    setupOpts.theme = config.wpTheme;
  }

  return setupOpts;
}

export async function generateProjectWpDevAssets(input: {
  clientSlug: string;
  projectSlug: string;
  setupOptions?: WpSetupOptions | null;
  includeTheme?: boolean;
}): Promise<void> {
  const projectRoot = resolve(PROJECTS_ROOT, input.clientSlug, input.projectSlug);
  const wpRoot = resolve(projectRoot, "wp");
  const wpContentRoot = resolve(wpRoot, "wp-content");

  await ensureDir(resolve(wpContentRoot, "plugins"));
  await ensureDir(resolve(wpContentRoot, "themes"));
  await ensureDir(resolve(wpContentRoot, "uploads"));
  await ensureProjectBackupDirs({
    clientSlug: input.clientSlug,
    projectSlug: input.projectSlug,
  });
  await syncProjectWpMuPlugins({
    clientSlug: input.clientSlug,
    projectSlug: input.projectSlug,
  });

  if (input.includeTheme) {
    const themeTarget = resolve(wpContentRoot, "themes", "sf-tt5");
    await copyMissingRecursive(THEME_SOURCE_ROOT, themeTarget);
  }

  await ensureFile(
    resolve(wpRoot, "wp-config.extra.local.php"),
    WP_CONFIG_EXTRA_LOCAL_TEMPLATE,
  );
  await ensureFile(
    resolve(wpRoot, "wp-config.extra.prod-like.php"),
    WP_CONFIG_EXTRA_PROD_LIKE_TEMPLATE,
  );

  if (input.setupOptions) {
    await ensureDir(resolve(projectRoot, "docker"));
    const scriptPath = resolve(projectRoot, "docker", "wp-setup.sh");
    const scriptContent = wpSetupScript(input.setupOptions);
    let shouldWrite = true;
    if (await pathExists(scriptPath)) {
      const existing = await readFile(scriptPath, "utf-8");
      shouldWrite = existing !== scriptContent;
    }
    if (shouldWrite) {
      await writeFile(scriptPath, scriptContent, "utf-8");
    }
    await chmod(scriptPath, 0o755);
  }
}
