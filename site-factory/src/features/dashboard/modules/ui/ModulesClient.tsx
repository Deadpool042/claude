"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MODULES,
  MODULE_CATEGORY_LABELS,
  STACK_LABELS,
  STACK_PRICING_NOTES,
  formatPriceEUR,
  getModulePriceForStack,
  isModuleCompatible,
  type ModuleCategory,
  type Stack,
} from "@/lib/offers";

const nativeSelectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

type CategoryFilter = ModuleCategory | "all";

const CATEGORY_BADGE_STYLES: Record<ModuleCategory, string> = {
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

const CATEGORY_CARD_STYLES: Record<ModuleCategory, string> = {
  ux: "border-l-sky-500/60",
  seo: "border-l-emerald-500/60",
  commerce: "border-l-amber-500/60",
  marketing: "border-l-rose-500/60",
  security: "border-l-red-500/60",
  ops: "border-l-slate-500/60",
  architecture: "border-l-teal-500/60",
  performance: "border-l-orange-500/60",
  data: "border-l-cyan-500/60",
  metier: "border-l-lime-500/60",
};

function formatPriceRange(price: ReturnType<typeof getModulePriceForStack>): string {
  if (!price || price.priceFrom == null) return "—";
  if (price.priceTo && price.priceTo !== price.priceFrom) {
    return `${formatPriceEUR(price.priceFrom)} - ${formatPriceEUR(price.priceTo)}`;
  }
  return formatPriceEUR(price.priceFrom);
}

export function ModulesClient() {
  const [stack, setStack] = useState<Stack>("WORDPRESS");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const stackOptions = useMemo(
    () => Object.keys(STACK_LABELS) as Stack[],
    [],
  );

  const availableModules = useMemo(
    () => MODULES.filter((mod) => isModuleCompatible(mod.id, stack)),
    [stack],
  );

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
  }, [availableModules, search, categoryFilter]);

  const stackNotes = STACK_PRICING_NOTES[stack];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
      <div className="space-y-6">
        <Card className="border-border/60 bg-linear-to-br from-primary/10 via-transparent to-transparent transition hover:shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              Stack sélectionnée
              <Badge variant="outline" className="border-primary/40 text-primary">
                {STACK_LABELS[stack]}
              </Badge>
            </CardTitle>
            <CardDescription>
              La stack impacte l'approche technique et le tarif.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            </div>
            <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
              <p className="font-medium">{stackNotes.label}</p>
              <p className="text-xs text-muted-foreground">{stackNotes.summary}</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                {stackNotes.details.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="transition hover:shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Filtrage</CardTitle>
            <CardDescription>
              Recherche par module ou catégorie.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un module"
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Catégorie
              </label>
              <select
                id="category"
                className={nativeSelectClass}
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
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
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredModules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucun module compatible pour cette stack.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredModules.map((mod) => (
              <Card
                key={mod.id}
                className={`group flex h-full flex-col border-l-4 transition hover:-translate-y-0.5 hover:shadow-xl ${CATEGORY_CARD_STYLES[mod.categories[0]]}`}
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
                        className={CATEGORY_BADGE_STYLES[category]}
                      >
                        {MODULE_CATEGORY_LABELS[category]}
                      </Badge>
                    ))}
                  </div>
                  <CardDescription>{mod.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Compatibilité</span>
                    <span className="text-right text-xs font-medium">
                      {STACK_LABELS[stack]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">À partir de</span>
                    <span className="font-medium">
                      {formatPriceRange(getModulePriceForStack(mod.id, "VITRINE_BLOG", stack))}
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
                  <Button asChild size="sm" variant="outline" className="group-hover:text-primary">
                    <Link href={`/dashboard/modules/${mod.id}`}>Voir détails</Link>
                  </Button>
                  <p className="text-[11px] text-muted-foreground">{mod.id}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
