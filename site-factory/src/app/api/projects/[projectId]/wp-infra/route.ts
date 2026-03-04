import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { INFRA_FEATURES } from "@/lib/wp";
import {
  INFRA_STATUS_VALUES,
  normalizeInfraStatus,
  parseInfraStatus,
} from "@/lib/wp";

const wpInfraUpdateSchema = z.object({
  feature: z.enum(INFRA_FEATURES),
  status: z.enum(INFRA_STATUS_VALUES),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { projectId } = await params;

  const wpConfig = await prisma.wordpressConfig.findUnique({
    where: { projectId },
    select: { wpInfraStatus: true },
  });

  if (!wpConfig) {
    return NextResponse.json({ error: "Projet WordPress introuvable" }, { status: 404 });
  }

  const infraStatus = normalizeInfraStatus(parseInfraStatus(wpConfig.wpInfraStatus)).status;
  return NextResponse.json({ infraStatus });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { projectId } = await params;
  const body: unknown = await req.json();
  const parsed = wpInfraUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides" },
      { status: 400 },
    );
  }

  const { feature, status } = parsed.data;

  const wpConfig = await prisma.wordpressConfig.findUnique({
    where: { projectId },
    select: { wpInfraStatus: true },
  });

  if (!wpConfig) {
    return NextResponse.json({ error: "Projet WordPress introuvable" }, { status: 404 });
  }

  const currentStatus = parseInfraStatus(wpConfig.wpInfraStatus) ?? {};
  currentStatus[feature] = status;
  const normalized = normalizeInfraStatus(currentStatus).status;

  await prisma.wordpressConfig.update({
    where: { projectId },
    data: { wpInfraStatus: JSON.stringify(normalized) },
  });

  return NextResponse.json({ infraStatus: normalized });
}
