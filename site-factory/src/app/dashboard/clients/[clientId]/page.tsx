import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Pencil, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { ClientWebsites } from "@/features/dashboard/clients";
import { PageLayout } from "@/components/shell/page-layout";
import { BreadcrumbOverride } from "@/components/shell/breadcrumb-context";
import { EmptyState } from "@/components/shell/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/lib/validators";
import { localHostForMode } from "@/lib/docker";

interface ClientDetailPageProps {
  params: Promise<{ clientId: string }>;
}

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { clientId } = await params;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: { runtime: { select: { port: true } } },
      },
      websites: {
        orderBy: { label: "asc" },
      },
    },
  });

  if (!client) {
    notFound();
  }

  return (
    <>
    <BreadcrumbOverride segments={{ [clientId]: client.name }} />
    <PageLayout
      title={client.name}
      description={`Slug : ${client.slug}`}
      toolbar={
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/clients/${client.id}/edit`}>
            <Button size="sm" variant="outline">
              <Pencil className="size-4" />
              Modifier
            </Button>
          </Link>
          <Link href={`/dashboard/projects/new?clientId=${client.id}`}>
            <Button size="sm">
              <Plus className="size-4" />
              Nouveau projet
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Projets</CardDescription>
            <CardTitle className="text-3xl">
              {client.projects.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Contact</CardDescription>
            <CardTitle className="text-base font-normal">
              {client.firstName ?? client.lastName ? (
                <p className="font-medium">
                  {[client.firstName, client.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              ) : null}
              {client.email ? (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5" />
                  <a href={`mailto:${client.email}`} className="hover:underline">
                    {client.email}
                  </a>
                </p>
              ) : null}
              {client.phone ? (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" />
                  <a href={`tel:${client.phone}`} className="hover:underline">
                    {client.phone}
                  </a>
                </p>
              ) : null}
              {!client.firstName && !client.lastName && !client.email && !client.phone ? (
                <span className="text-sm text-muted-foreground">—</span>
              ) : null}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Créé le</CardDescription>
            <CardTitle className="text-lg">
              {client.createdAt.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardDescription>Sites web</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientWebsites
            clientId={client.id}
            initialWebsites={client.websites.map((w) => ({
              id: w.id,
              label: w.label,
              url: w.url,
            }))}
          />
        </CardContent>
      </Card>

      {client.notes ? (
        <Card className="mt-4">
          <CardHeader>
            <CardDescription>Notes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{client.notes}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold">Projets</h2>
        {client.projects.length === 0 ? (
          <EmptyState
            title="Aucun projet"
            description={`${client.name} n'a pas encore de projet.`}
            action={
              <Link
                href={`/dashboard/projects/new?clientId=${client.id}`}
              >
                <Button>
                  <Plus className="size-4" />
                  Créer un projet
                </Button>
              </Link>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Créé le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.projects.map((project) => (
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
                    <Badge variant="secondary">
                      {PROJECT_TYPE_LABELS[project.type]}
                    </Badge>
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
                        dev: {localHostForMode(client.slug, project.slug, "dev")}
                      </code>
                      <code className="block">
                        prod-like: {localHostForMode(client.slug, project.slug, "prod-like")}
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
      </div>
    </PageLayout>
    </>
  );
}
