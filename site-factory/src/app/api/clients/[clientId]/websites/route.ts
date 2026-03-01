import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const websiteSchema = z.object({
  label: z
    .string()
    .min(1, "Le label est requis")
    .max(100, "Le label ne doit pas dépasser 100 caractères"),
  url: z.string().url("URL invalide"),
});

const deleteSchema = z.object({
  id: z.string().min(1, "ID requis"),
});

type RouteParams = { params: Promise<{ clientId: string }> };

export async function GET(
  _req: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { clientId } = await params;

  const websites = await prisma.clientWebsite.findMany({
    where: { clientId },
    orderBy: { label: "asc" },
  });

  return NextResponse.json(websites);
}

export async function POST(
  req: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { clientId } = await params;
  const body: unknown = await req.json();
  const parsed = websiteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides" },
      { status: 400 },
    );
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return NextResponse.json(
      { error: "Client introuvable" },
      { status: 404 },
    );
  }

  const website = await prisma.clientWebsite.create({
    data: {
      clientId,
      label: parsed.data.label,
      url: parsed.data.url,
    },
  });

  return NextResponse.json(website, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { clientId } = await params;
  const body: unknown = await req.json();
  const parsed = deleteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "ID du website requis" },
      { status: 400 },
    );
  }

  await prisma.clientWebsite.deleteMany({
    where: { id: parsed.data.id, clientId },
  });

  return NextResponse.json({ success: true });
}
