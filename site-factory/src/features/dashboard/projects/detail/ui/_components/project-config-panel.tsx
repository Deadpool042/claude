"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { Database, Gauge, HardDrive, Mail, Search, TableProperties, Zap, ArrowLeftRight } from "lucide-react";
import { updateProjectConfigAction } from "@/features/dashboard/projects/server-actions";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { ProjectConfigPanelProps } from "./project-config-panel.types";
import { useProjectConfigPanelState } from "./use-project-config-panel";
import { DeployTargetBanner } from "./deploy-target-banner";
import { ServiceCatalogSection } from "./service-catalog-section";
import { EnvVarsSection } from "./env-vars-section";
import type { DevMode } from "@/generated/prisma/client";
import { defaultComposeModeFromDevMode } from "@/lib/generators/compose/types";
import { TECH_STACK_LABELS } from "@/lib/validators";

// icon renderer (UI concern only)
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Database,
  TableProperties,
  Zap,
  Mail,
  Search,
  HardDrive,
  ArrowLeftRight,
  Gauge,
};
function renderIcon(name: string) {
  const Icon = ICONS[name];
  return Icon ? <Icon className="size-4" /> : null;
}

const DEV_MODE_OPTIONS: Array<{ id: DevMode; label: string }> = [
  { id: "DEV_COMFORT", label: "Dev local" },
  { id: "DEV_PROD_LIKE", label: "Dev prod-like" },
  { id: "PROD", label: "Prod" },
];

export function ProjectConfigPanel(props: ProjectConfigPanelProps) {
  const { projectId, techStack, deployTarget } = props;

  const boundAction = useCallback(
    (prev: { error: string | null; success?: boolean }, formData: FormData) =>
      updateProjectConfigAction(projectId, prev, formData),
    [projectId],
  );

  const [state, formAction, isPending] = useActionState(boundAction, { error: null });

  const vm = useProjectConfigPanelState(props);
  const [devMode, setDevMode] = useState<DevMode>(props.devMode ?? "DEV_COMFORT");
  useEffect(() => {
    setDevMode(props.devMode ?? "DEV_COMFORT");
  }, [props.devMode]);
  const defaultComposeMode = defaultComposeModeFromDevMode(devMode);
  const defaultComposeLabel =
    defaultComposeMode === "dev"
      ? "local (docker-compose.local.yml)"
      : defaultComposeMode === "prod-like"
        ? "prod-like (docker-compose.prod-like.yml)"
        : "prod (docker-compose.prod.yml)";
  const composeMode = vm.activeProfile ?? defaultComposeMode;

  return (
    <Card>
      <form action={formAction}>
        <input type="hidden" name="dbType" value={vm.dbType} />
        <input type="hidden" name="enabledServices" value={Array.from(vm.enabledServices).join(",")} />
        <input type="hidden" name="composeMode" value={composeMode} />
        <input type="hidden" name="devMode" value={devMode} />

        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Configuration Docker</CardTitle>
              {techStack ? (
                <Badge variant="secondary">
                  {TECH_STACK_LABELS[techStack as keyof typeof TECH_STACK_LABELS] ?? techStack}
                </Badge>
              ) : null}
            </div>

            {techStack ? (
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant={vm.activeProfile === "dev" ? "default" : "outline"}
                  size="sm"
                  onClick={() => vm.setActiveProfile(vm.activeProfile === "dev" ? null : "dev")}
                >
                  Vue Local
                </Button>
                <Button
                  type="button"
                  variant={vm.activeProfile === "prod-like" ? "default" : "outline"}
                  size="sm"
                  onClick={() => vm.setActiveProfile(vm.activeProfile === "prod-like" ? null : "prod-like")}
                >
                  Vue Prod-like
                </Button>
              </div>
            ) : null}
          </div>

          <CardDescription>
            {vm.activeProfile === "dev"
              ? "Prévisualisation local — services inclus dans docker-compose.local.yml. L'enregistrement régénère ce fichier."
              : vm.activeProfile === "prod-like"
                ? "Prévisualisation prod-like — services inclus dans docker-compose.prod-like.yml. L'enregistrement régénère ce fichier."
                : `Sélectionnez un mode pour prévisualiser. Par défaut, l'enregistrement régénère le ${defaultComposeLabel}.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {techStack ? (
            <DeployTargetBanner
              techStack={techStack}
              deployTarget={deployTarget}
              activeProfile={vm.activeProfile}
              compatibleCount={vm.compatibleServices.length}
              />
          ) : null}

          <div className="rounded-md border border-border/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Environnement cible</p>
                <p className="text-xs text-muted-foreground">
                  Pilote le socle, les tests de maintenance et le compose par défaut.
                </p>
              </div>
              <Badge variant="outline">
                {DEV_MODE_OPTIONS.find((opt) => opt.id === devMode)?.label ?? "—"}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {DEV_MODE_OPTIONS.map((opt) => (
                <Button
                  key={opt.id}
                  type="button"
                  variant={devMode === opt.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDevMode(opt.id)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {techStack ? (
            <ServiceCatalogSection
              groups={vm.groups}
              enabledServices={vm.enabledServices}
              compatibleServices={vm.compatibleServices}
              isWordpress={vm.isWordpress}
              activeProfile={vm.activeProfile}
              isRecommended={vm.recommendedFn}
              onToggle={vm.toggleService}
              renderIcon={renderIcon}
            />
          ) : null}

          {techStack ? (
            <EnvVarsSection
              envVars={vm.envVars}
              envVarsJson={vm.envVarsJson}
              onAdd={vm.addEnvVar}
              onRemove={vm.removeEnvVar}
              onUpdate={vm.updateEnvVar}
            />
          ) : null}

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? (
            <p className="text-sm text-green-600">Configuration sauvegardée. Le docker-compose.yml a été régénéré.</p>
          ) : null}
        </CardContent>

        {techStack ? (
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer la configuration"}
            </Button>
          </CardFooter>
        ) : null}
      </form>
    </Card>
  );
}
