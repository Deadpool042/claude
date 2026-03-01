import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { INFRA_FEATURES, type WpInfraFeature } from "@/lib/wp-features";
import {
  INFRA_STATUS_VALUES,
  normalizeInfraStatus,
  parseInfraStatus,
  type WpInfraStatusValue,
} from "@/lib/wp-infra";

const INFRA_FEATURES_SET = new Set<WpInfraFeature>(INFRA_FEATURES);
const INFRA_STATUS_SET = new Set<WpInfraStatusValue>(INFRA_STATUS_VALUES);

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
  const payload = (await req.json()) as { feature?: string; status?: string };

  const feature = payload.feature as WpInfraFeature | undefined;
  const status = payload.status as WpInfraStatusValue | undefined;

  if (!feature || !INFRA_FEATURES_SET.has(feature)) {
    return NextResponse.json({ error: "Feature invalide" }, { status: 400 });
  }

  if (!status || !INFRA_STATUS_SET.has(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const wpConfig = await prisma.wordpressConfig.findUnique({
    where: { projectId },
    select: { wpInfraStatus: true },
  });

  if (!wpConfig) {
    return NextResponse.json({ error: "Projet WordPress introuvable" }, { status: 404 });
  }

  const parsed = parseInfraStatus(wpConfig.wpInfraStatus) ?? {};
  parsed[feature] = status;
  const normalized = normalizeInfraStatus(parsed).status;

  await prisma.wordpressConfig.update({
    where: { projectId },
    data: { wpInfraStatus: JSON.stringify(normalized) },
  });

  return NextResponse.json({ infraStatus: normalized });
}
