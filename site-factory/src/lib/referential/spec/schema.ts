import { z } from "zod";

export const classificationSchema = z.enum([
  "CMS_NATIVE",
  "PLUGIN_INTEGRATION",
  "FRAMEWORK_MODULE",
  "CUSTOM_APP",
  "THEME_FEATURE",
]);

export const cmsSpecSchema = z.object({
  version: z.literal("1.0.0"),
  cms: z.array(
    z.object({
      id: z.string().min(1),
      cmsId: z.string().min(1).optional(),
      label: z.string().min(1),
      kind: z.string().min(1),
      type: z.enum(["CMS", "COMMERCE_CMS", "HEADLESS"]).optional(),
      editorialModel: z.enum(["NATIVE", "CONFIGURABLE"]).optional(),
      extensionModel: z.enum(["PLUGIN", "APP", "MODULE", "MODULE_OR_CUSTOM"]).optional(),
      supportedFrontends: z.array(z.string().min(1)).optional(),
      supportedContentModes: z.array(z.enum(["GIT_MDX", "HEADLESS_CMS", "CUSTOM_ADMIN"]))
        .optional(),
    })
  ),
});

export const featuresSpecSchema = z.object({
  version: z.literal("1.0.0"),
  features: z.array(
    z.object({
      id: z.string().min(1),
      featureId: z.string().min(1).optional(),
      label: z.string().min(1),
      domain: z.string().min(1),
      uiOnly: z.boolean(),
      tags: z.array(z.string().min(1)).optional(),
      isThemeFeature: z.boolean().optional(),
    })
  ),
});

export const pluginsSpecSchema = z.object({
  version: z.literal("1.0.0"),
  plugins: z.array(
    z.object({
      id: z.string().min(1),
      pluginId: z.string().min(1).optional(),
      label: z.string().min(1),
      featureIds: z.array(z.string().min(1)),
      cmsIds: z.array(z.string().min(1)),
      url: z.string().min(1).optional(),
      vendor: z.string().min(1).optional(),
      pricingMode: z.enum(["FREE", "PAID", "MIXED", "UNKNOWN"]).optional(),
      priceMonthlyMin: z.number().nonnegative().optional(),
      priceMonthlyMax: z.number().nonnegative().optional(),
      billingNotes: z.string().min(1).optional(),
      pricing: z
        .object({
          mode: z.enum(["FREE", "PAID", "MIXED", "UNKNOWN"]),
          monthlyRange: z
            .object({
              min: z.number().nonnegative(),
              max: z.number().nonnegative(),
            })
            .optional(),
          sourceUrl: z.string().min(1).optional(),
        })
        .optional(),
      pros: z.array(z.string().min(1)).optional(),
      cons: z.array(z.string().min(1)).optional(),
      dependencyRisk: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      lastVerified: z.string().min(1).optional(),
    })
  ),
});

export const modulesSpecSchema = z.object({
  version: z.literal("1.0.0"),
  modules: z
    .array(
      z.object({
        id: z.string().min(1),
        moduleId: z.string().min(1).optional(),
        label: z.string().min(1),
        featureIds: z.array(z.string().min(1)),
        description: z.string().min(1).optional(),
        triggers: z.array(z.string().min(1)).optional(),
        compatibility: z
          .object({
            cmsIds: z.array(z.string().min(1)).optional(),
            requiresHeadless: z.boolean().optional(),
            excludesCmsIds: z.array(z.string().min(1)).optional(),
          })
          .optional(),
        recommendedPluginsByCMS: z.record(z.string().min(1), z.array(z.string().min(1))).optional(),
        estimatedEffort: z.enum(["S", "M", "L", "XL"]).optional(),
        commercial: z
          .object({
            categoryHint: z.enum(["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"]).optional(),
            setupRange: z
              .object({
                min: z.number().nonnegative(),
                max: z.number().nonnegative(),
              })
              .optional(),
            monthlyRange: z
              .object({
                min: z.number().nonnegative(),
                max: z.number().nonnegative(),
              })
              .optional(),
          })
          .optional(),
        ciImpact: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        targetCategory: z.enum(["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"]).optional(),
        minCategory: z.enum(["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"]).optional(),
        pricingMode: z.enum(["FIXED", "RANGE", "QUOTE_REQUIRED"]),
        priceSetupMin: z.number().nonnegative(),
        priceSetupMax: z.number().nonnegative(),
        priceMonthlyMin: z.number().nonnegative().optional(),
        priceMonthlyMax: z.number().nonnegative().optional(),
        economicGuardrails: z.object({
          maxBaseProjectShare: z.number().positive(),
          mustStayBelowBaseProjectPrice: z.boolean(),
          nonUxThemeFeature: z.boolean(),
        }),
      })
    )
    .min(1),
});

