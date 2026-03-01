import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteProjectBackup, purgeProjectBackups } from "@/lib/backups";

function parseLimit(req: Request): number | null {
  const url = new URL(req.url);
  const raw = url.searchParams.get("limit");
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.floor(parsed);
  if (rounded <= 0) return null;
  return Math.min(rounded, 200);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      slug: true,
      client: { select: { slug: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  try {
    const result = await purgeProjectBackups({
      clientSlug: project.client.slug,
      projectSlug: project.slug,
    });
    const limit = parseLimit(req) ?? 30;
    const entries = result.entries.slice(0, Math.max(0, limit));
    return NextResponse.json({
      entries,
      meta: result.meta,
      purged: result.removedCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      slug: true,
      client: { select: { slug: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  const url = new URL(req.url);
  const stamp = url.searchParams.get("stamp");
  if (!stamp || !/^\d{8}-\d{6}$/.test(stamp)) {
    return NextResponse.json({ error: "Stamp invalide" }, { status: 400 });
  }

  try {
    const result = await deleteProjectBackup({
      clientSlug: project.client.slug,
      projectSlug: project.slug,
      stamp,
    });
    if (!result.deleted) {
      return NextResponse.json({ error: "Backup introuvable" }, { status: 404 });
    }
    return NextResponse.json({
      entries: result.entries,
      meta: result.meta,
      deleted: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
