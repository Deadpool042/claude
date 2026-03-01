import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  collectTraefikAccessLogs,
  envFromDevMode,
  readLogs,
  readTraefikAccessEntries,
} from "@/lib/logs";
import { resolveMonitoringProfile } from "@/lib/monitoring/config";
import { resolveDefaultHostingProfile } from "@/lib/projects/buildProjectCreateArgs";
import type { HostingProfileId } from "@/lib/hosting-profiles";
import type { MonitoringSnapshot } from "@/app/dashboard/projects/[projectId]/wordpress/_components/types";
import type { LogEnv } from "@/lib/logs";

type LogEntry = Awaited<ReturnType<typeof readLogs>>[number];

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index] ?? null;
}

function buildSnapshot(entries: LogEntry[], windowMinutes: number): MonitoringSnapshot {
  const total = entries.length;
  const statusCounts = { s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 };
  const durations: number[] = [];
  const routes = new Map<string, number>();
  let rate401 = 0;
  let rate403 = 0;
  let rate429 = 0;
  let loginFails = 0;
  let xmlrpcHits = 0;
  const bucketCount = Math.max(1, windowMinutes);
  const totalsPerMinute = Array.from({ length: bucketCount }, () => 0);
  const s5xxPerMinute = Array.from({ length: bucketCount }, () => 0);
  const durationBuckets: number[][] = Array.from({ length: bucketCount }, () => []);
  const startTs = Date.now() - windowMinutes * 60 * 1000;

  for (const entry of entries) {
    const meta = entry.meta ?? {};
    const status = parseNumber(meta.status);
    if (status !== null) {
      if (status >= 500) statusCounts.s5xx += 1;
      else if (status >= 400) statusCounts.s4xx += 1;
      else if (status >= 300) statusCounts.s3xx += 1;
      else statusCounts.s2xx += 1;

      if (status === 401) rate401 += 1;
      if (status === 403) rate403 += 1;
      if (status === 429) rate429 += 1;
    }

    const duration = parseNumber(meta.durationMs);
    if (duration !== null) durations.push(duration);

    const path = typeof meta.path === "string" ? meta.path : null;
    if (path) {
      routes.set(path, (routes.get(path) ?? 0) + 1);
      if (path.includes("/wp-login.php") && status && status >= 400) {
        loginFails += 1;
      }
      if (path.includes("/xmlrpc.php")) xmlrpcHits += 1;
    }

    const ts = Date.parse(entry.ts);
    if (!Number.isNaN(ts)) {
      const idx = Math.floor((ts - startTs) / 60000);
      if (idx >= 0 && idx < bucketCount) {
        totalsPerMinute[idx] += 1;
        if (status !== null && status >= 500) {
          s5xxPerMinute[idx] += 1;
        }
        if (duration !== null) {
          durationBuckets[idx].push(duration);
        }
      }
    }
  }

  const successRate =
    total > 0 ? ((total - statusCounts.s5xx) / total) * 100 : null;
  const errorRate5xx = total > 0 ? (statusCounts.s5xx / total) * 100 : null;
  const rate4xx = total > 0 ? (statusCounts.s4xx / total) * 100 : null;
  const p95Ms = percentile(durations, 95);
  const avgMs =
    durations.length > 0
      ? durations.reduce((sum, v) => sum + v, 0) / durations.length
      : null;

  const peak = totalsPerMinute.reduce((acc, value) => Math.max(acc, value), 0);
  const rpsAvg = total > 0 ? total / (windowMinutes * 60) : null;
  const rpsPeak = peak > 0 ? peak / 60 : null;

  const topRoutes = [...routes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([path, count]) => ({ path, count }));

  const successRateSeries = totalsPerMinute.map((count, idx) =>
    count > 0 ? ((count - s5xxPerMinute[idx]) / count) * 100 : null,
  );
  const errorRateSeries = totalsPerMinute.map((count, idx) =>
    count > 0 ? (s5xxPerMinute[idx] / count) * 100 : null,
  );
  const p95Series = durationBuckets.map((bucket) => percentile(bucket, 95));

  return {
    available: true,
    windowMinutes,
    generatedAt: new Date().toISOString(),
    series: {
      total: totalsPerMinute,
      successRate: successRateSeries,
      errorRate5xx: errorRateSeries,
      p95Ms: p95Series,
    },
    http: {
      total,
      successRate,
      errorRate5xx,
      p95Ms,
      avgMs,
      statusCounts,
    },
    traffic: {
      rpsAvg,
      rpsPeak,
      rate4xx,
      topRoutes,
    },
    security: {
      rate401: total > 0 ? (rate401 / total) * 100 : null,
      rate403: total > 0 ? (rate403 / total) * 100 : null,
      rate429: total > 0 ? (rate429 / total) * 100 : null,
      loginFails,
      xmlrpcHits,
    },
    mail: {
      note: "Non configure",
    },
  };
}

