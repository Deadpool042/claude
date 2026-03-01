import { generateTraefikConfig } from "@/lib/generators/traefik";
import { generateComposeFragment } from "@/lib/generators/compose";
import type { CreatedProject } from "@/lib/projects/buildProjectCreateArgs";
import type { DeployTarget, TechStack, DevMode } from "@/generated/prisma/client"; // ✅ DevMode

export async function generateProjectInfra(args: {
  project: CreatedProject;
  clientSlug: string;
  port: number;
  domain: string | null;
  type: CreatedProject["type"];
  techStack: TechStack | null;
  deployTarget: DeployTarget;
  devMode: DevMode; // ✅ AJOUT
}): Promise<void> {
  const { project, clientSlug, port, domain, type, techStack, deployTarget, devMode } = args; // ✅ devMode

  const enabledServiceIds = new Set<string>(
    project.services.filter((s) => s.enabled).map((s) => s.serviceId),
  );

  await generateTraefikConfig();

  await generateComposeFragment({
    projectSlug: project.slug,
    clientSlug,
    port,
    domain,
    type,
    techStack,
    deployTarget,
    devMode, // ✅ PROPAGÉ
    enabledServiceIds,
    database: project.database
      ? {
          dbType: project.database.dbType,
          dbVersion: project.database.dbVersion,
          dbName: project.database.dbName,
          dbUser: project.database.dbUser,
          dbPassword: project.database.dbPassword,
        }
      : null,
    wpConfig: project.wpConfig
      ? {
          phpVersion: project.wpConfig.phpVersion,
          wpHeadless: project.wpConfig.wpHeadless,
          frontendStack: project.wpConfig.frontendStack,
          wpSiteTitle: project.wpConfig.wpSiteTitle,
          wpAdminUser: project.wpConfig.wpAdminUser,
          wpAdminPassword: project.wpConfig.wpAdminPassword,
          wpAdminEmail: project.wpConfig.wpAdminEmail,
          wpPermalinkStructure: project.wpConfig.wpPermalinkStructure,
          wpDefaultPages: project.wpConfig.wpDefaultPages,
          wpPlugins: project.wpConfig.wpPlugins,
          wpTheme: project.wpConfig.wpTheme,
        }
      : null,
    nextConfig: project.nextConfig
      ? {
          nodeVersion: project.nextConfig.nodeVersion,
          envVarsJson: project.nextConfig.envVarsJson,
        }
      : null,
  });
}