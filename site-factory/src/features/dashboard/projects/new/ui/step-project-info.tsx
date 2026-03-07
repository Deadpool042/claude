//src/app/dashboard/projects/new/_components/step-project-info.tsx
"use client";

import { useWizard } from "../logic/WizardProvider";
import { ClientSelect } from "./client-select";
import { InlineHint } from "@/shared/components/InlineHint";
import { StepCard } from "@/shared/components/StepCard";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  FolderPlus,
  Globe,
  GitBranch,
  Monitor,
  Server,
} from "lucide-react";
import { PROJECT_TYPE_LABELS } from "@/lib/referential";
import {
  HOSTING_PROVIDERS,
  getHostingProvidersForDeployTarget,
  defaultHostingProviderForDeployTarget,
  type HostingProviderId,
} from "@/lib/hosting";
import { HOSTING_PROFILES } from "@/lib/hosting";
import { HOSTING_TARGET_LABELS } from "@/lib/validators";

const nativeSelectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export function StepProjectInfo() {
  const {
    projectType,
    techStack,
    deployTarget,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    hostingSelectionMode,
    formFields,
    setFormFields,
  } = useWizard();
  const isWp = techStack === "WORDPRESS";
  const providers = getHostingProvidersForDeployTarget(deployTarget);
  const defaultHostingProvider = defaultHostingProviderForDeployTarget(deployTarget);
  const selectedHostingProvider = providers.find((p) => p.id === formFields.hostingProviderId)
    ? formFields.hostingProviderId
    : defaultHostingProvider;
  const providerEntry = HOSTING_PROVIDERS.find((p) => p.id === selectedHostingProvider);
  const hostingProfileLabel = providerEntry ? HOSTING_PROFILES[providerEntry.profileId]?.label : null;
  const hostingProfileNotes = providerEntry?.notes ?? null;

  return (
    <div className="space-y-4">
      {/* ── Identité du projet ─────────────────────── */}
      <StepCard
        title="Identité du projet"
        icon={FolderPlus}
        tone="bg-primary/10 text-primary"
        description="Informations finales avant création."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nom du projet *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Site Vitrine Acme"
              required
              minLength={2}
              maxLength={100}
              autoFocus
              value={formFields.name}
              onChange={(e) => {
                setFormFields((f) => ({ ...f, name: e.target.value }));
              }}
            />
            <p className="text-xs text-muted-foreground">
              Le slug sera généré automatiquement.
            </p>
          </div>

          <div className="space-y-2">
            <ClientSelect
              defaultClientId={formFields.clientId}
              onChange={(id) => {
                setFormFields((f) => ({ ...f, clientId: id }));
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
              {projectType ? PROJECT_TYPE_LABELS[projectType] : "—"}
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brève description du projet…"
              rows={2}
              maxLength={2000}
              value={formFields.description}
              onChange={(e) => {
                setFormFields((f) => ({
                  ...f,
                  description: e.target.value,
                }));
              }}
            />
          </div>
        </div>
      </StepCard>

      {/* ── Hébergement ────────────────────────────── */}
      <StepCard
        title="Hébergement"
        icon={Server}
        tone="bg-emerald-500/10 text-emerald-500"
        description="Paramètres contractuels et opératoires liés à la recommandation retenue."
      >
        <div>
          <div className="rounded-lg border p-3 text-sm">
            <p className="text-muted-foreground">Hébergement cible</p>
            <p className="font-medium">
              {hostingSelectionMode === "NONE"
                ? "Géré par l’hébergeur"
                : hostingSelectionMode === "SINGLE"
                  ? HOSTING_TARGET_LABELS[hostingTarget]
                  : hostingSelectionMode === "FRONT_ONLY"
                    ? `Front ${HOSTING_TARGET_LABELS[hostingTargetFront ?? "TO_CONFIRM"]}`
                    : `Back ${HOSTING_TARGET_LABELS[hostingTargetBack ?? "TO_CONFIRM"]} / Front ${HOSTING_TARGET_LABELS[hostingTargetFront ?? "TO_CONFIRM"]}`}
            </p>
            {hostingSelectionMode !== "SINGLE" && hostingSelectionMode !== "NONE" && (
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {hostingSelectionMode === "SPLIT" && (
                  <p>
                    Back: {hostingTargetBack ? HOSTING_TARGET_LABELS[hostingTargetBack] : "—"}
                  </p>
                )}
                <p>
                  Front: {hostingTargetFront ? HOSTING_TARGET_LABELS[hostingTargetFront] : "—"}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="hostingProviderId">Hébergeur</Label>
            <select
              id="hostingProviderId"
              name="hostingProviderId"
              value={selectedHostingProvider}
              className={nativeSelectClass}
              onChange={(e) => {
                setFormFields((f) => ({
                  ...f,
                  hostingProviderId: e.target.value as HostingProviderId,
                }));
              }}
            >
              {providers.map((provider) => {
                const suffix = provider.id === defaultHostingProvider ? " - recommandé" : "";
                return (
                  <option key={provider.id} value={provider.id}>
                    {provider.label}
                    {suffix}
                  </option>
                );
              })}
            </select>
            {hostingProfileNotes ? <InlineHint>{hostingProfileNotes}</InlineHint> : null}
            {hostingProfileLabel ? (
              <p className="text-[11px] text-muted-foreground">
                Profil d’hébergement : {hostingProfileLabel}
              </p>
            ) : null}
            {isWp ? (
              <p className="text-[11px] text-muted-foreground">
                Ajuste automatiquement les plugins (cache, WAF, SMTP, etc.).
              </p>
            ) : null}
          </div>
        </div>
      </StepCard>

      {/* ── Réseau & dépôt ─────────────────────────── */}
      <StepCard
        title="Réseau & dépôt"
        icon={Monitor}
        tone="bg-orange-500/10 text-orange-500"
        description="Optionnel"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="domain" className="flex items-center gap-1.5">
              <Globe className="size-3.5 text-muted-foreground" />
              Domaine
            </Label>
            <Input
              id="domain"
              name="domain"
              placeholder="Ex: acme.localhost"
              value={formFields.domain}
              onChange={(e) => {
                setFormFields((f) => ({ ...f, domain: e.target.value }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port" className="flex items-center gap-1.5">
              <Server className="size-3.5 text-muted-foreground" />
              Port
            </Label>
            <Input
              id="port"
              name="port"
              type="number"
              min={3001}
              max={3999}
              placeholder="Auto (3001–3999)"
              value={formFields.port}
              onChange={(e) => {
                setFormFields((f) => ({ ...f, port: e.target.value }));
              }}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="gitRepo" className="flex items-center gap-1.5">
              <GitBranch className="size-3.5 text-muted-foreground" />
              Dépôt Git
            </Label>
            <Input
              id="gitRepo"
              name="gitRepo"
              type="url"
              placeholder="https://github.com/…"
              value={formFields.gitRepo}
              onChange={(e) => {
                setFormFields((f) => ({ ...f, gitRepo: e.target.value }));
              }}
            />
          </div>
        </div>
      </StepCard>
    </div>
  );
}
