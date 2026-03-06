import { useCallback, useEffect, useMemo, type MutableRefObject } from "react";
import { getOfferStackForProject } from "@/lib/qualification-runtime";
import {
  DEFAULT_CONSTRAINTS,
  MODULE_CATALOG,
  getBackendMultiplier,
  type BackendFamily,
  type DataSensitivity,
  type LegacyTechStack as TechStack,
  type ProductBucket,
  type ProjectConstraints,
  type ProjectType,
  type ScalabilityLevel,
  type TrafficLevel,
} from "@/lib/referential";
import { type CommerceModel, type EditingFrequency } from "@/lib/project-choices";
import {
  deriveOfferProjectType,
  deriveQualificationProjectType,
  resolveCanonicalTaxonomyFromOfferInput,
} from "@/lib/wizard-domain";
import {
  getIncludedModules,
  getMandatoryModules,
  isModuleCompatible,
  type ModuleId,
  type OfferCategory,
  type Stack as OfferStack,
} from "@/lib/offers";
import type { TaxonomyDisambiguationSignal } from "@/lib/taxonomy";
import type { ProjectFamilyInput } from "@/lib/validators";

interface SyncModulesPayload {
  allowedIds?: ModuleId[];
  mandatoryIds?: ModuleId[];
  selectedIds?: ModuleId[];
}

export interface WizardOfferDerivationsParams {
  projectType: ProjectType | null;
  taxonomySignal: TaxonomyDisambiguationSignal | null;
  projectFamily: ProjectFamilyInput | null;
  needsEditing: boolean;
  editingFrequency: EditingFrequency;
  trafficLevel: TrafficLevel;
  productCount: ProductBucket;
  dataSensitivity: DataSensitivity;
  scalabilityLevel: ScalabilityLevel;
  techStack: TechStack | null;
  wpHeadless: boolean;
  selectedModules: Set<ModuleId>;
  syncModules: (payload: SyncModulesPayload) => void;
  toggleModule: (id: ModuleId) => void;
  pendingOfferModulesRef: MutableRefObject<ModuleId[] | null>;
  backendFamily: BackendFamily | null;
  backendOpsHeavy: boolean;
}

export interface WizardOfferDerivations {
  qualificationProjectType: ProjectType | null;
  offerProjectType: OfferCategory | null;
  canonicalTaxonomyResolution: ReturnType<
    typeof resolveCanonicalTaxonomyFromOfferInput
  > | null;
  offerStack: OfferStack | null;
  backendMultiplier: number;
  compatibleModuleIds: ModuleId[];
  mandatoryModuleIds: ModuleId[];
  includedModuleIds: ModuleId[];
  toggleModuleSafe: (id: ModuleId) => void;
}

export interface QualificationConstraintsParams {
  projectType: ProjectType | null;
  trafficLevel: TrafficLevel;
  productCount: ProductBucket;
  dataSensitivity: DataSensitivity;
  scalabilityLevel: ScalabilityLevel;
  needsEditing: boolean;
  editingFrequency: EditingFrequency;
  commerceModel: CommerceModel;
  backendFamily: BackendFamily | null;
  backendOpsHeavy: boolean;
  isHeadless: boolean;
}

export function buildQualificationConstraints(
  params: QualificationConstraintsParams,
): ProjectConstraints {
  return {
    ...DEFAULT_CONSTRAINTS,
    trafficLevel: params.trafficLevel,
    productCount: params.projectType === "ECOM" ? params.productCount : "NONE",
    dataSensitivity: params.dataSensitivity,
    scalabilityLevel: params.scalabilityLevel,
    needsEditing: params.needsEditing,
    editingFrequency: params.editingFrequency,
    headlessRequired: params.isHeadless,
    commerceModel: params.projectType === "ECOM" ? params.commerceModel : null,
    backendFamily: params.projectType === "APP" ? params.backendFamily : null,
    backendOpsHeavy: params.projectType === "APP" ? params.backendOpsHeavy : false,
  };
}

