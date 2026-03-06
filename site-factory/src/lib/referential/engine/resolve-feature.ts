import { getSpec } from "@/lib/referential/spec";
import type {
  ResolveFeatureInput,
  ResolveFeatureOutput,
  Classification,
  ContentWorkflow,
  MatrixClassification,
} from "@/lib/referential/spec/types";

function toImplementationType(classification: Classification): MatrixClassification {
  if (classification === "THEME_FEATURE") return "CMS_NATIVE";
  if (classification === "PLUGIN_INTEGRATION") return "PLUGIN";
  if (classification === "FRAMEWORK_MODULE") return "MODULE";
  return classification;
}

function recommendStackProfile(input: ResolveFeatureInput): string | undefined {
  const spec = getSpec();
  const allowedProfileIds = new Set(spec.decisionRules.customStackProfiles ?? []);
  const profiles = spec.customStacks.profiles.filter(
    (profile) => allowedProfileIds.size === 0 || allowedProfileIds.has(profile.id)
  );
  const hasInHouseDev = Boolean(input.projectFlags?.requiresCustomBackend || input.projectFlags?.projectIsSaaS);
  const projectComplexity = input.projectFlags?.businessValue === "HIGH" ? "CAT3" : "CAT2";
  const rank: Record<string, number> = { CAT0: 0, CAT1: 1, CAT2: 2, CAT3: 3, CAT4: 4 };

  const direct = profiles.find(
    (profile) =>
      (!profile.allowedIf.hasInHouseDev || hasInHouseDev) &&
      (!profile.allowedIf.complexityAtLeast ||
        rank[profile.allowedIf.complexityAtLeast] <= rank[projectComplexity])
  );

  return direct?.id;
}

function isCustomAppForced(input: ResolveFeatureInput): boolean {
  const flags = input.projectFlags;
  if (!flags) return false;
  return Boolean(flags.clientRefusesCms || flags.projectIsSaaS || flags.requiresCustomBackend);
}

function pluginRuleSatisfied(input: ResolveFeatureInput, hasStablePlugin: boolean): boolean {
  const spec = getSpec();
  const rule = spec.decisionRules.economicRules.pluginVsModuleDecision.preferPluginIntegrationWhen;
  const flags = input.projectFlags;
  if (!flags) return hasStablePlugin;

  const ecosystem = flags.pluginEcosystem ?? "HEALTHY";
  const ecosystemForbidden = rule.forbiddenEcosystemStates.some((state) => state === ecosystem);
  const ecosystemAllowed = !ecosystemForbidden;
  const monthlyCostSatisfied =
    typeof flags.estimatedPluginMonthlyCost === "number"
      ? flags.estimatedPluginMonthlyCost <= rule.maxPluginMonthlyCost
      : (flags.pluginCostLessThanModule ?? true);

  return (
    hasStablePlugin &&
    (flags.pluginAvailability ?? "HIGH") === "HIGH" &&
    monthlyCostSatisfied &&
    ecosystemAllowed &&
    (flags.pluginMaintenanceRisk ?? "LOW") === "LOW"
  );
}

function moduleRuleSatisfied(input: ResolveFeatureInput): boolean {
  const spec = getSpec();
  const moduleRule = spec.decisionRules.economicRules.pluginVsModuleDecision.fallbackToFrameworkModuleWhen;
  const flags = input.projectFlags;
  if (!flags) return true;

  const hasBusinessValue = (flags.businessValue ?? "HIGH") === moduleRule.businessValue;
  const hasReusability = (flags.reusability ?? "HIGH") === moduleRule.reusability;
  const pluginEcosystem = flags.pluginEcosystem ?? "FRAGMENTED";
  const ecosystemAllowsModule = moduleRule.pluginEcosystem.some((state) => state === pluginEcosystem);

  return hasBusinessValue && hasReusability && ecosystemAllowsModule;
}

function recommendContentWorkflow(input: ResolveFeatureInput): ContentWorkflow {
  const spec = getSpec();
  const headless = spec.cms.cms.find((item) => item.id === "cms.HEADLESS");
  const supportedModes = headless?.supportedContentModes ?? ["GIT_MDX", "HEADLESS_CMS", "CUSTOM_ADMIN"];
  const preferred = input.projectFlags?.contentWorkflowPreference;

  if (preferred && supportedModes.includes(preferred)) {
    return preferred;
  }

  if (input.projectFlags?.projectIsSaaS || input.projectFlags?.requiresCustomBackend) {
    return supportedModes.includes("CUSTOM_ADMIN") ? "CUSTOM_ADMIN" : "HEADLESS_CMS";
  }

  if (input.projectFlags?.clientRefusesCms) {
    return supportedModes.includes("GIT_MDX") ? "GIT_MDX" : "HEADLESS_CMS";
  }

  return supportedModes.includes("HEADLESS_CMS") ? "HEADLESS_CMS" : "GIT_MDX";
}

