//src/app/dashboard/projects/new/_components/step-summary.tsx
"use client";

import { useWizard } from "../_providers/wizard-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BudgetBreakdown } from "@/components/qualification/budget-breakdown";
import { AlertTriangle } from "lucide-react";
import { formatEur } from "@/lib/qualification-ui";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_SHORT,
  TECH_STACK_LABELS,
  HOSTING_COSTS,
  HOSTING_COST_WP_HEADLESS,
  MAINTENANCE_LABELS,
  MAINTENANCE_PRICES,
  BILLING_MODE_LABELS,
  computeStackMultiplier,
  getMultiplierLabel,
  resolveModulePrice,
  resolveModuleMonthly,
} from "@/lib/qualification";
import { BACKEND_FAMILY_LABELS } from "@/lib/referential";
import { HOSTING_PROVIDERS } from "@/lib/hosting-providers";
import {
  FRONTEND_IMPLEMENTATIONS,
  IMPLEMENTATION_OPTIONS,
  SUPPORT_BADGE_LABELS,
} from "@/lib/project-choices";
import {
  HOSTING_TARGET_LABELS,
  PROJECT_FAMILY_LABELS,
  PROJECT_FRONTEND_IMPLEMENTATION_LABELS,
  PROJECT_IMPLEMENTATION_LABELS,
} from "@/lib/validators/project";

