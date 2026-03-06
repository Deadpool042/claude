//src/lib/wizard-domain/offers.ts
import type { ProjectType } from "@/lib/referential";
import type { OfferCategory } from "@/lib/offers";
import type { ProjectFamilyInput } from "@/lib/validators";
import {
  mapCanonicalTaxonomyToLegacyOfferCategory,
  mapCanonicalTaxonomyToLegacyProjectType,
  mapLegacyProjectTypeToCanonicalTaxonomy,
  normalizeTaxonomySignalForProjectType,
  resolveLegacyOfferCategoryFromProjectType,
  type CanonicalProjectTaxonomy,
  type TaxonomyDisambiguationSignal,
} from "@/lib/taxonomy";
import type {
  DataSensitivity,
  EditingFrequency,
  ProductBucket,
  ScalabilityLevel,
  TrafficLevel,
} from "@/lib/referential";

export interface OfferResolutionInput {
  projectType: ProjectType | null;
  projectFamily: ProjectFamilyInput | null;
  needsEditing: boolean;
  editingFrequency: EditingFrequency;
  trafficLevel: TrafficLevel;
  productCount: ProductBucket;
  dataSensitivity: DataSensitivity;
  scalabilityLevel: ScalabilityLevel;
  selectedModulesCount: number;
  taxonomySignal?: TaxonomyDisambiguationSignal | null;
}

export function isStarterEligible(input: OfferResolutionInput): boolean {
  if (!input.projectType) return false;
  if (input.projectType !== "BLOG" && input.projectType !== "VITRINE") return false;
  if (input.selectedModulesCount > 0) return false;
  if (input.projectFamily !== "STATIC_SSG" && input.projectFamily !== "CMS_MONO") return false;
  if (input.trafficLevel !== "LOW") return false;
  if (input.productCount !== "NONE") return false;
  if (input.dataSensitivity !== "STANDARD") return false;
  if (input.scalabilityLevel !== "FIXED") return false;
  if (input.needsEditing && input.editingFrequency !== "RARE") return false;
  return true;
}

export type CanonicalTaxonomyResolution = ReturnType<
  typeof mapLegacyProjectTypeToCanonicalTaxonomy
>;

export function resolveCanonicalTaxonomyFromOfferInput(
  input: OfferResolutionInput,
): CanonicalTaxonomyResolution | null {
  if (!input.projectType) return null;

  const normalizedSignal = normalizeTaxonomySignalForProjectType(
    input.projectType,
    input.taxonomySignal ?? null,
  );
  const mapping = mapLegacyProjectTypeToCanonicalTaxonomy(
    input.projectType,
    normalizedSignal,
  );
  return mapping;
}

function mapCanonicalToQualificationProjectType(
  taxonomy: CanonicalProjectTaxonomy,
): ProjectType | null {
  const mapped = mapCanonicalTaxonomyToLegacyProjectType(taxonomy).target;
  if (mapped === "BLOG" || mapped === "VITRINE" || mapped === "ECOM" || mapped === "APP") {
    return mapped;
  }
  return null;
}

export function deriveOfferProjectType(
  input: OfferResolutionInput,
): OfferCategory | null {
  if (!input.projectType) return null;
  const canonicalResolution = resolveCanonicalTaxonomyFromOfferInput(input);
  if (canonicalResolution?.target) {
    const mappedOffer = mapCanonicalTaxonomyToLegacyOfferCategory(
      canonicalResolution.target,
    ).target;
    if (mappedOffer) {
      return mappedOffer;
    }
  }
  return resolveLegacyOfferCategoryFromProjectType(input.projectType);
}

export function deriveQualificationProjectType(
  input: OfferResolutionInput,
): ProjectType | null {
  if (!input.projectType) return null;
  const canonicalResolution = resolveCanonicalTaxonomyFromOfferInput(input);
  if (canonicalResolution?.target) {
    const mappedType = mapCanonicalToQualificationProjectType(
      canonicalResolution.target,
    );
    if (mappedType) {
      return mappedType;
    }
  }
  return input.projectType;
}
