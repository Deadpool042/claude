import type { PrismaClient } from "@/generated/prisma/client";
import { TechStack } from "@/generated/prisma/client";
import { updateProjectSchema } from "@/lib/validators";
import { buildProjectDocIds, buildProjectDocRows } from "@/lib/docs/project-docs";
import {
  normalizeTaxonomySignalForProjectType,
  readPersistedTaxonomySignalDualSource,
  serializeQualificationCiAxesJson,
} from "@/lib/taxonomy";
import { computeLocalHost, computeNextPort, computeNextSlug } from "../domain/update-project.logic";
import type { TraefikService } from "./traefik-service";
import type { z } from "zod";

type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

type UpdateProjectResult =
  | { ok: true }
  | { ok: false; error: string };

export class ProjectService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly traefik: TraefikService,
  ) {}

  async updateProject(projectId: string, raw: unknown): Promise<UpdateProjectResult> {
    const parsed = updateProjectSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
    }

    const dto: UpdateProjectInput = parsed.data;

    const existing = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { runtime: true, qualification: true },
    });
    if (!existing) return { ok: false, error: "Projet introuvable." };

    const explicitTaxonomySignal = normalizeTaxonomySignalForProjectType(
      dto.type,
      dto.taxonomySignal ?? null,
    );
    const persistedTaxonomySignal = readPersistedTaxonomySignalDualSource({
      projectType: dto.type,
      taxonomySignal: existing.qualification?.taxonomySignal ?? null,
      ciAxesJson: existing.qualification?.ciAxesJson ?? null,
    });
    const stableTaxonomySignal = explicitTaxonomySignal ?? persistedTaxonomySignal;
    const ciAxesJson = serializeQualificationCiAxesJson({
      taxonomySignal: stableTaxonomySignal,
      previousCiAxesJson:
        dto.qualification?.ciAxesJson ??
        existing.qualification?.ciAxesJson ??
        null,
    });

    const slugInfo = await computeNextSlug(existing.slug, dto.name);

    const port = await computeNextPort({
      desiredPort: dto.runtime?.port ?? null,
      currentPort: existing.runtime?.port ?? null,
      projectId,
    });

    const localHost = computeLocalHost(slugInfo.slug);

    let projectDocRows: { docId: string; source: string }[] = [];
    try {
      const docIds = await buildProjectDocIds({
        techStack: dto.techStack ?? null,
        modulesJson: dto.qualification?.modules ?? null,
      });
      projectDocRows = buildProjectDocRows(docIds);
    } catch {
      projectDocRows = [];
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        if (slugInfo.changed) {
          const slugTaken = await tx.project.findUnique({ where: { slug: slugInfo.slug } });
          if (slugTaken) throw new Error(`Un projet avec le slug "${slugInfo.slug}" existe déjà.`);
        }

        await tx.project.update({
          where: { id: projectId },
          data: {
            name: dto.name,
            slug: slugInfo.slug,
            type: dto.type,
            status: dto.status,
            description: dto.description ?? null,
            domain: dto.domain ?? null,
            gitRepo: dto.gitRepo ?? null,
            techStack: dto.techStack ?? null,
            deployTarget: dto.deployTarget,
            category: dto.category ?? null, // ✅ enum ProjectCategory | null
          },
        });

        await tx.projectRuntime.upsert({
          where: { projectId },
          create: { projectId, port, localHost },
          update: { port, localHost },
        });

        await tx.projectQualification.upsert({
          where: { projectId },
          create: {
            projectId,
            modules: dto.qualification?.modules ?? null,
            maintenanceLevel: dto.qualification?.maintenanceLevel ?? null, // ✅ enum MaintenanceLevel | null
            estimatedBudget: dto.qualification?.estimatedBudget ?? null,
            trafficLevel: dto.qualification?.trafficLevel ?? null,
            productCount: dto.qualification?.productCount ?? null,
            dataSensitivity: dto.qualification?.dataSensitivity ?? null,
            scalabilityLevel: dto.qualification?.scalabilityLevel ?? null,
            needsEditing: dto.qualification?.needsEditing ?? null,
            editingFrequency: dto.qualification?.editingFrequency ?? null,
            headlessRequired: dto.qualification?.headlessRequired ?? null,
            commerceModel: dto.qualification?.commerceModel ?? null,
            ciScore: dto.qualification?.ciScore ?? null,
            ciCategory: dto.qualification?.ciCategory ?? null,
            ciAxesJson,
            taxonomySignal: stableTaxonomySignal,
          },
          update: {
            modules: dto.qualification?.modules ?? null,
            maintenanceLevel: dto.qualification?.maintenanceLevel ?? null, // ✅ enum MaintenanceLevel | null
            estimatedBudget: dto.qualification?.estimatedBudget ?? null,
            trafficLevel: dto.qualification?.trafficLevel ?? null,
            productCount: dto.qualification?.productCount ?? null,
            dataSensitivity: dto.qualification?.dataSensitivity ?? null,
            scalabilityLevel: dto.qualification?.scalabilityLevel ?? null,
            needsEditing: dto.qualification?.needsEditing ?? null,
            editingFrequency: dto.qualification?.editingFrequency ?? null,
            headlessRequired: dto.qualification?.headlessRequired ?? null,
            commerceModel: dto.qualification?.commerceModel ?? null,
            ciScore: dto.qualification?.ciScore ?? null,
            ciCategory: dto.qualification?.ciCategory ?? null,
            ciAxesJson,
            taxonomySignal: stableTaxonomySignal,
          },
        });

        await tx.projectDoc.deleteMany({
          where: { projectId, source: "AUTO" },
        });
        if (projectDocRows.length > 0) {
          await tx.projectDoc.createMany({
            data: projectDocRows.map((row) => ({
              projectId,
              ...row,
            })),
            skipDuplicates: true,
          });
        }

        const isWp = (dto.techStack ?? null) === TechStack.WORDPRESS;

        if (isWp) {
          const wpHeadless = dto.wpConfig?.wpHeadless ?? false;
          const frontendStack = wpHeadless ? (dto.wpConfig?.frontendStack ?? "NEXTJS") : null;

          await tx.wordpressConfig.upsert({
            where: { projectId },
            create: {
              projectId,
              phpVersion: dto.wpConfig?.phpVersion ?? "8.3",
              wpHeadless,
              frontendStack, // ✅ FrontendStack | null
            },
            update: {
              phpVersion: dto.wpConfig?.phpVersion ?? "8.3",
              wpHeadless,
              frontendStack, // ✅ FrontendStack | null
            },
          });
        } else {
          // optionnel: si tu veux nettoyer la config WP quand le stack n'est plus WP
          await tx.wordpressConfig.delete({ where: { projectId } }).catch(() => {});
        }
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      return { ok: false, error: msg };
    }

    try {
      await this.traefik.regenerate();
    } catch {
      // ignore
    }

    return { ok: true };
  }
}
