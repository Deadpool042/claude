import type { ProjectType } from "@/lib/qualification";
import type { ProjectType as OfferProjectType } from "@/lib/offers/offers";
import type { ProjectFamilyInput } from "@/lib/validators/project";
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
}

export function isStarterEligible(input: OfferResolutionInput): boolean {
  if (!input.projectType) return false;
  if (input.projectType !== "BLOG" && input.projectType !== "VITRINE") return false;
  if (input.selectedModulesCount > 0) return false;
  if (input.projectFamily !== "STATIC_SSG") return false;
  if (input.trafficLevel !== "LOW") return false;
  if (input.productCount !== "NONE") return false;
  if (input.dataSensitivity !== "STANDARD") return false;
  if (input.scalabilityLevel !== "FIXED") return false;
  if (input.needsEditing && input.editingFrequency !== "RARE") return false;
  return true;
}

export function deriveQualificationProjectType(
  input: OfferResolutionInput,
): ProjectType | null {
  if (!input.projectType) return null;
  if (isStarterEligible(input)) return "STARTER";
  return input.projectType;
}

export function deriveOfferProjectType(
  input: OfferResolutionInput,
): OfferProjectType | null {
  const effectiveType = deriveQualificationProjectType(input);
  if (!effectiveType) return null;
  if (effectiveType === "STARTER") return "STARTER";
  if (effectiveType === "BLOG" || effectiveType === "VITRINE") return "VITRINE_BLOG";
  if (effectiveType === "ECOM") return "ECOMMERCE";
  return "APP_CUSTOM";
}
