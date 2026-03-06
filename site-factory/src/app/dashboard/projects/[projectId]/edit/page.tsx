import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/shared/components/shell/page-layout";
import { BreadcrumbOverride } from "@/shared/providers/breadcrumb-context";
import { ProjectEditForm } from "@/features/dashboard/projects/edit";
import type { HostingProviderId } from "@/lib/hosting";
import {
  readPersistedTaxonomySignalDualSource,
  resolveTaxonomySignalFromRuntimeContext,
} from "@/lib/taxonomy";

interface EditProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true, runtime: true, wpConfig: true, qualification: true },
  });

  if (!project) {
    notFound();
  }
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

  return (
    <>
      <BreadcrumbOverride segments={{ [projectId]: project.name }} />
      <PageLayout
        title={`Modifier ${project.name}`}
        description={`Client : ${project.client.name} — Slug : ${project.slug}`}
      >
        <ProjectEditForm
          project={{
            id: project.id,
            name: project.name,
            type: project.type,
            status: project.status,
            description: project.description,
            domain: project.domain,
            port: project.runtime?.port ?? null,
            gitRepo: project.gitRepo,
            techStack: project.techStack,
            deployTarget: project.deployTarget,
            hostingProviderId: (project.hostingProviderId as HostingProviderId | null) ?? null,
            clientId: project.clientId,
            category: project.category,
            wpHeadless: project.wpConfig?.wpHeadless ?? false,
            frontendStack: project.wpConfig?.frontendStack ?? null,
            modules: project.qualification?.modules ?? null,
            maintenanceLevel: project.qualification?.maintenanceLevel ?? null,
            estimatedBudget: project.qualification?.estimatedBudget ?? null,
            taxonomySignal: taxonomySignalResolution.signal,
            taxonomySignalSource: taxonomySignalResolution.source,
          }}
        />
      </PageLayout>
    </>
  );
}
