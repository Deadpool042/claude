import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { devModeEnum } from "@/lib/validators/project";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { projectId } = await params;
  const body = (await req.json()) as { devMode?: string };
  const parsed = devModeEnum.safeParse(body.devMode);

  if (!parsed.success) {
    return NextResponse.json({ error: "Mode invalide" }, { status: 400 });
  }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { devMode: parsed.data },
    });
  } catch {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}/wordpress`);

  return NextResponse.json({ success: true, devMode: parsed.data });
}
