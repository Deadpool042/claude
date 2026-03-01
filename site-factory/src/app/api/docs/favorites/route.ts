import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type FavoriteScope = "global" | "project";
type FavoriteAction = "add" | "remove";

interface FavoritePayload {
  docId?: string;
  scope?: FavoriteScope;
  projectId?: string | null;
  action?: FavoriteAction;
}

export async function POST(req: Request) {
  const body = (await req.json()) as FavoritePayload;
  const docId = typeof body.docId === "string" ? body.docId : "";
  const scope = body.scope === "project" ? "project" : "global";
  const action = body.action === "remove" ? "remove" : "add";
  const projectId =
    scope === "project" && typeof body.projectId === "string"
      ? body.projectId
      : null;

  if (!docId) {
    return NextResponse.json(
      { error: "docId manquant." },
      { status: 400 },
    );
  }

  if (scope === "project" && !projectId) {
    return NextResponse.json(
      { error: "projectId manquant." },
      { status: 400 },
    );
  }

  if (scope === "project" && projectId) {
    if (action === "add") {
      await prisma.projectDocFavorite.upsert({
        where: { projectId_docId: { projectId, docId } },
        update: {},
        create: { projectId, docId },
      });
    } else {
      await prisma.projectDocFavorite.deleteMany({
        where: { projectId, docId },
      });
    }
  } else {
    if (action === "add") {
      await prisma.globalDocFavorite.upsert({
        where: { docId },
        update: {},
        create: { docId },
      });
    } else {
      await prisma.globalDocFavorite.deleteMany({ where: { docId } });
    }
  }

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
