import { appendFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { DevMode, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { localHostForMode, localHostBase } from "@/lib/docker";

const execFileAsync = promisify(execFile);

const PROJECTS_ROOT = resolve(process.cwd(), "..", "projects");
const TRAEFIK_ACCESS_LOG = resolve(process.cwd(), "..", "infra", "traefik", "logs", "access.log");

export type LogEnv = "dev" | "prod-like" | "prod";
export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  ts: string;
  level: LogLevel;
  env: LogEnv;
  type: string;
  source: string;
  service?: string;
  message: string;
  meta?: Record<string, unknown>;
  raw?: string;
};

export const LOG_TYPES = [
  "maintenance",
  "http",
  "docker",
  "wordpress",
  "infra",
  "security",
  "audit",
] as const;

const PROJECT_ID_CACHE = new Map<string, string>();

const RETENTION_DAYS: Record<LogEnv, number> = {
  dev: 7,
  "prod-like": 14,
  prod: 30,
};

export function envFromDevMode(devMode?: DevMode | null): LogEnv {
  switch (devMode) {
    case "DEV_PROD_LIKE":
      return "prod-like";
    case "PROD":
      return "prod";
    case "DEV_COMFORT":
    default:
      return "dev";
  }
}

function logsRoot(clientSlug: string, projectSlug: string): string {
  return resolve(PROJECTS_ROOT, clientSlug, projectSlug, "logs");
}

function stateRoot(clientSlug: string, projectSlug: string): string {
  return resolve(logsRoot(clientSlug, projectSlug), ".state");
}

async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

function dateFromTs(ts: string): string {
  return ts.slice(0, 10);
}

function isoNow(): string {
  return new Date().toISOString();
}

function cacheKey(clientSlug: string, projectSlug: string): string {
  return `${clientSlug}/${projectSlug}`;
}

async function resolveProjectId(
  clientSlug: string,
  projectSlug: string,
): Promise<string | null> {
  const key = cacheKey(clientSlug, projectSlug);
  const cached = PROJECT_ID_CACHE.get(key);
  if (cached) return cached;

  const project = await prisma.project.findFirst({
    where: { slug: projectSlug, client: { slug: clientSlug } },
    select: { id: true },
  });
  if (!project) return null;
  PROJECT_ID_CACHE.set(key, project.id);
  return project.id;
}

function inferService(entry: LogEntry): string | null {
  if (entry.service) return entry.service;
  const metaService = entry.meta?.service;
  if (typeof metaService === "string" && metaService.trim()) return metaService;
  if (entry.source.startsWith("docker:")) return entry.source.slice("docker:".length);
  if (entry.source.startsWith("wp:")) return "wordpress";
  if (entry.type === "maintenance" || entry.type === "audit") return "site-factory";
  return null;
}

function normalizeEntry(entry: LogEntry): LogEntry {
  const service = inferService(entry);
  if (!service) return entry;
  return { ...entry, service };
}

function parseLevel(message: string): LogLevel {
  const lower = message.toLowerCase();
  if (lower.includes("fatal") || lower.includes("panic") || lower.includes("error")) return "error";
  if (lower.includes("warn")) return "warn";
  if (lower.includes("debug")) return "debug";
  return "info";
}

function extractTimestamp(line: string): { ts: string | null; rest: string } {
  const match = line.match(/^(\d{4}-\d{2}-\d{2}T[^\s]+)\s+(.*)$/);
  if (!match) return { ts: null, rest: line };
  return { ts: match[1], rest: match[2] ?? "" };
}

function parseDockerLine(line: string, fallbackService: string): { ts: string; message: string } {
  const { ts, rest } = extractTimestamp(line);
  const trimmed = rest || line;
  const pipeIndex = trimmed.indexOf("|");
  let message = trimmed;
  if (pipeIndex !== -1) {
    message = trimmed.slice(pipeIndex + 1).trim();
  } else if (trimmed.startsWith(fallbackService)) {
    message = trimmed.slice(fallbackService.length).trim();
  }
  return { ts: ts ?? isoNow(), message: message || line };
}

function parseWpDebugLine(line: string): { ts: string; message: string } {
  const match = line.match(/^\\[(.+?)\\]\\s*(.*)$/);
  if (!match) return { ts: isoNow(), message: line };
  const dateStr = match[1] ?? "";
  const parsed = new Date(dateStr);
  const ts = Number.isNaN(parsed.getTime()) ? isoNow() : parsed.toISOString();
  return { ts, message: match[2] ?? line };
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function coerceString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  return null;
}

function durationMsFrom(value: unknown): number | null {
  const numeric = coerceNumber(value);
  if (numeric === null) return null;
  if (numeric > 1_000_000) return Math.round(numeric / 1_000_000);
  return Math.round(numeric);
}

function statusLevel(status: number | null): LogLevel {
  if (!status) return "info";
  if (status >= 500) return "error";
  if (status >= 400) return "warn";
  return "info";
}

function normalizeTraefikService(service: string | null): string | null {
  if (!service) return null;
  return service.replace(/@docker$/i, "").replace(/@file$/i, "");
}

function parseTraefikTimestamp(payload: Record<string, unknown>): string {
  const raw =
    coerceString(payload.StartUTC) ??
    coerceString(payload.StartLocal) ??
    coerceString(payload.StartDate) ??
    coerceString(payload.start);
  if (!raw) return isoNow();
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? isoNow() : parsed.toISOString();
}

function normalizeHost(value: string): string {
  const trimmed = value.trim();
  const host = trimmed.includes("://") ? trimmed.split("://")[1] ?? trimmed : trimmed;
  return (host.split("/")[0]?.split(":")[0] ?? trimmed).toLowerCase();
}

function localRouteName(
  clientSlug: string,
  projectSlug: string,
  mode: "dev" | "prod-like",
): string {
  return `project-${localHostBase(clientSlug, projectSlug, mode)}`;
}

type TraefikAccessFilter = {
  allowedSet: Set<string>;
  allowedRoutesSet: Set<string>;
};

function buildTraefikAccessFilter(input: {
  clientSlug: string;
  projectSlug: string;
  env: LogEnv;
  domain?: string | null;
}): TraefikAccessFilter | null {
  if (input.env === "prod") return null;

  const allowedHosts: string[] = [];
  const allowedRoutes: string[] = [];
  if (input.env === "dev") {
    allowedHosts.push(localHostForMode(input.clientSlug, input.projectSlug, "dev"));
    allowedRoutes.push(localRouteName(input.clientSlug, input.projectSlug, "dev"));
  }
  if (input.env === "prod-like") {
    allowedHosts.push(localHostForMode(input.clientSlug, input.projectSlug, "prod-like"));
    allowedRoutes.push(localRouteName(input.clientSlug, input.projectSlug, "prod-like"));
  }
  if (input.env === "prod-like" && input.domain) {
    allowedHosts.push(input.domain);
  }
  if (allowedHosts.length === 0 && allowedRoutes.length === 0) return null;

  return {
    allowedSet: new Set(allowedHosts.map((h) => normalizeHost(h))),
    allowedRoutesSet: new Set(allowedRoutes.map((route) => route.toLowerCase())),
  };
}

function parseTraefikAccessEntry(
  payload: Record<string, unknown>,
  env: LogEnv,
  filter: TraefikAccessFilter,
): LogEntry | null {
  const rawHost =
    coerceString(payload.RequestHost) ??
    coerceString(payload.RequestAddr) ??
    coerceString(payload.Host);
  const host = rawHost ? normalizeHost(rawHost) : null;

  const serviceRaw = coerceString(payload.ServiceName);
  const serviceName = normalizeTraefikService(serviceRaw);
  const routerName = normalizeTraefikService(coerceString(payload.RouterName));
  const routeMatch =
    (routerName && filter.allowedRoutesSet.has(routerName.toLowerCase())) ||
    (serviceName && filter.allowedRoutesSet.has(serviceName.toLowerCase()));
  if (!routeMatch && (!host || !filter.allowedSet.has(host))) return null;

  const method = coerceString(payload.RequestMethod) ?? "GET";
  const path =
    coerceString(payload.RequestPath) ??
    coerceString(payload.RequestURI) ??
    "/";
  const status =
    coerceNumber(payload.DownstreamStatus) ?? coerceNumber(payload.OriginStatus);
  const durationMs =
    durationMsFrom(payload.Duration) ??
    durationMsFrom(payload.OriginDuration) ??
    durationMsFrom(payload.DownstreamDuration);
  const level = statusLevel(status);
  const ts = parseTraefikTimestamp(payload);

  const messageParts = [`${method} ${path}`];
  if (status) messageParts.push(String(status));
  if (durationMs !== null) messageParts.push(`${String(durationMs)}ms`);
  const message = messageParts.join(" ");

  const meta: Record<string, unknown> = {
    method,
    path,
    status,
    durationMs,
    host,
    scheme: coerceString(payload.RequestScheme),
    protocol: coerceString(payload.RequestProtocol),
    userAgent: coerceString(payload.UserAgent),
    clientIp: coerceString(payload.ClientHost) ?? coerceString(payload.ClientAddr),
    clientPort: coerceString(payload.ClientPort),
    requestAddr: coerceString(payload.RequestAddr),
    router: coerceString(payload.RouterName),
    service: serviceRaw,
    serviceAddr: coerceString(payload.ServiceAddr),
    bytesIn: coerceNumber(payload.RequestContentSize),
    bytesOut: coerceNumber(payload.DownstreamContentSize),
    originStatus: coerceNumber(payload.OriginStatus),
    originDurationMs: durationMsFrom(payload.OriginDuration),
    retryAttempts: coerceNumber(payload.RetryAttempts),
  };

  return {
    ts,
    level,
    env,
    type: "http",
    source: "traefik:access",
    message,
    meta,
    ...(serviceName ? { service: serviceName } : {}),
  };
}

async function appendLogIndex(input: {
  clientSlug: string;
  projectSlug: string;
  projectId?: string;
  entry: LogEntry;
}): Promise<void> {
  const projectId =
    input.projectId ?? (await resolveProjectId(input.clientSlug, input.projectSlug));
  if (!projectId) return;

  const parsedTs = new Date(input.entry.ts);
  const ts = Number.isNaN(parsedTs.getTime()) ? new Date() : parsedTs;
  const metaJson = input.entry.meta ? JSON.stringify(input.entry.meta) : null;

  await prisma.projectLog.create({
    data: {
      projectId,
      env: input.entry.env,
      type: input.entry.type,
      level: input.entry.level,
      service: input.entry.service ?? null,
      source: input.entry.source,
      message: input.entry.message,
      metaJson,
      ts,
    },
  });
}

async function appendLogEntry(
  clientSlug: string,
  projectSlug: string,
  entry: LogEntry,
  projectId?: string,
): Promise<void> {
  const normalized = normalizeEntry(entry);
  const root = logsRoot(clientSlug, projectSlug);
  const typeDir = resolve(root, normalized.type);
  await ensureDir(typeDir);
  await ensureDir(stateRoot(clientSlug, projectSlug));
  const file = resolve(typeDir, `${dateFromTs(normalized.ts)}.log.jsonl`);
  await appendFile(file, `${JSON.stringify(normalized)}\n`);

  try {
    const indexInput: {
      clientSlug: string;
      projectSlug: string;
      entry: LogEntry;
      projectId?: string;
    } = { clientSlug, projectSlug, entry: normalized };
    if (projectId) {
      indexInput.projectId = projectId;
    }
    await appendLogIndex(indexInput);
  } catch {
    // ignore db indexing errors
  }
}

async function readState(path: string): Promise<Record<string, unknown>> {
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function writeState(path: string, data: Record<string, unknown>): Promise<void> {
  await ensureDir(resolve(path, ".."));
  await writeFile(path, JSON.stringify(data, null, 2));
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function collectDockerLogs(input: {
  clientSlug: string;
  projectSlug: string;
  env: LogEnv;
  projectId?: string;
}): Promise<{ entries: number }> {
  if (input.env === "prod") return { entries: 0 };

  const configDir = resolve(process.cwd(), "..", "configs", input.clientSlug, input.projectSlug);
  const composeFile =
    input.env === "prod-like" ? "docker-compose.prod-like.yml" : "docker-compose.local.yml";
  const composePath = resolve(configDir, composeFile);
  if (!(await fileExists(composePath))) return { entries: 0 };

  const { stdout } = await execFileAsync(
    "docker",
    ["compose", "-f", composeFile, "config", "--services"],
    { cwd: configDir },
  );
  const services = stdout.split("\\n").map((s) => s.trim()).filter(Boolean);

  let total = 0;
  for (const service of services) {
    const statePath = resolve(stateRoot(input.clientSlug, input.projectSlug), `docker-${input.env}-${service}.json`);
    const state = await readState(statePath);
    const since = typeof state.lastTs === "string" ? state.lastTs : undefined;

    const args = ["compose", "-f", composeFile, "logs", "-t", "--no-color"];
    if (since) {
      args.push("--since", since);
    }
    args.push(service);

    let logOutput = "";
    try {
      const result = await execFileAsync("docker", args, {
        cwd: configDir,
        maxBuffer: 10 * 1024 * 1024,
      });
      logOutput = result.stdout ?? "";
    } catch {
      // ignore errors from missing services or no logs
      logOutput = "";
    }

    const lines = logOutput.split("\\n").map((l) => l.trim()).filter(Boolean);
    let latestTs = since ?? null;
    for (const line of lines) {
      const parsed = parseDockerLine(line, service);
      const entry: LogEntry = {
        ts: parsed.ts,
        level: parseLevel(parsed.message),
        env: input.env,
        type: "docker",
        source: `docker:${service}`,
        message: parsed.message,
        meta: { service },
        raw: line,
      };
      await appendLogEntry(input.clientSlug, input.projectSlug, entry, input.projectId);
      total += 1;
      latestTs = parsed.ts;
    }
    if (latestTs) {
      await writeState(statePath, { lastTs: latestTs });
    }
  }

  return { entries: total };
}

export async function collectWpDebugLogs(input: {
  clientSlug: string;
  projectSlug: string;
  env: LogEnv;
  projectId?: string;
}): Promise<{ entries: number }> {
  if (input.env === "prod") return { entries: 0 };

  const debugPath = resolve(
    PROJECTS_ROOT,
    input.clientSlug,
    input.projectSlug,
    "wp",
    "wp-content",
    "debug.log",
  );
  if (!(await fileExists(debugPath))) return { entries: 0 };

  const statePath = resolve(stateRoot(input.clientSlug, input.projectSlug), "wp-debug.json");
  const state = await readState(statePath);
  const offset = typeof state.offset === "number" ? state.offset : 0;
  const content = await readFile(debugPath);
  const slice = content.slice(offset).toString();
  if (!slice) return { entries: 0 };

  const lines = slice.split("\\n").map((l) => l.trim()).filter(Boolean);
  let count = 0;
  for (const line of lines) {
    const parsed = parseWpDebugLine(line);
    const entry: LogEntry = {
      ts: parsed.ts,
      level: parseLevel(parsed.message),
      env: input.env,
      type: "wordpress",
      source: "wp:debug",
      message: parsed.message,
      raw: line,
    };
    await appendLogEntry(input.clientSlug, input.projectSlug, entry, input.projectId);
    count += 1;
  }

  await writeState(statePath, { offset: content.length });
  return { entries: count };
}

export async function collectTraefikAccessLogs(input: {
  clientSlug: string;
  projectSlug: string;
  env: LogEnv;
  projectId?: string;
  domain?: string | null;
}): Promise<{ entries: number }> {
  if (input.env === "prod") return { entries: 0 };
  if (!(await fileExists(TRAEFIK_ACCESS_LOG))) return { entries: 0 };

  const filter = buildTraefikAccessFilter(input);
  if (!filter) return { entries: 0 };

  const statePath = resolve(
    stateRoot(input.clientSlug, input.projectSlug),
    `traefik-access-${input.env}.json`,
  );
  const state = await readState(statePath);
  const content = await readFile(TRAEFIK_ACCESS_LOG);
  let offset = typeof state.offset === "number" ? state.offset : 0;
  if (offset > content.length) offset = 0;
  const slice = content.slice(offset).toString();
  if (!slice) return { entries: 0 };

  const lines = slice.split("\\n").map((l) => l.trim()).filter(Boolean);
  let count = 0;
  for (const line of lines) {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    const entry = parseTraefikAccessEntry(payload, input.env, filter);
    if (!entry) continue;
    entry.raw = line;
    await appendLogEntry(input.clientSlug, input.projectSlug, entry, input.projectId);
    count += 1;
  }

  await writeState(statePath, { offset: content.length });
  return { entries: count };
}

export async function readTraefikAccessEntries(input: {
  clientSlug: string;
  projectSlug: string;
  env: LogEnv;
  domain?: string | null;
  since?: Date;
}): Promise<LogEntry[]> {
  if (input.env === "prod") return [];
  if (!(await fileExists(TRAEFIK_ACCESS_LOG))) return [];
  const filter = buildTraefikAccessFilter(input);
  if (!filter) return [];

  const content = await readFile(TRAEFIK_ACCESS_LOG);
  const lines = content.toString().split("\n").map((l) => l.trim()).filter(Boolean);
  const entries: LogEntry[] = [];
  for (const line of lines) {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    const entry = parseTraefikAccessEntry(payload, input.env, filter);
    if (!entry) continue;
    if (input.since) {
      const ts = Date.parse(entry.ts);
      if (Number.isNaN(ts) || ts < input.since.getTime()) continue;
    }
    entries.push(entry);
  }
  return entries;
}

export async function appendActionLog(input: {
  clientSlug: string;
  projectSlug: string;
  projectId?: string;
  env: LogEnv;
  type: string;
  level: LogLevel;
  source: string;
  message: string;
  meta?: Record<string, unknown>;
  raw?: string;
}): Promise<void> {
  const service =
    typeof input.meta?.service === "string" ? input.meta.service : undefined;
  const entry: LogEntry = {
    ts: isoNow(),
    level: input.level,
    env: input.env,
    type: input.type,
    source: input.source,
    message: input.message,
    ...(service ? { service } : {}),
    ...(input.meta ? { meta: input.meta } : {}),
    ...(input.raw ? { raw: input.raw } : {}),
  };
  await appendLogEntry(input.clientSlug, input.projectSlug, entry, input.projectId);
}

async function readLogsFromFiles(input: {
  clientSlug: string;
  projectSlug: string;
  date: string;
  types: string[];
  level?: LogLevel | "all";
  env?: LogEnv | "all";
  service?: string | "all";
  search?: string;
  limit?: number;
}): Promise<LogEntry[]> {
  const root = logsRoot(input.clientSlug, input.projectSlug);
  const entries: LogEntry[] = [];

  for (const type of input.types) {
    const file = resolve(root, type, `${input.date}.log.jsonl`);
    if (!(await fileExists(file))) continue;
    const raw = await readFile(file, "utf-8");
    const primaryLines = raw.includes("\n") ? raw.split("\n") : raw.split("\\n");
    const pushParsed = (line: string) => {
      if (!line.trim()) return;
      try {
        const parsed = JSON.parse(line) as LogEntry;
        const normalized = normalizeEntry(parsed);
        if (input.level && input.level !== "all" && normalized.level !== input.level) return;
        if (input.env && input.env !== "all" && normalized.env !== input.env) return;
        if (input.service && input.service !== "all") {
          if (!normalized.service || normalized.service !== input.service) return;
        }
        if (input.search) {
          const needle = input.search.toLowerCase();
          const hay = `${normalized.message} ${normalized.raw ?? ""}`.toLowerCase();
          if (!hay.includes(needle)) return;
        }
        entries.push(normalized);
      } catch {
        // ignore invalid lines
      }
    };

    for (const line of primaryLines) {
      if (!line.trim()) continue;
      try {
        pushParsed(line);
      } catch {
        // ignore
      }
      if (line.includes("\\n")) {
        for (const chunk of line.split("\\n")) {
          pushParsed(chunk);
        }
      }
    }
  }

  entries.sort((a, b) => b.ts.localeCompare(a.ts));
  if (input.limit && entries.length > input.limit) {
    return entries.slice(0, input.limit);
  }
  return entries;
}

async function readLogsFromDb(input: {
  clientSlug: string;
  projectSlug: string;
  date: string;
  types: string[];
  level?: LogLevel | "all";
  env?: LogEnv | "all";
  service?: string | "all";
  search?: string;
  limit?: number;
}): Promise<LogEntry[]> {
  const projectId = await resolveProjectId(input.clientSlug, input.projectSlug);
  if (!projectId) return [];

  const start = new Date(`${input.date}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const where: Prisma.ProjectLogWhereInput = {
    projectId,
    type: { in: input.types },
    ts: { gte: start, lt: end },
  };
  if (input.level && input.level !== "all") where.level = input.level;
  if (input.env && input.env !== "all") where.env = input.env;
  if (input.service && input.service !== "all") where.service = input.service;
  if (input.search) {
    where.message = { contains: input.search };
  }

  const rows = await prisma.projectLog.findMany({
    where,
    orderBy: { ts: "desc" },
    take: input.limit ?? 250,
  });

  return rows.map((row) => {
    let meta: Record<string, unknown> | undefined;
    if (row.metaJson) {
      try {
        meta = JSON.parse(row.metaJson) as Record<string, unknown>;
      } catch {
        meta = undefined;
      }
    }
    const entry: LogEntry = {
      ts: row.ts.toISOString(),
      level: row.level as LogLevel,
      env: row.env as LogEnv,
      type: row.type,
      source: row.source,
      message: row.message,
    };
    if (row.service) entry.service = row.service;
    if (meta) entry.meta = meta;
    return entry;
  });
}

export async function readLogs(input: {
  clientSlug: string;
  projectSlug: string;
  date: string;
  types: string[];
  level?: LogLevel | "all";
  env?: LogEnv | "all";
  service?: string | "all";
  search?: string;
  limit?: number;
}): Promise<LogEntry[]> {
  if (input.types.length === 0) return [];
  try {
    const dbEntries = await readLogsFromDb(input);
    if (dbEntries.length > 0) return dbEntries;
  } catch {
    // ignore db errors
  }
  return readLogsFromFiles(input);
}

export async function purgeLogs(input: {
  clientSlug: string;
  projectSlug: string;
  env: LogEnv;
}): Promise<void> {
  const root = logsRoot(input.clientSlug, input.projectSlug);
  const retention = RETENTION_DAYS[input.env];
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - retention);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  for (const type of LOG_TYPES) {
    const dir = resolve(root, type);
    if (!(await fileExists(dir))) continue;
    const files = await readdir(dir);
    for (const file of files) {
      const match = file.match(/^(\\d{4}-\\d{2}-\\d{2})\\.log\\.jsonl$/);
      if (!match) continue;
      const date = match[1];
      if (date < cutoffStr) {
        await writeFile(resolve(dir, file), "");
      }
    }
  }

  try {
    const projectId = await resolveProjectId(input.clientSlug, input.projectSlug);
    if (!projectId) return;
    await prisma.projectLog.deleteMany({
      where: {
        projectId,
        ts: { lt: cutoff },
      },
    });
  } catch {
    // ignore db purge errors
  }
}

export async function purgeLogsByFilters(input: {
  clientSlug: string;
  projectSlug: string;
  env?: LogEnv | "all";
  types?: string[];
}): Promise<{ removed: number; files: number }> {
  const env = input.env ?? "all";
  const types = (input.types ?? LOG_TYPES).filter((type) =>
    LOG_TYPES.includes(type as (typeof LOG_TYPES)[number]),
  );
  if (types.length === 0) return { removed: 0, files: 0 };

  const root = logsRoot(input.clientSlug, input.projectSlug);
  let removed = 0;
  let files = 0;

  for (const type of types) {
    const dir = resolve(root, type);
    if (!(await fileExists(dir))) continue;
    const entries = await readdir(dir);
    for (const file of entries) {
      const match = file.match(/^(\\d{4}-\\d{2}-\\d{2})\\.log\\.jsonl$/);
      if (!match) continue;
      const filePath = resolve(dir, file);
      const raw = await readFile(filePath, "utf-8");
      if (!raw.trim()) continue;
      const lines = raw.split(/\r?\n/).filter(Boolean);

      if (env === "all") {
        removed += lines.length;
        await writeFile(filePath, "");
        files += 1;
        continue;
      }

      const kept: string[] = [];
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line) as LogEntry;
          if (parsed.env === env) {
            removed += 1;
          } else {
            kept.push(line);
          }
        } catch {
          kept.push(line);
        }
      }

      if (kept.length !== lines.length) {
        files += 1;
        const nextContent = kept.length > 0 ? `${kept.join("\n")}\n` : "";
        await writeFile(filePath, nextContent);
      }
    }
  }

  try {
    const projectId = await resolveProjectId(input.clientSlug, input.projectSlug);
    if (!projectId) return { removed, files };
    const where: Prisma.ProjectLogWhereInput = {
      projectId,
      type: { in: types },
    };
    if (env !== "all") where.env = env;
    const result = await prisma.projectLog.deleteMany({ where });
    removed += result.count;
  } catch {
    // ignore db purge errors
  }

  return { removed, files };
}
