import { spawn, spawnSync } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const envPath = resolve(repoRoot, ".env");

try {
  const dotenv = await import("dotenv");
  dotenv.config({ path: envPath });
} catch {
  // dotenv is optional; fall back to process.env only.
}

const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace("T", "-")
  .replace(/\..+$/, "");
const backupDir = process.env.BACKUP_DIR
  ? resolve(process.env.BACKUP_DIR)
  : resolve(repoRoot, "backup", "site-factory", "db");

const dbName = process.env.DB_NAME ?? "sitefactory";
const dbUser = process.env.DB_USER ?? "sitefactory";
const dbPassword = process.env.DB_PASSWORD ?? "sitefactory";
const dbHost = process.env.DB_HOST ?? "127.0.0.1";
const dbPort = process.env.DB_PORT ?? "3307";
const keepDays = process.env.BACKUP_KEEP_DAYS
  ? Number(process.env.BACKUP_KEEP_DAYS)
  : null;

const composeFile = process.env.COMPOSE_FILE
  ? resolve(process.env.COMPOSE_FILE)
  : resolve(repoRoot, "docker-compose.yml");
const dbService = process.env.DB_SERVICE ?? "db";

const filename = `db-${timestamp}.sql`;
const outputPath = resolve(backupDir, filename);

function hasCommand(command) {
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return result.status === 0;
}

function buildLocalDumpArgs() {
  return [
    `-h${dbHost}`,
    `-P${dbPort}`,
    `-u${dbUser}`,
    `-p${dbPassword}`,
    "--single-transaction",
    "--quick",
    dbName,
  ];
}

function buildDockerDumpArgs() {
  return [
    "compose",
    "-f",
    composeFile,
    "exec",
    "-T",
    dbService,
    "mysqldump",
    `-u${dbUser}`,
    `-p${dbPassword}`,
    "--single-transaction",
    "--quick",
    dbName,
  ];
}

async function purgeOldBackups() {
  if (!keepDays || Number.isNaN(keepDays)) return;
  const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;
  const entries = await readdir(backupDir);

  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.startsWith("db-")) return;
      const fullPath = resolve(backupDir, entry);
      const stats = await stat(fullPath);
      if (stats.mtimeMs < cutoff) {
        await rm(fullPath, { force: true });
      }
    }),
  );
}

await mkdir(backupDir, { recursive: true });

const useDocker = process.env.BACKUP_USE_DOCKER === "1" || !hasCommand("mysqldump");
const command = useDocker ? "docker" : "mysqldump";
const args = useDocker ? buildDockerDumpArgs() : buildLocalDumpArgs();

const output = createWriteStream(outputPath, { flags: "wx" });

const child = spawn(command, args, {
  stdio: ["ignore", "pipe", "pipe"],
});

let stderr = "";
child.on("error", async (error) => {
  console.error(error.message);
  await rm(outputPath, { force: true });
  process.exit(1);
});
child.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
});

output.on("error", async (error) => {
  if (error.code === "ENOSPC") {
    console.error("Disk full: not enough space to write the backup.");
  } else {
    console.error("Failed to write the backup file.");
  }
  child.kill("SIGTERM");
  await rm(outputPath, { force: true });
  process.exit(1);
});

child.stdout.pipe(output);

const exitCode = await new Promise((resolvePromise) => {
  child.on("close", resolvePromise);
});

if (exitCode !== 0) {
  await rm(outputPath, { force: true });
  console.error(stderr.trim() || "mysqldump failed");
  process.exit(1);
}

await purgeOldBackups();

console.log(`Backup saved: ${outputPath}`);
console.log(`Source: ${useDocker ? "docker compose" : "local mysqldump"}`);
console.log(`Database: ${dbName}`);
console.log(`File: ${basename(outputPath)}`);
