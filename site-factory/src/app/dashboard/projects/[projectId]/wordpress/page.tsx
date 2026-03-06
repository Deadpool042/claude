import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/shared/components/shell/page-layout";
import { BreadcrumbOverride } from "@/shared/providers/breadcrumb-context";
import { Button } from "@/shared/components/ui/button";
import { WpToolbox } from "@/features/dashboard/projects/detail";
import { resolveDefaultHostingProfile } from "@/lib/projects";
import type { HostingProfileId } from "@/lib/hosting";
import { resolveWpPlugins } from "@/lib/wp";
import type { WpFeature } from "@/lib/wp";
import { normalizeInfraStatus, parseInfraStatus } from "@/lib/wp";
import type { SocleSnapshot } from "@/features/dashboard/projects/detail";

interface WordPressPageProps {
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

export default async function WordPressPage({ params }: WordPressPageProps) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      techStack: true,
      devMode: true,
      wpConfig: {
        select: {
          hostingProfileId: true,
          wpFeatures: true,
          wpInfraStatus: true,
          wpHeadless: true,
          excludeFreemium: true,
          wpTheme: true,
        },
      },
      deployTarget: true,
    },
  });

  if (!project || project.techStack !== "WORDPRESS") {
    notFound();
  }

  const hostingProfileId =
    (project.wpConfig?.hostingProfileId as HostingProfileId | null) ??
    resolveDefaultHostingProfile(project.deployTarget);

  let socleSnapshot: SocleSnapshot | null = null;
  if (project.wpConfig?.wpFeatures) {
    try {
      const features = JSON.parse(project.wpConfig.wpFeatures) as WpFeature[];
      const themeExpected = resolveThemeExpected(
        project.wpConfig.wpHeadless ?? false,
        project.wpConfig.wpTheme ?? null,
      );
      const infraStatus = normalizeInfraStatus(
        parseInfraStatus(project.wpConfig.wpInfraStatus)
      ).status;
      const resolved = resolveWpPlugins(features, {
        profileId: hostingProfileId,
        excludeFreemium: project.wpConfig.excludeFreemium ?? false,
      });
      socleSnapshot = {
        features,
        plugins: resolved.plugins.map((p) => ({
          slug: p.slug,
          label: p.label,
          category: p.category,
          optional: p.optional,
          reason: p.reason,
        })),
        warnings: resolved.warnings,
        themeExpected,
        infraStatus,
      };
    } catch {
      socleSnapshot = null;
    }
  }

  return (
    <>
      <BreadcrumbOverride
        segments={{ [projectId]: project.name, wordpress: "WordPress Toolbox" }}
      />
      <PageLayout
        title="WordPress Toolbox"
        description={`${project.name} — Permaliens, pages, plugins, thèmes`}
        toolbar={
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/projects/${projectId}/services`}>
              <Button size="sm" variant="outline">
                <ArrowLeft className="size-4" />
                Services
              </Button>
            </Link>
            <Link href={`/dashboard/projects/${projectId}`}>
              <Button size="sm" variant="ghost">
                Projet
              </Button>
            </Link>
          </div>
        }
      >
        <WpToolbox
          projectId={project.id}
          projectType={project.type}
          hostingProfileId={hostingProfileId}
          devMode={project.devMode}
          socle={socleSnapshot}
        />
      </PageLayout>
    </>
  );
}