function findMatrixRow(
  cmsId: string,
  featureId: string
): {
  classification: Classification;
  recommendedModuleId?: string | undefined;
  recommendedPluginIds?: string[] | undefined;
} | null {
  const spec = getSpec();
  const featureEntry = spec.decisionRules.matrix.find((entry) => entry.featureId === featureId);
  if (!featureEntry) return null;
  const row = featureEntry.rows.find((item) => item.cmsId === cmsId);
  if (!row) return null;
  const result: {
    classification: Classification;
    recommendedModuleId?: string | undefined;
    recommendedPluginIds?: string[] | undefined;
  } = {
    classification: row.classification,
  };

  if (row.recommendedModuleId) {
    result.recommendedModuleId = row.recommendedModuleId;
  }
  if (row.recommendedPluginIds?.length) {
    result.recommendedPluginIds = row.recommendedPluginIds;
  }

  return result;
}

export function resolveFeature(input: ResolveFeatureInput): ResolveFeatureOutput {
  const spec = getSpec();

  const feature = spec.features.features.find((item) => item.id === input.featureId);
  if (!feature) {
    return {
      classification: "CUSTOM_APP",
      implementationType: "CUSTOM_APP",
      reason: `Feature inconnue (${input.featureId})`,
    };
  }

  if (feature.uiOnly) {
    return {
      classification: "THEME_FEATURE",
      implementationType: "CMS_NATIVE",
      reason: "Feature UI pure: classée THEME_FEATURE",
    };
  }

  if (isCustomAppForced(input)) {
    return {
      classification: "CUSTOM_APP",
      implementationType: "CUSTOM_APP",
      recommendedContentWorkflow: recommendContentWorkflow(input),
      recommendedStackProfileId: recommendStackProfile(input),
      reason: "Drapeaux projet imposent un CUSTOM_APP",
    };
  }

  const row = findMatrixRow(input.cmsId, input.featureId);
  if (!row) {
    return {
      classification: "CUSTOM_APP",
      implementationType: "CUSTOM_APP",
      recommendedContentWorkflow: recommendContentWorkflow(input),
      recommendedStackProfileId: recommendStackProfile(input),
      reason: "Aucune règle matrix pour ce couple cms/feature",
    };
  }

  if (row.classification === "CMS_NATIVE") {
    return {
      classification: "CMS_NATIVE",
      implementationType: toImplementationType("CMS_NATIVE"),
      reason: "Couvert nativement par le CMS",
    };
  }

  if (row.classification === "PLUGIN_INTEGRATION") {
    const hasRecommendations = (row.recommendedPluginIds?.length ?? 0) > 0;
    if (pluginRuleSatisfied(input, true)) {
      return {
        classification: "PLUGIN_INTEGRATION",
        implementationType: toImplementationType("PLUGIN_INTEGRATION"),
        ...(hasRecommendations
          ? { recommendedPluginIds: row.recommendedPluginIds }
          : {}),
        reason: hasRecommendations
          ? "Écosystème plugin mature et économiquement préférable"
          : "Voie plugin retenue sans recommandation explicite",
      };
    }

    if (row.recommendedModuleId && moduleRuleSatisfied(input)) {
      return {
        classification: "FRAMEWORK_MODULE",
        implementationType: toImplementationType("FRAMEWORK_MODULE"),
        recommendedModuleId: row.recommendedModuleId,
        reason: "Plugin non pertinent selon les règles économiques/risques",
      };
    }

    return {
      classification: "CUSTOM_APP",
      implementationType: "CUSTOM_APP",
      recommendedStackProfileId: recommendStackProfile(input),
      reason: "Aucun plugin ou module fiable selon les contraintes projet",
    };
  }

  if (row.classification === "FRAMEWORK_MODULE") {
    if (pluginRuleSatisfied(input, (row.recommendedPluginIds?.length ?? 0) > 0) && row.recommendedPluginIds?.length) {
      return {
        classification: "PLUGIN_INTEGRATION",
        implementationType: toImplementationType("PLUGIN_INTEGRATION"),
        recommendedPluginIds: row.recommendedPluginIds,
        reason: "Plugin stable disponible avec coût maîtrisé et écosystème non fragmenté",
      };
    }

    if (moduleRuleSatisfied(input)) {
      return {
        classification: "FRAMEWORK_MODULE",
        implementationType: toImplementationType("FRAMEWORK_MODULE"),
        ...(row.recommendedModuleId ? { recommendedModuleId: row.recommendedModuleId } : {}),
        ...(row.recommendedPluginIds?.length
          ? { recommendedPluginIds: row.recommendedPluginIds }
          : {}),
        reason: "Valeur métier élevée et module réutilisable",
      };
    }

    if (pluginRuleSatisfied(input, (row.recommendedPluginIds?.length ?? 0) > 0) && row.recommendedPluginIds?.length) {
      return {
        classification: "PLUGIN_INTEGRATION",
        implementationType: toImplementationType("PLUGIN_INTEGRATION"),
        recommendedPluginIds: row.recommendedPluginIds,
        reason: "Repli plugin selon règle économique",
      };
    }

    return {
      classification: "CUSTOM_APP",
      implementationType: "CUSTOM_APP",
      recommendedContentWorkflow: recommendContentWorkflow(input),
      recommendedStackProfileId: recommendStackProfile(input),
      reason: "Module non justifié et plugin insuffisant",
    };
  }

  return {
    classification: "CUSTOM_APP",
    implementationType: "CUSTOM_APP",
    recommendedContentWorkflow: recommendContentWorkflow(input),
    recommendedStackProfileId: recommendStackProfile(input),
    reason: "Fallback explicite CUSTOM_APP",
  };
}
