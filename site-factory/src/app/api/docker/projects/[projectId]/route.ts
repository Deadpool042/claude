// src/app/api/docker/projects/[projectId]/route.ts
import { NextResponse } from "next/server";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { access } from "node:fs/promises";
import { prisma } from "@/lib/db";
import { stackSlugForMode } from "@/lib/docker/names";
import { generateProjectWpThemeAssets } from "@/lib/projects/generateProjectWpThemeAssets";

import {
  buildExpectedServices,
  buildEnabledServiceIds,
  isOptionalServiceIdString,
  isDeployTargetLiteral,
  isStackLiteral,
  isDbTypeLiteral,
  isFrontendStackLiteral,
  type DeployTargetLiteral,
  type StackLiteral,
  type OptionalServiceId,
  type PersistedProjectServiceRow,
  type ExpectedService,
} from "@/lib/service-catalog";

import { DeployTarget, type FrontendStack } from "@/generated/prisma/client";
import { generateComposeFragment } from "@/lib/generators/compose";

// ─────────────────────────────────────────────────────────────────────────────
// Constants / helpers
// ─────────────────────────────────────────────────────────────────────────────

const execAsync = promisify(exec);
const CONFIGS_ROOT = resolve(process.cwd(), "..", "configs");

type ComposeMode = "dev" | "prod-like";

function parseModeFromUrl(url: string): ComposeMode {
  const u = new URL(url);
  return u.searchParams.get("mode") === "prod-like" ? "prod-like" : "dev";
}

function composeFileForMode(mode: ComposeMode): string {
  return mode === "prod-like" ? "docker-compose.prod-like.yml" : "docker-compose.local.yml";
}

function dockerCmdForMode(
  mode: ComposeMode,
  projectSlug: string,
): { mode: ComposeMode; composeFile: string; DC: string } {
  const composeFile = composeFileForMode(mode);
  const projectName = stackSlugForMode(projectSlug, mode);
  return { mode, composeFile, DC: `docker compose -p ${projectName} -f ${composeFile}` };
}

function safeTrim(s: unknown): string {
  return typeof s === "string" ? s.trim() : "";
}