export const decisionRulesSpecSchema = z.object({
  version: z.literal("1.0.0"),
  classificationEnum: z.array(classificationSchema),
  decisionFlow: z.array(z.string().min(1)),
  decisionOrderCanonical: z.array(z.enum(["CMS_NATIVE", "PLUGIN", "MODULE", "CUSTOM_APP"])).optional(),
  matrix: z.array(
    z.object({
      featureId: z.string().min(1),
      rows: z.array(
        z.object({
          cmsId: z.string().min(1),
          classification: classificationSchema,
          recommendedModuleId: z.string().min(1).optional(),
          recommendedPluginIds: z.array(z.string().min(1)).optional(),
        })
      ),
    })
  ),
  economicRules: z.object({
    basePricingByCategory: z.record(
      z.enum(["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"]),
      z.union([
        z.object({
          type: z.literal("FROM"),
          from: z.number().positive(),
        }),
        z.object({
          type: z.literal("RANGE"),
          min: z.number().positive(),
          max: z.number().positive(),
        }),
      ])
    ),
    maintenancePricingByCategory: z.record(
      z.enum(["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"]),
      z.object({
        monthly: z.number().nonnegative(),
        scopeSummary: z.string().min(1),
      })
    ),
    annexFees: z.object({
      deploymentSetupFee: z.object({
        oneTime: z.number().nonnegative(),
        scopeSummary: z.string().min(1),
      }),
      domainCostRange: z.object({
        yearlyMin: z.number().nonnegative(),
        yearlyMax: z.number().nonnegative(),
      }),
      hostingCostRange: z.object({
        monthlyMin: z.number().nonnegative(),
        monthlyMax: z.number().nonnegative(),
      }),
      emailProviderCostRange: z.object({
        monthlyMin: z.number().nonnegative(),
        monthlyMax: z.number().nonnegative(),
      }),
      storageCostRange: z.object({
        monthlyMin: z.number().nonnegative(),
        monthlyMax: z.number().nonnegative(),
      }),
    }),
    marketPositioning: z.object({
      label: z.string().min(1),
      guardrails: z.object({
        smallUxThemeFeaturesMaxShareOfBaseBuild: z.number().positive(),
        smallUxThemeFeaturesMaxAbsolute: z.number().positive(),
        majorCommerceModulesMinShareOfBaseBuild: z.number().positive(),
        preventSmallUxPricingNearMajorModules: z.boolean(),
      }),
    }),
    pluginVsModuleDecision: z.object({
      preferPluginIntegrationWhen: z.object({
        stablePluginOrAppExists: z.boolean(),
        maxPluginMonthlyCost: z.number().nonnegative(),
        forbiddenEcosystemStates: z.array(z.enum(["FRAGMENTED", "EXPENSIVE", "INTEGRATION_COMPLEX"])),
      }),
      fallbackToFrameworkModuleWhen: z.object({
        businessValue: z.literal("HIGH"),
        reusability: z.literal("HIGH"),
        pluginEcosystem: z.array(z.enum(["FRAGMENTED", "EXPENSIVE", "INTEGRATION_COMPLEX"])),
      }),
    }),
    preferPluginWhen: z.object({
      pluginAvailability: z.literal("HIGH"),
      pluginCostLowerThanModuleBuild: z.boolean(),
      maintenanceRisk: z.literal("LOW"),
    }),
    allowFrameworkModuleWhen: z.object({
      businessValue: z.literal("HIGH"),
      reusability: z.literal("HIGH"),
      pluginEcosystem: z.array(z.enum(["FRAGMENTED", "EXPENSIVE", "INTEGRATION_COMPLEX"])),
    }),
    customAppWhen: z.object({
      cmsCapabilityUnsupported: z.boolean(),
      clientRefusesCms: z.boolean(),
      projectIsSaaSOrCustomPlatform: z.boolean(),
      customBackendRequired: z.boolean(),
    }),
    pricingCoherence: z.object({
      themeFeaturesCannotBeFrameworkModule: z.boolean(),
      modulePriceMustNotExceedTargetCategoryBaseOffer: z.boolean(),
      smallUxThemeFeaturesMustStayBelowMajorCommerceModules: z.boolean(),
      pluginWrapperMustBePluginIntegration: z.boolean(),
    }),
  }),
  invariants: z.object({
    darkModeMustAlwaysBeThemeFeature: z.boolean(),
    moduleCountMin: z.number().int().positive(),
    moduleCountMax: z.number().int().positive(),
    idsAreImmutable: z.boolean(),
  }),
  projectFlagsSchema: z.array(z.string().min(1)),
  decisionOutputPipeline: z.array(z.string().min(1)),
  customStackProfiles: z.array(z.string().min(1)).optional(),
});