export function StepSummary() {
  const {
    projectType,
    qualificationProjectType,
    offerProjectType,
    techStack,
    wpHeadless,
    deployTarget,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    hostingSelectionMode,
    projectFamily,
    projectImplementation,
    projectImplementationLabel,
    projectFrontendImplementation,
    projectFrontendImplementationLabel,
    billingMode,
    setBillingMode,
    formFields,
    selectedModules,
    tierSelections,
    qualification,
    backendMode,
    backendFamily,
    backendOpsHeavy,
    backendMultiplier,
  } = useWizard();
  const hostingProviderLabel =
    HOSTING_PROVIDERS.find((p) => p.id === formFields.hostingProviderId)?.label ?? "—";
  const isWpHeadless = Boolean(techStack && wpHeadless && techStack === "WORDPRESS");
  const hostingCost = techStack
    ? isWpHeadless
      ? HOSTING_COST_WP_HEADLESS[deployTarget]
      : HOSTING_COSTS[deployTarget]
    : null;
  const hasQualification = Boolean(qualification && techStack);
  const offerLabel =
    offerProjectType === "STARTER"
      ? "Starter"
      : offerProjectType === "VITRINE_BLOG"
        ? "Vitrine / Blog"
        : offerProjectType === "ECOMMERCE"
          ? "E-commerce"
          : offerProjectType === "APP_CUSTOM"
            ? "App custom"
            : null;

  const implementationEntry = projectImplementation
    ? IMPLEMENTATION_OPTIONS.find((item) => item.value === projectImplementation)
    : null;
  const implementationLabel =
    projectImplementation === "OTHER" && projectImplementationLabel
      ? projectImplementationLabel
      : implementationEntry?.label ??
        (projectImplementation ? PROJECT_IMPLEMENTATION_LABELS[projectImplementation] : "—");
  const implementationSupport = implementationEntry?.support ?? null;

  const frontEntry = projectFrontendImplementation
    ? FRONTEND_IMPLEMENTATIONS.find((item) => item.value === projectFrontendImplementation)
    : null;
  const frontLabel =
    projectFrontendImplementation === "OTHER" && projectFrontendImplementationLabel
      ? projectFrontendImplementationLabel
      : frontEntry?.label ??
        (projectFrontendImplementation
          ? PROJECT_FRONTEND_IMPLEMENTATION_LABELS[projectFrontendImplementation]
          : null);
  const showBackend = projectType === "APP";
  const backendLabel =
    backendMode === "SEPARATE"
      ? backendFamily
        ? BACKEND_FAMILY_LABELS[backendFamily]
        : "À confirmer"
      : "Full‑stack intégré";
  const backendSuffix =
    backendMode === "SEPARATE" && backendOpsHeavy ? " + ops lourds" : "";
  const backendCoefLabel =
    backendMode === "SEPARATE" && backendFamily && backendMultiplier !== 1
      ? `×${backendMultiplier.toFixed(2).replace(/\.?0+$/, "")}`
      : null;

  if (!projectType) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Résumé de qualification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ── Nom du projet ───────────────────────── */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm text-muted-foreground">Projet</span>
            <span className="text-sm font-medium">
              {formFields.name || "—"}
            </span>
          </div>

          {/* ── Catégorie ───────────────────────────── */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm text-muted-foreground">Catégorie finale</span>
            {hasQualification ? (
              <Badge className={CATEGORY_COLORS[qualification!.finalCategory]}>
                {CATEGORY_LABELS[qualification!.finalCategory]}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                Non qualifié
              </Badge>
            )}
          </div>

          {offerLabel && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Offre détectée</span>
              <Badge variant="secondary" className="text-[11px]">
                {offerLabel}
              </Badge>
            </div>
          )}

          {hasQualification && qualification!.wasRequalified && (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-3.5" />
              Requalifié depuis{" "}
              {CATEGORY_SHORT[qualification!.initialCategory]} par :{" "}
              {qualification!.requalifyingModules
                .map((m) => m.name)
                .join(", ")}
            </div>
          )}

          {/* ── Implémentation ─────────────────────── */}
          <div className="rounded-lg border p-3 text-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Famille</span>
              <span className="font-medium">
                {projectFamily ? PROJECT_FAMILY_LABELS[projectFamily] : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Implémentation</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{implementationLabel}</span>
                {implementationSupport && (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    {SUPPORT_BADGE_LABELS[implementationSupport]}
                  </Badge>
                )}
              </div>
            </div>
            {frontLabel && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Front</span>
                <span>{frontLabel}</span>
              </div>
            )}
            {showBackend && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Backend</span>
                <span>
                  {backendLabel}
                  {backendSuffix}
                  {backendCoefLabel ? ` (${backendCoefLabel})` : ""}
                </span>
              </div>
            )}
          </div>

          {/* ── Hébergement ────────────────────────── */}
          <div className="rounded-lg border border-dashed p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hébergement cible</span>
              <span className="text-sm font-medium">
                {HOSTING_TARGET_LABELS[hostingTarget]}
              </span>
            </div>
            {hostingSelectionMode !== "SINGLE" &&
              hostingSelectionMode !== "NONE" && (
              <div className="text-xs text-muted-foreground space-y-1">
                {hostingSelectionMode === "SPLIT" && (
                  <div className="flex items-center justify-between">
                    <span>Back</span>
                    <span>
                      {hostingTargetBack ? HOSTING_TARGET_LABELS[hostingTargetBack] : "—"}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Front</span>
                  <span>{hostingTargetFront ? HOSTING_TARGET_LABELS[hostingTargetFront] : "—"}</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Hébergeur</span>
              <span>{hostingProviderLabel}</span>
            </div>
            {hostingCost && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Coût indicatif</span>
                <span>{hostingCost.range}</span>
              </div>
            )}
          </div>

          {/* ── Modules ─────────────────────────────── */}
          {hasQualification && qualification!.modules.length > 0 && techStack && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Modules ({String(qualification!.modules.length)})
              </p>
              <div className="space-y-1.5">
                {qualification!.modules.map((m) => {
                  const tierSel = tierSelections[m.id];
                  const resolved = resolveModulePrice(
                    m,
                    qualificationProjectType ?? projectType,
                    techStack,
                    wpHeadless,
                    tierSel,
                    backendMultiplier,
                  );
                  const monthly = resolveModuleMonthly(m, tierSel);
                  const setupTier =
                    tierSel.setupTierId && m.setupTiers
                      ? m.setupTiers.find(
                          (t) => t.id === tierSel.setupTierId,
                        )
                      : null;
                  const subTier =
                    tierSel.subTierId && m.subscriptionTiers
                      ? m.subscriptionTiers.find(
                          (t) => t.id === tierSel.subTierId,
                        )
                      : null;
                  const setupLabel = `${formatEur(resolved.setup)}${
                    resolved.setupMax ? `–${formatEur(resolved.setupMax)}` : ""
                  }`;

                  return (
                    <div
                      key={m.id}
                      className="flex flex-col gap-0.5 rounded-md border p-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{m.name}</span>
                        <span className="font-medium">{setupLabel}</span>
                      </div>
                      {setupTier && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>↳ Setup : {setupTier.name}</span>
                          <span>{formatEur(resolved.setup)}</span>
                        </div>
                      )}
                      {subTier && (
                        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                          <span>↳ Abo : {subTier.name}</span>
                          <span>{String(monthly)} €/mois</span>
                        </div>
                      )}
                      {!subTier && monthly > 0 && (
                        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                          <span>↳ Récurrent</span>
                          <span>{String(monthly)} €/mois</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Budget ──────────────────────────────── */}
          {hasQualification && techStack ? (
            <BudgetBreakdown
              budget={qualification!.budget}
              moduleCount={selectedModules.size}
              projectType={qualificationProjectType ?? projectType}
              techStack={techStack}
              wpHeadless={isWpHeadless}
              variant="full"
            />
          ) : (
            <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              Qualification indisponible pour cette implémentation. Les budgets
              et modules ne sont pas calculés.
            </div>
          )}

          {/* ── Mode de facturation ─────────────────── */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Mode de facturation
              </p>
              <p className="text-sm font-medium">
                {BILLING_MODE_LABELS[billingMode]}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setBillingMode(
                  billingMode === "SOLO" ? "SOUS_TRAITANT" : "SOLO",
                );
              }}
            >
              Changer
            </Button>
          </div>

          {/* ── Splits (sous-traitant) ──────────────── */}
          {hasQualification && qualification!.splits && (
            <div className="grid gap-3 rounded-lg border border-dashed p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Split base (toi / agence)
                </p>
                <p className="text-sm font-medium">
                  {String(qualification!.splits.baseSplitPrestataire)} % /{" "}
                  {String(qualification!.splits.baseSplitAgence)} %
                </p>
              </div>
              {qualification!.budget.modulesTotal > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Split modules (toi / agence)
                  </p>
                  <p className="text-sm font-medium">
                    {formatEur(qualification!.splits.modulesSplitPrestataire)}{" "}
                    / {formatEur(qualification!.splits.modulesSplitAgence)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Maintenance ─────────────────────────── */}
          {hasQualification && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Maintenance</span>
              <div className="text-right text-sm">
                <p className="font-medium">
                  {MAINTENANCE_LABELS[qualification!.maintenance]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {MAINTENANCE_PRICES[qualification!.maintenance]}
                </p>
              </div>
            </div>
          )}

          {techStack && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Stack</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {TECH_STACK_LABELS[techStack]}
                </span>
                {computeStackMultiplier(projectType, techStack, isWpHeadless) !== 1 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-muted-foreground"
                  >
                    {getMultiplierLabel(projectType, techStack, isWpHeadless)} sur la base
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
