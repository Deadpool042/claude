//src/app/dashboard/projects/[projectId]/services/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/components/shell/page-layout";
import { BreadcrumbOverride } from "@/components/shell/breadcrumb-context";
import { ServicesOrchestrator } from "@/features/dashboard/projects/detail";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ServicesPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      runtime: true,
      database: true,
      wpConfig: true,
      nextConfig: true,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <>
      <BreadcrumbOverride
        segments={{ [projectId]: project.name, services: "Services" }}
      />
      <PageLayout
        title="Services Docker"
        description={`${project.name} — ${project.techStack === "WORDPRESS" ? "WordPress" : project.techStack === "NEXTJS" ? "Next.js" : "Application"}`}
        toolbar={
          <Link href={`/dashboard/projects/${projectId}`}>
            <Button size="sm" variant="outline">
              <ArrowLeft className="size-4" />
              Retour au projet
            </Button>
          </Link>
        }
      >
        <ServicesOrchestrator
          projectId={projectId}
          projectSlug={project.slug}
          techStack={project.techStack}
          deployTarget={project.deployTarget}
      
        />
      </PageLayout>
    </>
  );
}
