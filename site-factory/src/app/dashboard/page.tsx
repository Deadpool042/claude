import Link from "next/link";
import { Users, FolderKanban, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/shared/components/shell/page-layout";
import { DataPanel } from "@/shared/components/shell/data-panel";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/lib/validators";
import { RunningProjects } from "@/features/dashboard/home";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [clientCount, projectCount, recentProjects] = await Promise.all([
    prisma.client.count(),
    prisma.project.count(),
    prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
  ]);

  return (
    <PageLayout
      title="Dashboard"
      description="Vue d'ensemble de votre Site Factory"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Clients</CardDescription>
            <CardTitle className="text-3xl">{clientCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/clients">
              <Button variant="outline" size="sm">
                <Users className="size-4" />
                Voir les clients
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Projets</CardDescription>
            <CardTitle className="text-3xl">{projectCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/projects">
              <Button variant="outline" size="sm">
                <FolderKanban className="size-4" />
                Voir les projets
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Actions rapides</CardDescription>
            <CardTitle className="text-lg">Nouveau</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Link href="/dashboard/clients/new">
              <Button size="sm">
                <Plus className="size-4" />
                Client
              </Button>
            </Link>
            <Link href="/dashboard/projects/new">
              <Button size="sm" variant="secondary">
                <Plus className="size-4" />
                Projet
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ── Docker status (real-time) ──────────────────────────── */}
      <RunningProjects />

      {/* ── Recent projects ────────────────────────────────────── */}
      <DataPanel
        title="Derniers projets"
        description="Les 5 projets les plus récents"
      >
        {recentProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun projet encore.</p>
        ) : (
          <ul className="space-y-3">
            {recentProjects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between text-sm rounded-md px-2 py-2 -mx-2 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <span className="font-medium">{project.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      ({project.client.name})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {PROJECT_TYPE_LABELS[project.type]}
                    </Badge>
                    <Badge
                      variant={
                        project.status === "ACTIVE"
                          ? "default"
                          : project.status === "DRAFT"
                            ? "outline"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DataPanel>
    </PageLayout>
  );
}
