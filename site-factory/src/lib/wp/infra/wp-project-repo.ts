import { resolve } from "node:path";
import { prisma } from "@/lib/db";
import type { DeployTarget, DevMode } from "@/generated/prisma/client";
import type { HostingProfileId } from "@/lib/hosting-profiles";

const CONFIGS_ROOT = resolve(process.cwd(), "..", "configs");

export type WpProjectRef = {
  dir: string;
  slug: string;
  clientSlug: string;
  deployTarget: DeployTarget | null;
  hostingProfileId: HostingProfileId | null;
  excludeFreemium: boolean | null;
  devMode?: DevMode | null;
};

export async function getWpProjectRef(projectId: string): Promise<WpProjectRef | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      slug: true,
      techStack: true,
      deployTarget: true,
      devMode: true,
      wpConfig: { select: { hostingProfileId: true, excludeFreemium: true } },
      client: { select: { slug: true } },
    },
  });

  if (!project || project.techStack !== "WORDPRESS") return null;

  return {
    dir: resolve(CONFIGS_ROOT, project.client.slug, project.slug),
    slug: project.slug,
    clientSlug: project.client.slug,
    deployTarget: project.deployTarget,
    hostingProfileId: (project.wpConfig?.hostingProfileId as HostingProfileId | null) ?? null,
    excludeFreemium: project.wpConfig?.excludeFreemium ?? null,
    devMode: project.devMode,
  };
}
