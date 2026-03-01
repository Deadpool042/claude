"use client";

import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { updateProjectAction } from "../../../_actions/update-project";
import { deleteProjectAction } from "../../../_actions/delete-project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteButton } from "@/components/shared/delete-button";
import { ModuleCard } from "@/components/qualification/module-card";
import { BudgetBreakdown } from "@/components/qualification/budget-breakdown";
import {
  FolderOpen,
  Layers,
  Globe,
  GitBranch,
  Server,
  AlertTriangle,
  Loader2,
  Save,
  Rocket,
  Trash2,
  Monitor,
  ShieldCheck,
  Euro,
} from "lucide-react";
import { useModules } from "@/hooks/use-modules";
import { useQualification } from "@/hooks/use-qualification";
import { GROUP_ICONS, TECH_STACK_OPTIONS, DEPLOY_TARGET_OPTIONS, formatEur } from "@/lib/qualification-ui";
import {
  MODULE_CATALOG,
  MODULE_GROUPS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_SHORT,
  ALLOWED_STACKS,
  getAllowedDeployTargets,
  getOfferProjectType,
  getOfferStackForProject,
  MAINTENANCE_LABELS,
  MAINTENANCE_PRICES,
  HOSTING_COSTS,
  HOSTING_COST_WP_HEADLESS,
  computeStackMultiplier,
  getMultiplierLabel,
  groupModules,
  type TechStack,
  type ProjectType,
  type DeployTarget,
  type ModuleDef,
} from "@/lib/qualification";
import {
  getMandatoryModules,
  getIncludedModules,
  isModuleCompatible,
  type ModuleId,
  type ProjectType as OfferProjectType,
  type Stack as OfferStack,
} from "@/lib/offers/offers";
import { HOSTING_PROFILES } from "@/lib/hosting-profiles";
import {
  getHostingProvidersForDeployTarget,
  defaultHostingProviderForDeployTarget,
  type HostingProviderId,
} from "@/lib/hosting-providers";

import { Wrench } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  { value: "STARTER", label: "Starter", desc: "Mini-site, petit budget" },
  { value: "VITRINE", label: "Vitrine", desc: "Site de présentation classique" },
  { value: "BLOG", label: "Blog", desc: "Blog ou magazine en ligne" },
  { value: "ECOM", label: "E-commerce", desc: "Boutique en ligne" },
  { value: "APP", label: "Application", desc: "Application web avancée" },
] as const;

const STATUSES = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "ACTIVE", label: "Actif" },
  { value: "ARCHIVED", label: "Archivé" },
] as const;

const nativeSelectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

// ── Component ──────────────────────────────────────────────────────────

interface ProjectEditFormProps {
  project: {
    id: string;
    name: string;
    type: string;
    status: string;
    description: string | null;
    domain: string | null;
    port: number | null;
    gitRepo: string | null;
    techStack: string | null;
    deployTarget: string;
    clientId: string;
    category: string | null;
    wpHeadless: boolean;
    frontendStack: string | null;
    hostingProviderId: HostingProviderId | null;
    modules: string | null;
    maintenanceLevel: string | null;
    estimatedBudget: number | null;
  };
}

