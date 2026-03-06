import type { ProjectType as ReferentialProjectType } from "@/lib/referential/project";

export type CanonicalProjectTaxonomy =
  | "SITE_VITRINE"
  | "SITE_BUSINESS"
  | "ECOMMERCE"
  | "MVP_SAAS"
  | "APP_METIER";

export type LegacyProjectType = ReferentialProjectType | "STARTER";

export type LegacyOfferCategory =
  | "VITRINE_BLOG"
  | "ECOMMERCE"
  | "APP_CUSTOM";

export type TaxonomyCluster = "SITE" | "ECOMMERCE" | "APP";

export type TaxonomyMappingStatus =
  | "EXACT"
  | "PROVISIONAL"
  | "APPROXIMATE"
  | "AMBIGUOUS";

export type TaxonomyMappingConfidence = "HIGH" | "MEDIUM" | "LOW";

export type TaxonomyDisambiguationSignal = Exclude<
  CanonicalProjectTaxonomy,
  "ECOMMERCE"
>;

export interface TaxonomyMappingResult<TSource, TTarget> {
  source: TSource;
  target: TTarget | null;
  status: TaxonomyMappingStatus;
  confidence: TaxonomyMappingConfidence;
  candidates: readonly TTarget[];
  needsSignal: boolean;
  note: string;
}

const SITE_TARGET_CANDIDATES: readonly CanonicalProjectTaxonomy[] = [
  "SITE_VITRINE",
  "SITE_BUSINESS",
];

const APP_TARGET_CANDIDATES: readonly CanonicalProjectTaxonomy[] = [
  "MVP_SAAS",
  "APP_METIER",
];

const SITE_PROJECT_TYPE_CANDIDATES: readonly LegacyProjectType[] = [
  "VITRINE",
  "BLOG",
  "STARTER",
];

const SITE_BUSINESS_PROJECT_TYPE_CANDIDATES: readonly LegacyProjectType[] = [
  "VITRINE",
  "BLOG",
];

function buildMappingResult<TSource, TTarget>(params: {
  source: TSource;
  target: TTarget | null;
  status: TaxonomyMappingStatus;
  confidence: TaxonomyMappingConfidence;
  candidates: readonly TTarget[];
  needsSignal: boolean;
  note: string;
}): TaxonomyMappingResult<TSource, TTarget> {
  return {
    source: params.source,
    target: params.target,
    status: params.status,
    confidence: params.confidence,
    candidates: params.candidates,
    needsSignal: params.needsSignal,
    note: params.note,
  };
}

export function getCanonicalTaxonomyCluster(
  taxonomy: CanonicalProjectTaxonomy,
): TaxonomyCluster {
  if (taxonomy === "ECOMMERCE") return "ECOMMERCE";
  if (taxonomy === "SITE_VITRINE" || taxonomy === "SITE_BUSINESS") return "SITE";
  return "APP";
}

export function getLegacyProjectTypeCluster(
  projectType: LegacyProjectType,
): TaxonomyCluster {
  if (projectType === "ECOM") return "ECOMMERCE";
  if (projectType === "APP") return "APP";
  return "SITE";
}

export function getLegacyOfferCategoryCluster(
  offerCategory: LegacyOfferCategory,
): TaxonomyCluster {
  if (offerCategory === "ECOMMERCE") return "ECOMMERCE";
  if (offerCategory === "APP_CUSTOM") return "APP";
  return "SITE";
}

export function readLegacyTaxonomyCluster(input: {
  projectType?: LegacyProjectType | null;
  offerCategory?: LegacyOfferCategory | null;
}): TaxonomyCluster | null {
  const byProjectType = input.projectType
    ? getLegacyProjectTypeCluster(input.projectType)
    : null;
  const byOfferCategory = input.offerCategory
    ? getLegacyOfferCategoryCluster(input.offerCategory)
    : null;

  if (byProjectType && byOfferCategory && byProjectType !== byOfferCategory) {
    return null;
  }
  return byProjectType ?? byOfferCategory ?? null;
}

