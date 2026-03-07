import {
  ExternalLink,
  Calendar,
  FileText,
  ShieldCheck,
  Euro,
  Layers,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  MAINTENANCE_LABELS,
  MAINTENANCE_PRICES,
  MODULE_CATALOG,
  normalizeModuleIds,
  type Category,
  type MaintenanceCat,
} from "@/lib/referential";
import { formatEur } from "@/shared/lib/currency";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import type { DeployTarget } from "@/generated/prisma/client";
import { localHostForMode, localServiceHost } from "@/lib/docker";
import { isServiceEnabledForMode } from "@/lib/generators/compose/services/enabled";
import {
  CANONICAL_TAXONOMY_LABELS,
  TAXONOMY_SIGNAL_SOURCE_LABELS,
  TAXONOMY_SIGNAL_LABELS,
  type CanonicalProjectTaxonomy,
  type TaxonomyDisambiguationSignal,
  type TaxonomySignalResolutionSource,
} from "@/lib/taxonomy";

// ── Types ──────────────────────────────────────────────────────────

interface TabOverviewProps {
  project: {
    id: string;
    slug: string;
    clientSlug: string;
    description: string | null;
    domain: string | null;
    port: number | null;
    status: string;
    clientId: string;
    clientName: string;
    category: string | null;
    createdAt: Date;
    updatedAt: Date;
    deployTarget: DeployTarget;
  };
  socleStatus?: {
    status: "configured" | "missing";
    featuresCount: number;
    theme: string | null;
    headless: boolean;
  } | null;
  qualification: {
    modules: string | null;
    maintenanceLevel: string | null;
    estimatedBudget: number | null;
  } | null;
  enabledServiceIds: string[];
  taxonomy?: {
    signal: TaxonomyDisambiguationSignal | null;
    signalSource: TaxonomySignalResolutionSource;
    canonicalTaxonomy: CanonicalProjectTaxonomy | null;
  };
}

 const ACCESS_SERVICES = [
  { id: "phpmyadmin", label: "phpMyAdmin", prefix: "pma" },
  { id: "mailpit", label: "Mailpit", prefix: "mail" },
  { id: "adminer", label: "Adminer", prefix: "adminer" },
  // ajoute quand tu veux: { id: "minio", label: "MinIO", prefix: "minio" },
] as const;

// ── Component ──────────────────────────────────────────────────────