function isStackService(name: string, stackSlug: string): boolean {
  return name === stackSlug || name.startsWith(`${stackSlug}-`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DockerPsService {
  Name: string;
  Service: string;
  State: string;
  Status: string;
  Publishers?: { PublishedPort: number; TargetPort: number; Protocol: string }[];
}

interface ProjectInfo {
  dir: string;
  slug: string;
  clientSlug: string;
  techStack: StackLiteral | null;
  deployTarget: DeployTargetLiteral;
  enabledIds: Set<OptionalServiceId>;
  dbType: "POSTGRESQL" | "MARIADB" | null;
  wpHeadless: boolean;
  frontendStack: FrontendStack | null;
}

async function getProjectInfo(projectId: string): Promise<ProjectInfo | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      slug: true,
      techStack: true,
      deployTarget: true,
      client: { select: { slug: true } },
      services: { select: { serviceId: true, enabled: true } },
      database: { select: { dbType: true } },
      wpConfig: { select: { wpHeadless: true, frontendStack: true } },
    },
  });

  if (!project) return null;

  const techStack = isStackLiteral(project.techStack) ? project.techStack : null;

  const deployTarget: DeployTargetLiteral = isDeployTargetLiteral(project.deployTarget)
    ? project.deployTarget
    : "DOCKER";

  const persistedRows: PersistedProjectServiceRow[] = project.services
    .filter(
      (s): s is { serviceId: OptionalServiceId; enabled: boolean } =>
        isOptionalServiceIdString(s.serviceId),
    )
    .map((s) => ({ serviceId: s.serviceId, enabled: s.enabled }));

  const enabledIds = buildEnabledServiceIds(persistedRows);

  const dbType = isDbTypeLiteral(project.database?.dbType) ? project.database!.dbType : null;

  const frontendStack = isFrontendStackLiteral(project.wpConfig?.frontendStack)
    ? project.wpConfig!.frontendStack
    : null;

  return {
    dir: resolve(CONFIGS_ROOT, project.client.slug, project.slug),
    slug: project.slug,
    clientSlug: project.client.slug,
    techStack,
    deployTarget,
    enabledIds,
    dbType,
    wpHeadless: project.wpConfig?.wpHeadless ?? false,
    frontendStack,
  };
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — list all expected services merged with Docker state
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { projectId } = await params;

  const info = await getProjectInfo(projectId);
  if (!info) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

  const { mode, composeFile, DC } = dockerCmdForMode(parseModeFromUrl(req.url), info.slug);

  const composePath = resolve(info.dir, composeFile);
  const composeExists = await fileExists(composePath);

  const services: ExpectedService[] = buildExpectedServices(
    info.slug,
    info.techStack,
    info.enabledIds,
    info.dbType,
    info.wpHeadless,
    info.frontendStack,
    mode,
    info.deployTarget,
  );

  if (!composeExists) {
    return NextResponse.json({ services, projectSlug: info.slug, composeExists });
  }

  try {
    const { stdout } = await execAsync(`${DC} ps -a --format json`, { cwd: info.dir });

    const lines = stdout.trim().split("\n").filter(Boolean);
    const dockerState = new Map<string, DockerPsService>();
    const otherStackSlug = stackSlugForMode(info.slug, mode === "dev" ? "prod-like" : "dev");

    for (const line of lines) {
      const svc = JSON.parse(line) as DockerPsService;
      if (isStackService(svc.Service, otherStackSlug)) continue;
      dockerState.set(svc.Service, svc);
    }

    for (const svc of services) {
      const docker = dockerState.get(svc.service);
      if (docker) {
        svc.state = docker.State;
        svc.status = docker.Status;
        svc.ports = (docker.Publishers ?? [])
          .filter((p) => p.PublishedPort > 0)
          .map((p) => `${String(p.PublishedPort)}:${String(p.TargetPort)}`);
        dockerState.delete(svc.service);
      }
    }

    // Add residues (containers not expected by config)
    for (const [, docker] of dockerState) {
      services.push({
        service: docker.Service,
        label: docker.Service,
        state: docker.State,
        status: docker.Status,
        ports: (docker.Publishers ?? [])
          .filter((p) => p.PublishedPort > 0)
          .map((p) => `${String(p.PublishedPort)}:${String(p.TargetPort)}`),
        description: "Service non configuré (résidu)",
        expected: false,
      });
    }
  } catch {
    // docker compose ps can fail when nothing exists yet / daemon not ready
  }

  return NextResponse.json({ services, projectSlug: info.slug, composeExists });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — perform actions (up, stop, restart, down, logs, generate, cleanup)
