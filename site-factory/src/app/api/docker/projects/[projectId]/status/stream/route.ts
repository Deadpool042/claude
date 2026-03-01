//src/app/api/docker/projects/[projectId]/status/stream/route.ts
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { access } from "node:fs/promises";
import { prisma } from "@/lib/db";
import { localHostForMode, stackSlugForMode } from "@/lib/docker/names";

import {
  buildExpectedServices,
  buildEnabledServiceIds,
  isDeployTargetLiteral,
  isStackLiteral,
  isDbTypeLiteral,
  isFrontendStackLiteral,
  isOptionalServiceIdString,
  type DeployTargetLiteral,
  type StackLiteral,
  type OptionalServiceId,
  type PersistedProjectServiceRow,
} from "@/lib/service-catalog";
import type { ServiceInfo } from "@/app/dashboard/projects/[projectId]/services/_components/services-orchestrator";

const execAsync = promisify(exec);
const CONFIGS_ROOT = resolve(process.cwd(), "..", "configs");

export const dynamic = "force-dynamic";

// ── Types ───────────────────────────────────────────────────────────────

interface DockerPsService {
  Service: string;
  State: string;
  Status: string;
  // Health: string;
  Publishers?: { PublishedPort: number; TargetPort: number; Protocol: string }[];
}

interface ProjectDockerStatus {
  projectId: string;
  projectName: string;
  slug: string;
  techStack: StackLiteral | null;
  port: number | null;
  host: string;
  status: "running" | "partial" | "stopped" | "no_compose" | "error";
  services: ServiceInfo[];
  runningCount: number;
  totalCount: number;
}

function isStackService(name: string, stackSlug: string): boolean {
  return name === stackSlug || name.startsWith(`${stackSlug}-`);
}

type NormalizedProject = {
  id: string;
  name: string;
  slug: string;
  techStack: StackLiteral | null;
  port: number | null;
  domain: string | null;
  deployTarget: DeployTargetLiteral;
  clientSlug: string;

  enabledIds: Set<OptionalServiceId>;
  dbType: "POSTGRESQL" | "MARIADB" | null;

  wpHeadless: boolean;
  frontendStack: "NEXTJS" | "NUXT" | "ASTRO" | null;
};

function parseMode(req: Request): "dev" | "prod-like" {
  const url = new URL(req.url);
  return url.searchParams.get("mode") === "prod-like" ? "prod-like" : "dev";
}

function composeFileForMode(mode: "dev" | "prod-like"): string {
  return mode === "prod-like" ? "docker-compose.prod-like.yml" : "docker-compose.local.yml";
}

// ── Normalization ──────────────────────────────────────────────────────

function normalizeEnabledRows(
  rows: { serviceId: string; enabled: boolean }[],
): PersistedProjectServiceRow[] {
  return rows
    .filter(
      (s): s is { serviceId: OptionalServiceId; enabled: boolean } =>
        isOptionalServiceIdString(s.serviceId),
    )
    .map((s) => ({ serviceId: s.serviceId, enabled: s.enabled }));
}

function normalizeProject(p: {
  id: string;
  name: string;
  slug: string;
  techStack: string | null;
  domain: string | null;
  deployTarget: string | null;
  client: { slug: string };
  runtime: { port: number | null } | null;
  services: { serviceId: string; enabled: boolean }[];
  database: { dbType: string | null } | null;
  wpConfig: { wpHeadless: boolean; frontendStack: string | null } | null;
}): NormalizedProject {
  const techStack = isStackLiteral(p.techStack) ? p.techStack : null;

  const deployTarget: DeployTargetLiteral =
    isDeployTargetLiteral(p.deployTarget) ? p.deployTarget : "DOCKER";

  const persisted = normalizeEnabledRows(p.services);
  const enabledIds = buildEnabledServiceIds(persisted);

  const dbType = isDbTypeLiteral(p.database?.dbType) ? p.database!.dbType : null;

  const frontendStack = isFrontendStackLiteral(p.wpConfig?.frontendStack)
    ? p.wpConfig!.frontendStack
    : null;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    techStack,
    port: p.runtime?.port ?? null,
    domain: p.domain,
    deployTarget,
    clientSlug: p.client.slug,
    enabledIds,
    dbType,
    wpHeadless: p.wpConfig?.wpHeadless ?? false,
    frontendStack,
  };
}

// ── Docker status ──────────────────────────────────────────────────────

