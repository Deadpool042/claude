import { exec } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { access } from "node:fs/promises";
import { prisma } from "@/lib/db";
import { localHostForMode } from "@/lib/docker/names";

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

const execAsync = promisify(exec);
const CONFIGS_ROOT = resolve(process.cwd(), "..", "configs");

export const dynamic = "force-dynamic";

// ── Types ───────────────────────────────────────────────────────────────

interface DockerPsService {
  Service: string;
  State: string;
  Status: string;
  Health: string;
}

interface ProjectDockerStatus {
  projectId: string;
  projectName: string;
  slug: string;
  techStack: StackLiteral | null;
  port: number | null;
  host: string;
  status: "running" | "partial" | "stopped" | "no_compose" | "error";
  services: { name: string; label: string; state: string }[];
  runningCount: number;
  totalCount: number;
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

async function getProjectDockerStatus(project: NormalizedProject): Promise<ProjectDockerStatus> {
  const dir = resolve(CONFIGS_ROOT, project.clientSlug, project.slug);
  const host = project.domain ?? localHostForMode(project.clientSlug, project.slug, "dev");

  try {
    await access(resolve(dir, "docker-compose.local.yml"));
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
    "dev",
    project.deployTarget,
  );

  const expectedServices = expectedList.map((s) => ({ name: s.service, label: s.label }));

  try {
    const { stdout } = await execAsync("docker compose -f docker-compose.local.yml ps -a --format json", {
      cwd: dir,
      timeout: 8_000,
    });

    const lines = stdout.trim().split("\n").filter(Boolean);
    const dockerMap = new Map<string, DockerPsService>();

    for (const line of lines) {
      const svc = JSON.parse(line) as DockerPsService;
      dockerMap.set(svc.Service, svc);
    }

    const services = expectedServices.map((es) => {
      const docker = dockerMap.get(es.name);
      return { name: es.name, label: es.label, state: docker?.State ?? "not_created" };
    });

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
    return {
      projectId: project.id,
      projectName: project.name,
      slug: project.slug,
      techStack: project.techStack,
      port: project.port,
      host,
      status: "error",
      services: expectedServices.map((es) => ({ ...es, state: "unknown" })),
      runningCount: 0,
      totalCount: expectedServices.length,
    };
  }
}

// ── SSE endpoint ───────────────────────────────────────────────────────

export async function GET(req: Request): Promise<Response> {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let previousHash = "";
      let stopped = false;

      const send = (eventType: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // stream closed
        }
      };

      const poll = async () => {
        if (stopped) return;

        try {
          const projects = await prisma.project.findMany({
            where: { status: "ACTIVE" },
            select: {
              id: true,
              name: true,
              slug: true,
              techStack: true,
              domain: true,
              deployTarget: true,
              client: { select: { slug: true } },
              runtime: { select: { port: true } },
              // on prend uniquement ce dont on a besoin, et on normalise ensuite
              services: { where: { enabled: true }, select: { serviceId: true, enabled: true } },
              database: { select: { dbType: true } },
              wpConfig: { select: { wpHeadless: true, frontendStack: true } },
            },
            orderBy: { name: "asc" },
          });

          const normalized = projects.map((p) =>
            normalizeProject({
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
            }),
          );

          const statuses = await Promise.all(normalized.map(getProjectDockerStatus));

          const hash = JSON.stringify(statuses);
          if (hash !== previousHash) {
            previousHash = hash;
            send("status", { projects: statuses, ts: Date.now() });
          } else {
            send("heartbeat", { ts: Date.now() });
          }
        } catch {
          send("error", { message: "Erreur récupération statuts Docker", ts: Date.now() });
        }
      };

      void poll();
      const interval = setInterval(() => {
        void poll();
      }, 5_000);

      req.signal.addEventListener("abort", () => {
        stopped = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
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