// ZERO AMBIGUITY: always uses compose file based on ?mode=dev|prod-like
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { projectId } = await params;

  const info = await getProjectInfo(projectId);
  if (!info) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

  const { mode, composeFile, DC } = dockerCmdForMode(parseModeFromUrl(req.url), info.slug);
  const composePath = resolve(info.dir, composeFile);

  const body = (await req.json()) as { action?: string; service?: string };
  const action = safeTrim(body.action);
  const service = safeTrim(body.service);
  const svcArg = service ? service : "";

  const validActions = [
    "up",
    "stop",
    "restart",
    "down",
    "logs",
    "generate",
    "down-clean",
    "prune",
  ] as const;

  if (!validActions.includes(action as (typeof validActions)[number])) {
    return NextResponse.json(
      { error: `Action invalide. Valeurs possibles : ${validActions.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    // ── Generate compose files (local + prod-like) ────────────────────
    // Note: generator should NOT write docker-compose.yml if you want
    // true "zero ambiguity". (Fix in the generator.)
    if (action === "generate") {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          client: true,
          runtime: true,
          database: true,
          wpConfig: true,
          nextConfig: true,
          services: true,
        },
      });

      if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

      const port = project.runtime?.port;
      if (port == null) return NextResponse.json({ error: "Port non configuré" }, { status: 400 });

      const enabledServiceIds = new Set<OptionalServiceId>(
        project.services
          .filter((s) => s.enabled)
          .map((s) => s.serviceId)
          .filter((id): id is OptionalServiceId => isOptionalServiceIdString(id)),
      );

      const deployTargetEnum = project.deployTarget ?? DeployTarget.DOCKER;

      await generateComposeFragment(
        {
          projectSlug: project.slug,
          clientSlug: project.client.slug,
          port,
          domain: project.domain,
          type: project.type,
          techStack: project.techStack,
          deployTarget: deployTargetEnum,
          devMode: project.devMode,
          enabledServiceIds,
          database: project.database
            ? {
                dbType: project.database.dbType,
                dbVersion: project.database.dbVersion,
                dbName: project.database.dbName,
                dbUser: project.database.dbUser,
                dbPassword: project.database.dbPassword,
              }
            : null,
          wpConfig: project.wpConfig
            ? {
                phpVersion: project.wpConfig.phpVersion,
                wpHeadless: project.wpConfig.wpHeadless,
                frontendStack: project.wpConfig.frontendStack,
                wpSiteTitle: project.wpConfig.wpSiteTitle,
                wpAdminUser: project.wpConfig.wpAdminUser,
                wpAdminPassword: project.wpConfig.wpAdminPassword,
                wpAdminEmail: project.wpConfig.wpAdminEmail,
                wpPermalinkStructure: project.wpConfig.wpPermalinkStructure,
                wpDefaultPages: project.wpConfig.wpDefaultPages,
                wpPlugins: project.wpConfig.wpPlugins,
                wpTheme: project.wpConfig.wpTheme,
              }
            : null,
          nextConfig: project.nextConfig
            ? {
                nodeVersion: project.nextConfig.nodeVersion,
                envVarsJson: project.nextConfig.envVarsJson,
              }
            : null,
        },
        { modes: [mode] },
      );

      return NextResponse.json({
        success: true,
        message: `${composeFile} généré`,
      });
    }

  // ── For all other actions, ensure compose exists for requested mode ─
  const exists = await fileExists(composePath);
  if (!exists) {
    return NextResponse.json(
        {
          error: `Compose introuvable pour mode="${mode}". Générez d'abord : ${composeFile}`,
          composeFile,
        },
        { status: 409 },
    );
  }

  if ((action === "up" || action === "restart") && info.techStack === "WORDPRESS") {
    try {
      await generateProjectWpThemeAssets({
        clientSlug: info.clientSlug,
        projectSlug: info.slug,
        includeTheme: !info.wpHeadless,
      });
    } catch (e: unknown) {
      console.error("Failed to sync WP theme assets:", info.slug, e);
    }
  }

  // ── Destructive cleanup per mode ──────────────────────────────────
  if (action === "down-clean") {
      const { stdout, stderr } = await execAsync(
        `${DC} down -v --rmi all --remove-orphans`,
        { cwd: info.dir, timeout: 120_000 },
      );
      return NextResponse.json({
        success: true,
        action: "down-clean",
        mode,
        composeFile,
        message: "Conteneurs, volumes et images supprimés",
        output: stdout || stderr,
      });
    }

    if (action === "prune") {
      const results: string[] = [];

      // remove containers for THIS compose file
      try {
        const { stdout } = await execAsync(`${DC} rm -f -s -v`, { cwd: info.dir, timeout: 30_000 });
        if (stdout.trim()) results.push(stdout.trim());
      } catch {
        // ignore
      }

      return NextResponse.json({
        success: true,
        action: "prune",
        mode,
        composeFile,
        message: "Ressources Docker inutilisées nettoyées",
        output: results.join("\n"),
      });
    }

    // ── Logs ──────────────────────────────────────────────────────────
    if (action === "logs") {
      const { stdout, stderr } = await execAsync(
        `${DC} logs ${svcArg} --tail 100 --no-color`,
        { cwd: info.dir, timeout: 10_000 },
      );
      return NextResponse.json({ logs: stdout || stderr, mode, composeFile });
    }

    // ── Standard actions ──────────────────────────────────────────────
    const commands: Record<string, string> = {
      up: `${DC} up -d ${svcArg}`,
      stop: `${DC} stop ${svcArg}`,
      restart: `${DC} restart ${svcArg}`,
      down: `${DC} down`,
    };

    const command = commands[action];
    if (!command) {
      return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
    }

    const { stdout, stderr } = await execAsync(command, { cwd: info.dir, timeout: 60_000 });

    return NextResponse.json({
      success: true,
      action,
      mode,
      composeFile,
      service: service || "all",
      output: stdout || stderr,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: message, mode: parseModeFromUrl(req.url) },
      { status: 500 },
    );
  }
}
