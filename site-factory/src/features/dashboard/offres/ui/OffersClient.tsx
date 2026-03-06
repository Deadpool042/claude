"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useMediaQuery } from "@/shared/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import {
  DEFAULT_STACK_BY_OFFER,
  DEPLOYMENT_FEES,
  DEPLOYMENT_NOTES,
  MODULES,
  MODULE_CATEGORY_LABELS,
  CATEGORY_LABELS,
  MAINTENANCE_BY_CATEGORY,
  MAINTENANCE_LABELS,
  MAINTENANCE_PRICES,
  OFFER_CATEGORY_LABELS,
  OFFER_CATEGORY_ORDER,
  OFFER_CATEGORY_STACKS,
  PRICING_CTA,
  PRICING_DISCLAIMER,
  PRICE_DRIVERS,
  STACK_PRICING_NOTES,
  STACK_LABELS,
  formatPriceEUR,
  computeEstimate,
  getMandatoryModules,
  getIncludedModules,
  getModuleById,
  getBasePrice,
  getModulePriceForStack,
  isModuleCompatible,
  type ModuleDef,
  type ModuleCategory,
  type ModuleId,
  type OfferCategory,
  type ProjectCategory,
  type Stack,
  type PriceRange,
} from "@/lib/offers";

const nativeSelectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

type CategoryFilter = ModuleCategory | "all";

type PublicSummary = {
  id: string;
  title: string;
  tier: string;
  priceLabel: string;
  maintenance: string;
  bullets: string[];
};

const PUBLIC_SUMMARY_OFFERS: PublicSummary[] = [
  // {
  //   id: "starter",
  //   title: "Starter",
  //   tier: CATEGORY_LABELS[0],
  //   priceLabel: `À partir de ${formatPriceRange(
  //     getBasePrice("STARTER", "WORDPRESS"),
  //   )}`,
  //   maintenance: `${MAINTENANCE_LABELS.MINIMAL} · ${MAINTENANCE_PRICES.MINIMAL}`,
  //   bullets: ["Mini-site 1-3 pages", "Sans modules optionnels", "Socle minimal obligatoire"],
  // },
  {
    id: "standard",
    title: "Standard",
    tier: CATEGORY_LABELS[1],
    priceLabel: `À partir de ${formatPriceRange(
      getBasePrice("VITRINE_BLOG", "WORDPRESS"),
    )}`,
    maintenance: `${MAINTENANCE_LABELS.STANDARD} · ${MAINTENANCE_PRICES.STANDARD}`,
    bullets: ["Vitrine / blog simple", "Modules limités", "Socle technique commun inclus"],
  },
  {
    id: "avancee",
    title: "Avancée",
    tier: CATEGORY_LABELS[2],
    priceLabel: `À partir de ${formatPriceRange(
      getBasePrice("ECOMMERCE", "WOOCOMMERCE"),
    )}`,
    maintenance: `${MAINTENANCE_LABELS.ADVANCED} · ${MAINTENANCE_PRICES.ADVANCED}`,
    bullets: ["E-commerce simple ou parcours avancés", "Modules structurants possibles", "Performance et sécurité renforcées"],
  },
  {
    id: "premium",
    title: "Premium",
    tier: CATEGORY_LABELS[4],
    priceLabel: "Sur devis",
    maintenance: `${MAINTENANCE_LABELS.PREMIUM} · ${MAINTENANCE_PRICES.PREMIUM}`,
    bullets: ["Cas métier / réglementés", "Headless, perfs avancées", "Accompagnement sur-mesure"],
  },
];

const CATEGORY_BADGE_STYLES: Record<ProjectCategory, string> = {
  0: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  1: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  2: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  3: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  4: "border-orange-500/40 bg-orange-500/10 text-orange-200",
};

const CATEGORY_PANEL_STYLES: Record<ProjectCategory, string> = {
  0: "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent",
  1: "border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent",
  2: "border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent",
  3: "border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent",
  4: "border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent",
};

