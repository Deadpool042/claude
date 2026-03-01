import { readdir, stat, mkdir, copyFile, utimes, rm } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { watch } from "node:fs";

const execAsync = promisify(exec);

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));

function getArgValue(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
}

const client = getArgValue("--client");
const project = getArgValue("--project");
const mode = getArgValue("--mode") === "prod-like" ? "prod-like" : "dev";
const dryRun = flags.has("--dry-run");
const once = flags.has("--once");
const wpcli = flags.has("--wpcli");
const flush = flags.has("--flush");

if (!client || !project) {
  console.error("Usage: pnpm sf:theme:watch --client <client> --project <project> [--once] [--dry-run] [--wpcli] [--flush] [--mode dev|prod-like]");
  process.exit(1);
}

const SOURCE_ROOT = resolve(process.cwd(), "assets", "wp", "theme-child", "sf-tt5");
const TARGET_ROOT = resolve(
  process.cwd(),
  "projects",
  client,
  project,
  "wp",
  "wp-content",
  "themes",
  "sf-tt5",
);

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(path) {
  if (dryRun) return;
  await mkdir(path, { recursive: true });
}

async function copyOne(sourcePath, targetPath) {
  const sourceStat = await stat(sourcePath);
  if (!sourceStat.isFile()) return;
  await ensureDir(dirname(targetPath));
  if (!dryRun) {
    await copyFile(sourcePath, targetPath);
    await utimes(targetPath, sourceStat.atime, sourceStat.mtime);
  }
  console.log(`[sf-tt5:watch] copied ${targetPath}`);
}

async function removeOne(targetPath) {
  if (!(await pathExists(targetPath))) return;
  if (!dryRun) {
    await rm(targetPath, { force: true, recursive: true });
  }
  console.log(`[sf-tt5:watch] removed ${targetPath}`);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function syncAll() {
  const files = await walk(SOURCE_ROOT);
  const sourceSet = new Set();
  for (const file of files) {
    const rel = file.slice(SOURCE_ROOT.length + 1);
    sourceSet.add(rel);
    await copyOne(file, resolve(TARGET_ROOT, rel));
  }

  if (await pathExists(TARGET_ROOT)) {
    const targetFiles = await walk(TARGET_ROOT);
    for (const file of targetFiles) {
      const rel = file.slice(TARGET_ROOT.length + 1);
      if (!sourceSet.has(rel)) {
        await removeOne(file);
      }
    }
  }
}

async function touchStyleCss() {
  const stylePath = resolve(TARGET_ROOT, "style.css");
  if (!(await pathExists(stylePath))) return;
  const now = new Date();
  if (!dryRun) {
    await utimes(stylePath, now, now);
  }
}

async function runWpCli() {
  if (!wpcli) return;
  const composeFile =
    mode === "prod-like"
      ? `configs/${client}/${project}/docker-compose.prod-like.yml`
      : `configs/${client}/${project}/docker-compose.local.yml`;
  const stackSlug = mode === "prod-like" ? `${project}-prod-like` : `${project}-dev`;
  const cmd = `docker compose -p ${stackSlug} -f ${composeFile} exec -T ${stackSlug} wp theme activate sf-tt5 --allow-root`;
  const flushCmd = `docker compose -p ${stackSlug} -f ${composeFile} exec -T ${stackSlug} wp cache flush --allow-root`;
  try {
    if (!dryRun) {
      await execAsync(cmd, { cwd: process.cwd() });
      if (flush || wpcli) {
        await execAsync(flushCmd, { cwd: process.cwd() });
      }
    }
  } catch (error) {
    console.error(`[sf-tt5:watch] wpcli failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (once) {
  await syncAll();
  await touchStyleCss();
  await runWpCli();
  process.exit(0);
}

await syncAll();
await touchStyleCss();
await runWpCli();

const pending = new Map();
let timer = null;
const DEBOUNCE_MS = 200;

function queueCopy(sourcePath) {
  if (!sourcePath.startsWith(SOURCE_ROOT)) return;
  pending.set(sourcePath, Date.now());
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    const entries = Array.from(pending.keys());
    pending.clear();
    for (const file of entries) {
      const rel = file.slice(SOURCE_ROOT.length + 1);
      const targetPath = resolve(TARGET_ROOT, rel);
      if (!(await pathExists(file))) {
        await removeOne(targetPath);
        continue;
      }
      await copyOne(file, targetPath);
    }
    await touchStyleCss();
    await runWpCli();
  }, DEBOUNCE_MS);
}

watch(SOURCE_ROOT, { recursive: true }, (_event, filename) => {
  if (!filename) return;
  const sourcePath = resolve(SOURCE_ROOT, filename);
  queueCopy(sourcePath);
});

console.log(`[sf-tt5:watch] watching ${SOURCE_ROOT}`);
