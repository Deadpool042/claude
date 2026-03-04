export type Classification =
  | "CMS_NATIVE"
  | "PLUGIN_INTEGRATION"
  | "FRAMEWORK_MODULE"
  | "CUSTOM_APP"
  | "THEME_FEATURE";

export type MatrixClassification = "CMS_NATIVE" | "PLUGIN" | "MODULE" | "CUSTOM_APP";

export type Category = "CAT0" | "CAT1" | "CAT2" | "CAT3" | "CAT4";
export type ContentWorkflow = "GIT_MDX" | "HEADLESS_CMS" | "CUSTOM_ADMIN";

export interface CmsSpecItem {
  id: string;
  cmsId?: string;
  label: string;
  kind: string;
  type?: "CMS" | "COMMERCE_CMS" | "HEADLESS";
  editorialModel?: "NATIVE" | "CONFIGURABLE";
  extensionModel?: "PLUGIN" | "APP" | "MODULE" | "MODULE_OR_CUSTOM";
  supportedFrontends?: string[] | undefined;
  supportedContentModes?: ContentWorkflow[] | undefined;
}

export interface FeatureSpecItem {
  id: string;
  featureId?: string;
  label: string;
  domain: string;
  uiOnly: boolean;
  tags?: string[];
  isThemeFeature?: boolean;
}

export interface PluginSpecItem {
  id: string;
  pluginId?: string;
  label: string;
  featureIds: string[];
  cmsIds: string[];
  url?: string;
  vendor?: string;
  pricingMode?: "FREE" | "PAID" | "MIXED" | "UNKNOWN" | undefined;
  priceMonthlyMin?: number | undefined;
  priceMonthlyMax?: number | undefined;
  billingNotes?: string | undefined;
  pricing?: {
    mode: "FREE" | "PAID" | "MIXED" | "UNKNOWN";
    monthlyRange?: { min: number; max: number };
    sourceUrl?: string;
  };
  pros?: string[];
  cons?: string[];
  dependencyRisk?: "LOW" | "MEDIUM" | "HIGH";
  lastVerified?: string;
}

export interface ModuleSpecItem {
  id: string;
  moduleId?: string;
  label: string;
  featureIds: string[];
  description?: string;
  triggers?: string[];
  compatibility?: {
    cmsIds?: string[];
    requiresHeadless?: boolean;
    excludesCmsIds?: string[];
  };
  recommendedPluginsByCMS?: Partial<Record<string, string[]>>;
  estimatedEffort?: "S" | "M" | "L" | "XL";
  commercial?: {
    categoryHint?: Category;
    setupRange?: { min: number; max: number };
    monthlyRange?: { min: number; max: number };
  };
  ciImpact?: "LOW" | "MEDIUM" | "HIGH";
  targetCategory?: Category | undefined;
  minCategory?: Category | undefined;
  pricingMode: "FIXED" | "RANGE" | "QUOTE_REQUIRED";
  priceSetupMin: number;
  priceSetupMax: number;
  priceMonthlyMin?: number | undefined;
  priceMonthlyMax?: number | undefined;
  economicGuardrails: {
    maxBaseProjectShare: number;
    mustStayBelowBaseProjectPrice: boolean;
    nonUxThemeFeature: boolean;
  };
}

export interface DecisionMatrixRow {
  cmsId: string;
  classification: Classification;
  recommendedModuleId?: string | undefined;
  recommendedPluginIds?: string[] | undefined;
}

export interface DecisionMatrixEntry {
  featureId: string;
  rows: DecisionMatrixRow[];
}

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

export interface CommercialSpec {
  version: "1.0.0";
  region: {
    label: string;
    currency: string;
  };
  basePackageBandsByCategory: Record<Category, { from: number; to: number }>;
  maintenanceByCategory: Record<Category, { label: string; monthly: number }>;
  annexCosts: {
    deploySetupFee: Record<string, number>;
    domainYearlyRange: { min: number; max: number };
    hostingMonthlyRangeByStack: Record<string, { min: number; max: number }>;
    emailMonthlyRange: { min: number; max: number };
    storageMonthlyRange: { min: number; max: number };
  };
  rules: {
    modulePriceMustStayProportionateToBase: boolean;
    preferPluginWhenCheaperStableLowRisk: boolean;
    pluginPreferenceThresholds: {
      maxMonthlyPluginCost: number;
      maxDependencyRisk: "LOW" | "MEDIUM" | "HIGH";
    };
  };
}

