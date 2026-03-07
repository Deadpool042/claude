import { formatEur } from "@/shared/lib/currency";
import {
  FRONTEND_IMPLEMENTATIONS,
  IMPLEMENTATION_OPTIONS,
  SUPPORT_BADGE_LABELS,
  getFrontendImplementationLabel,
  getImplementationLabel,
} from "@/lib/project-choices";
import type { WizardContextType } from "../../logic/wizard-types";

export const BILLING_MODE_LABELS = {
  SOLO: "Solo (100 %)" as const,
  SOUS_TRAITANT: "Sous-traitant" as const,
};

const OFFER_LABELS = {
  VITRINE_BLOG: "Vitrine / Blog",
  ECOMMERCE: "E-commerce",
  APP_CUSTOM: "Application sur mesure",
} as const;

export function formatSummaryRange(min: number, max: number, suffix = ""): string {
  if (min === max) return `${formatEur(min)}${suffix}`;
  return `${formatEur(min)}–${formatEur(max)}${suffix}`;
}

export function resolveOfferLabel(
  offerProjectType: WizardContextType["offerProjectType"],
): string | null {
  if (!offerProjectType) return null;
  return OFFER_LABELS[offerProjectType];
}

export function resolveImplementationData(params: {
  projectImplementation: WizardContextType["projectImplementation"];
  projectImplementationLabel: string;
  projectFrontendImplementation: WizardContextType["projectFrontendImplementation"];
  projectFrontendImplementationLabel: string;
}) {
  const implementationEntry = params.projectImplementation
    ? IMPLEMENTATION_OPTIONS.find((item) => item.value === params.projectImplementation)
    : null;
  const implementationLabel =
    params.projectImplementation === "OTHER" && params.projectImplementationLabel
      ? params.projectImplementationLabel
      : implementationEntry?.label ?? getImplementationLabel(params.projectImplementation);
  const implementationSupport = implementationEntry?.support ?? null;
  const frontEntry = params.projectFrontendImplementation
    ? FRONTEND_IMPLEMENTATIONS.find(
        (item) => item.value === params.projectFrontendImplementation,
      )
    : null;
  const frontLabel =
    params.projectFrontendImplementation === "OTHER" &&
    params.projectFrontendImplementationLabel
      ? params.projectFrontendImplementationLabel
      : frontEntry?.label ??
        (params.projectFrontendImplementation
          ? getFrontendImplementationLabel(params.projectFrontendImplementation)
          : null);

  return {
    implementationLabel,
    implementationSupport,
    implementationSupportLabel: implementationSupport
      ? SUPPORT_BADGE_LABELS[implementationSupport]
      : null,
    frontLabel,
  };
}

export function buildBudgetStatus(params: {
  budgetBandEffective: WizardContextType["budgetBand"];
  manualBudgetMax: string;
  setupMin: number;
  setupMax: number;
}) {
  const budgetCapByBand: Record<WizardContextType["budgetBand"], number | null> = {
    UNDER_1200: 1200,
    UP_TO_1800: 1800,
    UP_TO_3500: 3500,
    UP_TO_7000: 7000,
    OVER_7000: null,
    TO_CONFIRM: null,
  };
  const manualBudgetCap = Number(params.manualBudgetMax);
  const hasManualBudgetCap = Number.isFinite(manualBudgetCap) && manualBudgetCap > 0;
  const budgetCap = hasManualBudgetCap
    ? manualBudgetCap
    : budgetCapByBand[params.budgetBandEffective] ?? null;

  if (budgetCap == null) return null;
  if (params.setupMin > budgetCap) {
    return {
      label: `Hors budget client (dépassement min ${formatEur(params.setupMin - budgetCap)})`,
      className: "text-amber-600 dark:text-amber-400",
    };
  }
  if (params.setupMax <= budgetCap) {
    return {
      label: "Compatible avec le budget client",
      className: "text-emerald-600 dark:text-emerald-400",
    };
  }
  return {
    label: `Zone de risque (jusqu’à ${formatEur(params.setupMax - budgetCap)} au-dessus du budget)`,
    className: "text-amber-600 dark:text-amber-400",
  };
}
