import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  LOG_TYPES,
  collectDockerLogs,
  collectTraefikAccessLogs,
  collectWpDebugLogs,
  envFromDevMode,
  purgeLogs,
  purgeLogsByFilters,
  readLogs,
} from "@/lib/logs";

const logLevelEnum = z.enum(["debug", "info", "warn", "error", "all"]);
const logEnvEnum = z.enum(["dev", "prod-like", "prod", "all"]);

const refreshSchema = z.object({
  action: z.literal("refresh"),
});

const purgeSchema = z.object({
  action: z.literal("purge"),
  env: logEnvEnum.optional(),
  types: z.array(z.string()).optional(),
});

const querySchema = z.object({
  action: z.literal("query"),
  date: z.string().min(10),
  types: z.array(z.string()).optional(),
  level: logLevelEnum.optional(),
  env: logEnvEnum.optional(),
  service: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(2000).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { projectId } = await params;
  const body = (await req.json()) as unknown;

  const refreshParsed = refreshSchema.safeParse(body);
  const purgeParsed = purgeSchema.safeParse(body);
  const parsed = refreshParsed.success
    ? refreshParsed
    : purgeParsed.success
      ? purgeParsed
      : querySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide", issues: parsed.error.issues }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      slug: true,
      techStack: true,
      devMode: true,
      domain: true,
      client: { select: { slug: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  const env = envFromDevMode(project.devMode);
  const base = {
    clientSlug: project.client.slug,
    projectSlug: project.slug,
    env,
    projectId,
  };

  if (parsed.data.action === "refresh") {
    const httpResult = await collectTraefikAccessLogs({ ...base, domain: project.domain });
    const dockerResult = await collectDockerLogs(base);
    const wpResult =
      project.techStack === "WORDPRESS" ? await collectWpDebugLogs(base) : { entries: 0 };
    await purgeLogs(base);

    return NextResponse.json({
      success: true,
      env,
      http: httpResult.entries,
      docker: dockerResult.entries,
      wordpress: wpResult.entries,
    });
  }

  if (parsed.data.action === "purge") {
    const types = (parsed.data.types ?? LOG_TYPES).filter((t) =>
      LOG_TYPES.includes(t as (typeof LOG_TYPES)[number]),
    );
    if (types.length === 0) return NextResponse.json({ purged: 0, files: 0 });

    const env = parsed.data.env ?? envFromDevMode(project.devMode);
    const result = await purgeLogsByFilters({
      clientSlug: project.client.slug,
      projectSlug: project.slug,
      env,
      types,
    });

    return NextResponse.json({
      success: true,
      env,
      purged: result.removed,
      files: result.files,
      types,
    });
  }

  const types = (parsed.data.types ?? LOG_TYPES).filter((t) =>
    LOG_TYPES.includes(t as (typeof LOG_TYPES)[number]),
  );
  if (types.length === 0) return NextResponse.json({ entries: [] });
  const logQuery: {
    clientSlug: string;
    projectSlug: string;
    date: string;
    types: string[];
    level: "all" | "debug" | "info" | "warn" | "error";
    env: "all" | "dev" | "prod-like" | "prod";
    service: string;
    search?: string;
    limit?: number;
  } = {
    clientSlug: project.client.slug,
    projectSlug: project.slug,
    date: parsed.data.date,
    types,
    level: parsed.data.level ?? "all",
    env: parsed.data.env ?? "all",
    service: parsed.data.service ?? "all",
  };
  if (parsed.data.search) logQuery.search = parsed.data.search;
  if (parsed.data.limit) logQuery.limit = parsed.data.limit;

  const entries = await readLogs(logQuery);

  return NextResponse.json({ entries });
}
