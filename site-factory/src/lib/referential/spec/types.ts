import type {
  CmsSpec as CmsSpecSchema,
  FeaturesSpec as FeaturesSpecSchema,
  PluginsSpec as PluginsSpecSchema,
  ModulesSpec as ModulesSpecSchema,
  DecisionRulesSpec as DecisionRulesSpecSchema,
  CommercialSpec as CommercialSpecSchema,
  CustomStacksSpec as CustomStacksSpecSchema,
  StackProfilesSpec as StackProfilesSpecSchema,
  InfraServicesSpec as InfraServicesSpecSchema,
} from "./schema";

export type CmsSpec = CmsSpecSchema;
export type FeaturesSpec = FeaturesSpecSchema;
export type PluginsSpec = PluginsSpecSchema;
export type ModulesSpec = ModulesSpecSchema;
export type DecisionRulesSpec = DecisionRulesSpecSchema;
export type CommercialSpec = CommercialSpecSchema;
export type CustomStacksSpec = CustomStacksSpecSchema;
export type StackProfilesSpec = StackProfilesSpecSchema;
export type InfraServicesSpec = InfraServicesSpecSchema;

export type CmsSpecItem = CmsSpec["cms"][number];
export type FeatureSpecItem = FeaturesSpec["features"][number];
export type PluginSpecItem = PluginsSpec["plugins"][number];
export type ModuleSpecItem = ModulesSpec["modules"][number];
export type DecisionMatrixRow = DecisionRulesSpec["matrix"][number]["rows"][number];
export type DecisionMatrixEntry = DecisionRulesSpec["matrix"][number];
export type ConstraintDef = NonNullable<DecisionRulesSpec["constraints"]>[string];

export type Classification = DecisionMatrixRow["classification"];
export type MatrixClassification = NonNullable<DecisionRulesSpec["decisionOrderCanonical"]>[number];
export type Category = ModuleSpecItem["targetCategory"];
export type ContentWorkflow = NonNullable<CmsSpecItem["supportedContentModes"]>[number];
export type FeatureDomain = FeatureSpecItem["domain"];
export type FeatureType = FeatureSpecItem["type"];

export interface ProjectFlags {
  clientRefusesCms?: boolean;
  projectIsSaaS?: boolean;
  requiresCustomBackend?: boolean;
  pluginAvailability?: "LOW" | "MEDIUM" | "HIGH";
  pluginCostLessThanModule?: boolean;
  estimatedPluginMonthlyCost?: number;
  pluginMaintenanceRisk?: "LOW" | "MEDIUM" | "HIGH";
  businessValue?: "LOW" | "MEDIUM" | "HIGH";
  reusability?: "LOW" | "MEDIUM" | "HIGH";
  pluginEcosystem?: "HEALTHY" | "FRAGMENTED" | "EXPENSIVE" | "INTEGRATION_COMPLEX";
  contentWorkflowPreference?: ContentWorkflow;
}

export interface ResolveFeatureInput {
  cmsId: string;
  featureId: string;
  projectFlags?: ProjectFlags;
}

export interface ResolveFeatureOutput {
  classification: Classification;
  implementationType?: MatrixClassification | undefined;
  recommendedModuleId?: string | undefined;
  recommendedPluginIds?: string[] | undefined;
  recommendedContentWorkflow?: ContentWorkflow | undefined;
  recommendedStackProfileId?: string | undefined;
  reason: string;
}

export type CustomStackProfile = CustomStacksSpec["profiles"][number];
export type InfraServiceCategory = InfraServicesSpec["categories"][number];
export type InfraServiceItem = InfraServicesSpec["services"][number];

export interface FullSpec {
  cms: CmsSpec;
  features: FeaturesSpec;
  plugins: PluginsSpec;
  modules: ModulesSpec;
  decisionRules: DecisionRulesSpec;
  commercial: CommercialSpec;
  customStacks: CustomStacksSpec;
  stackProfiles: StackProfilesSpec;
  infraServices: InfraServicesSpec;
}
