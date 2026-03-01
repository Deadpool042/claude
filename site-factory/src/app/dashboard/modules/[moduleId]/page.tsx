import Link from "next/link";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/shell/page-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MODULES,
  MODULE_CATEGORY_LABELS,
  STACK_LABELS,
  STACK_PRICING_NOTES,
  formatPriceEUR,
  getModulePriceForStack,
  type Stack,
  type ModuleCategory,
} from "@/lib/offers/offers";

interface ModuleDetailPageProps {
  params: Promise<{ moduleId: string }>;
}

function formatPriceRange(
  price: ReturnType<typeof getModulePriceForStack> | null,
): string {
  if (!price || price.priceFrom == null) return "—";
  if (price.priceTo && price.priceTo !== price.priceFrom) {
    return `${formatPriceEUR(price.priceFrom)} - ${formatPriceEUR(price.priceTo)}`;
  }
  return formatPriceEUR(price.priceFrom);
}

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

const STACK_CARD_STYLES: Record<Stack, string> = {
  WORDPRESS: "border-l-emerald-500/60",
  NEXTJS: "border-l-indigo-500/60",
  NUXT: "border-l-violet-500/60",
  ASTRO: "border-l-amber-500/60",
  WORDPRESS_HEADLESS: "border-l-teal-500/60",
  WOOCOMMERCE: "border-l-green-500/60",
  WOOCOMMERCE_HEADLESS: "border-l-rose-500/60",
};

export default async function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const { moduleId } = await params;
  const mod = MODULES.find((entry) => entry.id === moduleId);

  if (!mod) {
    notFound();
  }

  const allStacks = Object.keys(STACK_LABELS) as Stack[];

  return (
    <PageLayout
      title={mod.label}
      description={`Module ${mod.id}`}
      toolbar={
        <Link href="/dashboard/modules" className="text-sm text-muted-foreground hover:text-foreground">
          Retour aux modules
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        <div className="space-y-6">
          <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-transparent to-transparent transition hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Presentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{mod.description}</p>
              <div className="flex flex-wrap gap-2">
                {mod.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className={CATEGORY_BADGE_STYLES[category]}
                  >
                    {MODULE_CATEGORY_LABELS[category]}
                  </Badge>
                ))}
                {mod.compatibleWith === "ALL" ? (
                  <Badge variant="secondary">Compatible: toutes stacks</Badge>
                ) : (
                  <Badge variant="secondary">
                    Compatible: {mod.compatibleWith.map((s) => STACK_LABELS[s]).join(", ")}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {mod.details && mod.details.length > 0 ? (
            <Card className="transition hover:shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Contenu du module</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {mod.details.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="transition hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tarif par stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allStacks.map((stack) => {
                const isCompatible =
                  mod.compatibleWith === "ALL" || mod.compatibleWith.includes(stack);
                const price = isCompatible
                  ? getModulePriceForStack(mod.id, "VITRINE_BLOG", stack)
                  : null;
                const note = STACK_PRICING_NOTES[stack];

                return (
                  <div
                    key={stack}
                    className={`rounded-md border border-border/60 bg-muted/20 p-3 transition hover:-translate-y-0.5 hover:shadow ${STACK_CARD_STYLES[stack]}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{STACK_LABELS[stack]}</p>
                        <p className="text-xs text-muted-foreground">{note.summary}</p>
                      </div>
                      <div className="text-sm font-semibold">
                        {isCompatible ? formatPriceRange(price) : "Non compatible"}
                      </div>
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                      {note.details.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
