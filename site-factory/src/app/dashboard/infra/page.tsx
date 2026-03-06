import { Network } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/shared/components/shell/page-layout";
import { EmptyState } from "@/shared/components/shell/empty-state";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  RegenerateButton,
  ToggleServiceButton,
  TestServiceButton,
} from "@/features/dashboard/infra";
import Link from "next/link";
import { localHostForMode } from "@/lib/docker";

export const dynamic = "force-dynamic";

export default async function InfraPage() {
  const traefikUrl =
    process.env.TRAEFIK_DASHBOARD_URL ?? "https://traefik.localhost";

  const activeRoutes = await prisma.project.findMany({
    where: { status: "ACTIVE", runtime: { port: { not: null } } },
    select: {
      id: true,
      slug: true,
      name: true,
      domain: true,
      runtime: { select: { port: true } },
      client: { select: { slug: true } },
    },
    orderBy: { slug: "asc" },
  });

  return (
    <PageLayout
      title="Infrastructure"
      description="Traefik reverse-proxy et routes actives"
      toolbar={<RegenerateButton />}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Traefik Dashboard</CardTitle>
            <CardDescription>
              Reverse-proxy global pour tous les projets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              URL :{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                {traefikUrl}
              </code>
              <span className="ml-2 text-xs text-warning">(HTTPS uniquement)</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrypoints : <strong>web</strong> (:80),{" "}
              <strong>websecure</strong> (:443)
            </p>
            <div className="mt-3 flex items-center gap-2">
              <ToggleServiceButton service="traefik" />
              <TestServiceButton service="traefik" />
              <Link href={traefikUrl} target="_blank" className="text-sm text-muted-foreground">
                Ouvrir le dashboard
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Whoami (test)</CardTitle>
            <CardDescription>
              Service de test pour vérifier le routage Traefik
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              URL :{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                https://whoami.localhost
              </code>
            </p>
            <div className="mt-3 flex items-center gap-2">
              <ToggleServiceButton service="whoami" />
              <TestServiceButton service="whoami" />
              <Link href="https://whoami.localhost" target="_blank" className="text-sm text-muted-foreground">
                Ouvrir le whoami
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Routes actives</CardTitle>
            <CardDescription>
              Projets ACTIVE avec port assigné — routés via dynamic.yml
              (auto-reload)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeRoutes.length === 0 ? (
              <EmptyState
                icon={
                  <Network className="size-6 text-muted-foreground" />
                }
                title="Aucune route active"
                description="Créez un projet pour générer automatiquement une route Traefik."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projet</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRoutes.map((route) => {
                    const port = route.runtime?.port ?? null;
                    const devHost = localHostForMode(route.client.slug, route.slug, "dev");
                    const prodLikeHost = localHostForMode(route.client.slug, route.slug, "prod-like");
                    const hosts = [
                      ...(route.domain ? [{ label: "domaine", host: route.domain }] : []),
                      { label: "dev", host: devHost },
                      { label: "prod-like", host: prodLikeHost },
                    ];
                    const schemeForHost = (host: string) =>
                      port === 443 || host.endsWith(".localhost") ? "https" : "http";
                    return (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">
                          {route.name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs">
                            {hosts.map((entry) => (
                              <code key={`${route.id}-${entry.label}`} className="block">
                                {entry.label}: {entry.host}
                              </code>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {port !== null ? String(port) : "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs">
                            {hosts.map((entry) => (
                              <code key={`${route.id}-${entry.label}-url`} className="block">
                                {schemeForHost(entry.host)}://{entry.host}
                              </code>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
