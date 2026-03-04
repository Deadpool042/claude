"use server";

import { redirect } from "next/navigation";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { prisma } from "@/lib/db";
import { generateTraefikConfig } from "@/lib/generators/traefik";
import { stopProjectContainers } from "@/features/dashboard/projects/server-actions";

const CONFIGS_ROOT = resolve(process.cwd(), "..", "configs");

interface ActionState {
  error: string | null;
}

export async function deleteClientAction(
  clientId: string,
  _prev: ActionState,
): Promise<ActionState> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      projects: { select: { slug: true } },
      _count: { select: { projects: true } },
    },
  });

  if (!client) {
    return { error: "Client introuvable." };
  }

  // 1. Stopper & supprimer les containers Docker pour chaque projet AVANT de supprimer les fichiers
  for (const project of client.projects) {
    const projectDir = resolve(CONFIGS_ROOT, client.slug, project.slug);
    await stopProjectContainers(project.slug, projectDir);
  }

  // 2. Supprimer le dossier de config du client (tous les projets d'un coup)
  const clientDir = resolve(CONFIGS_ROOT, client.slug);
  try {
    await rm(clientDir, { recursive: true, force: true });
  } catch {
    // Non-fatal
  }

  // 3. Supprimer le client en base (cascade sur les projets + sub-models)
  try {
    await prisma.client.delete({ where: { id: clientId } });
  } catch (err) {
    return { error: "Erreur lors de la suppression du client en base : " + (err instanceof Error ? err.message : String(err)) };
  }

  // 4. Regénérer la config Traefik si besoin
  if (client._count.projects > 0) {
    try {
      await generateTraefikConfig();
    } catch {
      // Non-fatal
    }
  }

  redirect("/dashboard/clients");
}
