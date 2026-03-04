import type { ReactNode } from "react";
import {
  HOSTING_ALLOWED_FAMILIES,
  HOSTING_TARGET_OPTIONS,
  HOSTING_TARGET_BACK_OPTIONS,
  HOSTING_TARGET_FRONT_OPTIONS,
  PROJECT_FAMILY_OPTIONS,
  SUPPORT_BADGE_LABELS,
  FAMILY_BY_PROJECT_TYPE,
  HOSTING_BY_PROJECT_TYPE,
  filterFamiliesByProjectType,
} from "@/lib/project-choices";
import {
  IMPLEMENTATION_OPTIONS,
  FRONTEND_IMPLEMENTATIONS,
  getImplementationOptions,
  getFrontImplementationOptions,
} from "@/lib/project-choices";
import { PROJECT_TYPE_OPTIONS } from "@/lib/referential";
import type { HostingTargetInput, ProjectFamilyInput } from "@/lib/validators";
import type {
  TypeStackOption,
  WizardTypeStackState,
  TypeStackViewModel,
} from "./types";
import { deriveHostingSelectionMode, isHeadlessArchitecture } from "./hosting";

const PROJECT_TYPE_META: Record<string, { description: string; icon: string }> = {
  BLOG: {
    description: "Blog ou magazine, contenus éditoriaux",
    icon: "📝",
  },
  VITRINE: {
    description: "Présentation, landing pages",
    icon: "🏢",
  },
  ECOM: {
    description: "Boutique en ligne, catalogue produits",
    icon: "🛒",
  },
  APP: {
    description: "Application web avancée",
    icon: "⚡",
  },
};

export function allowedHostingTargetsForType(
  projectType: WizardTypeStackState["projectType"],
): HostingTargetInput[] {
  if (!projectType) {
    return HOSTING_TARGET_OPTIONS.map((opt) => opt.value);
  }
  const allowed = HOSTING_BY_PROJECT_TYPE[projectType] ?? [];
  return allowed.filter((hosting) => {
    const families = HOSTING_ALLOWED_FAMILIES[hosting] ?? [];
    const typeFamilies = FAMILY_BY_PROJECT_TYPE[projectType] ?? [];
    return families.some((f) => typeFamilies.includes(f));
  });
}

export function allowedFamiliesForTypeAndHosting(
  projectType: WizardTypeStackState["projectType"],
  hosting: HostingTargetInput,
): ProjectFamilyInput[] {
  const families = HOSTING_ALLOWED_FAMILIES[hosting] ?? [];
  const filtered = filterFamiliesByProjectType(families, projectType);
  return filtered;
}

function mapOption<T extends string>(
  options: {
    value: T;
    label: string;
    description?: string | undefined;
    support?: string | undefined;
    icon?: ReactNode | undefined;
  }[],
): TypeStackOption<T>[] {
  return options.map((opt) => ({
    value: opt.value,
    label: opt.label,
    description: opt.description,
    support: opt.support,
    icon: opt.icon,
  }));
}

function getCommerceModelHint(state: WizardTypeStackState): string | null {
  if (state.projectType !== "ECOM") return null;

  const highScale =
    state.trafficLevel === "HIGH" ||
    state.trafficLevel === "VERY_HIGH" ||
    state.productCount === "LARGE" ||
    state.scalabilityLevel === "ELASTIC";

  if (highScale) {
    return "Trafic/volume élevés : headless ou custom (Medusa, Shopify headless) recommandé.";
  }

  const lowScale =
    state.trafficLevel === "LOW" &&
    (state.productCount === "SMALL" || state.productCount === "NONE") &&
    state.scalabilityLevel === "FIXED";
  if (lowScale) {
    return "Petit catalogue : SaaS (Shopify) recommandé pour limiter l’ops.";
  }

  return null;
}

export function buildTypeStackViewModel(
  state: WizardTypeStackState,
  showAllImplementations: boolean,
): TypeStackViewModel {
  const wizardTypeOptions = PROJECT_TYPE_OPTIONS;
  const hostingSelectionMode = deriveHostingSelectionMode(state);
  const allowedHosting = allowedHostingTargetsForType(state.projectType);
  const hostingOptions = HOSTING_TARGET_OPTIONS.filter((opt) => allowedHosting.includes(opt.value));
  const hostingBackOptions = HOSTING_TARGET_BACK_OPTIONS;
  const hostingFrontOptions = HOSTING_TARGET_FRONT_OPTIONS;

  const allowedFamilies =
    hostingSelectionMode === "SINGLE"
      ? allowedFamiliesForTypeAndHosting(state.projectType, state.hostingTarget)
      : filterFamiliesByProjectType(
          PROJECT_FAMILY_OPTIONS.map((opt) => opt.value),
          state.projectType,
        );
  const familyOptions = PROJECT_FAMILY_OPTIONS.filter((opt) =>
    allowedFamilies.includes(opt.value),
  );

  const supportFilter = showAllImplementations ? "all" : "supported";
  const implementationOptions = state.projectFamily
    ? getImplementationOptions(state.projectFamily, supportFilter)
    : [];
  const frontOptions = getFrontImplementationOptions(supportFilter);

  const activeImplementation =
    state.projectImplementation === "OTHER" && state.projectImplementationLabel.trim().length > 0
      ? {
          value: "OTHER" as const,
          label: state.projectImplementationLabel.trim(),
          family: state.projectFamily ?? "APP_PLATFORM",
          support: "EXTERNAL" as const,
        }
      : IMPLEMENTATION_OPTIONS.find((item) => item.value === state.projectImplementation) ?? null;
  const activeFront =
    FRONTEND_IMPLEMENTATIONS.find((item) => item.value === state.projectFrontendImplementation) ??
    null;

  const showHeadlessSelectors = isHeadlessArchitecture(state);

  return {
    projectTypeOptions: mapOption(
      wizardTypeOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
        description: PROJECT_TYPE_META[opt.value]?.description,
        icon: PROJECT_TYPE_META[opt.value]?.icon,
      })),
    ),
    hostingOptions: mapOption(hostingOptions),
    hostingBackOptions: mapOption(hostingBackOptions),
    hostingFrontOptions: mapOption(hostingFrontOptions),
    hostingSelectionMode,
    familyOptions: mapOption(familyOptions),
    implementationOptions: mapOption(
      implementationOptions.map((opt) => ({ ...opt, support: SUPPORT_BADGE_LABELS[opt.support] })),
    ),
    frontOptions: mapOption(
      frontOptions.map((opt) => ({ ...opt, support: SUPPORT_BADGE_LABELS[opt.support] })),
    ),
    showHeadlessSelectors,
    commerceModelHint: getCommerceModelHint(state),
    activeImplementation: activeImplementation
      ? {
          value: activeImplementation.value,
          label: activeImplementation.label,
          support: SUPPORT_BADGE_LABELS[activeImplementation.support],
        }
      : null,
    activeFront: activeFront
      ? {
          value: activeFront.value,
          label: activeFront.label,
          support: SUPPORT_BADGE_LABELS[activeFront.support],
        }
      : null,
    showAllImplementations,
  };
}