export function mapLegacyProjectTypeToCanonicalTaxonomy(
  projectType: LegacyProjectType,
  signal?: TaxonomyDisambiguationSignal | null,
): TaxonomyMappingResult<LegacyProjectType, CanonicalProjectTaxonomy> {
  if (projectType === "ECOM") {
    return buildMappingResult({
      source: projectType,
      target: "ECOMMERCE",
      status: "EXACT",
      confidence: "HIGH",
      candidates: ["ECOMMERCE"],
      needsSignal: false,
      note: "Mapping exact: ECOM runtime legacy correspond a ECOMMERCE canonique.",
    });
  }

  if (projectType === "STARTER") {
    return buildMappingResult({
      source: projectType,
      target: "SITE_VITRINE",
      status: "PROVISIONAL",
      confidence: "MEDIUM",
      candidates: ["SITE_VITRINE"],
      needsSignal: false,
      note: "STARTER reste legacy et est lu provisoirement comme SITE_VITRINE.",
    });
  }

  if (projectType === "VITRINE" || projectType === "BLOG") {
    if (signal === "SITE_BUSINESS") {
      return buildMappingResult({
        source: projectType,
        target: "SITE_BUSINESS",
        status: "APPROXIMATE",
        confidence: "LOW",
        candidates: SITE_TARGET_CANDIDATES,
        needsSignal: false,
        note: "Signal explicite applique pour distinguer SITE_BUSINESS du cluster VITRINE/BLOG.",
      });
    }

    if (signal === "SITE_VITRINE") {
      return buildMappingResult({
        source: projectType,
        target: "SITE_VITRINE",
        status: "PROVISIONAL",
        confidence: "MEDIUM",
        candidates: SITE_TARGET_CANDIDATES,
        needsSignal: false,
        note: "SITE_VITRINE reste un regroupement provisoire en runtime (VITRINE/BLOG).",
      });
    }

    return buildMappingResult({
      source: projectType,
      target: null,
      status: "AMBIGUOUS",
      confidence: "LOW",
      candidates: SITE_TARGET_CANDIDATES,
      needsSignal: true,
      note: "Le runtime legacy ne separe pas nativement SITE_VITRINE et SITE_BUSINESS.",
    });
  }

  if (signal === "MVP_SAAS" || signal === "APP_METIER") {
    return buildMappingResult({
      source: projectType,
      target: signal,
      status: "APPROXIMATE",
      confidence: "LOW",
      candidates: APP_TARGET_CANDIDATES,
      needsSignal: false,
      note: "Signal explicite applique pour distinguer MVP_SAAS et APP_METIER.",
    });
  }

  return buildMappingResult({
    source: projectType,
    target: null,
    status: "AMBIGUOUS",
    confidence: "LOW",
    candidates: APP_TARGET_CANDIDATES,
    needsSignal: true,
    note: "Le runtime legacy APP fusionne MVP_SAAS et APP_METIER.",
  });
}

export function mapLegacyOfferCategoryToCanonicalTaxonomy(
  offerCategory: LegacyOfferCategory,
  signal?: TaxonomyDisambiguationSignal | null,
): TaxonomyMappingResult<LegacyOfferCategory, CanonicalProjectTaxonomy> {
  if (offerCategory === "ECOMMERCE") {
    return buildMappingResult({
      source: offerCategory,
      target: "ECOMMERCE",
      status: "EXACT",
      confidence: "HIGH",
      candidates: ["ECOMMERCE"],
      needsSignal: false,
      note: "Mapping exact: offre ECOMMERCE runtime legacy = ECOMMERCE canonique.",
    });
  }

  if (offerCategory === "VITRINE_BLOG") {
    if (signal === "SITE_BUSINESS") {
      return buildMappingResult({
        source: offerCategory,
        target: "SITE_BUSINESS",
        status: "APPROXIMATE",
        confidence: "LOW",
        candidates: SITE_TARGET_CANDIDATES,
        needsSignal: false,
        note: "VITRINE_BLOG necessite un signal pour distinguer SITE_BUSINESS.",
      });
    }

    if (signal === "SITE_VITRINE") {
      return buildMappingResult({
        source: offerCategory,
        target: "SITE_VITRINE",
        status: "PROVISIONAL",
        confidence: "MEDIUM",
        candidates: SITE_TARGET_CANDIDATES,
        needsSignal: false,
        note: "SITE_VITRINE reste un regroupement provisoire en offre VITRINE_BLOG.",
      });
    }

    return buildMappingResult({
      source: offerCategory,
      target: null,
      status: "AMBIGUOUS",
      confidence: "LOW",
      candidates: SITE_TARGET_CANDIDATES,
      needsSignal: true,
      note: "VITRINE_BLOG couvre SITE_VITRINE et SITE_BUSINESS en mode transitoire.",
    });
  }

  if (signal === "MVP_SAAS" || signal === "APP_METIER") {
    return buildMappingResult({
      source: offerCategory,
      target: signal,
      status: "APPROXIMATE",
      confidence: "LOW",
      candidates: APP_TARGET_CANDIDATES,
      needsSignal: false,
      note: "APP_CUSTOM necessite un signal pour distinguer MVP_SAAS et APP_METIER.",
    });
  }

  return buildMappingResult({
    source: offerCategory,
    target: null,
    status: "AMBIGUOUS",
    confidence: "LOW",
    candidates: APP_TARGET_CANDIDATES,
    needsSignal: true,
    note: "APP_CUSTOM fusionne MVP_SAAS et APP_METIER au runtime.",
  });
}

