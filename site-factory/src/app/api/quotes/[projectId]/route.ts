// src/app/api/quotes/[projectId]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalizeModuleIds } from "@/lib/referential";
import { generateQuotePdf } from "@/lib/quote-pdf";

const modulesJsonSchema = z.array(z.string()).catch([]); // modules stockés en JSON string

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      status: true,
      description: true,
      techStack: true,
      deployTarget: true,
      domain: true,
      category: true,
      wpConfig: {
        select: {
          wpHeadless: true,
        },
      },
      client: {
        select: {
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      qualification: {
        select: {
          modules: true,
          maintenanceLevel: true,
          estimatedBudget: true,
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  const modules = normalizeModuleIds(
    modulesJsonSchema.parse(
      project.qualification?.modules ? safeJsonParse(project.qualification.modules) : [],
    ),
  );

  const pdfBuffer = Buffer.from(
    generateQuotePdf({
      project: {
        name: project.name,
        slug: project.slug,
        type: project.type,
        category: project.category ?? null,
        techStack: project.techStack,
        wpHeadless: project.wpConfig?.wpHeadless ?? null,
        deployTarget: project.deployTarget,
        description: project.description ?? null,
      },
      client: {
        name: project.client?.name ?? "Client",
        firstName: project.client?.firstName ?? null,
        lastName: project.client?.lastName ?? null,
        email: project.client?.email ?? null,
        phone: project.client?.phone ?? null,
      },
      config: {
        modules: JSON.stringify(modules),
        maintenanceLevel: project.qualification?.maintenanceLevel ?? null,
        estimatedBudget: project.qualification?.estimatedBudget ?? null,
      },
    }),
  );

  const filename = `devis-${project.slug ?? project.id}.pdf`;

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "X-Filename": filename,
    },
  });
}

function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return [];
  }
}
