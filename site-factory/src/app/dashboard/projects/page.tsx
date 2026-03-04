import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/components/shell/page-layout";
import { EmptyState } from "@/components/shell/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  TECH_STACK_LABELS,
} from "@/lib/validators";
import { CATEGORY_SHORT, CATEGORY_COLORS } from "@/lib/referential";
import { localHostForMode } from "@/lib/docker";

interface ProjectsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const { q } = await searchParams;

  const projects = await prisma.project.findMany({
    ...(q ? { where: { name: { contains: q } } } : {}),
    orderBy: { createdAt: "desc" },
    include: { client: true, runtime: { select: { port: true } } },
  });

  return (
    <PageLayout
      title="Projets"
      description={`${String(projects.length)} projet${projects.length !== 1 ? "s" : ""}`}
      toolbar={
        <Link href="/dashboard/projects/new">
          <Button size="sm">
            <Plus className="size-4" />
            Nouveau projet
          </Button>
        </Link>
      }
    >
      <form className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher un projet..."
          className="h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
        />
      </form>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="size-6 text-muted-foreground" />}
          title="Aucun projet"
          description={
            q
              ? `Aucun projet ne correspond à "${q}".`
              : "Commencez par créer votre premier projet."
          }
          action={
            !q ? (
              <Link href="/dashboard/projects/new">
                <Button>
                  <Plus className="size-4" />
                  Créer un projet
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Cat.</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Stack</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Port</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Créé le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="font-medium hover:underline"
                  >
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/clients/${project.clientId}`}
                    className="hover:underline"
                  >
                    {project.client.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {project.category ? (
                    <Badge variant="outline" className={CATEGORY_COLORS[project.category]}>
                      {CATEGORY_SHORT[project.category]}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {PROJECT_TYPE_LABELS[project.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {project.techStack ? (
                    <Badge variant="outline">
                      {TECH_STACK_LABELS[project.techStack]}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {project.runtime?.port != null ? (
                    <Badge variant="secondary">
                      {String(project.runtime.port)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="space-y-1 text-xs">
                    {project.domain ? (
                      <code className="block">{project.domain}</code>
                    ) : null}
                    <code className="block">
                      dev: {localHostForMode(project.client.slug, project.slug, "dev")}
                    </code>
                    <code className="block">
                      prod-like: {localHostForMode(project.client.slug, project.slug, "prod-like")}
                    </code>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project.createdAt.toLocaleDateString("fr-FR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageLayout>
  );
}