export function mapCanonicalTaxonomyToLegacyProjectType(
  taxonomy: CanonicalProjectTaxonomy,
): TaxonomyMappingResult<CanonicalProjectTaxonomy, LegacyProjectType> {
  if (taxonomy === "ECOMMERCE") {
    return buildMappingResult({
      source: taxonomy,
      target: "ECOM",
      status: "EXACT",
      confidence: "HIGH",
      candidates: ["ECOM"],
      needsSignal: false,
      note: "Mapping exact vers le runtime legacy ECOM.",
    });
  }

  if (taxonomy === "SITE_VITRINE") {
    return buildMappingResult({
      source: taxonomy,
      target: "VITRINE",
      status: "PROVISIONAL",
      confidence: "MEDIUM",
      candidates: SITE_PROJECT_TYPE_CANDIDATES,
      needsSignal: false,
      note: "SITE_VITRINE est transitoirement regroupe dans le cluster legacy VITRINE/BLOG/STARTER.",
    });
  }

  if (taxonomy === "SITE_BUSINESS") {
    return buildMappingResult({
      source: taxonomy,
      target: "VITRINE",
      status: "APPROXIMATE",
      confidence: "LOW",
      candidates: SITE_BUSINESS_PROJECT_TYPE_CANDIDATES,
      needsSignal: false,
      note: "SITE_BUSINESS n'a pas encore d'enum runtime dediee.",
    });
  }

  return buildMappingResult({
    source: taxonomy,
    target: "APP",
    status: "APPROXIMATE",
    confidence: "LOW",
    candidates: ["APP"],
    needsSignal: false,
    note: "MVP_SAAS et APP_METIER convergent en runtime legacy APP.",
  });
}

export function mapCanonicalTaxonomyToLegacyOfferCategory(
  taxonomy: CanonicalProjectTaxonomy,
): TaxonomyMappingResult<CanonicalProjectTaxonomy, LegacyOfferCategory> {
  if (taxonomy === "ECOMMERCE") {
    return buildMappingResult({
      source: taxonomy,
      target: "ECOMMERCE",
      status: "EXACT",
      confidence: "HIGH",
      candidates: ["ECOMMERCE"],
      needsSignal: false,
      note: "Mapping exact vers l'offre runtime ECOMMERCE.",
    });
  }

  if (taxonomy === "SITE_VITRINE") {
    return buildMappingResult({
      source: taxonomy,
      target: "VITRINE_BLOG",
      status: "PROVISIONAL",
      confidence: "MEDIUM",
      candidates: ["VITRINE_BLOG"],
      needsSignal: false,
      note: "SITE_VITRINE est provisoirement regroupe avec SITE_BUSINESS dans VITRINE_BLOG.",
    });
  }

  if (taxonomy === "SITE_BUSINESS") {
    return buildMappingResult({
      source: taxonomy,
      target: "VITRINE_BLOG",
      status: "APPROXIMATE",
      confidence: "LOW",
      candidates: ["VITRINE_BLOG"],
      needsSignal: false,
      note: "SITE_BUSINESS est une approximation transitoire dans VITRINE_BLOG.",
    });
  }

  return buildMappingResult({
    source: taxonomy,
    target: "APP_CUSTOM",
    status: "APPROXIMATE",
    confidence: "LOW",
    candidates: ["APP_CUSTOM"],
    needsSignal: false,
    note: "MVP_SAAS et APP_METIER convergent vers APP_CUSTOM au runtime.",
  });
}

