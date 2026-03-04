"use client";

import { useMemo } from "react";
import {
  qualifyProject,
  type TechStack,
  type BillingMode,
  type DeployTarget,
  type ModuleCatSelection,
  type QualificationResult,
} from "@/lib/qualification-runtime";
import type { ProjectConstraints, CIAxes, ProjectType } from "@/lib/referential";
import type { ModuleId } from "@/lib/offers";

// ── Types ──────────────────────────────────────────────────────────

export interface UseQualificationParams {
  projectType: ProjectType | null;
  techStack: TechStack | null;
  selectedModules: Set<ModuleId>;
  billingMode: BillingMode;
  deployTarget: DeployTarget;
  wpHeadless: boolean;
  catSelections: Record<string, ModuleCatSelection>;
  constraints?: Partial<ProjectConstraints>;
  ciAxes?: CIAxes;
}

// ── Hook ───────────────────────────────────────────────────────────

export function useQualification(
  params: UseQualificationParams,
): QualificationResult | null {
  const {
    projectType,
    techStack,
    selectedModules,
    billingMode,
    deployTarget,
    wpHeadless,
    catSelections,
    constraints,
    ciAxes,
  } = params;

  return useMemo(() => {
    if (!projectType || !techStack) return null;
    const payload = {
      projectType,
      techStack,
      selectedModuleIds: Array.from(selectedModules),
      billingMode,
      deployTarget,
      wpHeadless,
      catSelections,
    } as const;

    const withExtras: {
      constraints?: Partial<ProjectConstraints>;
      ciAxes?: CIAxes;
    } = {};
    if (constraints) {
      withExtras.constraints = constraints;
    }
    if (ciAxes) {
      withExtras.ciAxes = ciAxes;
    }

    return qualifyProject({
      ...payload,
      ...withExtras,
    });
  }, [
    projectType,
    techStack,
    selectedModules,
    billingMode,
    deployTarget,
    wpHeadless,
    catSelections,
    constraints,
    ciAxes,
  ]);
}