export const commercialSpecSchema = z.object({
  version: z.literal("1.0.0"),
  region: z.object({
    label: z.string().min(1),
    currency: z.string().min(1),
  }),
  basePackageBandsByCategory: z.record(
    z.enum(["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"]),
    z.object({ from: z.number().nonnegative(), to: z.number().nonnegative() })
  ),
  maintenanceByCategory: z.record(
    z.enum(["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"]),
    z.object({ label: z.string().min(1), monthly: z.number().nonnegative() })
  ),
  annexCosts: z.object({
    deploySetupFee: z.record(z.string().min(1), z.number().nonnegative()),
    domainYearlyRange: z.object({ min: z.number().nonnegative(), max: z.number().nonnegative() }),
    hostingMonthlyRangeByStack: z.record(
      z.string().min(1),
      z.object({ min: z.number().nonnegative(), max: z.number().nonnegative() })
    ),
    emailMonthlyRange: z.object({ min: z.number().nonnegative(), max: z.number().nonnegative() }),
    storageMonthlyRange: z.object({ min: z.number().nonnegative(), max: z.number().nonnegative() }),
  }),
  rules: z.object({
    modulePriceMustStayProportionateToBase: z.boolean(),
    preferPluginWhenCheaperStableLowRisk: z.boolean(),
    pluginPreferenceThresholds: z.object({
      maxMonthlyPluginCost: z.number().nonnegative(),
      maxDependencyRisk: z.enum(["LOW", "MEDIUM", "HIGH"]),
    }),
  }),
});

export const customStacksSpecSchema = z.object({
  version: z.literal("1.0.0"),
  profiles: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      allowedIf: z.object({
        hasInHouseDev: z.boolean().optional(),
        complexityAtLeast: z.enum(["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"]).optional(),
      }),
      implies: z.object({
        maintenanceCategory: z.enum(["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"]).optional(),
        projectCategory: z.literal("CUSTOM_STACK").optional(),
      }),
      budgetHint: z.object({ min: z.number().nonnegative(), max: z.number().nonnegative() }).optional(),
      notes: z.array(z.string().min(1)).optional(),
    })
  ),
});

export type CmsSpec = z.infer<typeof cmsSpecSchema>;
export type FeaturesSpec = z.infer<typeof featuresSpecSchema>;
export type PluginsSpec = z.infer<typeof pluginsSpecSchema>;
export type ModulesSpec = z.infer<typeof modulesSpecSchema>;
export type DecisionRulesSpec = z.infer<typeof decisionRulesSpecSchema>;
export type CommercialSpec = z.infer<typeof commercialSpecSchema>;
export type CustomStacksSpec = z.infer<typeof customStacksSpecSchema>;