export function mapLegacyProjectTypeToOfferCategory(
  projectType: LegacyProjectType,
): TaxonomyMappingResult<LegacyProjectType, LegacyOfferCategory> {
  if (projectType === "ECOM") {
    return buildMappingResult({
      source: projectType,
      target: "ECOMMERCE",
      status: "EXACT",
      confidence: "HIGH",
      candidates: ["ECOMMERCE"],
      needsSignal: false,
      note: "ECOM runtime legacy garde l'offre ECOMMERCE.",
    });
  }

  if (projectType === "APP") {
    return buildMappingResult({
      source: projectType,
      target: "APP_CUSTOM",
      status: "EXACT",
      confidence: "HIGH",
      candidates: ["APP_CUSTOM"],
      needsSignal: false,
      note: "APP runtime legacy garde l'offre APP_CUSTOM.",
    });
  }

  return buildMappingResult({
    source: projectType,
    target: "VITRINE_BLOG",
    status: "PROVISIONAL",
    confidence: "MEDIUM",
    candidates: ["VITRINE_BLOG"],
    needsSignal: false,
    note: "STARTER/BLOG/VITRINE convergent en offre runtime VITRINE_BLOG.",
  });
}

export function mapLegacyOfferCategoryToProjectType(
  offerCategory: LegacyOfferCategory,
): TaxonomyMappingResult<LegacyOfferCategory, ReferentialProjectType> {
  if (offerCategory === "ECOMMERCE") {
    return buildMappingResult({
      source: offerCategory,
      target: "ECOM",
      status: "EXACT",
      confidence: "HIGH",
      candidates: ["ECOM"],
      needsSignal: false,
      note: "L'offre ECOMMERCE mappe exactement vers ECOM runtime.",
    });
  }

  if (offerCategory === "APP_CUSTOM") {
    return buildMappingResult({
      source: offerCategory,
      target: "APP",
      status: "EXACT",
      confidence: "HIGH",
      candidates: ["APP"],
      needsSignal: false,
      note: "L'offre APP_CUSTOM mappe vers APP runtime.",
    });
  }

  return buildMappingResult({
    source: offerCategory,
    target: "VITRINE",
    status: "PROVISIONAL",
    confidence: "MEDIUM",
    candidates: ["VITRINE", "BLOG"],
    needsSignal: false,
    note: "VITRINE_BLOG est transitoirement resolu sur VITRINE pour la qualification legacy.",
  });
}

export function resolveLegacyOfferCategoryFromProjectType(
  projectType: LegacyProjectType | null,
): LegacyOfferCategory | null {
  if (!projectType) return null;
  return mapLegacyProjectTypeToOfferCategory(projectType).target;
}

export function resolveLegacyProjectTypeFromOfferCategory(
  offerCategory: LegacyOfferCategory,
): ReferentialProjectType {
  const resolved = mapLegacyOfferCategoryToProjectType(offerCategory).target;
  if (!resolved) {
    // Defensive fallback: keep historical behavior.
    return "VITRINE";
  }
  return resolved;
}

export function isExactTaxonomyMapping<TSource, TTarget>(
  result: TaxonomyMappingResult<TSource, TTarget>,
): boolean {
  return result.status === "EXACT";
}

export function isApproximateTaxonomyMapping<TSource, TTarget>(
  result: TaxonomyMappingResult<TSource, TTarget>,
): boolean {
  return result.status === "APPROXIMATE";
}

export function isAmbiguousTaxonomyMapping<TSource, TTarget>(
  result: TaxonomyMappingResult<TSource, TTarget>,
): boolean {
  return result.status === "AMBIGUOUS";
}

export function isProvisionalTaxonomyMapping<TSource, TTarget>(
  result: TaxonomyMappingResult<TSource, TTarget>,
): boolean {
  return result.status === "PROVISIONAL";
}
