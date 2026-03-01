import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildProjectDocIds, buildProjectDocRows } from "@/lib/docs/project-docs";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      techStack: true,
      qualification: { select: { modules: true } },
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Projet introuvable." },
      { status: 404 },
    );
  }

  const docIds = await buildProjectDocIds({
    techStack: project.techStack ?? null,
    modulesJson: project.qualification?.modules ?? null,
  });

  await prisma.$transaction(async (tx) => {
    await tx.projectDoc.deleteMany({
      where: { projectId, source: "AUTO" },
    });
    if (docIds.length > 0) {
      const rows = buildProjectDocRows(docIds).map((row) => ({
        projectId,
        ...row,
      }));
      await tx.projectDoc.createMany({ data: rows, skipDuplicates: true });
    }
  });

  return NextResponse.json(
    { ok: true, count: docIds.length, docIds },
    { headers: { "Cache-Control": "no-store" } },
  );
}