export interface CustomStackProfile {
  id: string;
  label: string;
  allowedIf: {
    hasInHouseDev?: boolean;
    complexityAtLeast?: Category;
  };
  implies: {
    maintenanceCategory?: Category;
    projectCategory?: "CUSTOM_STACK";
  };
  budgetHint?: { min: number; max: number };
  notes?: string[];
}

export interface CustomStacksSpec {
  version: "1.0.0";
  profiles: CustomStackProfile[];
}

export interface FullSpec {
  cms: {
    version: "1.0.0";
    cms: CmsSpecItem[];
  };
  features: {
    version: "1.0.0";
    features: FeatureSpecItem[];
  };
  plugins: {
    version: "1.0.0";
    plugins: PluginSpecItem[];
  };
  modules: {
    version: "1.0.0";
    modules: ModuleSpecItem[];
  };
  decisionRules: {
    version: "1.0.0";
    classificationEnum: Classification[];
    decisionFlow: string[];
    decisionOrderCanonical?: MatrixClassification[];
    matrix: DecisionMatrixEntry[];
    economicRules: {
      basePricingByCategory: Partial<Record<
        Category,
        { type: "FROM"; from: number } | { type: "RANGE"; min: number; max: number }
      >>;
      maintenancePricingByCategory: Partial<Record<
        Category,
        {
          monthly: number;
          scopeSummary: string;
        }
      >>;
      annexFees: {
        deploymentSetupFee: {
          oneTime: number;
          scopeSummary: string;
        };
        domainCostRange: { yearlyMin: number; yearlyMax: number };
        hostingCostRange: { monthlyMin: number; monthlyMax: number };
        emailProviderCostRange: { monthlyMin: number; monthlyMax: number };
        storageCostRange: { monthlyMin: number; monthlyMax: number };
      };
      marketPositioning: {
        label: string;
        guardrails: {
          smallUxThemeFeaturesMaxShareOfBaseBuild: number;
          smallUxThemeFeaturesMaxAbsolute: number;
          majorCommerceModulesMinShareOfBaseBuild: number;
          preventSmallUxPricingNearMajorModules: boolean;
        };
      };
      pluginVsModuleDecision: {
        preferPluginIntegrationWhen: {
          stablePluginOrAppExists: boolean;
          maxPluginMonthlyCost: number;
          forbiddenEcosystemStates: Array<"FRAGMENTED" | "EXPENSIVE" | "INTEGRATION_COMPLEX">;
        };
        fallbackToFrameworkModuleWhen: {
          businessValue: "HIGH";
          reusability: "HIGH";
          pluginEcosystem: Array<"FRAGMENTED" | "EXPENSIVE" | "INTEGRATION_COMPLEX">;
        };
      };
      preferPluginWhen: {
        pluginAvailability: "HIGH";
        pluginCostLowerThanModuleBuild: boolean;
        maintenanceRisk: "LOW";
      };
      allowFrameworkModuleWhen: {
        businessValue: "HIGH";
        reusability: "HIGH";
        pluginEcosystem: Array<"FRAGMENTED" | "EXPENSIVE" | "INTEGRATION_COMPLEX">;
      };
      customAppWhen: {
        cmsCapabilityUnsupported: boolean;
        clientRefusesCms: boolean;
        projectIsSaaSOrCustomPlatform: boolean;
        customBackendRequired: boolean;
      };
      pricingCoherence: {
        themeFeaturesCannotBeFrameworkModule: boolean;
        modulePriceMustNotExceedTargetCategoryBaseOffer: boolean;
        smallUxThemeFeaturesMustStayBelowMajorCommerceModules: boolean;
        pluginWrapperMustBePluginIntegration: boolean;
      };
    };
    invariants: {
      darkModeMustAlwaysBeThemeFeature: boolean;
      moduleCountMin: number;
      moduleCountMax: number;
      idsAreImmutable: boolean;
    };
    projectFlagsSchema: string[];
    decisionOutputPipeline: string[];
    customStackProfiles?: string[];
  };
  commercial: CommercialSpec;
  customStacks: CustomStacksSpec;
}
