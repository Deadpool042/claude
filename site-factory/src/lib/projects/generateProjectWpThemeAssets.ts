import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const PROJECTS_ROOT = resolve(process.cwd(), "..", "projects");
const THEME_SOURCE_ROOT = resolve(
  process.cwd(),
  "..",
  "assets",
  "wp",
  "theme-child",
  "sf-tt5",
);

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

export async function generateProjectWpThemeAssets(input: {
  clientSlug: string;
  projectSlug: string;
  includeTheme?: boolean;
}): Promise<void> {
  if (!input.includeTheme) return;

  const projectRoot = resolve(PROJECTS_ROOT, input.clientSlug, input.projectSlug);
  const themesRoot = resolve(projectRoot, "wp", "wp-content", "themes");
  await ensureDir(themesRoot);

  const themeTarget = resolve(themesRoot, "sf-tt5");
  await copyMissingRecursive(THEME_SOURCE_ROOT, themeTarget);
}
