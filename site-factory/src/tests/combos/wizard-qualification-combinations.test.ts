import { describe, expect, it } from "vitest";
import {
  DEFAULT_WIZARD_TYPE_STACK_STATE,
  normalizeTypeStackState,
  deriveHostingSelectionMode,
  isHeadlessArchitecture,
  allowedHostingTargetsForType,
  allowedFamiliesForTypeAndHosting,
  type WizardTypeStackState,
} from "@/lib/wizard-domain";
import { qualifyProject } from "@/lib/qualification-runtime";
import type {
  ProjectType,
  TrafficLevel,
  ProductBucket,
  DataSensitivity,
  ScalabilityLevel,
  BackendFamily,
} from "@/lib/referential";
import type {
  CommerceModel,
  EditingFrequency,
} from "@/lib/project-choices";
import type { HostingTargetInput } from "@/lib/validators";

describe("wizard + qualification live combinations", () => {
  it("normalizes and qualifies sampled combinations without dead-ends", () => {
    const projectTypes: ProjectType[] = ["BLOG", "VITRINE", "ECOM", "APP"];
    const hostingTargets: HostingTargetInput[] = [
      "SHARED_PHP",
      "CLOUD_STATIC",
      "CLOUD_SSR",
      "VPS_DOCKER",
      "TO_CONFIRM",
    ];
    const needsEditingValues = [false, true] as const;
    const editingFrequencies: EditingFrequency[] = ["RARE", "REGULAR", "DAILY"];
    const commerceModels: CommerceModel[] = ["SELF_HOSTED", "SAAS", "HEADLESS"];
    const backendModes = ["FULLSTACK", "SEPARATE"] as const;
    const backendFamilies: Array<BackendFamily | null> = [null, "BAAS_STANDARD", "CUSTOM_API"];
    const backendOpsValues = [false, true] as const;
    const headlessRequiredValues = [false, true] as const;
    const trafficLevels: TrafficLevel[] = ["LOW", "HIGH"];
    const productCounts: ProductBucket[] = ["NONE", "SMALL"];
    const dataSensitivities: DataSensitivity[] = ["STANDARD", "REGULATED"];
    const scalabilityLevels: ScalabilityLevel[] = ["FIXED", "ELASTIC"];

    const errors: string[] = [];
    let checked = 0;

    for (const projectType of projectTypes) {
      for (const hostingTarget of hostingTargets) {
        for (const needsEditing of needsEditingValues) {
          for (const editingFrequency of editingFrequencies) {
            for (const commerceModel of commerceModels) {
              for (const backendMode of backendModes) {
                for (const backendFamily of backendFamilies) {
                  for (const backendOpsHeavy of backendOpsValues) {
                    for (const headlessRequired of headlessRequiredValues) {
                      for (const trafficLevel of trafficLevels) {
                        for (const productCount of productCounts) {
                          for (const dataSensitivity of dataSensitivities) {
                            for (const scalabilityLevel of scalabilityLevels) {
                              const seed: WizardTypeStackState = {
                                ...DEFAULT_WIZARD_TYPE_STACK_STATE,
                                projectType,
                                hostingTarget,
                                needsEditing,
                                editingFrequency,
                                commerceModel,
                                backendMode,
                                backendFamily,
                                backendOpsHeavy,
                                headlessRequired,
                                trafficLevel,
                                productCount,
                                dataSensitivity,
                                scalabilityLevel,
                                projectFamily: null,
                                projectImplementation: null,
                                projectFrontendImplementation: null,
                              };

                              const next = normalizeTypeStackState(seed, {});
                              checked += 1;

                              const allowedHosting = allowedHostingTargetsForType(next.projectType);
                              if (!allowedHosting.includes(next.hostingTarget)) {
                                errors.push(
                                  `${projectType}: hosting '${next.hostingTarget}' not allowed`,
                                );
                              }

                              const hostingMode = deriveHostingSelectionMode(next);
                              if (hostingMode === "SINGLE") {
                                const allowedFamilies = allowedFamiliesForTypeAndHosting(
                                  next.projectType,
                                  next.hostingTarget,
                                );
                                if (!next.projectFamily || !allowedFamilies.includes(next.projectFamily)) {
                                  errors.push(
                                    `${projectType}: invalid family '${next.projectFamily}' for SINGLE/${next.hostingTarget}`,
                                  );
                                }
                              } else {
                                if (!next.projectFamily) {
                                  errors.push(`${projectType}: missing family in mode ${hostingMode}`);
                                }
                              }

                              const isHeadless = isHeadlessArchitecture(next);
                              if (!isHeadless && next.projectFrontendImplementation !== null) {
                                errors.push(`${projectType}: frontend implementation should be null for non-headless`);
                              }
                              if (isHeadless && next.projectFrontendImplementation === null) {
                                errors.push(`${projectType}: frontend implementation missing for headless`);
                              }

                              if (hostingMode === "SINGLE" || hostingMode === "NONE") {
                                if (next.hostingTargetBack !== null || next.hostingTargetFront !== null) {
                                  errors.push(`${projectType}: split hosting fields should be null in ${hostingMode}`);
                                }
                              }
                              if (hostingMode === "FRONT_ONLY") {
                                if (next.hostingTargetBack !== null || next.hostingTargetFront === null) {
                                  errors.push(`${projectType}: invalid FRONT_ONLY hosting targets`);
                                }
                              }
                              if (hostingMode === "SPLIT") {
                                if (next.hostingTargetBack === null || next.hostingTargetFront === null) {
                                  errors.push(`${projectType}: invalid SPLIT hosting targets`);
                                }
                              }

                              const isApp =
                                next.projectType === "APP" || next.projectFamily === "APP_PLATFORM";
                              if (!isApp) {
                                if (
                                  next.backendMode !== "FULLSTACK" ||
                                  next.backendFamily !== null ||
                                  next.backendOpsHeavy !== false
                                ) {
                                  errors.push(`${projectType}: backend fields should be reset outside APP`);
                                }
                              }

                              if (next.techStack) {
                                try {
                                  const constraints = {
                                    trafficLevel: next.trafficLevel,
                                    productCount:
                                      next.projectType === "ECOM" ? next.productCount : "NONE",
                                    dataSensitivity: next.dataSensitivity,
                                    scalabilityLevel: next.scalabilityLevel,
                                    needsEditing: next.needsEditing,
                                    editingFrequency: next.editingFrequency,
                                    headlessRequired: isHeadless,
                                    commerceModel:
                                      next.projectType === "ECOM" ? next.commerceModel : null,
                                    backendFamily:
                                      next.projectType === "APP" ? next.backendFamily : null,
                                    backendOpsHeavy:
                                      next.projectType === "APP" ? next.backendOpsHeavy : false,
                                  };

                                  qualifyProject({
                                    projectType: next.projectType as ProjectType,
                                    techStack: next.techStack,
                                    selectedModuleIds: [],
                                    billingMode: "SOLO",
                                    deployTarget: "DOCKER",
                                    wpHeadless: next.wpHeadless,
                                    constraints,
                                  });
                                } catch (error) {
                                  errors.push(
                                    `${projectType}: qualification error for normalized state (${String(error)})`,
                                  );
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    expect(checked).toBeGreaterThan(1000);
    expect(errors).toEqual([]);
  });
});