export function ProjectEditForm({ project }: ProjectEditFormProps) {
  const boundUpdateAction = useCallback(
    (prev: { error: string | null }, formData: FormData) =>
      updateProjectAction(project.id, prev, formData),
    [project.id],
  );

  const boundDeleteAction = useCallback(
    (prev: { error: string | null }) =>
      deleteProjectAction(project.id, prev),
    [project.id],
  );

  const [state, formAction, isPending] = useActionState(boundUpdateAction, {
    error: null,
  });

  const [techStack, setTechStack] = useState(project.techStack ?? "");
  const [deployTarget, setDeployTarget] = useState(project.deployTarget);
  const [wpHeadless, setWpHeadless] = useState(project.wpHeadless);
  const [frontendStack, setFrontendStack] = useState(project.frontendStack ?? "NEXTJS");
  const [projectType, setProjectType] = useState(project.type);
  const [hostingProviderId, setHostingProviderId] = useState<HostingProviderId>(
    project.hostingProviderId ?? defaultHostingProviderForDeployTarget(project.deployTarget as DeployTarget),
  );

  // Auto-reset deploy target if incompatible with selected stack + headless mode
  const currentStackAllowedDeploys = techStack
    ? getAllowedDeployTargets(techStack as TechStack, wpHeadless)
    : (["DOCKER", "VERCEL", "SHARED_HOSTING"] as DeployTarget[]);
  if (techStack && !currentStackAllowedDeploys.includes(deployTarget as DeployTarget)) {
    setDeployTarget(currentStackAllowedDeploys[0]);
  }

  const providers = getHostingProvidersForDeployTarget(deployTarget as DeployTarget);
  const allowedHostingProviders = providers.map((p) => p.id);
  const defaultHostingProvider = defaultHostingProviderForDeployTarget(deployTarget as DeployTarget);
  const selectedProvider =
    providers.find((p) => p.id === hostingProviderId) ??
    providers.find((p) => p.id === defaultHostingProvider) ??
    providers[0];
  const providerProfileLabel = selectedProvider
    ? HOSTING_PROFILES[selectedProvider.profileId]?.label
    : null;

  useEffect(() => {
    if (!allowedHostingProviders.includes(hostingProviderId)) {
      setHostingProviderId(defaultHostingProvider);
    }
  }, [allowedHostingProviders, defaultHostingProvider, hostingProviderId]);

  // ── Modules (shared hook) ──────────────────────────────────────
  const initialModuleIds: string[] = project.modules
    ? (JSON.parse(project.modules) as string[])
    : [];
  const {
    selectedModules,
    tierSelections,
    setTierSelections,
    toggleModule,
    syncModules,
    clearModules,
  } = useModules(initialModuleIds);

  const resolvedTechStack = (techStack || "WORDPRESS") as TechStack;

  // ── Qualification (shared hook) ────────────────────────────────
  const qualification = useQualification({
    projectType: projectType as ProjectType,
    techStack: resolvedTechStack,
    selectedModules,
    billingMode: "SOLO",
    deployTarget: (deployTarget || "DOCKER") as DeployTarget,
    wpHeadless,
    tierSelections,
  });

  const offerProjectType = getOfferProjectType(
    projectType as ProjectType,
  ) as OfferProjectType;
  const offerStack = getOfferStackForProject(
    projectType as ProjectType,
    resolvedTechStack,
    wpHeadless,
  ) as OfferStack;

  const compatibleModuleIds = useMemo(() => {
    if (projectType === "STARTER") return [];
    return MODULE_CATALOG.filter((mod) =>
      isModuleCompatible(mod.id as ModuleId, offerStack, offerProjectType),
    ).map((mod) => mod.id);
  }, [offerStack, offerProjectType, projectType]);

  const mandatoryModuleIds = useMemo(
    () => getMandatoryModules(offerProjectType, offerStack),
    [offerProjectType, offerStack],
  );

  const includedModuleIds = useMemo(
    () => getIncludedModules(offerProjectType, offerStack),
    [offerProjectType, offerStack],
  );

  const lockedModuleSet = useMemo(
    () => new Set([...mandatoryModuleIds, ...includedModuleIds]),
    [mandatoryModuleIds, includedModuleIds],
  );

  useEffect(() => {
    syncModules({
      allowedIds: compatibleModuleIds,
      mandatoryIds: [...mandatoryModuleIds, ...includedModuleIds],
    });
  }, [compatibleModuleIds, mandatoryModuleIds, includedModuleIds, syncModules]);

  const toggleModuleSafe = useCallback(
    (id: ModuleId) => {
      if (lockedModuleSet.has(id)) return;
      toggleModule(id);
    },
    [lockedModuleSet, toggleModule],
  );

  if (!qualification) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <form action={formAction} className="space-y-6">
        {/* Hidden qualification inputs */}
        <input type="hidden" name="category" value={qualification.finalCategory} />
        <input type="hidden" name="modules" value={JSON.stringify(Array.from(selectedModules))} />
        <input type="hidden" name="tierSelections" value={JSON.stringify(tierSelections)} />
        <input type="hidden" name="maintenanceLevel" value={qualification.maintenance} />
        <input type="hidden" name="estimatedBudget" value={String(qualification.budget.grandTotal)} />

        {/* ── 1. Identité ──────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                <FolderOpen className="size-4 text-primary" />
              </div>
              Identité du projet
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nom du projet *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={project.name}
                required
                minLength={2}
                maxLength={100}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Le slug sera régénéré si le nom change. La config Traefik sera mise à jour.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de projet</Label>
              <select
                id="type"
                name="type"
                defaultValue={project.type}
                className={nativeSelectClass}
                onChange={(e) => {
                  const newType = e.target.value as ProjectType;
                  setProjectType(newType);
                  if (newType === "STARTER") {
                    setTechStack("WORDPRESS");
                    setWpHeadless(false);
                    clearModules();
                  }
                  // Auto-reset stack if no longer allowed for the new project type
                  if (techStack && !ALLOWED_STACKS[newType].includes(techStack as TechStack)) {
                    setTechStack("");
                    setWpHeadless(false);
                  }
                }}
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select id="status" name="status" defaultValue={project.status} className={nativeSelectClass}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Seuls les projets « Actif » sont routés via Traefik.
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={project.description ?? ""}
                placeholder="Brève description du projet…"
                rows={2}
                maxLength={2000}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── 2. Stack technique ────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10">
                <Layers className="size-4 text-blue-500" />
              </div>
              Stack technique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input type="hidden" name="techStack" value={techStack} />
            <input type="hidden" name="wpHeadless" value={wpHeadless ? "true" : "false"} />
            {wpHeadless ? <input type="hidden" name="frontendStack" value={frontendStack} /> : null}
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => { setTechStack(""); setWpHeadless(false); }}
                className={`group flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all ${
                  techStack === ""
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-lg">
                  —
                </div>
                <span className="text-sm font-medium">Aucune</span>
              </button>

              {TECH_STACK_OPTIONS
                .filter((stack) => ALLOWED_STACKS[projectType as ProjectType].includes(stack.value))
                .map((stack) => {
                  const isWpStack = stack.value === "WORDPRESS";
                  const multiplier = computeStackMultiplier(
                    projectType as ProjectType,
                    stack.value as TechStack,
                    isWpStack ? wpHeadless : false,
                  );
                  const multiplierLabel = getMultiplierLabel(
                    projectType as ProjectType,
                    stack.value as TechStack,
                    isWpStack ? wpHeadless : false,
                  );

                  return (
                    <button
                      key={stack.value}
                      type="button"
                      onClick={() => { setTechStack(stack.value); if (stack.value !== "WORDPRESS") setWpHeadless(false); }}
                      className={`group flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all ${
                        techStack === stack.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-lg">
                        {stack.icon}
                      </div>
                      <span className="text-sm font-medium">{stack.label}</span>
                      <span className="text-xs text-muted-foreground">{stack.desc}</span>
                      {multiplier !== 1 && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          {multiplierLabel}
                        </Badge>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* ── WordPress mode: Classique / Headless ──────────── */}
            {techStack === "WORDPRESS" && projectType !== "STARTER" ? (
              <div className="mt-4 space-y-3 rounded-lg border border-dashed border-blue-300/50 bg-blue-50/50 p-4 dark:border-blue-700/50 dark:bg-blue-950/20">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Mode WordPress</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => { setWpHeadless(false); }}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-all ${
                      !wpHeadless
                        ? "border-blue-500 bg-blue-500/10 shadow-sm"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <span className="text-lg">🎨</span>
                    <span className="text-sm font-medium">Classique</span>
                    <span className="text-xs text-muted-foreground">Thème WP, rendu serveur</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setWpHeadless(true); }}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-all ${
                      wpHeadless
                        ? "border-blue-500 bg-blue-500/10 shadow-sm"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <span className="text-lg">⚡</span>
                    <span className="text-sm font-medium">Headless</span>
                    <span className="text-xs text-muted-foreground">WP API + frontend JS</span>
                  </button>
                </div>
                {wpHeadless && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    2 services nécessaires : WP backend (PHP) + frontend JS.
                    Hébergement split (mutualisé + Vercel) ou unifié (Docker/VPS).
                  </p>
                )}

                {/* ── Frontend stack picker (headless only) ─────── */}
                {wpHeadless ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-medium text-muted-foreground">Frontend framework</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {TECH_STACK_OPTIONS.filter((s) => s.value !== "WORDPRESS").map((fw) => (
                        <button
                          key={fw.value}
                          type="button"
                          onClick={() => { setFrontendStack(fw.value); }}
                          className={`flex flex-col items-center gap-1 rounded-md border-2 p-2.5 text-center transition-all ${
                            frontendStack === fw.value
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          <span className="text-base">{fw.icon}</span>
                          <span className="text-xs font-medium">{fw.label}</span>
                          <span className="text-[10px] text-muted-foreground">{fw.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* ── 3. Déploiement ────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10">
                <Rocket className="size-4 text-emerald-500" />
              </div>
              Cible de déploiement
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              L&apos;hébergement et le domaine sont à la charge et la propriété du client.
            </p>
          </CardHeader>
          <CardContent>
            <input type="hidden" name="deployTarget" value={deployTarget} />
            <div className="grid gap-3 sm:grid-cols-3">
              {DEPLOY_TARGET_OPTIONS.filter((target) =>
                !techStack || currentStackAllowedDeploys.includes(target.value)
              ).map((target) => {
                const Icon = target.icon;
                const isWpH = wpHeadless && techStack === "WORDPRESS";
                const hostCost = isWpH ? HOSTING_COST_WP_HEADLESS[target.value] : HOSTING_COSTS[target.value];
                return (
                  <button
                    key={target.value}
                    type="button"
                    onClick={() => { setDeployTarget(target.value); }}
                    className={`group flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all ${
                      deployTarget === target.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <Icon className={`size-6 ${deployTarget === target.value ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">{isWpH ? hostCost.label : target.label}</span>
                    <span className="text-[10px] text-muted-foreground">{!isWpH && target.desc}</span>
                    <span className="text-[10px] text-muted-foreground/70">{hostCost.range}</span>
                  </button>
                );
              })}
            </div>
            {techStack && currentStackAllowedDeploys.length < 3 && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Certaines cibles ne sont pas compatibles avec la stack sélectionnée{wpHeadless ? " (headless)" : ""}.
              </p>
            )}
            <div className="mt-4 space-y-2">
              <Label htmlFor="hostingProviderId">Hebergeur</Label>
              <select
                id="hostingProviderId"
                name="hostingProviderId"
                value={hostingProviderId}
                className={nativeSelectClass}
                onChange={(e) => {
                  setHostingProviderId(e.target.value as HostingProviderId);
                }}
              >
                {providers.map((provider) => {
                  const suffix = provider.id === defaultHostingProvider ? " - recommande" : "";
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
              {providerProfileLabel ? (
                <p className="text-[11px] text-muted-foreground">
                  Profil technique: {providerProfileLabel}
                </p>
              ) : null}
              {techStack === "WORDPRESS" ? (
                <p className="text-[11px] text-muted-foreground">
                  Ce choix ajuste automatiquement les plugins WordPress (cache, WAF, SMTP, etc.).
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* ── 4. Qualification & Modules ───────────────────────── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10">
                <Layers className="size-4 text-violet-500" />
              </div>
              Qualification & Modules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ── Summary bar ───────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
              <Badge className={CATEGORY_COLORS[qualification.finalCategory]}>
                {CATEGORY_LABELS[qualification.finalCategory]}
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ShieldCheck className="size-3.5" />
                <span>{MAINTENANCE_LABELS[qualification.maintenance]}</span>
                <span className="text-xs">({MAINTENANCE_PRICES[qualification.maintenance]})</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-sm font-medium">
                <Euro className="size-3.5 text-muted-foreground" />
                {formatEur(qualification.budget.grandTotal)}
              </div>
            </div>

            {/* ── Requalification alert ─────────────────── */}
            {qualification.wasRequalified && (
              <div className={`flex items-start gap-3 rounded-lg border p-3 ${CATEGORY_COLORS[qualification.finalCategory]}`}>
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">
                    Requalification : {CATEGORY_SHORT[qualification.initialCategory]} → {CATEGORY_SHORT[qualification.finalCategory]}
                  </p>
                  <p className="mt-0.5 text-xs opacity-80">
                    Modules structurants : {qualification.requalifyingModules.map((m) => m.name).join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* ── Module groups ─────────────────────────── */}
            {projectType === "STARTER" ? (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                Les projets Starter n&apos;incluent pas de modules optionnels.
              </div>
            ) : (
              Object.entries(groupModules(MODULE_CATALOG)).map(([groupKey, mods]) => {
                const GroupIcon = GROUP_ICONS[groupKey] ?? Wrench;
                const visibleMods = mods.filter((mod) =>
                  compatibleModuleIds.includes(mod.id),
                );
                if (visibleMods.length === 0) return null;
                return (
                  <div key={groupKey} className="space-y-2">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <GroupIcon className="size-4" />
                      {MODULE_GROUPS[groupKey as ModuleDef["group"]]}
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {visibleMods.map((mod) => (
                        <ModuleCard
                          key={mod.id}
                          mod={mod}
                          isSelected={selectedModules.has(mod.id)}
                          onToggle={() => { toggleModuleSafe(mod.id); }}
                          tierSel={tierSelections[mod.id]}
                          onTierChange={(modId, ts) => { setTierSelections((prev) => ({ ...prev, [modId]: ts })); }}
                          techStack={resolvedTechStack}
                          projectType={projectType as ProjectType}
                          wpHeadless={wpHeadless}
                          initialCategory={qualification.initialCategory}
                          isMandatory={mandatoryModuleIds.includes(mod.id)}
                          isIncluded={includedModuleIds.includes(mod.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {/* ── Budget breakdown ──────────────────────── */}
            {(selectedModules.size > 0 || qualification.budget.deployCost > 0) && (
              <BudgetBreakdown
                budget={qualification.budget}
                moduleCount={selectedModules.size}
                projectType={projectType as ProjectType}
                techStack={resolvedTechStack}
                wpHeadless={wpHeadless}
                variant="compact"
              />
            )}
          </CardContent>
        </Card>

        {/* ── 5. Réseau & dépôt ─────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10">
                <Monitor className="size-4 text-orange-500" />
              </div>
              Réseau & dépôt
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="domain" className="flex items-center gap-1.5">
                <Globe className="size-3.5 text-muted-foreground" />
                Domaine
              </Label>
              <Input
                id="domain"
                name="domain"
                defaultValue={project.domain ?? ""}
                placeholder="Ex: mon-site.localhost"
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
                defaultValue={project.port ?? undefined}
                placeholder="Auto-assigné"
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
                defaultValue={project.gitRepo ?? ""}
                placeholder="https://github.com/…"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Error + Submit ────────────────────────────────────── */}
        {state.error ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            {state.error}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} size="lg" className="gap-2">
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>

      {/* ── Zone de danger ──────────────────────────────────────── */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <div className="flex size-7 items-center justify-center rounded-lg bg-destructive/10">
              <Trash2 className="size-4 text-destructive" />
            </div>
            Zone de danger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            La suppression arrêtera les conteneurs Docker, supprimera les fichiers de configuration et retirera la route Traefik.
          </p>
          <DeleteButton
            action={boundDeleteAction}
            entityName="le projet"
            entityLabel={project.name}
          />
        </CardContent>
      </Card>
    </div>
  );
}
