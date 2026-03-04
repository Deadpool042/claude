import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const BACKUPS_ROOT = resolve(process.cwd(), "..", "backup");

const DB_REGEX = /^db-(\d{8}-\d{6})\.sql$/;
const UPLOADS_REGEX = /^uploads-(\d{8}-\d{6})\.(zip|tar)$/;
const BACKUP_RETENTION_DAYS = 30;
const BACKUP_KEEP_DEFAULT = 14;

export type BackupFileKind = "db" | "uploads";

export type BackupFile = {
  name: string;
  path: string;
  size: number;
  modifiedAt: string;
  kind: BackupFileKind;
};

export type BackupEntry = {
  stamp: string;
  createdAt: string;
  db?: BackupFile;
  uploads?: BackupFile;
};

export type BackupFileWithStamp = BackupFile & {
  stamp: string;
};

export type BackupMeta = {
  last_backup_at?: string | null;
  last_backup_files?: {
    db?: string | null;
    uploads?: string | null;
    type?: string | null;
  } | null;
  last_backup_keep?: number;
  [key: string]: unknown;
};

export function parseBackupFilename(
  name: string,
  kind: BackupFileKind,
): { stamp: string } | null {
  const match = (kind === "db" ? DB_REGEX : UPLOADS_REGEX).exec(name);
  if (!match) return null;
  return { stamp: match[1] };
}

export function stampToIso(stamp: string): string | null {
  const match = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/.exec(
    stamp,
  );
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ),
  );
  return date.toISOString();
}

export function buildBackupEntries(files: BackupFileWithStamp[]): BackupEntry[] {
  const byStamp = new Map<string, BackupEntry>();

  for (const file of files) {
    const createdAt = stampToIso(file.stamp) ?? file.modifiedAt;
    const entry = byStamp.get(file.stamp) ?? {
      stamp: file.stamp,
      createdAt,
    };

    if (file.kind === "db") {
      entry.db = file;
    } else {
      entry.uploads = file;
    }

    if (!entry.createdAt) {
      entry.createdAt = createdAt;
    }

    byStamp.set(file.stamp, entry);
  }

  return [...byStamp.values()].sort((a, b) => b.stamp.localeCompare(a.stamp));
}

export function applyBackupRetention(input: {
  entries: BackupEntry[];
  keep: number;
  maxAgeDays: number;
  now?: Date;
}): { kept: BackupEntry[]; removed: BackupEntry[] } {
  const now = input.now ?? new Date();
  const cutoff = new Date(now);
  const maxAgeDays = Math.max(0, input.maxAgeDays);
  if (maxAgeDays > 0) {
    cutoff.setUTCDate(cutoff.getUTCDate() - maxAgeDays);
  }

  const kept: BackupEntry[] = [];
  const removed: BackupEntry[] = [];

  for (const entry of input.entries) {
    const ts = Date.parse(entry.createdAt);
    if (maxAgeDays > 0 && !Number.isNaN(ts) && ts < cutoff.getTime()) {
      removed.push(entry);
      continue;
    }
    kept.push(entry);
  }

  const keep = Math.max(0, input.keep);
  if (keep > 0 && kept.length > keep) {
    removed.push(...kept.slice(keep));
    kept.splice(keep);
  }

  return { kept, removed };
}

async function readBackupFiles(dir: string, kind: BackupFileKind): Promise<BackupFileWithStamp[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: BackupFileWithStamp[] = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const parsed = parseBackupFilename(entry.name, kind);
      if (!parsed) continue;
      const fullPath = resolve(dir, entry.name);
      const stats = await stat(fullPath);
      files.push({
        name: entry.name,
        path: `${kind}/${entry.name}`,
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
        kind,
        stamp: parsed.stamp,
      });
    }

    return files;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      return [];
    }
    throw error;
  }
}

export async function listProjectBackups(input: {
  clientSlug: string;
  projectSlug: string;
  limit?: number;
}): Promise<BackupEntry[]> {
  const base = resolve(BACKUPS_ROOT, input.clientSlug, input.projectSlug);
  const [dbFiles, uploadsFiles] = await Promise.all([
    readBackupFiles(resolve(base, "db"), "db"),
    readBackupFiles(resolve(base, "uploads"), "uploads"),
  ]);

  const entries = buildBackupEntries([...dbFiles, ...uploadsFiles]);
  if (input.limit != null && Number.isFinite(input.limit)) {
    return entries.slice(0, Math.max(0, input.limit));
  }
  return entries;
}

