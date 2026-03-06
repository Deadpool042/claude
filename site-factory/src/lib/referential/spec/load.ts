import cmsJson from "./data/cms.json";
import featuresJson from "./data/features.json";
import pluginsJson from "./data/plugins.json";
import modulesJson from "./data/modules.json";
import decisionRulesJson from "./data/decision-rules.json";
import commercialJson from "./data/commercial.json";
import customStacksJson from "./data/custom-stacks.json";
import stackProfilesJson from "./data/stack-profiles.json";
import infraServicesJson from "./data/infra-services.json";
import {
  cmsSpecSchema,
  featuresSpecSchema,
  pluginsSpecSchema,
  modulesSpecSchema,
  decisionRulesSpecSchema,
  commercialSpecSchema,
  customStacksSpecSchema,
  stackProfilesSpecSchema,
  infraServicesSpecSchema,
} from "./schema";
import type { FullSpec } from "./types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[spec] ${message}`);
  }
}

export function loadReferentialSpec(): FullSpec {
  assert(
    !("categoryBaseOfferPrice" in (modulesJson as Record<string, unknown>)),
    "categoryBaseOfferPrice doit être défini uniquement dans decision-rules.economicRules.basePricingByCategory"
  );

  const cms = cmsSpecSchema.parse(cmsJson);
  const features = featuresSpecSchema.parse(featuresJson);
  const plugins = pluginsSpecSchema.parse(pluginsJson);
  const modules = modulesSpecSchema.parse(modulesJson);
  const decisionRules = decisionRulesSpecSchema.parse(decisionRulesJson);
  const commercial = commercialSpecSchema.parse(commercialJson);
  const customStacks = customStacksSpecSchema.parse(customStacksJson);
  const stackProfiles = stackProfilesSpecSchema.parse(stackProfilesJson);
  const infraServices = infraServicesSpecSchema.parse(infraServicesJson);

  const cmsIds = new Set(cms.cms.map((item) => item.id));
  const featureIds = new Set(features.features.map((item) => item.id));
  const pluginIds = new Set(plugins.plugins.map((item) => item.id));
  const moduleIds = new Set(modules.modules.map((item) => item.id));

  for (const entry of decisionRules.matrix) {
    assert(featureIds.has(entry.featureId), `featureId inconnu dans matrix: ${entry.featureId}`);

    for (const row of entry.rows) {
      assert(cmsIds.has(row.cmsId), `cmsId inconnu dans matrix: ${row.cmsId}`);

      if (row.recommendedModuleId) {
        assert(
          moduleIds.has(row.recommendedModuleId),
          `recommendedModuleId inconnu: ${row.recommendedModuleId}`
        );
      }

      for (const pluginId of row.recommendedPluginIds ?? []) {
        assert(pluginIds.has(pluginId), `recommendedPluginId inconnu: ${pluginId}`);
      }
    }
  }

  for (const plugin of plugins.plugins) {
    for (const featureId of plugin.featureIds) {
      assert(featureIds.has(featureId), `plugin ${plugin.id} référence feature inconnue: ${featureId}`);
    }
    for (const cmsId of plugin.cmsIds) {
      assert(cmsIds.has(cmsId), `plugin ${plugin.id} référence cms inconnu: ${cmsId}`);
    }
  }

  const decisionOrder = decisionRules.decisionOrderCanonical ?? ["CMS_NATIVE", "PLUGIN", "MODULE", "CUSTOM_APP"];
  assert(
    decisionOrder.join("|") === "CMS_NATIVE|PLUGIN|MODULE|CUSTOM_APP",
    "decisionOrderCanonical doit être CMS_NATIVE > PLUGIN > MODULE > CUSTOM_APP"
  );

  if (decisionRules.customStackProfiles?.length) {
    const profileIds = new Set(customStacks.profiles.map((profile) => profile.id));
    for (const profileId of decisionRules.customStackProfiles) {
      assert(
        profileIds.has(profileId),
        `customStackProfile inconnu dans decision-rules.customStackProfiles: ${profileId}`
      );
    }
  }

  for (const mod of modules.modules) {
    for (const featureId of mod.featureIds) {
      assert(featureIds.has(featureId), `module ${mod.id} référence feature inconnue: ${featureId}`);
    }

    const category = mod.targetCategory ?? mod.minCategory;
    assert(Boolean(category), `module ${mod.id} doit définir targetCategory ou minCategory`);
    const basePricing =
      decisionRules.economicRules.basePricingByCategory[
        category as keyof typeof decisionRules.economicRules.basePricingByCategory
      ];
    assert(Boolean(basePricing), `basePricingByCategory manquant pour ${category}`);
    const pricingEntry = basePricing as { type: "FROM"; from: number } | { type: "RANGE"; min: number; max: number };
    const cap = pricingEntry.type === "FROM" ? pricingEntry.from : pricingEntry.max;

    assert(mod.priceSetupMin <= mod.priceSetupMax, `module ${mod.id} a une plage setup invalide`);
    if (typeof mod.priceMonthlyMin === "number" || typeof mod.priceMonthlyMax === "number") {
      assert(
        typeof mod.priceMonthlyMin === "number" && typeof mod.priceMonthlyMax === "number",
        `module ${mod.id} doit définir priceMonthlyMin et priceMonthlyMax ensemble`
      );
      assert(
        (mod.priceMonthlyMin ?? 0) <= (mod.priceMonthlyMax ?? 0),
        `module ${mod.id} a une plage monthly invalide`
      );
    }

    assert(
      mod.priceSetupMax <= cap,
      `module ${mod.id} dépasse le prix d'offre de base ${category} (${mod.priceSetupMax} > ${cap})`
    );

    assert(mod.economicGuardrails.nonUxThemeFeature, `module ${mod.id} ne peut pas être une feature UX/thème`);
  }

  const darkModeEntry = decisionRules.matrix.find((entry) => entry.featureId === "feature.DARK_MODE");
  assert(Boolean(darkModeEntry), "feature.DARK_MODE absent de la matrix");
  for (const row of darkModeEntry?.rows ?? []) {
    assert(
      row.classification === "THEME_FEATURE",
      `dark mode doit toujours être THEME_FEATURE (cms: ${row.cmsId})`
    );
  }

  assert(
    modules.modules.length >= decisionRules.invariants.moduleCountMin &&
      modules.modules.length <= decisionRules.invariants.moduleCountMax,
    `nombre de modules invalide (${modules.modules.length})`
  );

  const headless = cms.cms.find((item) => item.id === "cms.HEADLESS");
  assert(Boolean(headless), "cms.HEADLESS absent de la spec");
  assert(
    (headless?.supportedFrontends?.length ?? 0) > 0,
    "cms.HEADLESS doit définir supportedFrontends"
  );
  assert(
    headless?.supportedContentModes?.includes("GIT_MDX") &&
      headless?.supportedContentModes?.includes("HEADLESS_CMS") &&
      headless?.supportedContentModes?.includes("CUSTOM_ADMIN"),
    "cms.HEADLESS doit supporter GIT_MDX, HEADLESS_CMS et CUSTOM_ADMIN"
  );

  // ── Infra services cross-validation ──
  const infraCategories = new Set(infraServices.categories.map((c) => c.id));
  for (const svc of infraServices.services) {
    assert(
      infraCategories.has(svc.category),
      `infra service ${svc.id} référence catégorie inconnue: ${svc.category}`
    );
  }

  return {
    cms: {
      ...cms,
      cms: cms.cms.map((item) => ({
        ...item,
        cmsId: item.cmsId ?? item.id,
      })),
    },
    features: {
      ...features,
      features: features.features.map((item) => ({
        ...item,
        featureId: item.featureId ?? item.id,
        isThemeFeature: item.isThemeFeature ?? item.uiOnly,
        tags: item.tags ?? [item.domain],
      })),
    },
    plugins: {
      ...plugins,
      plugins: plugins.plugins.map((item) => ({
        ...item,
        pluginId: item.pluginId ?? item.id,
      })),
    },
    modules: {
      ...modules,
      modules: modules.modules.map((item) => ({
        ...item,
        moduleId: item.moduleId ?? item.id,
      })),
    },
    decisionRules,
    commercial,
    customStacks,
    stackProfiles,
    infraServices,
  } as FullSpec;
}
