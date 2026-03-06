import { prisma } from "@/lib/db";
import { normalizeDocId } from "@/lib/docs";
import { PageLayout } from "@/shared/components/shell/page-layout";
import { DocsClient } from "@/features/dashboard/docs";

function parseModules(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function normalizeDocIds(docIds: string[]): string[] {
  return Array.from(new Set(docIds.map((docId) => normalizeDocId(docId))));
}

export const dynamic = "force-dynamic";

export default async function DocsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      techStack: true,
      qualification: { select: { modules: true } },
      docs: { select: { docId: true, source: true } },
      docFavorites: { select: { docId: true } },
    },
  });

  const globalFavorites = await prisma.globalDocFavorite.findMany({
    select: { docId: true },
    orderBy: { createdAt: "desc" },
  });

  const mappedProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    type: project.type,
    techStack: project.techStack ?? null,
    modules: parseModules(project.qualification?.modules ?? null),
    docs: normalizeDocIds(project.docs.map((doc) => doc.docId)),
    favorites: normalizeDocIds(project.docFavorites.map((doc) => doc.docId)),
  }));

  return (
    <PageLayout
      title="Documentation"
      description="Docs internes et commerciales, editables en local."
    >
      <DocsClient
        projects={mappedProjects}
        globalFavorites={normalizeDocIds(globalFavorites.map((doc) => doc.docId))}
      />
    </PageLayout>
  );
}
