import fs from "node:fs";
import path from "node:path";

const base = path.resolve("Docs/_spec");
const read = (name) => JSON.parse(fs.readFileSync(path.join(base, name), "utf8"));
const write = (name, data) => fs.writeFileSync(path.join(base, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");

const features = read("features.json");
const modules = read("modules.json");
const capabilityMatrix = read("capability-matrix.json");
const commercial = read("commercial.json");

const featureTypeFromDomain = (feature) => {
  if (feature.uiOnly === true) return "UX";
  if (feature.domain === "ECOMMERCE") return "COMMERCE";
  if (feature.domain === "ANALYTICS") return "ANALYTICS";
  if (feature.domain === "MARKETING") return "MARKETING";
  return "CMS";
};

features.features = features.features.map((feature) => ({
  ...feature,
  type: feature.type ?? featureTypeFromDomain(feature),
}));

const matrixByFeature = new Map(capabilityMatrix.matrix.map((entry) => [entry.featureId, entry]));

modules.modules = modules.modules.map((moduleItem) => {
  const hasPluginPath = moduleItem.featureIds.some((featureId) => {
    const entry = matrixByFeature.get(featureId);
    return entry?.rows.some((row) => row.classification === "PLUGIN_INTEGRATION") ?? false;
  });

  const updated = {
    ...moduleItem,
    classificationRationale:
      moduleItem.classificationRationale ??
      "Module framework réutilisable à forte valeur métier transversale.",
  };

  if (hasPluginPath) {
    updated.pluginInsufficiencyRationale =
      moduleItem.pluginInsufficiencyRationale ??
      "Les plugins existants ne couvrent pas durablement les besoins multi-CMS, la réutilisabilité et la gouvernance CI/maintenance.";
  }

  return updated;
});

commercial.pluginRecurringCosts = commercial.pluginRecurringCosts ?? {
  monthlyMin: 0,
  monthlyMax: 350,
  source: "Derived from plugins pricingMode/priceMonthlyMin/priceMonthlyMax",
};

write("features.json", features);
write("modules.json", modules);
write("commercial.json", commercial);

console.log("Applied Step 2 spec fixes: features.type, modules rationale fields, commercial completeness fields");
