import fs from "node:fs";
import path from "node:path";

const strictMode = process.argv.includes("--strict");
const base = path.resolve("Docs/_spec");
const read = (fileName) => JSON.parse(fs.readFileSync(path.join(base, fileName), "utf8"));

const cms = read("cms.json");
const features = read("features.json");
const plugins = read("plugins.json");
const modules = read("modules.json");
const matrixSpec = read("capability-matrix.json");
const commercial = read("commercial.json");

const result = {
  errors: [],
  warnings: [],
  proposedFixes: [],
  summary: {
    cms: cms.cms.length,
    features: features.features.length,
    plugins: plugins.plugins.length,
    modules: modules.modules.length,
  },
};

const idRegex = {
  cms: /^cms\.[A-Z0-9_]+$/,
  feature: /^feature\.[A-Z0-9_]+$/,
  plugin: /^plugin\.[A-Z0-9_]+$/,
  module: /^module\.[A-Z0-9_]+$/,
};

function checkIds(items, regex, label) {
  const seen = new Set();
  for (const item of items) {
    const id = item.id;
    if (typeof id !== "string" || !regex.test(id)) {
      result.errors.push(`${label} invalid id format: ${id}`);
    }
    if (seen.has(id)) {
      result.errors.push(`${label} duplicate id: ${id}`);
    }
    seen.add(id);
    if (/[\sÀ-ÿ]/.test(id)) {
      result.errors.push(`${label} unstable id chars: ${id}`);
    }
  }
}

checkIds(cms.cms, idRegex.cms, "cms");
checkIds(features.features, idRegex.feature, "feature");
checkIds(plugins.plugins, idRegex.plugin, "plugin");
checkIds(modules.modules, idRegex.module, "module");

const cmsIds = new Set(cms.cms.map((item) => item.id));
const featureIds = new Set(features.features.map((item) => item.id));
const pluginIds = new Set(plugins.plugins.map((item) => item.id));
const moduleIds = new Set(modules.modules.map((item) => item.id));

const matrix = matrixSpec.matrix;
const matrixByFeature = new Map(matrix.map((entry) => [entry.featureId, entry]));

for (const feature of features.features) {
  if (!matrixByFeature.has(feature.id)) {
    result.errors.push(`matrix missing feature entry: ${feature.id}`);
  }
}

for (const entry of matrix) {
  if (!featureIds.has(entry.featureId)) {
    result.errors.push(`matrix references unknown feature: ${entry.featureId}`);
  }
  const rowCms = new Set();
  for (const row of entry.rows) {
    if (!cmsIds.has(row.cmsId)) {
      result.errors.push(`matrix references unknown cms: ${entry.featureId} -> ${row.cmsId}`);
    }
    if (rowCms.has(row.cmsId)) {
      result.errors.push(`matrix duplicate cms row: ${entry.featureId} -> ${row.cmsId}`);
    }
    rowCms.add(row.cmsId);

    if (!["CMS_NATIVE", "PLUGIN_INTEGRATION", "FRAMEWORK_MODULE", "CUSTOM_APP", "THEME_FEATURE"].includes(row.classification)) {
      result.errors.push(`matrix invalid classification: ${entry.featureId}/${row.cmsId}/${row.classification}`);
    }

    for (const pluginId of row.recommendedPluginIds ?? []) {
      if (!pluginIds.has(pluginId)) {
        result.errors.push(`matrix unknown plugin id ${pluginId} in ${entry.featureId}/${row.cmsId}`);
      }
    }

    if (row.recommendedModuleId && !moduleIds.has(row.recommendedModuleId)) {
      result.errors.push(`matrix unknown module id ${row.recommendedModuleId} in ${entry.featureId}/${row.cmsId}`);
    }
  }

  for (const cmsItem of cms.cms) {
    if (!rowCms.has(cmsItem.id)) {
      result.errors.push(`matrix missing row: ${entry.featureId} / ${cmsItem.id}`);
    }
  }
}

const darkModeEntry = matrixByFeature.get("feature.DARK_MODE");
if (!darkModeEntry) {
  result.errors.push("Dark mode entry missing");
} else {
  for (const row of darkModeEntry.rows) {
    if (row.classification !== "THEME_FEATURE") {
      result.errors.push(`Dark mode not THEME_FEATURE for ${row.cmsId}`);
    }
  }
}

