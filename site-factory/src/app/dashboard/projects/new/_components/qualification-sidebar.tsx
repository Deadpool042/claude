"use client";

import { useWizard } from "../_providers/wizard-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, Gauge } from "lucide-react";
import { formatEur } from "@/lib/qualification-ui";
import {
  FRONTEND_IMPLEMENTATIONS,
  IMPLEMENTATION_OPTIONS,
  SUPPORT_BADGE_LABELS,
} from "@/lib/project-choices";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_SHORT,
  MAINTENANCE_LABELS,
  MAINTENANCE_PRICES,
  computeStackMultiplier,
  getMultiplierLabel,
} from "@/lib/qualification";
import { BACKEND_FAMILY_LABELS } from "@/lib/referential";
import { HOSTING_TARGET_LABELS } from "@/lib/validators/project";

/**
 * Panneau latéral de qualification.
 * Rendu en parallèle du contenu wizard via le slot @sidebar.
 * Affiche en temps réel : catégorie, budget, maintenance, stack.
 */
export function QualificationSidebar() {
  const {
    projectType,
    qualificationProjectType,
    offerProjectType,
    techStack,
    wpHeadless,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    hostingSelectionMode,
    projectImplementation,
    projectImplementationLabel,
    projectFrontendImplementation,
    projectFrontendImplementationLabel,
    selectedModules,
    qualification,
    backendMode,
    backendFamily,
    backendOpsHeavy,
    backendMultiplier,
  } = useWizard();

  const implementationSupport = projectImplementation
    ? IMPLEMENTATION_OPTIONS.find((item) => item.value === projectImplementation)?.support
    : null;

  if (!qualification || !projectType) {
    const message = !projectType
      ? "Sélectionnez un type de projet pour voir la qualification."
      : implementationSupport && implementationSupport !== "SUPPORTED"
        ? "Qualification désactivée (implémentation non supportée)."
        : "Qualification indisponible pour la sélection courante.";
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <Gauge className="mx-auto mb-2 size-6 opacity-40" />
          {message}
        </CardContent>
      </Card>
    );
  }

  const multiplier =
    techStack &&
    computeStackMultiplier(
      qualificationProjectType ?? projectType,
      techStack,
      wpHeadless && techStack === "WORDPRESS",
    );
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

  const implementationLabel =
    projectImplementation === "OTHER" && projectImplementationLabel
      ? projectImplementationLabel
      : projectImplementation
        ? IMPLEMENTATION_OPTIONS.find((item) => item.value === projectImplementation)?.label
        : null;
  const frontLabel = projectFrontendImplementation
    ? projectFrontendImplementation === "OTHER" && projectFrontendImplementationLabel
      ? projectFrontendImplementationLabel
      : FRONTEND_IMPLEMENTATIONS.find((item) => item.value === projectFrontendImplementation)?.label
    : null;
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Qualification live</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* ── Catégorie ────────────────────────────── */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Catégorie</span>
          <Badge
            className={CATEGORY_COLORS[qualification.finalCategory]}
          >
            {CATEGORY_LABELS[qualification.finalCategory]}
          </Badge>
        </div>

        {offerLabel && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Offre</span>
            <span className="font-medium text-foreground">{offerLabel}</span>
          </div>
        )}

        {qualification.ci ? (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Complexity Index</span>
            <span className="font-medium text-foreground">
              {qualification.ci.score} ({CATEGORY_SHORT[qualification.ci.category]})
            </span>
          </div>
        ) : null}

        {qualification.wasRequalified && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-3" />
            {CATEGORY_SHORT[qualification.initialCategory]} →{" "}
            {CATEGORY_SHORT[qualification.finalCategory]}
          </div>
        )}

        {/* ── Budget ───────────────────────────────── */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base</span>
            <span>{formatEur(qualification.budget.base)}</span>
          </div>
          {qualification.budget.modulesTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Modules ({String(selectedModules.size)})
              </span>
              <span>
                + {formatEur(qualification.budget.modulesTotal)}
              </span>
            </div>
          )}
          {qualification.budget.deployCost > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mise en prod.</span>
              <span>+ {formatEur(qualification.budget.deployCost)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-1 font-medium">
            <span>Total</span>
            <span>{formatEur(qualification.budget.grandTotal)}</span>
          </div>
          {qualification.budget.monthlyTotal > 0 && (
            <div className="flex justify-between text-amber-600 dark:text-amber-400">
              <span>Récurrent</span>
              <span>
                {formatEur(qualification.budget.monthlyTotal)}/mois
              </span>
            </div>
          )}
        </div>

        {/* ── Implémentation ─────────────────────────── */}
        <div className="border-t pt-2 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Implémentation</span>
            <span className="font-medium">
              {implementationLabel ?? "—"}
            </span>
          </div>
          {implementationSupport && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Support</span>
              <span>{SUPPORT_BADGE_LABELS[implementationSupport]}</span>
            </div>
          )}
          {frontLabel && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Front</span>
              <span>{frontLabel}</span>
            </div>
          )}
          {showBackend && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backend</span>
              <span>
                {backendLabel}
                {backendSuffix}
                {backendCoefLabel ? ` (${backendCoefLabel})` : ""}
              </span>
            </div>
          )}
          {techStack && multiplier && multiplier !== 1 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coeff.</span>
              <span>
                {getMultiplierLabel(
                  qualificationProjectType ?? projectType,
                  techStack,
                  wpHeadless && techStack === "WORDPRESS",
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hébergement</span>
            <span>{HOSTING_TARGET_LABELS[hostingTarget]}</span>
          </div>
          {hostingSelectionMode !== "SINGLE" && hostingSelectionMode !== "NONE" && (
            <>
              {hostingSelectionMode === "SPLIT" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Back</span>
                  <span>{hostingTargetBack ? HOSTING_TARGET_LABELS[hostingTargetBack] : "—"}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Front</span>
                <span>{hostingTargetFront ? HOSTING_TARGET_LABELS[hostingTargetFront] : "—"}</span>
              </div>
            </>
          )}
        </div>

        {/* ── Maintenance ───────────────────────────── */}
        <div className="border-t pt-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <ShieldCheck className="size-3" />
            Maintenance
          </div>
          <div className="text-right">
            <p className="font-medium">
              {MAINTENANCE_LABELS[qualification.maintenance]}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {MAINTENANCE_PRICES[qualification.maintenance]}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
