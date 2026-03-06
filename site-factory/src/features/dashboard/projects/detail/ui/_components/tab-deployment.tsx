"use client";

import { useActionState, useCallback } from "react";
import { Cloud, Lock } from "lucide-react";
import { updateDeploymentAction } from "@/features/dashboard/projects/server-actions";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { DEPLOY_TARGET_LABELS } from "@/lib/validators";
import { HOSTING_PROFILES } from "@/lib/hosting";
import {
  HOSTING_PROVIDERS,
  getHostingProvidersForDeployTarget,
  defaultHostingProviderForDeployTarget,
  type HostingProviderId,
} from "@/lib/hosting";
import { isDeployTargetLiteral, type DeployTargetLiteral } from "@/lib/services";

const nativeSelectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const SSL_RULES: Record<DeployTargetLiteral, { label: string; modes: Array<{ env: string; mode: string }> }> = {
  DOCKER: {
    label: "Docker / VPS",
    modes: [
      { env: "Dev", mode: "local-ca" },
      { env: "Prod-like", mode: "local-ca" },
      { env: "Prod", mode: "letsencrypt" },
    ],
  },
  SHARED_HOSTING: {
    label: "Mutualise",
    modes: [
      { env: "Dev", mode: "local-ca" },
      { env: "Prod-like", mode: "local-ca" },
      { env: "Prod", mode: "provider" },
    ],
  },
  VERCEL: {
    label: "Vercel / Cloud",
    modes: [
      { env: "Dev", mode: "local-ca" },
      { env: "Prod-like", mode: "local-ca" },
      { env: "Prod", mode: "provider" },
    ],
  },
};

interface TabDeploymentProps {
  projectId: string;
  techStack: string | null;
  deployTarget: string;
  hostingProviderId: HostingProviderId | null;
}

export function TabDeployment(props: TabDeploymentProps) {
  const { projectId, techStack, deployTarget, hostingProviderId } = props;
  const boundAction = useCallback(
    (prev: { error: string | null; success?: boolean }, formData: FormData) =>
      updateDeploymentAction(projectId, prev, formData),
    [projectId],
  );
  const [state, formAction, isPending] = useActionState(boundAction, { error: null });

  const deployTargetLiteral: DeployTargetLiteral = isDeployTargetLiteral(deployTarget)
    ? deployTarget
    : "DOCKER";

  const providers = getHostingProvidersForDeployTarget(deployTargetLiteral);
  const recommendedProviderId = defaultHostingProviderForDeployTarget(deployTargetLiteral);
  const selectedProviderId = providers.find((p) => p.id === hostingProviderId)
    ? (hostingProviderId as HostingProviderId)
    : recommendedProviderId;
  const selectedProvider = HOSTING_PROVIDERS.find((p) => p.id === selectedProviderId);
  const profileLabel = selectedProvider ? HOSTING_PROFILES[selectedProvider.profileId]?.label : null;
  const sslRule = SSL_RULES[deployTargetLiteral];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cloud className="size-4 text-muted-foreground" />
            Déploiement
          </CardTitle>
          <CardDescription>Préconfiguration automatique selon la cible d'hébergement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Cible :</span>
            <Badge variant="secondary">{DEPLOY_TARGET_LABELS[deployTargetLiteral]}</Badge>
            <span className="text-xs text-muted-foreground">({sslRule.label})</span>
          </div>

          <div className="rounded-md border border-border/60 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
              <Lock className="size-3.5" />
              SSL recommandé
            </div>
            <div className="grid gap-2">
              {sslRule.modes.map((row) => (
                <div key={row.env} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{row.env}</span>
                  <Badge variant="outline">{row.mode}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <form action={formAction}>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Hébergeur</CardTitle>
            <CardDescription>
              L&apos;hébergeur pilote le profil technique et les contraintes de déploiement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="hostingProviderId" className="text-sm font-medium">
                Hébergeur
              </label>
              <select
                id="hostingProviderId"
                name="hostingProviderId"
                defaultValue={selectedProviderId}
                className={nativeSelectClass}
              >
                {providers.map((provider) => {
                  const suffix = provider.id === recommendedProviderId ? " - recommandé" : "";
                  return (
                    <option key={provider.id} value={provider.id}>
                      {provider.label}
                      {suffix}
                    </option>
                  );
                })}
              </select>
              {selectedProvider?.notes ? (
                <p className="text-xs text-muted-foreground">{selectedProvider.notes}</p>
              ) : null}
              {profileLabel ? (
                <p className="text-[11px] text-muted-foreground">Profil technique: {profileLabel}</p>
              ) : null}
              {techStack === "WORDPRESS" ? (
                <p className="text-[11px] text-muted-foreground">
                  Ce choix ajuste automatiquement les plugins WordPress (cache, WAF, SMTP, etc.).
                </p>
              ) : null}
            </div>

            {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
            {state.success ? (
              <p className="text-sm text-green-600">Hébergeur mis à jour.</p>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
