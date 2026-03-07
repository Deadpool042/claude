import type { JsonValue, SpecDetailMetric, SpecDetailSection } from "./spec-types";

type JsonRecord = Record<string, JsonValue>;

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as JsonRecord;
}

function asRecordArray(value: unknown): JsonRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry) => {
    const record = asRecord(entry);
    return record ? [record] : [];
  });
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry) => {
    const stringValue = asString(entry);
    return stringValue ? [stringValue] : [];
  });
}

function countEntries(value: unknown): number {
  if (Array.isArray(value)) {
    return value.length;
  }
  const record = asRecord(value);
  return record ? Object.keys(record).length : 0;
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function formatTags(counts: Record<string, number>, limit = 4): string[] {
  return Object.entries(counts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "fr"))
    .slice(0, limit)
    .map(([key, count]) => `${key} ${count}`);
}

function metric(
  label: string,
  value: string | number,
  tone: SpecDetailMetric["tone"] = "default",
): SpecDetailMetric {
  return { label, value: String(value), tone };
}

function formatEuroRange(min: number, max: number): string {
  return `${min} € à ${max} €`;
}

function buildCmsDetails(content: unknown): SpecDetailSection[] {
  const root = asRecord(content);
  const cms = asRecordArray(root?.cms);
  const kinds = countBy(cms.flatMap((item) => {
    const kind = asString(item.kind);
    return kind ? [kind] : [];
  }));
  const extensionModels = new Set(
    cms.flatMap((item) => {
      const model = asString(item.extensionModel);
      return model ? [model] : [];
    }),
  );
  const headlessCount = cms.filter((item) => asString(item.type) === "HEADLESS").length;

  return [
    {
      title: "Panorama CMS",
      description:
        "Vue rapide des plateformes, de leur positionnement et des modes d’extension déclarés.",
      metrics: [
        metric("CMS déclarés", cms.length, "accent"),
        metric("Familles distinctes", Object.keys(kinds).length),
        metric("Modèles d’extension", extensionModels.size),
        metric("Entrées headless", headlessCount),
      ],
      tags: formatTags(kinds),
    },
  ];
}

function buildFeaturesDetails(content: unknown): SpecDetailSection[] {
  const root = asRecord(content);
  const features = asRecordArray(root?.features);
  const domains = countBy(features.flatMap((item) => {
    const domain = asString(item.domain);
    return domain ? [domain] : [];
  }));
  const types = countBy(features.flatMap((item) => {
    const type = asString(item.type);
    return type ? [type] : [];
  }));
  const uiOnlyCount = features.filter((item) => item.uiOnly === true).length;

  return [
    {
      title: "Catalogue fonctionnel",
      description:
        "Résume la composition du catalogue et les zones fonctionnelles effectivement couvertes.",
      metrics: [
        metric("Fonctionnalités", features.length, "accent"),
        metric("Domaines", Object.keys(domains).length),
        metric("Interface seule", uiOnlyCount),
        metric("Types distincts", Object.keys(types).length),
      ],
      tags: formatTags(domains),
    },
  ];
}

function buildCapabilityMatrixDetails(content: unknown): SpecDetailSection[] {
  const root = asRecord(content);
  const matrixEntries = asRecordArray(root?.matrix);
  const rows = matrixEntries.flatMap((entry) => asRecordArray(entry.rows));
  const cmsIds = new Set(
    rows.flatMap((row) => {
      const cmsId = asString(row.cmsId);
      return cmsId ? [cmsId] : [];
    }),
  );
  const classifications = countBy(rows.flatMap((row) => {
    const classification = asString(row.classification);
    return classification ? [classification] : [];
  }));

  return [
    {
      title: "Couverture de la matrice",
      description:
        "Indique l’étendue de la matrice et la répartition des classifications exploitées par le moteur.",
      metrics: [
        metric("Fonctionnalités mappées", matrixEntries.length, "accent"),
        metric("Cellules CMS", rows.length),
        metric("CMS distincts", cmsIds.size),
        metric("Classifications", Object.keys(classifications).length),
      ],
      tags: formatTags(classifications),
    },
  ];
}

function buildPluginsDetails(content: unknown): SpecDetailSection[] {
  const root = asRecord(content);
  const plugins = asRecordArray(root?.plugins);
  const pricingModes = countBy(plugins.flatMap((item) => {
    const mode = asString(item.pricingMode);
    return mode ? [mode] : [];
  }));
  const billingCycles = countBy(plugins.flatMap((item) => {
    const cycle = asString(item.billingCycle) ?? "UNSPECIFIED";
    return [cycle];
  }));
  const coveredCms = new Set(
    plugins.flatMap((item) => asStringArray(item.cmsIds)),
  );

  return [
    {
      title: "Catalogue de plugins",
      description:
        "Mesure la couverture CMS et la structure des coûts récurrents du catalogue de plugins.",
      metrics: [
        metric("Plugins", plugins.length, "accent"),
        metric("Modes tarifaires", Object.keys(pricingModes).length),
        metric("Cycles de facturation", Object.keys(billingCycles).length),
        metric("CMS couverts", coveredCms.size),
      ],
      tags: formatTags(pricingModes),
    },
  ];
}

