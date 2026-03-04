"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { generateComposeFragment } from "@/lib/generators/compose";
import { generateTraefikConfig } from "@/lib/generators/traefik";
import { resolveWpPlugins, serializeResolvedPlugins } from "@/lib/wp";
import { resolveHostingProviderForDeployTarget } from "@/lib/hosting";
import { devModeEnum } from "@/lib/validators";
import type { DbType } from "@/generated/prisma/client";
import type { DeployTargetLiteral } from "@/lib/services";
import type { HostingProfileId } from "@/lib/hosting";
import type { WpFeature } from "@/lib/wp";

interface ActionState {
  error: string | null;
  success?: boolean;
}

export async function updateProjectConfigAction(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      slug: true,
      domain: true,
      type: true,
      devMode: true,
      techStack: true,
      deployTarget: true,
      hostingProviderId: true,
      client: { select: { slug: true } },
      runtime: { select: { port: true } },
      wpConfig: {
        select: {
          wpFeatures: true,
          wpPlugins: true,
          wpPermalinkStructure: true,
          wpDefaultPages: true,
          wpTheme: true,
          wpHeadless: true,
          frontendStack: true,
          hostingProfileId: true,
          excludeFreemium: true,
        },
      },
    },
  });

  if (!project) {
    return { error: "Projet introuvable." };
  }

  const isWordpress = project.techStack === "WORDPRESS";
  const slugForDb = project.slug.replace(/-/g, "_");

  // ── Parse form data ─────────────────────────────────────────────────

  const nodeVersion = (formData.get("nodeVersion") as string) || "22";
  const phpVersion = (formData.get("phpVersion") as string) || "8.3";
  const dbType = (formData.get("dbType") as string) || "MARIADB";
  const dbVersion = (formData.get("dbVersion") as string) || (dbType === "POSTGRESQL" ? "17" : "11");
  const envVarsRaw = (formData.get("envVarsJson") as string) || null;
  const composeModeRaw = formData.get("composeMode");
  const composeMode =
    composeModeRaw === "prod-like" || composeModeRaw === "prod" ? composeModeRaw : "dev";
  const devModeRaw = formData.get("devMode");
  const parsedDevMode = devModeEnum.safeParse(devModeRaw);
  const devMode = parsedDevMode.success ? parsedDevMode.data : project.devMode ?? "DEV_COMFORT";

  const dbName = (formData.get("dbName") as string) || (isWordpress ? `wp_${slugForDb}` : null);
  const dbUser = (formData.get("dbUser") as string) || (isWordpress ? "wordpress" : null);
  const dbPassword = (formData.get("dbPassword") as string) || (isWordpress ? "wordpress" : null);

  // WordPress admin fields
  const wpSiteTitle = (formData.get("wpSiteTitle") as string) || null;
  const wpAdminUser = (formData.get("wpAdminUser") as string) || (isWordpress ? "admin" : null);
  const wpAdminPassword = (formData.get("wpAdminPassword") as string) || (isWordpress ? "admin" : null);
  const wpAdminEmail = (formData.get("wpAdminEmail") as string) || (isWordpress ? "admin@example.com" : null);

  // WordPress hosting profile + freemium preference
  const deployTargetLiteral = project.deployTarget as unknown as DeployTargetLiteral;
  const hostingProvider = resolveHostingProviderForDeployTarget(
    project.hostingProviderId,
    deployTargetLiteral,
  );
  const hostingProfileId = hostingProvider.profileId as HostingProfileId;
  const excludeFreemium = formData.get("excludeFreemium") === "on";

  // Validate envVarsJson if provided
  if (envVarsRaw) {
    try {
      JSON.parse(envVarsRaw);
    } catch {
      return { error: "Le JSON des variables d'environnement est invalide." };
    }
  }

  // ── Parse enabled services from form ────────────────────────────────
  const enabledServiceIds: string[] = [];
  const servicesRaw = formData.get("enabledServices");
  if (typeof servicesRaw === "string" && servicesRaw.trim()) {
    enabledServiceIds.push(...servicesRaw.split(",").map((s) => s.trim()).filter(Boolean));
  }

  // ── Re-resolve WP plugins from features + hosting profile ──────────
  let wpPluginsJson: string | null = project.wpConfig?.wpPlugins ?? null;

  if (isWordpress && project.wpConfig?.wpFeatures) {
    try {
      const features = JSON.parse(project.wpConfig.wpFeatures) as WpFeature[];
      const resolved = resolveWpPlugins(features, { profileId: hostingProfileId, excludeFreemium });
      wpPluginsJson = serializeResolvedPlugins(resolved.plugins);
    } catch {
      // Keep existing wpPlugins if features parsing fails
    }
  }

  // ── Update sub-models ───────────────────────────────────────────────

  if (devMode !== project.devMode) {
    await prisma.project.update({
      where: { id: projectId },
      data: { devMode },
    });
  }

  // Database config
  await prisma.projectDatabase.upsert({
    where: { projectId },
    create: {
      projectId,
      dbType: dbType as DbType,
      dbVersion,
      dbName,
      dbUser,
      dbPassword,
    },
    update: {
      dbType: dbType as DbType,
      dbVersion,
      dbName,
      dbUser,
      dbPassword,
    },
  });

  // WordPress config
  if (isWordpress) {
    await prisma.wordpressConfig.upsert({
      where: { projectId },
      create: {
        projectId,
        phpVersion,
        hostingProfileId,
        excludeFreemium,
        wpSiteTitle,
        wpAdminUser,
        wpAdminPassword,
        wpAdminEmail,
        wpPlugins: wpPluginsJson,
      },
      update: {
        phpVersion,
        hostingProfileId,
        excludeFreemium,
        wpSiteTitle,
        wpAdminUser,
        wpAdminPassword,
        wpAdminEmail,
        wpPlugins: wpPluginsJson,
      },
    });
  }

  // Next.js config
  if (project.techStack === "NEXTJS") {
    await prisma.nextjsConfig.upsert({
      where: { projectId },
      create: {
        projectId,
        nodeVersion,
        envVarsJson: envVarsRaw,
      },
      update: {
        nodeVersion,
        envVarsJson: envVarsRaw,
      },
    });
  }

  // ── Sync ProjectService rows ─────────────────────────────────────────
  // DB services (db-mariadb, db-postgresql) are managed by ProjectDatabase,
  // not ProjectService. Filter them out before persisting.
  const nonDbServiceIds = enabledServiceIds.filter(
    (id) => id !== "db-mariadb" && id !== "db-postgresql",
  );

  await prisma.projectService.deleteMany({ where: { projectId } });
  if (nonDbServiceIds.length > 0) {
    await prisma.projectService.createMany({
      data: nonDbServiceIds.map((serviceId) => ({
        projectId,
        serviceId,
        enabled: true,
      })),
    });
  }

  // ── Regenerate compose ──────────────────────────────────────────────

  const port = project.runtime?.port;
  if (port != null) {
    try {
      const enabledIds = new Set(enabledServiceIds);
      await generateComposeFragment(
        {
  projectSlug: project.slug,
  clientSlug: project.client.slug,
  port,
  domain: project.domain,
  type: project.type,
  techStack: project.techStack,
  deployTarget: project.deployTarget,
  devMode,
  enabledServiceIds: enabledIds,
  database: {
    dbType: dbType as DbType,
    dbVersion,
    dbName,
    dbUser,
    dbPassword,
  },
  wpConfig: isWordpress
    ? {
        phpVersion,
        wpHeadless: project.wpConfig?.wpHeadless ?? false,
        frontendStack: project.wpConfig?.frontendStack ?? null,
        wpSiteTitle,
        wpAdminUser,
        wpAdminPassword,
        wpAdminEmail,
        wpPermalinkStructure: project.wpConfig?.wpPermalinkStructure ?? null,
        wpDefaultPages: project.wpConfig?.wpDefaultPages ?? null,
        wpPlugins: wpPluginsJson,
        wpTheme: project.wpConfig?.wpTheme ?? null,
      }
    : null,
  nextConfig:
    project.techStack === "NEXTJS"
      ? {
          nodeVersion,
          envVarsJson: envVarsRaw,
        }
      : null,
        },
        { modes: [composeMode] },
      );
    } catch {
      console.error("Failed to regenerate compose for project:", projectId);
    }
  }

  // Regenerate Traefik dynamic.yml (routes for phpmyadmin, mailpit, etc.)
  try {
    await generateTraefikConfig();
  } catch {
    // Non-fatal
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { error: null, success: true };
}