function parseEnvParam(req: Request): LogEnv | null {
  const url = new URL(req.url);
  const env = url.searchParams.get("env");
  if (env === "dev" || env === "prod-like" || env === "prod") return env;
  return null;
}

async function buildResponse(
  projectId: string,
  collect: boolean,
  requestedEnv: LogEnv | null,
): Promise<NextResponse> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      slug: true,
      devMode: true,
      domain: true,
      deployTarget: true,
      client: { select: { slug: true } },
      wpConfig: { select: { hostingProfileId: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  const env = requestedEnv ?? envFromDevMode(project.devMode);
  const hostingProfileId =
    (project.wpConfig?.hostingProfileId as HostingProfileId | null) ??
    resolveDefaultHostingProfile(project.deployTarget);
  const { windows } = resolveMonitoringProfile(hostingProfileId);
  if (env === "prod") {
    const emptySeries = {
      total: Array.from({ length: windows.httpMinutes }, () => 0),
      successRate: Array.from({ length: windows.httpMinutes }, () => null),
      errorRate5xx: Array.from({ length: windows.httpMinutes }, () => null),
      p95Ms: Array.from({ length: windows.httpMinutes }, () => null),
    };
    const snapshot: MonitoringSnapshot = {
      available: false,
      windowMinutes: windows.httpMinutes,
      generatedAt: new Date().toISOString(),
      series: emptySeries,
      http: {
        total: 0,
        successRate: null,
        errorRate5xx: null,
        p95Ms: null,
        avgMs: null,
        statusCounts: { s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
      },
      traffic: { rpsAvg: null, rpsPeak: null, rate4xx: null, topRoutes: [] },
      security: {
        rate401: null,
        rate403: null,
        rate429: null,
        loginFails: 0,
        xmlrpcHits: 0,
      },
      mail: { note: "Prod: source non branchee" },
    };
    return NextResponse.json({ snapshot });
  }

  if (collect) {
    await collectTraefikAccessLogs({
      clientSlug: project.client.slug,
      projectSlug: project.slug,
      env,
      projectId,
      domain: project.domain,
    });
  }

  const windowMinutes = windows.httpMinutes;
  const now = Date.now();
  const since = new Date(now - windowMinutes * 60 * 1000);
  const dates = new Set([
    new Date(now).toISOString().slice(0, 10),
    since.toISOString().slice(0, 10),
  ]);

  const entries: LogEntry[] = [];
  for (const date of dates) {
    const logs = await readLogs({
      clientSlug: project.client.slug,
      projectSlug: project.slug,
      date,
      types: ["http"],
      level: "all",
      env,
      service: "all",
      limit: 5000,
    });
    entries.push(...logs);
  }

  const filtered = entries.filter((entry) => {
    const ts = Date.parse(entry.ts);
    return !Number.isNaN(ts) && ts >= since.getTime();
  });

  let snapshotEntries = filtered;
  if (snapshotEntries.length === 0) {
    const fallback = await readTraefikAccessEntries({
      clientSlug: project.client.slug,
      projectSlug: project.slug,
      env,
      domain: project.domain ?? null,
      since,
    });
    if (fallback.length > 0) {
      snapshotEntries = fallback;
    }
  }

  const snapshot = buildSnapshot(snapshotEntries, windowMinutes);
  return NextResponse.json({ snapshot });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { projectId } = await params;
  return buildResponse(projectId, false, parseEnvParam(req));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { projectId } = await params;
  return buildResponse(projectId, true, parseEnvParam(req));
}