export function TabOverview({
  project,
  socleStatus,
  qualification,
  enabledServiceIds,
  taxonomy,
}: TabOverviewProps) {
  const themeLabel = socleStatus?.theme
    ? socleStatus.theme === "sf-tt5"
      ? "sf-tt5 + parent"
      : socleStatus.theme
    : null;
  const localHosts = [
    {
      id: "dev",
      label: "Local",
      host: localHostForMode(project.clientSlug, project.slug, "dev"),
    },
    {
      id: "prod-like",
      label: "Simulation prod",
      host: localHostForMode(project.clientSlug, project.slug, "prod-like"),
    },
  ] as const;

  // Parse modules
  const moduleIds: string[] = qualification?.modules
    ? normalizeModuleIds(JSON.parse(qualification.modules) as string[])
    : [];
  const activeModules = moduleIds
    .map((id) => MODULE_CATALOG.find((m) => m.id === id))
    .filter((m): m is (typeof MODULE_CATALOG)[number] => m != null);

  const maintenance = qualification?.maintenanceLevel as MaintenanceCat | null;
  const budget = qualification?.estimatedBudget;

  const enabledIds = new Set(enabledServiceIds);
  const accessServices = ACCESS_SERVICES.filter((s) => enabledServiceIds.includes(s.id));
  const enabledAccessLinks = localHosts
    .map((mode) => {
      const links = accessServices
        .filter((s) => isServiceEnabledForMode(s.id, enabledIds, project.deployTarget, mode.id))
        .map((s) => ({
          id: `${mode.id}-${s.id}`,
          label: s.label,
          href: `https://${localServiceHost(s.prefix, project.clientSlug, project.slug, mode.id)}`,
        }));
      return { mode: mode.id, label: mode.label, links };
    })
    .filter((group) => group.links.length > 0);
  const canLink = project.domain != null || project.port != null;
 

  return (
    <div className="space-y-6">
      {/* ── Description ────────────────────────────── */}
      {project.description ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-muted-foreground" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {project.description}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* ── KPI Cards ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Budget */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Euro className="size-3.5" />
              Budget estimé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {budget != null ? formatEur(budget) : "—"}
            </p>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Layers className="size-3.5" />
              Modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {activeModules.length > 0
                ? String(activeModules.length)
                : "0"}
            </p>
            {activeModules.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {activeModules.slice(0, 4).map((m) => (
                  <Badge key={m.id} variant="outline" className="text-[10px]">
                    {m.name}
                  </Badge>
                ))}
                {activeModules.length > 4 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{String(activeModules.length - 4)}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              Maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {maintenance ? MAINTENANCE_LABELS[maintenance] : "—"}
            </p>
            {maintenance && (
              <p className="text-xs text-muted-foreground">
                {MAINTENANCE_PRICES[maintenance]}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Catégorie */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.category ? (
                <Badge
                  className={`text-sm ${CATEGORY_COLORS[project.category as Category]}`}
                >
                  {CATEGORY_LABELS[project.category as Category]}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
              {(taxonomy?.canonicalTaxonomy || taxonomy?.signal) && (
                <div className="space-y-1">
                  {taxonomy?.canonicalTaxonomy && (
                    <Badge variant="secondary" className="text-[10px]">
                      {CANONICAL_TAXONOMY_LABELS[taxonomy.canonicalTaxonomy]}
                    </Badge>
                  )}
                  {taxonomy?.signal && (
                    <p className="text-[11px] text-muted-foreground">
                      {TAXONOMY_SIGNAL_LABELS[taxonomy.signal]} (
                      {TAXONOMY_SIGNAL_SOURCE_LABELS[taxonomy.signalSource]})
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {socleStatus ? (
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              Socle WordPress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={socleStatus.status === "configured" ? "secondary" : "outline"}
                className="text-[10px]"
              >
                {socleStatus.status === "configured" ? "Configuré" : "À appliquer"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Fonctionnalités : {String(socleStatus.featuresCount)}
              </span>
              {themeLabel ? (
                <Badge variant="outline" className="text-[10px]">
                  Thème : {themeLabel}
                </Badge>
              ) : null}
              {socleStatus.headless ? (
                <Badge variant="outline" className="text-[10px]">
                  Headless
                </Badge>
              ) : null}
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/projects/${project.id}/wordpress`}>
                Ouvrir WordPress Toolbox
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* ── Accès rapide ───────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Accès</CardTitle>
          <CardDescription>Accès locaux et services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground pb-1">URLs locales</p>
                <div className="flex flex-wrap items-center gap-2">
                  {localHosts.map((entry) => (
                    <Button
                      key={entry.id}
                      className="text-sm"
                      variant="secondary"
                      size="sm"
                      disabled={!canLink}
                    >
                      <Link href={`https://${entry.host}`} target="_blank" rel="noopener noreferrer">
                        {entry.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* access aux services:  My PHP Admin s'il existe */}
            <div>
              <p className="text-xs text-muted-foreground pb-1">Services</p>

              {enabledAccessLinks.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucun</p>
              ) : (
                <div className="space-y-2">
                  {enabledAccessLinks.map((group) => (
                    <div key={group.mode} className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">{group.label}</span>
                      {group.links.map((l) => (
                        <Button key={l.id} variant="outline" size="sm" asChild>
                          <Link href={l.href} target="_blank" rel="noopener noreferrer">
                            {l.label}
                            <ExternalLink className="ml-2 size-3" />
                          </Link>
                        </Button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {project.status === "ACTIVE" && project.port !== null ? (
              <Badge variant="default" className="text-xs">
                <ExternalLink className="mr-1 size-3" />
                Routé
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Non routé
              </Badge>
            )}
          </div>
          {project.domain ? (
            <div>
              <p className="text-xs text-muted-foreground">
                Domaine personnalisé
              </p>
              <code className="text-sm">{project.domain}</code>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* ── Dates ──────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="size-4 text-muted-foreground" />
            Historique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            <div>
              <p className="text-xs text-muted-foreground">Créé le</p>
              <p className="text-sm">
                {project.createdAt.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Modifié le</p>
              <p className="text-sm">
                {project.updatedAt.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