export function useWizardOfferDerivations(
  params: WizardOfferDerivationsParams,
): WizardOfferDerivations {
  const {
    projectType,
    taxonomySignal,
    projectFamily,
    needsEditing,
    editingFrequency,
    trafficLevel,
    productCount,
    dataSensitivity,
    scalabilityLevel,
    techStack,
    wpHeadless,
    selectedModules,
    syncModules,
    toggleModule,
    pendingOfferModulesRef,
    backendFamily,
    backendOpsHeavy,
  } = params;

  const baseOfferInput = useMemo(
    () => ({
      projectType,
      taxonomySignal,
      projectFamily,
      needsEditing,
      editingFrequency,
      trafficLevel,
      productCount,
      dataSensitivity,
      scalabilityLevel,
    }),
    [
      projectType,
      taxonomySignal,
      projectFamily,
      needsEditing,
      editingFrequency,
      trafficLevel,
      productCount,
      dataSensitivity,
      scalabilityLevel,
    ],
  );

  const candidateOfferInput = useMemo(
    () => ({
      ...baseOfferInput,
      selectedModulesCount: selectedModules.size,
    }),
    [baseOfferInput, selectedModules.size],
  );

  const candidateQualificationProjectType = useMemo(
    () => deriveQualificationProjectType(candidateOfferInput),
    [candidateOfferInput],
  );
  const candidateOfferProjectType = useMemo(
    () => deriveOfferProjectType(candidateOfferInput),
    [candidateOfferInput],
  );

  const candidateOfferStack = useMemo(() => {
    return candidateQualificationProjectType && techStack
      ? (getOfferStackForProject(
          candidateQualificationProjectType,
          techStack,
          wpHeadless,
        ) as OfferStack)
      : null;
  }, [candidateQualificationProjectType, techStack, wpHeadless]);

  const candidateMandatoryModuleIds = useMemo(() => {
    if (!candidateOfferProjectType || !candidateOfferStack) return [];
    return getMandatoryModules(candidateOfferProjectType, candidateOfferStack);
  }, [candidateOfferProjectType, candidateOfferStack]);

  const candidateIncludedModuleIds = useMemo(() => {
    if (!candidateOfferProjectType || !candidateOfferStack) return [];
    return getIncludedModules(candidateOfferProjectType, candidateOfferStack);
  }, [candidateOfferProjectType, candidateOfferStack]);

  const candidateLockedModuleSet = useMemo(
    () =>
      new Set([...candidateMandatoryModuleIds, ...candidateIncludedModuleIds]),
    [candidateMandatoryModuleIds, candidateIncludedModuleIds],
  );

  const selectedOptionalCount = useMemo(() => {
    if (selectedModules.size === 0) return 0;
    let count = 0;
    for (const id of selectedModules) {
      if (!candidateLockedModuleSet.has(id)) {
        count += 1;
      }
    }
    return count;
  }, [selectedModules, candidateLockedModuleSet]);

  const offerInput = useMemo(
    () => ({
      ...baseOfferInput,
      selectedModulesCount: selectedOptionalCount,
    }),
    [baseOfferInput, selectedOptionalCount],
  );

  const qualificationProjectType = useMemo(
    () => deriveQualificationProjectType(offerInput),
    [offerInput],
  );
  const offerProjectType = useMemo(
    () => deriveOfferProjectType(offerInput),
    [offerInput],
  );
  const canonicalTaxonomyResolution = useMemo(
    () => resolveCanonicalTaxonomyFromOfferInput(offerInput),
    [offerInput],
  );
  const offerStack = useMemo(() => {
    return qualificationProjectType && techStack
      ? (getOfferStackForProject(
          qualificationProjectType,
          techStack,
          wpHeadless,
        ) as OfferStack)
      : null;
  }, [qualificationProjectType, techStack, wpHeadless]);

  const backendMultiplier = useMemo(
    () => getBackendMultiplier(backendFamily, backendOpsHeavy),
    [backendFamily, backendOpsHeavy],
  );

  const compatibleModuleIds = useMemo(() => {
    if (!offerStack || !offerProjectType) return [];
    return MODULE_CATALOG.filter((mod) =>
      isModuleCompatible(mod.id as ModuleId, offerStack, offerProjectType),
    ).map((mod) => mod.id);
  }, [offerStack, offerProjectType]);

  const mandatoryModuleIds = useMemo(() => {
    if (!offerProjectType || !offerStack) return [];
    return getMandatoryModules(offerProjectType, offerStack);
  }, [offerProjectType, offerStack]);

  const includedModuleIds = useMemo(() => {
    if (!offerProjectType || !offerStack) return [];
    return getIncludedModules(offerProjectType, offerStack);
  }, [offerProjectType, offerStack]);

  const lockedModuleSet = useMemo(
    () => new Set([...mandatoryModuleIds, ...includedModuleIds]),
    [mandatoryModuleIds, includedModuleIds],
  );

  useEffect(() => {
    if (!offerProjectType) return;
    if (!offerStack) return;
    const selectedIds = pendingOfferModulesRef.current ?? undefined;
    const payload: SyncModulesPayload = {
      allowedIds: compatibleModuleIds,
      mandatoryIds: [...mandatoryModuleIds, ...includedModuleIds],
    };
    if (selectedIds) {
      payload.selectedIds = selectedIds;
    }
    syncModules(payload);
    if (pendingOfferModulesRef.current) {
      pendingOfferModulesRef.current = null;
    }
  }, [
    offerProjectType,
    offerStack,
    compatibleModuleIds,
    mandatoryModuleIds,
    includedModuleIds,
    pendingOfferModulesRef,
    syncModules,
  ]);

  const toggleModuleSafe = useCallback(
    (id: ModuleId) => {
      if (lockedModuleSet.has(id)) return;
      toggleModule(id);
    },
    [lockedModuleSet, toggleModule],
  );

  return {
    qualificationProjectType,
    offerProjectType,
    canonicalTaxonomyResolution,
    offerStack,
    backendMultiplier,
    compatibleModuleIds,
    mandatoryModuleIds,
    includedModuleIds,
    toggleModuleSafe,
  };
}