function buildModulesDetails(content: unknown): SpecDetailSection[] {
  const root = asRecord(content);
  const modules = asRecordArray(root?.modules);
  const groups = countBy(modules.flatMap((item) => {
    const group = asString(item.group);
    return group ? [group] : [];
  }));
  const categories = countBy(modules.flatMap((item) => {
    const category = asString(item.targetCategory);
    return category ? [category] : [];
  }));
  const structuringCount = modules.filter((item) => item.isStructurant === true).length;

  return [
    {
      title: "Briques sur-mesure",
      description:
        "Met en avant les modules structurants et leur répartition par groupe et catégorie cible.",
      metrics: [
        metric("Modules", modules.length, "accent"),
        metric("Structurants", structuringCount, structuringCount > 0 ? "warning" : "default"),
        metric("Groupes", Object.keys(groups).length),
        metric("Catégories cibles", Object.keys(categories).length),
      ],
      tags: formatTags(groups),
    },
  ];
}

function buildDecisionRulesDetails(content: unknown): SpecDetailSection[] {
  const root = asRecord(content);
  const matrixEntries = asRecordArray(root?.matrix);
  const constraints = countEntries(root?.constraints);
  const invariants = countEntries(root?.invariants);
  const backendFamilies = countEntries(root?.backendFamilies);
  const classifications = asStringArray(root?.classificationEnum);

  return [
    {
      title: "Moteur de décision",
      description:
        "Résume les briques qui gouvernent la qualification, les garde-fous et les familles backend.",
      metrics: [
        metric("Règles de matrice", matrixEntries.length, "accent"),
        metric("Contraintes", constraints),
        metric("Invariants", invariants, invariants > 0 ? "warning" : "default"),
        metric("Familles backend", backendFamilies),
      ],
      tags: classifications.slice(0, 5),
    },
  ];
}

function buildCommercialDetails(content: unknown): SpecDetailSection[] {
  const root = asRecord(content);
  const baseBands = asRecord(root?.basePackageBandsByCategory);
  const maintenance = asRecord(root?.maintenanceByCategory);
  const deploy = asRecord(root?.deployFees);
  const hosting = asRecord(root?.hostingCosts);
  const bandValues = Object.values(baseBands ?? {}).flatMap((entry) => {
    const record = asRecord(entry);
    if (!record) {
      return [];
    }
    const from = typeof record.from === "number" ? record.from : null;
    const to = typeof record.to === "number" ? record.to : null;
    return from !== null && to !== null ? [{ from, to }] : [];
  });
  const setupFloor = bandValues.reduce((sum, item) => sum + item.from, 0);
  const setupCeil = bandValues.reduce((sum, item) => sum + item.to, 0);

  return [
    {
      title: "Grilles commerciales",
      description:
        "Cadre les plans de prix, de maintenance et les options d’infrastructure exploitées par le devis.",
      metrics: [
        metric("Catégories tarifées", countEntries(baseBands), "accent"),
        metric("Plans de maintenance", countEntries(maintenance)),
        metric("Cibles de déploiement", countEntries(deploy)),
        metric("Entrées d’hébergement", countEntries(hosting)),
      ],
      tags:
        setupFloor > 0 || setupCeil > 0
          ? [formatEuroRange(setupFloor, setupCeil)]
          : [],
    },
  ];
}

function buildCustomStacksDetails(content: unknown): SpecDetailSection[] {
  const root = asRecord(content);
  const profiles = asRecordArray(root?.profiles);
  const complexities = countBy(profiles.flatMap((profile) => {
    const allowedIf = asRecord(profile.allowedIf);
    const level = asString(allowedIf?.complexityAtLeast);
    return level ? [level] : [];
  }));
  const maintenanceCats = new Set(
    profiles.flatMap((profile) => {
      const implies = asRecord(profile.implies);
      const maintenanceCategory = asString(implies?.maintenanceCategory);
      return maintenanceCategory ? [maintenanceCategory] : [];
    }),
  );

  return [
    {
      title: "Escalade sur mesure",
      description:
        "Montre quand une stack sur mesure devient admissible et le niveau d’engagement qu’elle implique.",
      metrics: [
        metric("Profils sur mesure", profiles.length, "accent"),
        metric("Seuils de complexité", Object.keys(complexities).length),
        metric("Maintenances imposées", maintenanceCats.size),
        metric("Profils avec budget", profiles.filter((profile) => asRecord(profile.budgetHint)).length),
      ],
      tags: formatTags(complexities),
    },
  ];
}

