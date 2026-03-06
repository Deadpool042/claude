import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/shared/components/shell/page-layout";
import { BreadcrumbOverride } from "@/shared/providers/breadcrumb-context";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  TECH_STACK_LABELS,
} from "@/lib/validators";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  normalizeModuleIds,
  type Category,
} from "@/lib/referential";
import type { HostingProfileId } from "@/lib/hosting";
import type { HostingProviderId } from "@/lib/hosting";
import {
  CANONICAL_TAXONOMY_LABELS,
  TAXONOMY_SIGNAL_LABELS,
  mapLegacyProjectTypeToCanonicalTaxonomy,
  readPersistedTaxonomySignalDualSource,
  resolveLegacyOfferCategoryFromProjectType,
  resolveTaxonomySignalFromRuntimeContext,
} from "@/lib/taxonomy";
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

function resolveOfferStackParam(input: {
  techStack: string | null;
  projectFamily: string | null;
  wpHeadless: boolean;
}): string | null {
  if (input.techStack === "WORDPRESS") {
    if (input.projectFamily === "COMMERCE_HEADLESS") return "WOOCOMMERCE_HEADLESS";
    if (input.projectFamily === "COMMERCE_SELF_HOSTED") return "WOOCOMMERCE";
    return input.wpHeadless ? "WORDPRESS_HEADLESS" : "WORDPRESS";
  }
  if (input.techStack === "NEXTJS") return "NEXTJS";
  if (input.techStack === "NUXT") return "NUXT";
  if (input.techStack === "ASTRO") return "ASTRO";
  return null;
}

function resolveOfferDeploymentParam(deployTarget: string): string | null {
  if (deployTarget === "DOCKER") return "docker_vps";
  if (deployTarget === "VERCEL") return "vercel";
  if (deployTarget === "SHARED_HOSTING") return "shared";
  return null;
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
  const taxonomySignalResolution = resolveTaxonomySignalFromRuntimeContext({
    projectType: project.type,
    persistedSignal: readPersistedTaxonomySignalDualSource({
      projectType: project.type,
      taxonomySignal: project.qualification?.taxonomySignal ?? null,
      ciAxesJson: project.qualification?.ciAxesJson ?? null,
    }),
    category: project.category,
    modulesJson: project.qualification?.modules ?? null,
    trafficLevel: project.qualification?.trafficLevel ?? null,
    needsEditing: project.qualification?.needsEditing ?? null,
    dataSensitivity: project.qualification?.dataSensitivity ?? null,
    scalabilityLevel: project.qualification?.scalabilityLevel ?? null,
    backendFamily: project.qualification?.backendFamily ?? null,
    backendOpsHeavy: project.qualification?.backendOpsHeavy ?? null,
  });
  const canonicalTaxonomy = mapLegacyProjectTypeToCanonicalTaxonomy(
    project.type,
    taxonomySignalResolution.signal,
  ).target;

  const wizardParams = new URLSearchParams({
    clientId: project.clientId,
    name: project.name,
    description: project.description ?? "",
    domain: project.domain ?? "",
    gitRepo: project.gitRepo ?? "",
  });
  const offerProjectType = resolveLegacyOfferCategoryFromProjectType(project.type);
  if (offerProjectType) {
    wizardParams.set("offerProjectType", offerProjectType);
  }
  const offerStackParam = resolveOfferStackParam({
    techStack: project.techStack,
    projectFamily: project.projectFamily,
    wpHeadless: project.wpConfig?.wpHeadless ?? false,
  });
  if (offerStackParam) {
    wizardParams.set("offerStack", offerStackParam);
  }
  const offerDeploymentParam = resolveOfferDeploymentParam(project.deployTarget);
  if (offerDeploymentParam) {
    wizardParams.set("offerDeployment", offerDeploymentParam);
  }
  const offerModulesParam = (() => {
    const raw = project.qualification?.modules ?? null;
    if (!raw) return "";
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return "";
      const moduleIds = normalizeModuleIds(parsed.map((value) => String(value)));
      return moduleIds.join(",");
    } catch {
      return "";
    }
  })();
  if (offerModulesParam) {
    wizardParams.set("offerModules", offerModulesParam);
  }
  if (taxonomySignalResolution.signal) {
    wizardParams.set("taxonomySignal", taxonomySignalResolution.signal);
  }
  const wizardEditHref = `/dashboard/projects/new?${wizardParams.toString()}`;

  return (
    <>
      <BreadcrumbOverride segments={{ [projectId]: project.name }} />
      <PageLayout
        title={project.name}
        description={`Slug : ${project.slug}`}
        toolbar={
          <div className="flex items-center gap-2">
            <Link href={wizardEditHref}>
              <Button size="sm" variant="secondary">
                Réouvrir wizard
              </Button>
            </Link>
            <Link href={`/dashboard/projects/${project.id}/edit`}>
              <Button size="sm" variant="outline">
                <Pencil className="size-4" />
                Modifier
              </Button>
            </Link>
          </div>
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

          {canonicalTaxonomy && (
            <Badge variant="secondary">
              {CANONICAL_TAXONOMY_LABELS[canonicalTaxonomy]}
            </Badge>
          )}

          {taxonomySignalResolution.signal && (
            <Badge variant="outline">
              {TAXONOMY_SIGNAL_LABELS[taxonomySignalResolution.signal]}
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
              taxonomy={{
                signal: taxonomySignalResolution.signal,
                signalSource: taxonomySignalResolution.source,
                canonicalTaxonomy,
              }}
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
              taxonomy={{
                signal: taxonomySignalResolution.signal,
                signalSource: taxonomySignalResolution.source,
                canonicalTaxonomy,
              }}
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
