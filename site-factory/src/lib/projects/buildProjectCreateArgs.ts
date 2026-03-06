// src/lib/projects/builders/buildProjectCreateArgs.ts

import type { HostingProfileId } from "@/lib/hosting";
import type { DeployTargetLiteral } from "@/lib/services";
import { resolveHostingProviderForDeployTarget } from "@/lib/hosting";
import {
  DeployTarget,
  FrontendStack,
  TechStack,
  DbType,
  type Prisma,
} from "@/generated/prisma/client";

import { getPresetForType, serializePresetPages } from "@/lib/wp";
import { resolveWpPlugins, serializeResolvedPlugins } from "@/lib/wp";
import { buildDefaultInfraStatus } from "@/lib/wp";
import { isImplementationSupported, resolveCmsIdFromImplementation } from "@/lib/project-choices";

import type { CreateProjectData, DeployTargetInput, TechStackInput } from "../validators/project";
import { buildDefaultOptionalServiceRows } from "../services";

// ── Prisma include ────────────────────────────────────────────────────

export const projectInclude = {
  runtime: true,
  database: true,
  wpConfig: true,
  nextConfig: true,
  services: true,
} satisfies Prisma.ProjectInclude;

export type CreatedProject = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

export type ProjectCreateArgsWithInclude = Omit<Prisma.ProjectCreateArgs, "include"> & {
  include: typeof projectInclude;
};

export type BuiltProject = {
  createArgs: ProjectCreateArgsWithInclude;
  techStack: TechStack | null;
  deployTarget: DeployTarget;
};

// ── Hosting profile defaults ──────────────────────────────────────────

export function resolveDefaultHostingProfile(deployTarget: DeployTarget): HostingProfileId {
  switch (deployTarget) {
    case DeployTarget.DOCKER:
      return "VPS_SELF_HOSTED";
    case DeployTarget.SHARED_HOSTING:
      return "SHARED_STANDARD";
    case DeployTarget.VERCEL:
      return "WP_MANAGED_GENERIC";
    default:
      return "SHARED_STANDARD";
  }
}

// ── Parsers (form + validator values) ─────────────────────────────────

function parseFrontendStack(v: FormDataEntryValue | null): FrontendStack {
  const s = typeof v === "string" ? v : "";
  if (s === FrontendStack.NEXTJS) return FrontendStack.NEXTJS;
  if (s === FrontendStack.NUXT) return FrontendStack.NUXT;
  if (s === FrontendStack.ASTRO) return FrontendStack.ASTRO;
  return FrontendStack.NEXTJS;
}

function parseDeployTarget(v: DeployTargetInput): DeployTarget {
  return DeployTarget[v];
}

function parseTechStack(v: TechStackInput | undefined): TechStack | null {
  if (!v) return null;
  return TechStack[v];
}

// ── Service defaults (NO hardcoded rows) ───────────────────────────────
//
// Rules:
// - ProjectDatabase is the DB source of truth → do NOT persist DB services in ProjectService.
// - We still want some default optional rows so UI can show switches with saved state.
// - Default optional rows are derived from SERVICE_CATALOG (recommendedFor + targets + env + stacks)
//   and can be overridden later with defaultEnabled/defaultFor if you set them.



// ── Input type ─────────────────────────────────────────────────────────

export type BuildProjectInput = {
  formData: FormData;
  slug: string;
  port: number;

  // On reste volontairement “large” ici pour ne pas coupler à Zod infer.
  // Le server action te passe parsed.data.
  data: CreateProjectData;
};

// ── Builder ───────────────────────────────────────────────────────────

