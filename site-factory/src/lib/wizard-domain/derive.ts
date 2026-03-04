import {
  resolveFamilyFromInputs,
  resolveImplementationFromFamily,
  resolveDefaultFrontend,
  filterFamiliesByProjectType,
  PROJECT_FAMILY_OPTIONS,
} from "@/lib/project-choices";
import { resolveTechStackFromImplementation } from "@/lib/project-choices";
import type { WizardTypeStackState } from "./types";
import { allowedFamiliesForTypeAndHosting, allowedHostingTargetsForType } from "./rules";
import {
  deriveHostingSelectionMode,
  isHeadlessArchitecture,
  resolveDefaultBackHosting,
  resolveDefaultFrontHosting,
} from "./hosting";

export function normalizeTypeStackState(
  prev: WizardTypeStackState,
  patch: Partial<WizardTypeStackState>,
): WizardTypeStackState {
  const next: WizardTypeStackState = { ...prev, ...patch };

  // Clamp hosting target
  const allowedHostingTargets = allowedHostingTargetsForType(next.projectType);
  if (!allowedHostingTargets.includes(next.hostingTarget)) {
    next.hostingTarget = allowedHostingTargets[0] ?? "TO_CONFIRM";
  }

  const hostingSelectionMode = deriveHostingSelectionMode(next);

  // Clamp families
  const allowedFamilies =
    hostingSelectionMode === "SINGLE"
      ? allowedFamiliesForTypeAndHosting(next.projectType, next.hostingTarget)
      : filterFamiliesByProjectType(
          PROJECT_FAMILY_OPTIONS.map((opt) => opt.value),
          next.projectType,
        );
  if (next.projectFamily && !allowedFamilies.includes(next.projectFamily)) {
    next.projectFamily = allowedFamilies[0] ?? null;
    next.projectImplementation = null;
  }

  // Auto family suggestion if missing
  if (!next.projectFamily && next.projectType) {
    const suggested = resolveFamilyFromInputs({
      projectType: next.projectType,
      needsEditing: next.needsEditing,
      editingFrequency: next.editingFrequency,
      commerceModel: next.commerceModel,
      headlessRequired: next.headlessRequired,
    });
    if (allowedFamilies.includes(suggested)) {
      next.projectFamily = suggested;
    } else {
      next.projectFamily = allowedFamilies[0] ?? null;
    }
  }

  // Implementation default
  if (next.projectFamily && !next.projectImplementation) {
    next.projectImplementation = resolveImplementationFromFamily(next.projectFamily, "supported");
  }

  // Reset headless front/hosting if not needed
  const needsFrontend = isHeadlessArchitecture(next);
  if (!needsFrontend) {
    next.projectFrontendImplementation = null;
    next.projectFrontendImplementationLabel = "";
  } else {
    if (!next.projectFrontendImplementation) {
      next.projectFrontendImplementation = resolveDefaultFrontend();
    }
  }

  if (hostingSelectionMode === "SINGLE" || hostingSelectionMode === "NONE") {
    next.hostingTargetBack = null;
    next.hostingTargetFront = null;
  } else if (hostingSelectionMode === "FRONT_ONLY") {
    next.hostingTargetBack = null;
    next.hostingTargetFront = next.hostingTargetFront ?? resolveDefaultFrontHosting(next);
  } else {
    next.hostingTargetBack = next.hostingTargetBack ?? resolveDefaultBackHosting(next);
    next.hostingTargetFront = next.hostingTargetFront ?? resolveDefaultFrontHosting(next);
  }

  // Backend distinction (App only)
  const isApp = next.projectType === "APP" || next.projectFamily === "APP_PLATFORM";
  if (!isApp) {
    next.backendMode = "FULLSTACK";
    next.backendFamily = null;
    next.backendOpsHeavy = false;
  } else if (next.backendMode === "FULLSTACK") {
    next.backendFamily = null;
    next.backendOpsHeavy = false;
  }

  // Resolve tech stack from implementation
  const { techStack, wpHeadless } = resolveTechStackFromImplementation(
    next.projectImplementation,
    next.projectFrontendImplementation,
  );
  next.techStack = techStack;
  next.wpHeadless = wpHeadless;

  return next;
}
