"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { resolveWpPlugins, serializeResolvedPlugins } from "@/lib/wp-plugin-resolver";
import type { WpFeature } from "@/lib/wp-features";
import type { DeployTargetLiteral } from "@/lib/service-catalog";
import { resolveHostingProviderForDeployTarget } from "@/lib/hosting-providers";

interface ActionState {
  error: string | null;
  success?: boolean;
}

export async function updateDeploymentAction(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      techStack: true,
      deployTarget: true,
      hostingProviderId: true,
      wpConfig: {
        select: {
          hostingProfileId: true,
          wpFeatures: true,
          wpPlugins: true,
          excludeFreemium: true,
        },
      },
    },
  });

  if (!project) {
    return { error: "Projet introuvable." };
  }

  const deployTargetLiteral = project.deployTarget as unknown as DeployTargetLiteral;
  const hostingProvider = resolveHostingProviderForDeployTarget(
    (formData.get("hostingProviderId") as string) || project.hostingProviderId || null,
    deployTargetLiteral,
  );
  const nextProfile = hostingProvider.profileId;

  let wpPluginsJson = project.wpConfig?.wpPlugins ?? null;
  if (project.techStack === "WORDPRESS" && project.wpConfig?.wpFeatures) {
    try {
      const features = JSON.parse(project.wpConfig.wpFeatures) as WpFeature[];
      const resolved = resolveWpPlugins(features, {
        profileId: nextProfile,
        excludeFreemium: project.wpConfig.excludeFreemium ?? false,
      });
      wpPluginsJson = serializeResolvedPlugins(resolved.plugins);
    } catch {
      // Keep existing plugins if parsing fails
    }
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      hostingProviderId: hostingProvider.id,
    },
  });

  if (project.techStack === "WORDPRESS") {
    await prisma.wordpressConfig.upsert({
      where: { projectId },
      create: {
        projectId,
        hostingProfileId: nextProfile,
        wpPlugins: wpPluginsJson,
        phpVersion: "8.3",
      },
      update: {
        hostingProfileId: nextProfile,
        wpPlugins: wpPluginsJson,
      },
    });
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { error: null, success: true };
}