const MODULE_CATEGORY_BADGE_STYLES: Record<ModuleCategory, string> = {
  ux: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  seo: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  commerce: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  marketing: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  security: "border-red-500/40 bg-red-500/10 text-red-200",
  ops: "border-slate-500/40 bg-slate-500/10 text-slate-200",
  architecture: "border-teal-500/40 bg-teal-500/10 text-teal-200",
  performance: "border-orange-500/40 bg-orange-500/10 text-orange-200",
  data: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
  metier: "border-lime-500/40 bg-lime-500/10 text-lime-200",
};

function formatPriceRange(price: PriceRange | null): string {
  if (!price || price.priceFrom == null) return "—";
  if (price.priceTo && price.priceTo !== price.priceFrom) {
    return `${formatPriceEUR(price.priceFrom)} - ${formatPriceEUR(price.priceTo)}`;
  }
  return formatPriceEUR(price.priceFrom);
}

function formatCompatibleStacks(compatible: Stack[] | "ALL"): string {
  if (compatible === "ALL") return "Tous stacks";
  return compatible.map((stack) => STACK_LABELS[stack]).join(", ");
}

export function OffersClient() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [projectType, setProjectType] = useState<OfferCategory>("VITRINE_BLOG");
  const [stack, setStack] = useState<Stack>("WORDPRESS")
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedOptionalModules, setSelectedOptionalModules] = useState<Set<ModuleId>>(new Set());
  const [deploymentFeeId, setDeploymentFeeId] = useState<string>(
    DEPLOYMENT_FEES[0]?.id ?? "",
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<ModuleId | null>(null);
  const selectedModulesParam = useMemo(
    () => Array.from(selectedOptionalModules).sort().join(","),
    [selectedOptionalModules],
  );

  const ctaHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("offerProjectType", projectType);
    params.set("offerStack", stack);
    if (selectedModulesParam) params.set("offerModules", selectedModulesParam);
    if (deploymentFeeId) params.set("offerDeployment", deploymentFeeId);
    const query = params.toString();
    return query ? `${PRICING_CTA.href}?${query}` : PRICING_CTA.href;
  }, [projectType, stack, selectedModulesParam, deploymentFeeId]);

  const _toggleOptionalModule = (moduleId: ModuleId) => {
    setSelectedOptionalModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const _openModuleDetails = (moduleId: ModuleId) => {
    setActiveModuleId(moduleId);
    setDetailsOpen(true);
  };

  useEffect(() => {
    const allowedStacks = OFFER_CATEGORY_STACKS[projectType];
    if (!allowedStacks.includes(stack)) {
      setStack(DEFAULT_STACK_BY_OFFER[projectType]);
    }
  }, [projectType, stack]);

  useEffect(() => {
    setSelectedOptionalModules(new Set());
  }, [projectType, stack]);

  const estimate = computeEstimate(
    projectType,
    stack,
    Array.from(selectedOptionalModules),
    deploymentFeeId,
  );
  const basePriceLabel = formatPriceRange(estimate.basePrice ?? null);
  const stackOptions = OFFER_CATEGORY_STACKS[projectType];
  const includedModuleIds = getIncludedModules(projectType, stack);
  const mandatoryModuleIds = getMandatoryModules(projectType, stack);
  const _includedModules = includedModuleIds.map((id) => getModuleById(id));
  const mandatoryModuleSet = new Set(mandatoryModuleIds);
  const includedModuleSet = new Set(includedModuleIds);

  const selectedModuleIds = [
    ...mandatoryModuleIds,
    ...Array.from(selectedOptionalModules),
  ].filter((id, index, arr) => arr.indexOf(id) === index);
  const selectedModules = selectedModuleIds.map((id) => getModuleById(id));
  const catBase = estimate.catBase;
  const catEstimated = estimate.catEstimated;
  const maintenanceBase = MAINTENANCE_BY_CATEGORY[catBase];
  const maintenanceEstimated = MAINTENANCE_BY_CATEGORY[catEstimated];

  const deploymentFee =
    DEPLOYMENT_FEES.find((fee) => fee.id === deploymentFeeId) ??
    DEPLOYMENT_FEES[0] ??
    null;
  const deployPrice = deploymentFee?.price ?? estimate.deploymentFee ?? null;

  const availableModules = useMemo(() => {
    return MODULES.filter((mod) => isModuleCompatible(mod.id, stack, projectType));
  }, [stack, projectType]);

  const categoryOptions = useMemo(() => {
    const categories = new Set<ModuleCategory>();
    availableModules.forEach((mod) => {
      mod.categories.forEach((cat) => categories.add(cat));
    });
    return ["all", ...Array.from(categories)];
  }, [availableModules]);

  useEffect(() => {
    if (categoryFilter !== "all" && !categoryOptions.includes(categoryFilter)) {
      setCategoryFilter("all");
    }
  }, [categoryFilter, categoryOptions]);

  const filteredModules = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    return availableModules
      .filter((mod) =>
        categoryFilter === "all" ? true : mod.categories.includes(categoryFilter),
      )
      .filter((mod) => {
        if (!lowered) return true;
        return (
          mod.label.toLowerCase().includes(lowered) ||
          mod.description.toLowerCase().includes(lowered) ||
          mod.id.toLowerCase().includes(lowered)
        );
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [availableModules, categoryFilter, search]);

  const activeModule = activeModuleId ? getModuleById(activeModuleId) : null;
  const stackNote = STACK_PRICING_NOTES[stack];

  const renderModuleDetails = (module: ModuleDef) => (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {module.categories.map((category) => (
          <Badge
            key={category}
            variant="outline"
            className={MODULE_CATEGORY_BADGE_STYLES[category]}
          >
            {MODULE_CATEGORY_LABELS[category]}
          </Badge>
        ))}
        {mandatoryModuleSet.has(module.id) && (
          <Badge variant="destructive" className="text-[10px]">
            Obligatoire
          </Badge>
        )}
        {includedModuleSet.has(module.id) && (
          <Badge variant="secondary" className="text-[10px]">
            Inclus
          </Badge>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Compatibilité</p>
        <p className="font-medium">{formatCompatibleStacks(module.compatibleWith)}</p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Prix pour {STACK_LABELS[stack]}</p>
        <p className="text-lg font-semibold">
          {formatPriceRange(getModulePriceForStack(module.id, projectType, stack))}
        </p>
        <p className="text-xs text-muted-foreground">{stackNote.summary}</p>
      </div>

      {module.details.length > 0 ? (
        <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Contenu</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {module.details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {module.subscriptions && module.subscriptions.length > 0 ? (
        <div className="space-y-1 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs">
          <p className="font-medium">Abonnements mensuels</p>
          {module.subscriptions.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between">
              <span>{sub.label}</span>
              <span>{formatPriceEUR(sub.priceMonthly)}/mois</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/dashboard/modules/${module.id}`}>Voir la fiche module</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-6 space-y-3">
        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Référence interne</Badge>
            <span>
              Non public. La stack et les modules sont proposés après qualification, selon la demande client.
            </span>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {PUBLIC_SUMMARY_OFFERS.map((item) => (
            <Card key={item.id} className="border-border/60 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  {item.title}
                  <Badge variant="outline" className="text-[10px]">
                    {item.tier}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">{item.maintenance}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-lg font-semibold">{item.priceLabel}</div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/70" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs value={projectType} onValueChange={(value) => setProjectType(value as OfferCategory)}>
        <TabsList variant="line" className="w-full justify-start border-b">
          {OFFER_CATEGORY_ORDER.map((type) => (
            <TabsTrigger
              key={type}
              value={type}
              className="gap-1.5 transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
            >
              {OFFER_CATEGORY_LABELS[type]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={projectType} className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
            <div className="space-y-6">
            <Card className="transition hover:shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  Prix de base
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${CATEGORY_BADGE_STYLES[catBase]}`}
                  >
                    {CATEGORY_LABELS[catBase]}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  À partir de, selon la stack et la qualif du projet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`rounded-lg border p-4 ${CATEGORY_PANEL_STYLES[catBase]}`}>
                  <p className="text-xs text-muted-foreground">À partir de</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-semibold">{basePriceLabel}</span>
                    <span className="text-xs text-muted-foreground">HT</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Stack sélectionnée: {STACK_LABELS[stack]}
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="stack" className="text-sm font-medium">
                    Stack
                  </label>
                  <div className="hidden flex-wrap gap-2 sm:flex">
                    {stackOptions.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        size="sm"
                        variant={stack === option ? "secondary" : "outline"}
                        className="transition hover:-translate-y-0.5 hover:shadow"
                        onClick={() => setStack(option)}
                      >
                        {STACK_LABELS[option]}
                      </Button>
                    ))}
                  </div>
                  <select
                    id="stack"
                    name="stack"
                    className={`sm:hidden ${nativeSelectClass}`}
                    value={stack}
                    onChange={(event) => setStack(event.target.value as Stack)}
                  >
                    {stackOptions.map((option) => (
                      <option key={option} value={option}>
                        {STACK_LABELS[option]}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    La stack finale est proposée après qualification détaillée.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* <Card className="transition hover:shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Socle technique commun</CardTitle>
                <CardDescription>Inclus dans toutes les offres hors Starter.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {projectType === "STARTER" ? (
                  <p className="text-sm text-muted-foreground">
                    Starter: maintenance minimale obligatoire, sans socle technique commun.
                  </p>
                ) : (
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {SOCLE_TECHNIQUE_ITEMS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {includedModules.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {includedModules.map((mod) => (
                      <Badge key={mod.id} variant="secondary">
                        {mod.label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card> */}

            <Card className="transition hover:shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Frais de mise en ligne</CardTitle>
                <CardDescription>Configuration initiale et déploiement.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {DEPLOYMENT_FEES.map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
                  >
                    <span>{fee.label}</span>
                    <span className="font-medium">{formatPriceRange(fee.price)}</span>
                  </div>
                ))}
                {DEPLOYMENT_NOTES.length > 0 ? (
                  <ul className="list-disc pl-5 text-xs text-muted-foreground">
                    {DEPLOYMENT_NOTES.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>

            <Card className="transition hover:shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Ce qui fait varier le prix</CardTitle>
                <CardDescription>Résumé rapide des facteurs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {PRICE_DRIVERS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  {PRICING_DISCLAIMER}
                </div>
                <Button
                  asChild
                  className="bg-linear-to-r from-sky-500 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20"
                >
                  <Link href={ctaHref}>{PRICING_CTA.label}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="transition hover:shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-base">
                  Estimation
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${CATEGORY_BADGE_STYLES[catEstimated]}`}
                    >
                      {CATEGORY_LABELS[catEstimated]}
                    </Badge>
                    {estimate.isRequalified ? (
                      <Badge variant="secondary" className="text-[10px]">
                        Requalification
                      </Badge>
                    ) : null}
                  </div>
                </CardTitle>
                <CardDescription>Base + modules + mise en ligne.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Cat base</span>
                    <span>{CATEGORY_LABELS[catBase]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cat estimée</span>
                    <span>{CATEGORY_LABELS[catEstimated]}</span>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Maintenance recommandée</span>
                    <span>
                      {MAINTENANCE_LABELS[maintenanceBase]} · {MAINTENANCE_PRICES[maintenanceBase]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Maintenance estimée</span>
                    <span>
                      {MAINTENANCE_LABELS[maintenanceEstimated]} · {MAINTENANCE_PRICES[maintenanceEstimated]}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Le niveau pourra être ajusté ensuite dans Maintenance.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Base</span>
                  <span className="font-medium">{basePriceLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Modules ({String(selectedModuleIds.length)})
                  </span>
                  <span className="font-medium">
                    {formatPriceRange(estimate.modulesTotal)}
                  </span>
                </div>
                <div className="space-y-2">
                  <label htmlFor="deployment" className="text-xs font-medium text-muted-foreground">
                    Mise en ligne
                  </label>
                  <select
                    id="deployment"
                    className={nativeSelectClass}
                    value={deploymentFeeId}
                    onChange={(event) => setDeploymentFeeId(event.target.value)}
                  >
                    {DEPLOYMENT_FEES.map((fee) => (
                      <option key={fee.id} value={fee.id}>
                        {fee.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Déploiement</span>
                  <span className="font-medium">{formatPriceRange(deployPrice)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2 font-semibold">
                  <span>Total estimatif</span>
                  <span>
                    {formatPriceRange(estimate.total)}
                  </span>
                </div>
                {selectedModules.length > 0 ? (
                  <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                    <p className="text-xs font-medium">Modules sélectionnés</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedModules.map((mod) => (
                        <Badge key={mod.id} variant="secondary" className="text-[10px]">
                          {mod.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                <p className="text-[11px] text-muted-foreground">
                  {PRICING_DISCLAIMER}
                </p>
              </CardContent>
            </Card>

            <Card className="transition hover:shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Modules compatibles</CardTitle>
                <CardDescription>
                  Filtrage par catégorie, recherche, compatibilité.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Rechercher un module"
                      className="pl-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-4 text-muted-foreground" />
                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
                      className={nativeSelectClass}
                    >
                      {categoryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option === "all"
                            ? "Toutes catégories"
                            : MODULE_CATEGORY_LABELS[option as ModuleCategory]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredModules.length} module(s) disponible(s) pour {STACK_LABELS[stack]}.
                </p>
              </CardContent>
            </Card>

            {/* {filteredModules.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  {projectType === "STARTER"
                    ? "Aucun module disponible pour l'offre Starter."
                    : "Aucun module ne correspond a ces filtres."}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredModules.map((mod) => (
                  <Card
                    key={mod.id}
                    className={`group flex h-full flex-col border-l-4 transition hover:-translate-y-0.5 hover:shadow-xl ${MODULE_CATEGORY_CARD_STYLES[mod.categories[0]]} ${
                      selectedOptionalModules.has(mod.id) ? "ring-1 ring-primary/40 bg-primary/10" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base transition group-hover:text-primary">
                          {mod.label}
                        </CardTitle>
                        {mod.categories.map((category) => (
                          <Badge
                            key={category}
                            variant="outline"
                            className={MODULE_CATEGORY_BADGE_STYLES[category]}
                          >
                            {MODULE_CATEGORY_LABELS[category]}
                          </Badge>
                        ))}
                        {mandatoryModuleSet.has(mod.id) && (
                          <Badge variant="destructive" className="text-[10px]">
                            Obligatoire
                          </Badge>
                        )}
                        {includedModuleSet.has(mod.id) && (
                          <Badge variant="secondary" className="text-[10px]">
                            Inclus
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{mod.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Compatibilité</span>
                        <span className="text-right text-xs font-medium">
                          {formatCompatibleStacks(mod.compatibleWith)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">À partir de</span>
                        <span className="font-medium">
                          {formatPriceRange(
                            getModulePriceForStack(mod.id, projectType, stack),
                          )}
                        </span>
                      </div>
                      {mod.details && mod.details.length > 0 ? (
                        <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                          <p className="font-medium text-foreground">Contenu</p>
                          <ul className="mt-1 list-disc space-y-1 pl-4">
                            {mod.details.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {mod.subscriptions && mod.subscriptions.length > 0 ? (
                        <div className="space-y-1 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs">
                          <p className="font-medium">Abonnements mensuels</p>
                          {mod.subscriptions.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between">
                              <span>{sub.label}</span>
                              <span>{formatPriceEUR(sub.priceMonthly)}/mois</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {!includedModuleSet.has(mod.id) && (
                          <Button
                            type="button"
                            size="sm"
                            variant={selectedOptionalModules.has(mod.id) ? "secondary" : "outline"}
                            disabled={mandatoryModuleSet.has(mod.id)}
                            onClick={() => toggleOptionalModule(mod.id)}
                          >
                            {mandatoryModuleSet.has(mod.id)
                              ? "Obligatoire"
                              : selectedOptionalModules.has(mod.id)
                                ? "Retirer"
                                : "Ajouter"}
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="group-hover:text-primary"
                          onClick={() => openModuleDetails(mod.id)}
                        >
                          Details
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{mod.id}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )} */}
          </div>
        </div>
        </TabsContent>
      </Tabs>

      {activeModule ? (
        isDesktop ? (
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{activeModule.label}</DialogTitle>
                <DialogDescription>{activeModule.description}</DialogDescription>
              </DialogHeader>
              {renderModuleDetails(activeModule)}
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{activeModule.label}</DrawerTitle>
                <DrawerDescription>{activeModule.description}</DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-4">{renderModuleDetails(activeModule)}</div>
            </DrawerContent>
          </Drawer>
        )
      ) : null}
    </>
  );
}