async function readBackupMeta(base: string): Promise<BackupMeta> {
  try {
    const raw = await readFile(resolve(base, "meta.json"), "utf-8");
    const parsed = JSON.parse(raw) as BackupMeta;
    if (parsed && typeof parsed === "object") return parsed;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      return {};
    }
  }
  return {};
}

async function writeBackupMeta(base: string, meta: BackupMeta): Promise<void> {
  await mkdir(base, { recursive: true });
  await writeFile(resolve(base, "meta.json"), JSON.stringify(meta, null, 2), "utf-8");
}

function buildMetaFromEntries(input: {
  clientSlug: string;
  projectSlug: string;
  entries: BackupEntry[];
  existing: BackupMeta;
}): BackupMeta {
  if (input.entries.length === 0) {
    return {
      ...input.existing,
      last_backup_at: null,
      last_backup_files: null,
    };
  }

  const latest = input.entries[0];
  const containerBase = `/var/www/backup/${input.clientSlug}/${input.projectSlug}`;
  const dbPath = latest.db ? `${containerBase}/${latest.db.path}` : null;
  const uploadsPath = latest.uploads ? `${containerBase}/${latest.uploads.path}` : null;
  const type = latest.db && latest.uploads ? "full" : latest.db ? "db" : "uploads";

  return {
    ...input.existing,
    last_backup_at: latest.createdAt,
    last_backup_files: {
      db: dbPath,
      uploads: uploadsPath,
      type,
    },
  };
}

export async function deleteProjectBackup(input: {
  clientSlug: string;
  projectSlug: string;
  stamp: string;
}): Promise<{ entries: BackupEntry[]; meta: BackupMeta; deleted: boolean }> {
  const base = resolve(BACKUPS_ROOT, input.clientSlug, input.projectSlug);
  const entries = await listProjectBackups({
    clientSlug: input.clientSlug,
    projectSlug: input.projectSlug,
  });
  const target = entries.find((entry) => entry.stamp === input.stamp);
  if (!target) {
    return { entries, meta: await readBackupMeta(base), deleted: false };
  }

  const toDelete = [target.db?.path, target.uploads?.path].filter(
    (value): value is string => Boolean(value),
  );

  for (const relative of toDelete) {
    const filePath = resolve(base, relative);
    try {
      await rm(filePath, { force: true });
    } catch {
      // ignore
    }
  }

  const nextEntries = entries.filter((entry) => entry.stamp !== input.stamp);
  const existingMeta = await readBackupMeta(base);
  const nextMeta = buildMetaFromEntries({
    clientSlug: input.clientSlug,
    projectSlug: input.projectSlug,
    entries: nextEntries,
    existing: existingMeta,
  });
  await writeBackupMeta(base, nextMeta);

  return { entries: nextEntries, meta: nextMeta, deleted: true };
}

export async function purgeProjectBackups(input: {
  clientSlug: string;
  projectSlug: string;
  keep?: number;
  maxAgeDays?: number;
}): Promise<{ entries: BackupEntry[]; meta: BackupMeta; removedCount: number }> {
  const base = resolve(BACKUPS_ROOT, input.clientSlug, input.projectSlug);
  const entries = await listProjectBackups({
    clientSlug: input.clientSlug,
    projectSlug: input.projectSlug,
  });

  const existingMeta = await readBackupMeta(base);
  const keep =
    input.keep ??
    (typeof existingMeta.last_backup_keep === "number"
      ? existingMeta.last_backup_keep
      : BACKUP_KEEP_DEFAULT);
  const maxAgeDays = input.maxAgeDays ?? BACKUP_RETENTION_DAYS;

  const { kept, removed } = applyBackupRetention({
    entries,
    keep,
    maxAgeDays,
  });

  for (const entry of removed) {
    const toDelete = [entry.db?.path, entry.uploads?.path].filter(
      (value): value is string => Boolean(value),
    );
    for (const relative of toDelete) {
      const filePath = resolve(base, relative);
      try {
        await rm(filePath, { force: true });
      } catch {
        // ignore
      }
    }
  }

  const nextMeta = buildMetaFromEntries({
    clientSlug: input.clientSlug,
    projectSlug: input.projectSlug,
    entries: kept,
    existing: existingMeta,
  });
  await writeBackupMeta(base, nextMeta);

  return { entries: kept, meta: nextMeta, removedCount: removed.length };
}