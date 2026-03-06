import { z } from "zod";

export const classificationSchema = z.enum([
  "CMS_NATIVE",
  "PLUGIN_INTEGRATION",
  "FRAMEWORK_MODULE",
  "CUSTOM_APP",
  "THEME_FEATURE",
]);

const featureDomainSchema = z.enum([
  "CONTENT",
  "ECOMMERCE",
  "ANALYTICS",
  "MARKETING",
  "INTEGRATION",
  "SECURITY",
  "THEME",
]);

const featureTypeSchema = z.enum([
  "CMS",
  "COMMERCE",
  "ANALYTICS",
  "MARKETING",
  "UX",
]);

export const cmsSpecSchema = z.object({
  version: z.string().min(1),
  cms: z.array(
    z.object({
      id: z.string().min(1),
      cmsId: z.string().min(1).optional(),
      label: z.string().min(1),
      description: z.string().min(1),
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
  version: z.string().min(1),
  features: z.array(
    z.object({
      id: z.string().min(1),
      featureId: z.string().min(1).optional(),
      label: z.string().min(1),
      domain: featureDomainSchema,
      uiOnly: z.boolean(),
      type: featureTypeSchema,
      description: z.string().min(1),
      dependencies: z.array(z.string().min(1)).optional(),
      tags: z.array(z.string().min(1)).optional(),
      isThemeFeature: z.boolean().optional(),
    })
  ),
});

export const pluginsSpecSchema = z.object({
  version: z.string().min(1),
  plugins: z.array(
    z.object({
      id: z.string().min(1),
      pluginId: z.string().min(1).optional(),
      label: z.string().min(1),
      description: z.string().min(1),
      featureIds: z.array(z.string().min(1)),
      cmsIds: z.array(z.string().min(1)),
      url: z.string().min(1).optional(),
      vendor: z.string().min(1).optional(),
      pricingMode: z.enum(["FREE", "PAID", "MIXED", "UNKNOWN"]),
      billingCycle: z.enum(["MONTHLY", "ANNUAL", "ONE_TIME", "USAGE_BASED"]).optional(),
      priceMonthlyMin: z.number().nonnegative().optional(),
      priceMonthlyMax: z.number().nonnegative().optional(),
      priceAnnual: z.number().nonnegative().optional(),
      renewalDiscountPercent: z.number().min(0).max(100).optional(),
      amortization: z.enum(["ONE_SHOT", "MONTHLY_SPREAD"]).optional(),
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

const categoryEnum = z.enum(["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"]);

const ciImpactObjectSchema = z.object({
  sa: z.number().optional(),
  de: z.number().optional(),
  cb: z.number().optional(),
  sd: z.number().optional(),
});

const guardrailsSchema = z.object({
  maxBaseProjectShare: z.number().positive(),
  mustStayBelowBaseProjectPrice: z.boolean(),
  nonUxThemeFeature: z.boolean(),
});

export const modulesSpecSchema = z.object({
  version: z.string().min(1),
  modules: z
    .array(
      z.object({
        id: z.string().min(1),
        moduleId: z.string().min(1).optional(),
        label: z.string().min(1),
        name: z.string().min(1).optional(),
        featureIds: z.array(z.string().min(1)),
        implementationStrategies: z.array(z.string().min(1)).optional(),
        description: z.string().min(1),
        details: z.array(z.string()).min(1),
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
            categoryHint: categoryEnum.optional(),
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
        ciImpact: ciImpactObjectSchema,
        requalifiesTo: categoryEnum,
        isStructurant: z.boolean(),
        jsMultiplier: z.number(),
        splitPrestataireSetup: z.number(),
        splitPrestataireMonthly: z.number(),
        group: z.enum(["ecommerce", "contenu", "technique", "metier", "premium"]),
        icon: z.string().min(1),
        wpNote: z.string().min(1),
        setupTiers: z.array(z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          priceSetup: z.number(),
          requalifiesTo: categoryEnum.optional(),
        })).optional(),
        subscriptionTiers: z.array(z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          priceMonthly: z.number(),
        })).optional(),
        targetCategory: categoryEnum,
        minCategory: categoryEnum,
        pricingMode: z.enum(["FIXED", "RANGE", "QUOTE_REQUIRED"]),
        priceSetupMin: z.number().nonnegative(),
        priceSetupMax: z.number().nonnegative(),
        priceMonthlyMin: z.number().nonnegative(),
        priceMonthlyMax: z.number().nonnegative(),
        economicGuardrails: guardrailsSchema,
      })
    )
    .min(1),
});

export const decisionRulesSpecSchema = z.object({
  version: z.string().min(1),
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
      categoryEnum,
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
      categoryEnum,
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
  constraints: z.record(z.string(), z.object({
    values: z.array(z.string()),
    labels: z.record(z.string(), z.string()),
    minCategoryIndex: z.record(z.string(), z.number()).optional(),
  })).optional(),
  complexityIndex: z.object({
    formula: z.string().optional(),
    range: z.object({ min: z.number(), max: z.number() }).optional(),
    axisRange: z.object({ min: z.number(), max: z.number() }).optional(),
    weights: z.record(z.string(), z.number()),
    thresholds: z.array(z.object({
      max: z.number().nullable(),
      category: z.string(),
      label: z.string().optional(),
      note: z.string().optional(),
    })),
    axisLabels: z.record(z.string(), z.string()).optional(),
    axisDescriptions: z.record(z.string(), z.array(z.string())).optional(),
    moduleCIImpacts: z.record(z.string(), z.object({
      sa: z.number().optional(),
      de: z.number().optional(),
      cb: z.number().optional(),
      sd: z.number().optional(),
    })).optional(),
    baseAxesByProjectType: z.record(z.string(), z.object({
      sa: z.number(),
      de: z.number(),
      cb: z.number(),
      sd: z.number(),
    })).optional(),
  }).optional(),
  backendFamilies: z.record(z.string(), z.object({
    label: z.string(),
    description: z.string(),
    coefficient: z.number(),
  })).optional(),
  backendOpsHeavyCoefficient: z.number().optional(),
});

export const capabilityMatrixSpecSchema = z.object({
  version: z.string().min(1),
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
});

export const commercialSpecSchema = z.object({
  version: z.string().min(1),
  region: z.object({
    label: z.string().min(1),
    currency: z.string().min(1),
  }),
  basePackageBandsByCategory: z.record(
    categoryEnum,
    z.object({
      from: z.number().nonnegative(),
      to: z.number().nonnegative(),
      description: z.string().min(1).optional(),
    })
  ),
  maintenanceByCategory: z.record(
    categoryEnum,
    z.object({
      label: z.string().min(1),
      monthly: z.number().nonnegative(),
      id: z.string().optional(),
      shortLabel: z.string().optional(),
      description: z.string().min(1).optional(),
      splitPrestataire: z.number().optional(),
      scope: z.array(z.string()).optional(),
    })
  ),
  annexCosts: z.object({
    domainYearlyRange: z.object({ min: z.number().nonnegative(), max: z.number().nonnegative() }),
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
  deployFees: z.record(z.string(), z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    cost: z.number(),
    complexity: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    baseContainers: z.array(z.string()).optional(),
    scope: z.array(z.string()),
    headless: z.object({
      label: z.string(),
      description: z.string().optional(),
      cost: z.number(),
      complexity: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      scope: z.array(z.string()),
    }).optional(),
  })).optional(),
  hostingCosts: z.record(z.string(), z.object({
    label: z.string(),
    description: z.string().optional(),
    range: z.object({ min: z.number().nonnegative(), max: z.number().nonnegative() }),
    headless: z.object({
      label: z.string(),
      description: z.string().optional(),
      range: z.object({ min: z.number().nonnegative(), max: z.number().nonnegative() }),
    }).optional(),
  })).optional(),
  saasCosts: z.record(z.string(), z.object({
    label: z.string(),
    range: z.string(),
    description: z.string().min(1).optional(),
  })).optional(),
  stackDeployCompat: z.record(z.string(), z.array(z.string())).optional(),
  pluginRecurringCosts: z.object({
    monthlyMin: z.number(),
    monthlyMax: z.number(),
    source: z.string(),
  }).optional(),
});

export const customStacksSpecSchema = z.object({
  version: z.string().min(1),
  profiles: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      description: z.string().min(1),
      allowedIf: z.object({
        hasInHouseDev: z.boolean().optional(),
        complexityAtLeast: categoryEnum.optional(),
      }),
      implies: z.object({
        maintenanceCategory: categoryEnum.optional(),
        projectCategory: z.literal("CUSTOM_STACK").optional(),
      }),
      budgetHint: z.object({ min: z.number().nonnegative(), max: z.number().nonnegative() }).optional(),
      notes: z.array(z.string().min(1)).optional(),
    })
  ),
});

export const stackProfilesSpecSchema = z.object({
  version: z.string().min(1),
  families: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    description: z.string().min(1),
    basePrice: z.object({
      from: z.number().nonnegative(),
      label: z.string().min(1),
    }),
    maintenanceFloor: z.number().int().nonnegative(),
  })),
  profiles: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    family: z.string().min(1),
    capabilities: z.array(z.string()),
    hostingCompat: z.array(z.string()),
    complexityFactor: z.number().positive(),
    maintenanceFloorIndex: z.number().int().nonnegative(),
    legacyTechStack: z.string().nullable(),
    hasPluginEcosystem: z.boolean(),
    summary: z.string().min(1),
    pricingNotes: z.array(z.string()),
  })),
  implementationMapping: z.record(z.string(), z.string()),
  projectFamilyMapping: z.record(z.string(), z.string()),
});

const infraServiceCategorySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().min(1),
});

export const infraServicesSpecSchema = z.object({
  version: z.string().min(1),
  categories: z.array(infraServiceCategorySchema).min(1),
  services: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    category: z.string().min(1),
    description: z.string().min(1),
    containers: z.array(z.string().min(1)).min(1),
    setupCost: z.number().nonnegative(),
    monthlyCost: z.number().nonnegative(),
    requiresDocker: z.boolean(),
    minMaintenanceCat: categoryEnum,
    hostingImpact: z.object({
      ramMb: z.number().nonnegative(),
      note: z.string().min(1),
    }),
  })).min(1),
});

export type CmsSpec = z.infer<typeof cmsSpecSchema>;
export type FeaturesSpec = z.infer<typeof featuresSpecSchema>;
export type PluginsSpec = z.infer<typeof pluginsSpecSchema>;
export type ModulesSpec = z.infer<typeof modulesSpecSchema>;
export type DecisionRulesSpec = z.infer<typeof decisionRulesSpecSchema>;
export type CommercialSpec = z.infer<typeof commercialSpecSchema>;
export type CustomStacksSpec = z.infer<typeof customStacksSpecSchema>;
export type StackProfilesSpec = z.infer<typeof stackProfilesSpecSchema>;
export type InfraServicesSpec = z.infer<typeof infraServicesSpecSchema>;
export type CapabilityMatrixSpec = z.infer<typeof capabilityMatrixSpecSchema>;
