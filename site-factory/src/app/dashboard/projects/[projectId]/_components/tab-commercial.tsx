import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Euro, ShieldCheck, Layers, Receipt, Bot, CalendarClock } from "lucide-react";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_SHORT,
  MAINTENANCE_LABELS,
  MAINTENANCE_PRICES,
  MODULE_CATALOG,
  MODULE_GROUPS,
  resolveModulePrice,
  groupModules,
  normalizeModuleIds,
  type Category,
  type MaintenanceLevel,
  type ModuleDef,
  type ProjectType,
  type TechStack,
} from "@/lib/qualification";
import { MODULE_ICONS, GROUP_ICONS, formatEur } from "@/lib/qualification-ui";
import { Wrench } from "lucide-react";
import { QuoteActions } from "./quote-actions";

// ── Types ──────────────────────────────────────────────────────────

interface TabCommercialProps {
  project: {
    id: string;
    name: string;
    slug: string;
    type: string;
    category: string | null;
    techStack: string | null;
    wpHeadless: boolean;
    deployTarget: string;
    description: string | null;
  };
  client: {
    name: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
  };
  config: {
    modules: string | null;
    maintenanceLevel: string | null;
    estimatedBudget: number | null;
  } | null;
}

// ── Component ──────────────────────────────────────────────────────

export function TabCommercial({ project, config }: TabCommercialProps) {
  const resolvedProjectType = project.type as ProjectType;
  const resolvedTechStack = (project.techStack || "WORDPRESS") as TechStack;

  const moduleIds: string[] = config?.modules
    ? normalizeModuleIds(JSON.parse(config.modules) as string[])
    : [];
  const activeModuleSet = new Set(moduleIds);
  const activeModules = moduleIds
    .map((id) => MODULE_CATALOG.find((m) => m.id === id))
    .filter((m): m is (typeof MODULE_CATALOG)[number] => m != null);

  const maintenance = config?.maintenanceLevel as MaintenanceLevel | null;
  const budget = config?.estimatedBudget;

  const getModuleMonthly = (mod: ModuleDef): number => {
    if (mod.subscriptionTiers && mod.subscriptionTiers.length > 0) {
      return Math.min(...mod.subscriptionTiers.map((tier) => tier.priceMonthly));
    }
    return mod.priceMonthly;
  };

  // ── IA subscription ──
  const iaModule = activeModules.find((m) => m.id === "module-assistant-ia");
  const hasIa = iaModule != null;
  // Default subscription = lowest available tier (if present)
  const iaMonthly = iaModule ? getModuleMonthly(iaModule) : 0;
  // All subscription tiers for display
  const iaSubscriptionTiers = iaModule?.subscriptionTiers ?? [];

  // ── Coûts récurrents totaux ──
  const totalMonthly =
    activeModules.reduce((sum, m) => sum + getModuleMonthly(m), 0);

  return (
    <div className="space-y-6">
      {/* ── Résumé financier ───────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Euro className="size-3.5" />
              Budget total estimé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {budget != null ? formatEur(budget) : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Receipt className="size-3.5" />
              Catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.category ? (
              <div className="space-y-1">
                <Badge
                  className={`text-sm ${CATEGORY_COLORS[project.category as Category]}`}
                >
                  {CATEGORY_LABELS[project.category as Category]}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_SHORT[project.category as Category]}
                </p>
              </div>
            ) : (
              <span className="text-muted-foreground">Non qualifié</span>
            )}
          </CardContent>
        </Card>

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
      </div>

      {/* ── Modules activés ────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="size-4 text-muted-foreground" />
            Modules activés
            {activeModules.length > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {String(activeModules.length)} module
                {activeModules.length > 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeModules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun module activé pour ce projet.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupModules(MODULE_CATALOG)).map(
                ([groupKey, mods]) => {
                  const groupActive = mods.filter((m) =>
                    activeModuleSet.has(m.id),
                  );
                  if (groupActive.length === 0) return null;

                  const GroupIcon = GROUP_ICONS[groupKey] ?? Wrench;

                  return (
                    <div key={groupKey} className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <GroupIcon className="size-4" />
                        {MODULE_GROUPS[groupKey as ModuleDef["group"]]}
                      </h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {groupActive.map((mod) => {
                          const ModIcon =
                            MODULE_ICONS[mod.icon] ?? Wrench;
                          const resolved = resolveModulePrice(
                            mod,
                            resolvedProjectType,
                            resolvedTechStack,
                            project.wpHeadless,
                          );
                          const setupLabel = `${formatEur(resolved.setup)}${
                            resolved.setupMax ? `–${formatEur(resolved.setupMax)}` : ""
                          }`;
                          return (
                            <div
                              key={mod.id}
                              className="flex items-center gap-3 rounded-lg border p-3"
                            >
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <ModIcon className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {mod.name}
                                  </span>
                                  {mod.isStructurant && (
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] px-1 py-0"
                                    >
                                      structurant
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {mod.description}
                                </p>
                              </div>
                              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                                {setupLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Abonnement IA ──────────────────────────── */}
      {hasIa && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="size-4 text-blue-600 dark:text-blue-400" />
              Abonnement Assistant IA
            </CardTitle>
            <CardDescription>
              Coût mensuel de l&apos;abonnement IA (hébergement, API, maintenance)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatEur(iaMonthly)}
              </span>
              <span className="text-sm text-muted-foreground">/ mois</span>
            </div>
            {iaSubscriptionTiers.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Paliers disponibles :
                </p>
                {iaSubscriptionTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between rounded border px-3 py-1.5"
                  >
                    <div>
                      <span className="text-sm font-medium">{tier.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {tier.description}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formatEur(tier.priceMonthly)}/mois
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Récapitulatif mensuel ──────────────────── */}
      {totalMonthly > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="size-4 text-muted-foreground" />
              Coûts récurrents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {formatEur(totalMonthly)}
              </span>
              <span className="text-sm text-muted-foreground">/ mois</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Total des abonnements mensuels liés aux modules actifs
              {maintenance
                ? ` (hors maintenance ${MAINTENANCE_LABELS[maintenance]})`
                : ""}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Générer un devis ───────────────────────── */}
      <QuoteActions
        projectId={project.id}
        projectName={project.name}
      />
    </div>
  );
}
