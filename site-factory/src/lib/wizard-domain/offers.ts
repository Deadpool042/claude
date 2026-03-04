//src/lib/wizard-domain/offers.ts
import type { ProjectType } from "@/lib/referential";
import type { OfferCategory } from "@/lib/offers";
import type { ProjectFamilyInput } from "@/lib/validators";
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
  if (input.projectFamily !== "STATIC_SSG" && input.projectFamily !== "CMS_MONO") return false;
  if (input.trafficLevel !== "LOW") return false;
  if (input.productCount !== "NONE") return false;
  if (input.dataSensitivity !== "STANDARD") return false;
  if (input.scalabilityLevel !== "FIXED") return false;
  if (input.needsEditing && input.editingFrequency !== "RARE") return false;
  return true;
}

export function deriveOfferProjectType(
  input: OfferResolutionInput,
): OfferCategory | null {
  if (!input.projectType) return null;
  if (input.projectType === "BLOG" || input.projectType === "VITRINE") return "VITRINE_BLOG";
  if (input.projectType === "ECOM") return "ECOMMERCE";
  return "APP_CUSTOM";
}

export function deriveQualificationProjectType(
  input: OfferResolutionInput,
): ProjectType | null {
  // Placeholder until the new qualification flow lands: keep the original project type.
  return input.projectType;
}