export function buildProjectCreateArgs(input: BuildProjectInput): BuiltProject {
  const { formData, slug, port, data } = input;
  const resolvedImplementationId =
    data.projectImplementationId ??
    resolveCmsIdFromImplementation(data.projectImplementation ?? null, data.projectImplementationLabel ?? "");

  const implementationSupported = data.projectImplementation
    ? isImplementationSupported(data.projectImplementation)
    : false;
  const techStack = implementationSupported ? parseTechStack(data.techStack) : null;
  const deployTarget = parseDeployTarget(data.deployTarget);

  const isWp = techStack === TechStack.WORDPRESS;
  const isNext = techStack === TechStack.NEXTJS;

  const wpHeadless = formData.get("wpHeadless") === "true";
  const hostingProviderIdRaw = (formData.get("hostingProviderId") as string) || null;
  const deployTargetLiteral = deployTarget as unknown as DeployTargetLiteral;
  const hostingProvider = resolveHostingProviderForDeployTarget(hostingProviderIdRaw, deployTargetLiteral);
  const hostingProfileId = hostingProvider.profileId as HostingProfileId;

  const wpPreset = isWp ? getPresetForType(data.type) : null;
  const wpResolved =
    isWp && wpPreset ? resolveWpPlugins(wpPreset.features, { profileId: hostingProfileId }) : null;

  const wpPluginsJson = wpResolved ? serializeResolvedPlugins(wpResolved.plugins) : null;
  const wpPagesJson = wpPreset ? serializePresetPages(wpPreset.pages) : null;
  const wpTheme = wpHeadless ? wpPreset?.theme ?? "twentytwentyfive" : "sf-tt5";
  const wpInfraStatusJson = isWp ? JSON.stringify(buildDefaultInfraStatus()) : null;

  const runtimeCreate: Prisma.ProjectRuntimeCreateNestedOneWithoutProjectInput = {
    create: { port, localHost: `${slug}.localhost` },
  };

  const databaseCreate: Prisma.ProjectDatabaseCreateNestedOneWithoutProjectInput | undefined =
    isWp || isNext
      ? {
          create: {
            dbType: isWp ? DbType.MARIADB : DbType.POSTGRESQL,
            dbVersion: isWp ? "11" : "17",
            dbName: isWp ? `wp_${slug.replace(/-/g, "_")}` : null,
            dbUser: isWp ? "wordpress" : null,
            dbPassword: isWp ? "wordpress" : null,
          },
        }
      : undefined;

  const wpConfigCreate: Prisma.WordpressConfigCreateNestedOneWithoutProjectInput | undefined =
    isWp
      ? {
          create: {
            phpVersion: "8.3",
            hostingProfileId,
            wpFeatures: wpPreset ? JSON.stringify(wpPreset.features) : null,
            wpInfraStatus: wpInfraStatusJson,
            wpHeadless,
            frontendStack: wpHeadless ? parseFrontendStack(formData.get("frontendStack")) : null,

            wpSiteTitle: data.name,
            wpAdminUser: "admin",
            wpAdminPassword: "admin",
            wpAdminEmail: "admin@example.com",

            wpPermalinkStructure: wpPreset?.permalink ?? "/%postname%/",
            wpTheme,
            wpDefaultPages: wpPagesJson,
            wpPlugins: wpPluginsJson,
          },
        }
      : undefined;

  const nextConfigCreate: Prisma.NextjsConfigCreateNestedOneWithoutProjectInput | undefined =
    isNext ? { create: { nodeVersion: "22" } } : undefined;

  const qualificationCreate: Prisma.ProjectQualificationCreateNestedOneWithoutProjectInput = {
    create: {
      modules: data.qualification?.modules ?? null,
      maintenanceLevel: data.qualification?.maintenanceLevel ?? null,
      estimatedBudget: data.qualification?.estimatedBudget ?? null,
      trafficLevel: data.qualification?.trafficLevel ?? null,
      productCount: data.qualification?.productCount ?? null,
      dataSensitivity: data.qualification?.dataSensitivity ?? null,
      scalabilityLevel: data.qualification?.scalabilityLevel ?? null,
      needsEditing: data.qualification?.needsEditing ?? null,
      editingFrequency: data.qualification?.editingFrequency ?? null,
      headlessRequired: data.qualification?.headlessRequired ?? null,
      commerceModel: data.qualification?.commerceModel ?? null,
      backendFamily: data.qualification?.backendFamily ?? null,
      backendOpsHeavy: data.qualification?.backendOpsHeavy ?? null,
      ciScore: data.qualification?.ciScore ?? null,
      ciCategory: data.qualification?.ciCategory ?? null,
      ciAxesJson: data.qualification?.ciAxesJson ?? null,
      taxonomySignal: data.taxonomySignal ?? null,
    },
  };

  // ✅ Optional services are persisted; DB is not.
  // We create a deterministic set of rows (disabled by default unless catalog specifies otherwise).
  const serviceRows = buildDefaultOptionalServiceRows({
    techStack,
    deployTarget,
    devMode: data.devMode ?? "DEV_COMFORT", // si ton form le fournit
  });

  const createArgs = {
    data: {
      name: data.name,
      slug,
      clientId: data.clientId,
      type: data.type,
      category: data.category ?? null,
      description: data.description ?? null,
      domain: data.domain ?? null,
      gitRepo: data.gitRepo ?? null,
      techStack,
      deployTarget,
      hostingProviderId: hostingProvider.id,
      hostingTarget: data.hostingTarget ?? null,
      hostingTargetBack: data.hostingTargetBack ?? null,
      hostingTargetFront: data.hostingTargetFront ?? null,
      projectFamily: data.projectFamily ?? null,
      projectImplementation: data.projectImplementation ?? null,
      projectImplementationId: resolvedImplementationId ?? null,
      projectImplementationLabel: data.projectImplementationLabel ?? null,
      projectFrontendImplementation: data.projectFrontendImplementation ?? null,
      projectFrontendImplementationLabel: data.projectFrontendImplementationLabel ?? null,
      status: "ACTIVE",
      runtime: runtimeCreate,
      ...(databaseCreate ? { database: databaseCreate } : {}),
      ...(wpConfigCreate ? { wpConfig: wpConfigCreate } : {}),
      ...(nextConfigCreate ? { nextConfig: nextConfigCreate } : {}),
      qualification: qualificationCreate,

      ...(serviceRows.length > 0
        ? {
            services: {
              create: serviceRows.map((r) => ({
                serviceId: r.serviceId,
                enabled: r.enabled,
                optionsJson: r.optionsJson ?? null,
              })),
            },
          }
        : {}),
    },
    include: projectInclude,
  } satisfies ProjectCreateArgsWithInclude;

  return { createArgs, techStack, deployTarget };
}
