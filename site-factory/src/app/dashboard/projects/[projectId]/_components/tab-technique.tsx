import {
  ExternalLink,
  GitBranch,
  Globe,
  Server,
  Code,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  ProjectType,
  TechStack,
  DeployTarget,
  FrontendStack,
} from "@/generated/prisma/client";
import {
  PROJECT_TYPE_LABELS,
  TECH_STACK_LABELS,
  DEPLOY_TARGET_LABELS,
} from "@/lib/validators/project";
import { localHostForMode } from "@/lib/docker/names";

// ── Types ──────────────────────────────────────────────────────────

interface TabTechniqueProps {
  project: {
    slug: string;
    clientSlug: string;
    type: ProjectType;
    status: string;
    domain: string | null;
    port: number | null;
    gitRepo: string | null;
    techStack: TechStack | null;
    deployTarget: DeployTarget;
  };
  config: {
    wpHeadless: boolean;
    frontendStack: FrontendStack | null;
  } | null;
}

// ── Component ──────────────────────────────────────────────────────

export function TabTechnique({ project, config }: TabTechniqueProps) {
  const localHosts = [
    {
      id: "dev",
      label: "Local dev",
      host: localHostForMode(project.clientSlug, project.slug, "dev"),
    },
    {
      id: "prod-like",
      label: "Prod-like",
      host: localHostForMode(project.clientSlug, project.slug, "prod-like"),
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* ── Stack & type ───────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Code className="size-3.5" />
              Type de projet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-sm">
              {PROJECT_TYPE_LABELS[project.type]}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Layers className="size-3.5" />
              Stack technique
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.techStack ? (
              <div className="space-y-1">
                <Badge variant="secondary" className="text-sm">
                  {TECH_STACK_LABELS[project.techStack]}
                </Badge>
                {config?.wpHeadless && project.techStack === "WORDPRESS" && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Mode Headless
                    {config.frontendStack
                      ? ` + ${TECH_STACK_LABELS[config.frontendStack]}`
                      : ""}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Non définie
              </span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Server className="size-3.5" />
              Déploiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-sm">
              {DEPLOY_TARGET_LABELS[project.deployTarget]}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* ── Accès & routing ────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="size-4 text-muted-foreground" />
            Accès & Routing
          </CardTitle>
          <CardDescription>Configuration Traefik</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Hosts locaux</p>
                <div className="space-y-1 text-xs">
                  {localHosts.map((entry) => (
                    <code key={entry.id} className="block">
                      {entry.label}: {entry.host}
                    </code>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">URLs locales</p>
                <div className="flex items-center gap-2">
                  <div className="space-y-1 text-xs">
                    {localHosts.map((entry) => (
                      <code key={`${entry.id}-url`} className="block">
                        https://{entry.host}
                      </code>
                    ))}
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
              </div>
            </div>

            <div className="space-y-3">
              {project.domain ? (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Domaine personnalisé
                  </p>
                  <code className="text-sm">{project.domain}</code>
                </div>
              ) : null}
              <div>
                <p className="text-xs text-muted-foreground">Port</p>
                <p className="text-sm">
                  {project.port !== null
                    ? String(project.port)
                    : "Non assigné"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Dépôt Git ──────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="size-4 text-muted-foreground" />
            Dépôt Git
          </CardTitle>
        </CardHeader>
        <CardContent>
          {project.gitRepo ? (
            <a
              href={project.gitRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <GitBranch className="size-3.5" />
              {project.gitRepo.replace(/^https?:\/\//, "")}
              <ExternalLink className="size-3" />
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun dépôt Git renseigné.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
