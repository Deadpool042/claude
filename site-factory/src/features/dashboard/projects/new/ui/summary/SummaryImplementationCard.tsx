import { Layers, Server } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { InlineHint } from "@/shared/components/InlineHint";
import { SupportBadge } from "@/shared/components/SupportBadge";
import {
  BACKEND_FAMILY_LABELS,
  HOSTING_COSTS,
  HOSTING_COSTS_HEADLESS,
} from "@/lib/referential";
import { HOSTING_PROVIDERS } from "@/lib/hosting";
import {
  HOSTING_TARGET_LABELS,
  PROJECT_FAMILY_LABELS,
} from "@/lib/validators";
import {
  computeStackMultiplier,
  getMultiplierLabel,
} from "@/lib/stack-pricing";
import { useWizard } from "../../logic/WizardProvider";
import { resolveImplementationData } from "./summary-helpers";

const TECH_STACK_LABELS = {
  WORDPRESS: "WordPress",
  NEXTJS: "Next.js",
  NUXT: "Nuxt",
  ASTRO: "Astro",
} as const;

export function SummaryImplementationCard() {
  const wizard = useWizard();
  const {
    projectType,
    qualificationProjectType,
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
    formFields,
    needsEditing,
    editingMode,
    includeOnboardingPack,
    includeMonthlyEditorialValidation,
    includeUnblockInterventions,
    backendMode,
    backendFamily,
    backendOpsHeavy,
    backendMultiplier,
  } = wizard;

  if (!projectType) {
    return null;
  }

  const { implementationLabel, implementationSupportLabel, frontLabel } =
    resolveImplementationData({
      projectImplementation,
      projectImplementationLabel,
      projectFrontendImplementation,
      projectFrontendImplementationLabel,
    });
  const selectedHostingProvider = HOSTING_PROVIDERS.find(
    (provider) => provider.id === formFields.hostingProviderId,
  );
  const hostingProviderLabel = selectedHostingProvider?.label ?? "—";
  const isWpHeadless = Boolean(techStack && wpHeadless && techStack === "WORDPRESS");
  const hostingCostData = techStack
    ? isWpHeadless
      ? HOSTING_COSTS_HEADLESS[deployTarget]
      : HOSTING_COSTS[deployTarget]
    : null;
  const hostingRangeLabel = hostingCostData
    ? "rangeLabel" in hostingCostData
      ? hostingCostData.rangeLabel
      : hostingCostData.range
    : null;
  const showBackend = projectType === "APP";
  const backendLabel =
    backendMode === "SEPARATE"
      ? backendFamily
        ? BACKEND_FAMILY_LABELS[backendFamily]
        : "À confirmer"
      : "Full-stack intégré";
  const backendSuffix =
    backendMode === "SEPARATE" && backendOpsHeavy ? " + ops lourds" : "";
  const backendCoefLabel =
    backendMode === "SEPARATE" && backendFamily && backendMultiplier !== 1
      ? `×${backendMultiplier.toFixed(2).replace(/\.?0+$/, "")}`
      : null;
  const extraSetupMin = (includeOnboardingPack ? 300 : 0) + (includeUnblockInterventions ? 90 : 0);
  const extraSetupMax = (includeOnboardingPack ? 500 : 0) + (includeUnblockInterventions ? 150 : 0);
  const extraMonthlyMin = includeMonthlyEditorialValidation ? 120 : 0;
  const extraMonthlyMax = includeMonthlyEditorialValidation ? 250 : 0;
  const effectiveProjectType = qualificationProjectType ?? projectType;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Mise en œuvre retenue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border p-3 text-sm">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              <p className="font-medium">Architecture</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Famille</span>
                <span className="font-medium text-foreground">
                  {projectFamily ? PROJECT_FAMILY_LABELS[projectFamily] : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Implémentation</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{implementationLabel}</span>
                  {implementationSupportLabel ? (
                    <SupportBadge>{implementationSupportLabel}</SupportBadge>
                  ) : null}
                </div>
              </div>
              {frontLabel ? (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Front</span>
                  <span>{frontLabel}</span>
                </div>
              ) : null}
              {showBackend ? (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Backend</span>
                  <span>
                    {backendLabel}
                    {backendSuffix}
                    {backendCoefLabel ? ` (${backendCoefLabel})` : ""}
                  </span>
                </div>
              ) : null}
              {techStack ? (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Stack</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{TECH_STACK_LABELS[techStack]}</span>
                    {computeStackMultiplier(projectType, techStack, isWpHeadless) !== 1 ? (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {getMultiplierLabel(effectiveProjectType, techStack, isWpHeadless)}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border p-3 text-sm">
            <div className="mb-3 flex items-center gap-2">
              <Server className="size-4 text-muted-foreground" />
              <p className="font-medium">Hébergement</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Cible</span>
                <span className="font-medium text-foreground">
                  {hostingSelectionMode === "NONE"
                    ? "Géré par l’hébergeur"
                    : hostingSelectionMode === "SINGLE"
                      ? HOSTING_TARGET_LABELS[hostingTarget]
                      : hostingSelectionMode === "FRONT_ONLY"
                        ? `Front ${HOSTING_TARGET_LABELS[hostingTargetFront ?? "TO_CONFIRM"]}`
                        : `Back ${HOSTING_TARGET_LABELS[hostingTargetBack ?? "TO_CONFIRM"]} / Front ${HOSTING_TARGET_LABELS[hostingTargetFront ?? "TO_CONFIRM"]}`}
                </span>
              </div>
              {hostingSelectionMode === "SPLIT" ? (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Back</span>
                  <span>{hostingTargetBack ? HOSTING_TARGET_LABELS[hostingTargetBack] : "—"}</span>
                </div>
              ) : null}
              {hostingSelectionMode !== "SINGLE" && hostingSelectionMode !== "NONE" ? (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Front</span>
                  <span>{hostingTargetFront ? HOSTING_TARGET_LABELS[hostingTargetFront] : "—"}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Hébergeur</span>
                <span>{hostingProviderLabel}</span>
              </div>
              {hostingRangeLabel ? (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Coût indicatif</span>
                  <span>{hostingRangeLabel}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {needsEditing && editingMode === "GIT_MDX" ? (
          <div className="space-y-2 rounded-lg border border-dashed p-3 text-xs">
            <InlineHint className="text-[11px]">
              Le mode d’édition MDX/Git n’ajuste pas le CI à lui seul ; il ajoute surtout un cadre d’exploitation éditoriale.
            </InlineHint>
            {(includeOnboardingPack || includeMonthlyEditorialValidation || includeUnblockInterventions) ? (
              <div className="space-y-1 text-muted-foreground">
                <p className="font-medium text-foreground">Accompagnement éditorial en sus</p>
                {(includeOnboardingPack || includeUnblockInterventions) ? (
                  <p>
                    Ponctuel estimatif : {extraSetupMin} € à {extraSetupMax} €
                  </p>
                ) : null}
                {includeMonthlyEditorialValidation ? (
                  <p>
                    Mensuel estimatif : {extraMonthlyMin} € à {extraMonthlyMax} € / mois
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
