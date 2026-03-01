"use server";

import { redirect } from "next/navigation";
import { rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { prisma } from "@/lib/db";
import { generateTraefikConfig } from "@/lib/generators/traefik";

const execAsync = promisify(exec);
const CONFIGS_ROOT = resolve(process.cwd(), "..", "configs");
const PROJECTS_ROOT = resolve(process.cwd(), "..", "projects");
const BACKUPS_ROOT = resolve(process.cwd(), "..", "backup");

interface ActionState {
  error: string | null;
}

export async function deleteProjectAction(
  projectId: string,
  _prev: ActionState,
): Promise<ActionState> {
  // Phase 1: Gather project info (quick DB query)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: { select: { slug: true } } },
  });

  if (!project) {
    return { error: "Projet introuvable." };
  }

  const clientId = project.clientId;
  const clientSlug = (project.client as { slug: string }).slug;
  const projectDir = resolve(CONFIGS_ROOT, clientSlug, project.slug);
  const projectAssetsDir = resolve(PROJECTS_ROOT, clientSlug, project.slug);
  const projectBackupDir = resolve(BACKUPS_ROOT, clientSlug, project.slug);

  // Phase 2: Stop & remove Docker containers/volumes
  // Use -p <project-slug> so it works even if the compose file/directory is missing
  await stopProjectContainers(project.slug, projectDir);

  // Delete config directory
  try {
    await rm(projectDir, { recursive: true, force: true });
  } catch {
    // Non-fatal
  }

  // Delete project assets directory (wp-content, wp-config extras, etc.)
  try {
    await rm(projectAssetsDir, { recursive: true, force: true });
  } catch {
    // Non-fatal
  }

  try {
    await rm(projectBackupDir, { recursive: true, force: true });
  } catch {
    // Non-fatal
  }

  // Phase 3: DB delete (fresh connection after Docker cleanup)
  try {
    await prisma.project.delete({ where: { id: projectId } });
  } catch (e) {
    return { error: `Erreur suppression en base : ${e instanceof Error ? e.message : String(e)}` };
  }

  // Regenerate Traefik config since route was removed
  try {
    await generateTraefikConfig();
  } catch {
    // Non-fatal
  }

  redirect(`/dashboard/clients/${clientId}`);
}

/**
 * Stop and remove all Docker containers for a project.
 * Uses `-p <slug>` (project name) which works even without the compose file.
 * Falls back to `cwd`-based approach if directory still exists.
 */
export async function stopProjectContainers(
  projectSlug: string,
  projectDir: string,
): Promise<void> {
  const composeFiles = [
    "docker-compose.local.yml",
    "docker-compose.prod-like.yml",
    "docker-compose.prod.yml",
  ];

  const existingComposeFiles: string[] = [];
  for (const file of composeFiles) {
    const filePath = resolve(projectDir, file);
    try {
      const fileStat = await stat(filePath);
      if (fileStat.isFile()) existingComposeFiles.push(filePath);
    } catch {
      // ignore missing files
    }
  }

  try {
    // Primary: use -p flag (works even if compose files are gone)
    for (const filePath of existingComposeFiles) {
      await execAsync(
        `docker compose -p ${projectSlug} -f ${filePath} down -v --remove-orphans 2>/dev/null || true`,
        { timeout: 60_000 },
      );
    }

    await execAsync(
      `docker compose -p ${projectSlug} down -v --remove-orphans 2>/dev/null || true`,
      { timeout: 60_000 },
    );
  } catch {
    // Fallback: try with cwd if directory exists
    try {
      await execAsync(
        "docker compose down -v --remove-orphans 2>/dev/null || true",
        { cwd: projectDir, timeout: 60_000 },
      );
    } catch {
      // Containers might not exist — that's fine
    }
  }
}