for (const feature of features.features) {
  if (!feature.domain) {
    result.errors.push(`feature missing domain: ${feature.id}`);
  }
  if (typeof feature.uiOnly !== "boolean") {
    result.errors.push(`feature missing uiOnly boolean: ${feature.id}`);
  }
  if (!feature.type) {
    result.warnings.push(`feature missing type: ${feature.id}`);
    const proposedType = feature.domain === "UX" || feature.uiOnly
      ? "UX"
      : feature.domain === "ECOMMERCE"
        ? "COMMERCE"
        : "CMS";
    result.proposedFixes.push({
      file: "Docs/_spec/features.json",
      node: `features[id=${feature.id}].type`,
      value: proposedType,
    });
  }
}

for (const moduleItem of modules.modules) {
  if (!moduleItem.classificationRationale) {
    result.warnings.push(`module missing classificationRationale: ${moduleItem.id}`);
    result.proposedFixes.push({
      file: "Docs/_spec/modules.json",
      node: `modules[id=${moduleItem.id}].classificationRationale`,
      value: "Module framework réutilisable à forte valeur métier transversale.",
    });
  }

  let pluginPathExists = false;
  for (const featureId of moduleItem.featureIds) {
    const featureMatrix = matrixByFeature.get(featureId);
    if (featureMatrix && featureMatrix.rows.some((row) => row.classification === "PLUGIN_INTEGRATION")) {
      pluginPathExists = true;
    }
  }

  if (pluginPathExists && !moduleItem.pluginInsufficiencyRationale) {
    result.errors.push(`module lacks pluginInsufficiencyRationale while plugin path exists: ${moduleItem.id}`);
    result.proposedFixes.push({
      file: "Docs/_spec/modules.json",
      node: `modules[id=${moduleItem.id}].pluginInsufficiencyRationale`,
      value: "Les plugins existants ne couvrent pas durablement les besoins multi-CMS, la réutilisabilité et la gouvernance CI/maintenance.",
    });
  }
}

for (const plugin of plugins.plugins) {
  if (!plugin.url) {
    result.warnings.push(`plugin missing url: ${plugin.id}`);
    result.proposedFixes.push({
      file: "Docs/_spec/plugins.json",
      node: `plugins[id=${plugin.id}].url`,
      value: "https://example.com/official-docs",
    });
  }
  if (!plugin.pricingMode) {
    result.warnings.push(`plugin missing pricingMode: ${plugin.id}`);
    result.proposedFixes.push({
      file: "Docs/_spec/plugins.json",
      node: `plugins[id=${plugin.id}].pricingMode`,
      value: "UNKNOWN",
    });
  }
  if (!plugin.vendor) {
    result.warnings.push(`plugin missing vendor: ${plugin.id}`);
    result.proposedFixes.push({
      file: "Docs/_spec/plugins.json",
      node: `plugins[id=${plugin.id}].vendor`,
      value: "UNKNOWN",
    });
  }
}

for (const category of ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"]) {
  if (!commercial.maintenanceByCategory?.[category]) {
    result.errors.push(`commercial missing maintenance mapping ${category}`);
  }
}

if (!commercial.pluginRecurringCosts) {
  result.warnings.push("commercial missing pluginRecurringCosts aggregate");
  result.proposedFixes.push({
    file: "Docs/_spec/commercial.json",
    node: "pluginRecurringCosts",
    value: {
      monthlyMin: 0,
      monthlyMax: 350,
      source: "Derived from plugins pricingMode/priceMonthlyMin/priceMonthlyMax",
    },
  });
}

fs.writeFileSync(path.join(base, "audit-step2.raw.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log("Wrote Docs/_spec/audit-step2.raw.json");
console.log(
  `[spec-audit] summary cms=${result.summary.cms} features=${result.summary.features} plugins=${result.summary.plugins} modules=${result.summary.modules}`
);
console.log(
  `[spec-audit] errors=${result.errors.length} warnings=${result.warnings.length} strict=${strictMode}`
);

if (result.errors.length > 0) {
  process.exit(1);
}

if (strictMode && result.warnings.length > 0) {
  process.exit(2);
}