async function getProjectDockerStatus(
  project: NormalizedProject,
  mode: "dev" | "prod-like",
): Promise<ProjectDockerStatus> {

  const dir = resolve(CONFIGS_ROOT, project.clientSlug, project.slug);
  const host = project.domain ?? localHostForMode(project.clientSlug, project.slug, mode);

  const composeFile = composeFileForMode(mode);

  const projectName = stackSlugForMode(project.slug, mode);
  const DC = `docker compose -p ${projectName} -f ${composeFile}`;

  try {
    await access(resolve(dir, composeFile));
  } catch {
    return {
      projectId: project.id,
      projectName: project.name,
      slug: project.slug,
      techStack: project.techStack,
      port: project.port,
      host,
      status: "no_compose",
      services: [],
      runningCount: 0,
      totalCount: 0,
    };
  }

  const expectedList = buildExpectedServices(
    project.slug,
    project.techStack,
    project.enabledIds,
    project.dbType,
    project.wpHeadless,
    project.frontendStack,
    mode, // 🔥 IMPORTANT
    project.deployTarget,
  );

  const services: ServiceInfo[] = expectedList.map((s) => ({
    service: s.service,
    label: s.label,
    state: "not_created",
    status: "",
    ports: [],
    description: s.description ?? "",
    expected: s.expected ?? true,
  }));

  try {
    const { stdout } = await execAsync(
      `${DC} ps -a --format json`,
      { cwd: dir, timeout: 8_000 },
    );

    const lines = stdout.trim().split("\n").filter(Boolean);
    const dockerMap = new Map<string, DockerPsService>();
    const otherStackSlug = stackSlugForMode(project.slug, mode === "dev" ? "prod-like" : "dev");

    for (const line of lines) {
      const svc = JSON.parse(line) as DockerPsService;
      if (isStackService(svc.Service, otherStackSlug)) continue;
      dockerMap.set(svc.Service, svc);
    }

    for (const s of services) {
      const docker = dockerMap.get(s.service);
      if (!docker) continue;

      s.state = docker.State;
      s.status = docker.Status;

      s.ports = (docker.Publishers ?? [])
        .filter((p) => Number.isFinite(p.PublishedPort) && p.PublishedPort > 0)
        .map((p) => `${p.PublishedPort}:${p.TargetPort}`);

      dockerMap.delete(s.service);
    }

    for (const docker of dockerMap.values()) {
      services.push({
        service: docker.Service,
        label: docker.Service,
        state: docker.State,
        status: docker.Status,
        ports: (docker.Publishers ?? [])
          .filter((p) => Number.isFinite(p.PublishedPort) && p.PublishedPort > 0)
          .map((p) => `${p.PublishedPort}:${p.TargetPort}`),
        description: "Service non configuré (résidu)",
        expected: false,
      });
    }

    const runningCount = services.filter((s) => s.state === "running").length;
    const totalCount = services.length;

    let status: ProjectDockerStatus["status"] = "stopped";
    if (runningCount === totalCount && totalCount > 0) status = "running";
    else if (runningCount > 0) status = "partial";

    return {
      projectId: project.id,
      projectName: project.name,
      slug: project.slug,
      techStack: project.techStack,
      port: project.port,
      host,
      status,
      services,
      runningCount,
      totalCount,
    };
  } catch {
    const fallback = services.map((s) => ({ ...s, state: "unknown" }));
    return {
      projectId: project.id,
      projectName: project.name,
      slug: project.slug,
      techStack: project.techStack,
      port: project.port,
      host,
      status: "error",
      services: fallback,
      runningCount: 0,
      totalCount: fallback.length,
    };
  }

}

// ── SSE endpoint ───────────────────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<Response> {
  const { projectId } = await params;
  const mode = parseMode(req);

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let previousHash = "";
      let stopped = false;

      const send = (eventType: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          // stream closed
        }
      };

      const poll = async () => {
        if (stopped) return;

        try {
          const p = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
              id: true,
              name: true,
              slug: true,
              techStack: true,
              domain: true,
              deployTarget: true,
              client: { select: { slug: true } },
              runtime: { select: { port: true } },
              services: { where: { enabled: true }, select: { serviceId: true, enabled: true } },
              database: { select: { dbType: true } },
              wpConfig: { select: { wpHeadless: true, frontendStack: true } },
            },
          });

          if (!p) {
            send("error", { message: "Projet introuvable", ts: Date.now() });
            return;
          }

          const normalized = normalizeProject({
            id: p.id,
            name: p.name,
            slug: p.slug,
            techStack: p.techStack as string | null,
            domain: p.domain,
            deployTarget: (p.deployTarget as unknown as string | null) ?? null,
            client: p.client,
            runtime: p.runtime ? { port: p.runtime.port ?? null } : null,
            services: p.services.map((s) => ({ serviceId: s.serviceId as string, enabled: s.enabled })),
            database: p.database ? { dbType: p.database.dbType as string | null } : null,
            wpConfig: p.wpConfig
              ? { wpHeadless: p.wpConfig.wpHeadless, frontendStack: p.wpConfig.frontendStack as string | null }
              : null,
          });

          const status = await getProjectDockerStatus(normalized, mode);

          const hash = JSON.stringify(status);
          if (hash !== previousHash) {
            previousHash = hash;

            // ⬇️ IMPORTANT: payload "project", pas "projects"
            send("status", { project: status, ts: Date.now() });
          } else {
            send("heartbeat", { ts: Date.now() });
          }
        } catch {
          send("error", { message: "Erreur récupération statut Docker", ts: Date.now() });
        }
      };

      void poll();
      const interval = setInterval(() => void poll(), 5_000);

      req.signal.addEventListener("abort", () => {
        stopped = true;
        clearInterval(interval);
        try { controller.close(); } catch {
          // intentionally ignored
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
