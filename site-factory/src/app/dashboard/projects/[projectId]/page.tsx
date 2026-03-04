import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/components/shell/page-layout";
import { BreadcrumbOverride } from "@/components/shell/breadcrumb-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  TECH_STACK_LABELS,
} from "@/lib/validators";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type Category,
} from "@/lib/referential";
import type { HostingProfileId } from "@/lib/hosting";
import type { HostingProviderId } from "@/lib/hosting";
import {
  ProjectTabs,
  TabOverview,
  TabCommercial,
  TabTechnique,
  TabDeployment,
  TabInfrastructure,
  TabServices,
  TabWordpress,
} from "@/features/dashboard/projects/detail";

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

function resolveThemeExpected(wpHeadless: boolean, wpTheme: string | null): string {
  if (wpHeadless) {
    if (!wpTheme || wpTheme === "sf-tt5" || wpTheme === "sf-block-theme") {
      return "twentytwentyfive";
    }
    return wpTheme;
  }

  return "sf-tt5";
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      runtime: true,
      database: true,
      wpConfig: true,
      nextConfig: true,
      qualification: true,
      services: { where: { enabled: true } },
    },
  });

  if (!project) {
    notFound();
  }

  const port = project.runtime?.port ?? null;
  const enabledServiceIds = project.services.map((s) => s.serviceId);
  const socleStatus =
    project.techStack === "WORDPRESS"
      ? (() => {
          const rawFeatures = project.wpConfig?.wpFeatures ?? null;
          let featuresCount = 0;
          if (rawFeatures) {
            try {
              const parsed = JSON.parse(rawFeatures) as unknown;
              if (Array.isArray(parsed)) featuresCount = parsed.length;
            } catch {
              featuresCount = 0;
            }
          }
          const status: "configured" | "missing" = rawFeatures ? "configured" : "missing";
          const themeExpected = resolveThemeExpected(
            project.wpConfig?.wpHeadless ?? false,
            project.wpConfig?.wpTheme ?? null,
          );
          return {
            status,
            featuresCount,
            theme: themeExpected,
            headless: project.wpConfig?.wpHeadless ?? false,
          };
        })()
      : null;

  return (
    <>
      <BreadcrumbOverride segments={{ [projectId]: project.name }} />
      <PageLayout
        title={project.name}
        description={`Slug : ${project.slug}`}
        toolbar={
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Button size="sm" variant="outline">
              <Pencil className="size-4" />
              Modifier
            </Button>
          </Link>
        }
      >
        {/* ── Header compact ─────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              project.status === "ACTIVE"
                ? "default"
                : project.status === "DRAFT"
                  ? "outline"
                  : "secondary"
            }
          >
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>

          <Badge variant="secondary">
            {PROJECT_TYPE_LABELS[project.type]}
          </Badge>

          {project.techStack && (
            <Badge variant="secondary">
              {TECH_STACK_LABELS[project.techStack]}
            </Badge>
          )}

          {project.category && (
            <Badge
              className={CATEGORY_COLORS[project.category as Category]}
            >
              {CATEGORY_LABELS[project.category as Category]}
            </Badge>
          )}

          <span className="text-sm text-muted-foreground">
            Client :{" "}
            <Link
              href={`/dashboard/clients/${project.clientId}`}
              className="text-primary hover:underline"
            >
              {project.client.name}
            </Link>
          </span>
        </div>

        {/* ── Tabs ───────────────────────────────────── */}
        <ProjectTabs
          overview={
            <TabOverview
              project={{
                id: project.id,
                slug: project.slug,
                clientSlug: project.client.slug,
                description: project.description,
                domain: project.domain,
                port,
                status: project.status,
                clientId: project.clientId,
                clientName: project.client.name,
                category: project.category,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                deployTarget: project.deployTarget,
              }}
              socleStatus={socleStatus}
              qualification={
                project.qualification
                  ? {
                      modules: project.qualification.modules,
                      maintenanceLevel: project.qualification.maintenanceLevel,
                      estimatedBudget: project.qualification.estimatedBudget,
                    }
                  : null
              }
              enabledServiceIds={enabledServiceIds}
            />
          }
          commercial={
            <TabCommercial
              project={{
                id: project.id,
                name: project.name,
                slug: project.slug,
                type: project.type,
                category: project.category,
                techStack: project.techStack,
                wpHeadless: project.wpConfig?.wpHeadless ?? false,
                deployTarget: project.deployTarget,
                description: project.description,
              }}
              client={{
                name: project.client.name,
                firstName: project.client.firstName,
                lastName: project.client.lastName,
                email: project.client.email,
                phone: project.client.phone,
              }}
              config={
                project.qualification
                  ? {
                      modules: project.qualification.modules,
                      maintenanceLevel: project.qualification.maintenanceLevel,
                      estimatedBudget: project.qualification.estimatedBudget,
                    }
                  : null
              }
            />
          }
          technique={
            <TabTechnique
              project={{
                slug: project.slug,
                clientSlug: project.client.slug,
                type: project.type,
                status: project.status,
                domain: project.domain,
                port,
                gitRepo: project.gitRepo,
                techStack: project.techStack,
                deployTarget: project.deployTarget,
              }}
              config={
                project.wpConfig
                  ? {
                      wpHeadless: project.wpConfig.wpHeadless,
                      frontendStack: project.wpConfig.frontendStack,
                    }
                  : null
              }
            />
          }
          deployment={
            <TabDeployment
              projectId={project.id}
              techStack={project.techStack}
              deployTarget={project.deployTarget}
              hostingProviderId={(project.hostingProviderId as HostingProviderId | null) ?? null}
            />
          }
          infrastructure={
            <TabInfrastructure
              projectId={project.id}
              techStack={project.techStack}
              deployTarget={project.deployTarget}
              devMode={project.devMode}
              database={
                project.database
                  ? {
                      dbType: project.database.dbType,
                      dbVersion: project.database.dbVersion,
                      dbName: project.database.dbName,
                      dbUser: project.database.dbUser,
                      dbPassword: project.database.dbPassword,
                    }
                  : null
              }
              wpConfig={
                project.wpConfig
                  ? {
                      phpVersion: project.wpConfig.phpVersion,
                      wpSiteTitle: project.wpConfig.wpSiteTitle,
                      wpAdminUser: project.wpConfig.wpAdminUser,
                      wpAdminPassword: project.wpConfig.wpAdminPassword,
                      wpAdminEmail: project.wpConfig.wpAdminEmail,
                    }
                  : null
              }
              nextConfig={
                project.nextConfig
                  ? {
                      nodeVersion: project.nextConfig.nodeVersion,
                      envVarsJson: project.nextConfig.envVarsJson,
                    }
                  : null
              }
              enabledServiceIds={enabledServiceIds}
            />
          }
          services={
            <TabServices
              projectId={project.id}
              projectSlug={project.slug}
              techStack={project.techStack}
              deployTarget={project.deployTarget}
            />
          }
          wordpress={
            project.techStack === "WORDPRESS" ? (
              <TabWordpress
                projectId={project.id}
                projectType={project.type}
                deployTarget={project.deployTarget}
                hostingProfileId={
                  (project.wpConfig?.hostingProfileId as HostingProfileId | null) ?? null
                }
                devMode={project.devMode}
              />
            ) : null
          }
        />
      </PageLayout>
    </>
  );
}