function buildStackProfilesDetails(content: unknown): SpecDetailSection[] {
  const root = asRecord(content);
  const families = asRecordArray(root?.families);
  const profiles = asRecordArray(root?.profiles);
  const maintenanceFloors = countBy(
    families.flatMap((family) => {
      const floor = family.maintenanceFloor;
      return typeof floor === "number" ? [`CAT${floor}`] : [];
    }),
  );

  return [
    {
      title: "Profils de stack",
      description:
        "Relie les familles de stack, leurs profils concrets et les planchers de maintenance déclarés.",
      metrics: [
        metric("Familles", families.length, "accent"),
        metric("Profils", profiles.length),
        metric("Correspondances CMS", countEntries(root?.implementationMapping)),
        metric("Correspondances projet", countEntries(root?.projectFamilyMapping)),
      ],
      tags: formatTags(maintenanceFloors),
    },
  ];
}

function buildSharedSocleDetails(content: unknown): SpecDetailSection[] {
  const root = asRecord(content);
  return [
    {
      title: "Socle commun",
      description: "Expose le volume des exigences transverses et des exceptions par stack.",
      metrics: [
        metric("Socle de base", countEntries(root?.baselineRequirements), "accent"),
        metric("Écarts par stack", countEntries(root?.stackDeltas)),
        metric("Références commerciales", countEntries(root?.commercialReferences)),
        metric("Clés racines", Object.keys(root ?? {}).filter((key) => key !== "_meta").length),
      ],
      tags: Object.keys(asRecord(root?.stackDeltas) ?? {}).slice(0, 4),
    },
  ];
}

function buildInfraServicesDetails(content: unknown): SpecDetailSection[] {
  const root = asRecord(content);
  const categories = asRecordArray(root?.categories);
  const services = asRecordArray(root?.services);
  const dockerRequired = services.filter((service) => service.requiresDocker === true).length;
  const recurringServices = services.filter((service) => {
    const monthlyCost = service.monthlyCost;
    return typeof monthlyCost === "number" && monthlyCost > 0;
  }).length;
  const byCategory = countBy(services.flatMap((service) => {
    const category = asString(service.category);
    return category ? [category] : [];
  }));

  return [
    {
      title: "Services d’infrastructure",
      description:
        "Mesure l’étendue du catalogue d’infrastructure et les contraintes d’hébergement les plus structurantes.",
      metrics: [
        metric("Catégories", categories.length, "accent"),
        metric("Services", services.length),
        metric("Docker requis", dockerRequired, dockerRequired > 0 ? "warning" : "default"),
        metric("Services récurrents", recurringServices),
      ],
      tags: formatTags(byCategory),
    },
  ];
}

function buildGenericDetails(content: unknown): SpecDetailSection[] {
  const root = asRecord(content);
  const topLevelKeys = Object.keys(root ?? {}).filter((key) => key !== "_meta");

  return [
    {
      title: "Structure générale",
      description:
        "Vue de lecture rapide quand aucune synthèse spécifique n’est définie.",
      metrics: [
        metric("Sections principales", topLevelKeys.length, "accent"),
        metric("Collections", topLevelKeys.filter((key) => Array.isArray(root?.[key])).length),
        metric("Objets", topLevelKeys.filter((key) => asRecord(root?.[key]) !== null).length),
        metric("Version", asString(root?.version) ?? "n/a"),
      ],
      tags: topLevelKeys.slice(0, 4),
    },
  ];
}

export function buildSpecDetailSections(
  specFile: string,
  content: unknown,
): SpecDetailSection[] {
  switch (specFile) {
    case "cms.json":
      return buildCmsDetails(content);
    case "features.json":
      return buildFeaturesDetails(content);
    case "capability-matrix.json":
      return buildCapabilityMatrixDetails(content);
    case "plugins.json":
      return buildPluginsDetails(content);
    case "modules.json":
      return buildModulesDetails(content);
    case "decision-rules.json":
      return buildDecisionRulesDetails(content);
    case "commercial.json":
      return buildCommercialDetails(content);
    case "custom-stacks.json":
      return buildCustomStacksDetails(content);
    case "stack-profiles.json":
      return buildStackProfilesDetails(content);
    case "shared-socle.json":
      return buildSharedSocleDetails(content);
    case "infra-services.json":
      return buildInfraServicesDetails(content);
    default:
      return buildGenericDetails(content);
  }
}
