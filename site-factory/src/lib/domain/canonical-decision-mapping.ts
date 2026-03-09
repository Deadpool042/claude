import type {
  CanonicalDecisionOutput,
  Category,
  CommercialProfile,
  DeliveryModel,
  ImplementationStrategy,
  MutualizationLevel,
  SolutionFamily,
  TechnicalProfile
} from "@/lib/referential";
import type { CanonicalProjectInputDraft } from "./canonical-input";

export function mapSolutionFamilyFromCanonical(
  canonicalInput: CanonicalProjectInputDraft
): SolutionFamily {
  switch (canonicalInput.businessIntent.needKind) {
    case "CONTENT":
      return "CONTENT_PLATFORM";
    case "BUSINESS_PRESENCE":
      return "BUSINESS_SITE";
    case "COMMERCE":
      return "ECOMMERCE";
    case "BUSINESS_TOOL":
      return "BUSINESS_APP";
    default: {
      const _never: never = canonicalInput.businessIntent.needKind;
      return _never;
    }
  }
}

export function mapDeliveryModelFromCanonical(
  canonicalInput: CanonicalProjectInputDraft
): DeliveryModel {
  if (canonicalInput.operatingModel.operatingIntent === "MANAGED_FOR_CLIENT") {
    return "MANAGED_CUSTOM";
  }

  return "DELIVERED_CUSTOM";
}

export function mapMutualizationLevelFromCanonical(
  canonicalInput: CanonicalProjectInputDraft,
  finalCategory: Category
): MutualizationLevel {
  if (canonicalInput.operatingModel.operatingIntent === "MANAGED_FOR_CLIENT") {
    return "SHARED_SOCLE";
  }

  if (
    canonicalInput.operatingModel.standardizationIntent ===
      "STANDARDIZATION_POSSIBLE" &&
    finalCategory !== "CAT4"
  ) {
    return "SHARED_SOCLE";
  }

  return "DEDICATED";
}

export function mapImplementationStrategyFromCanonical(
  canonicalInput: CanonicalProjectInputDraft
): ImplementationStrategy {
  if (canonicalInput.businessIntent.needKind === "BUSINESS_TOOL") {
    return "CUSTOM_WEB_APP";
  }

  if (
    canonicalInput.technicalContext.legacyTechStack === "WORDPRESS" &&
    canonicalInput.technicalContext.wpHeadless
  ) {
    return "HEADLESS_CONTENT_SITE";
  }

  if (
    canonicalInput.businessIntent.needKind === "COMMERCE" &&
    canonicalInput.technicalContext.legacyTechStack === "WORDPRESS"
  ) {
    return "CMS_EXTENDED";
  }

  if (canonicalInput.technicalContext.legacyTechStack === "WORDPRESS") {
    return "CMS_CONFIGURED";
  }

  if (
    canonicalInput.technicalContext.legacyTechStack === "NEXTJS" ||
    canonicalInput.technicalContext.legacyTechStack === "ASTRO" ||
    canonicalInput.technicalContext.legacyTechStack === "NUXT"
  ) {
    return "HEADLESS_CONTENT_SITE";
  }

  return "HYBRID_STACK";
}

export function mapTechnicalProfileFromCanonical(
  canonicalInput: CanonicalProjectInputDraft
): TechnicalProfile {
  if (canonicalInput.businessIntent.needKind === "BUSINESS_TOOL") {
    return "CUSTOM_APP_MANAGED";
  }

  if (
    canonicalInput.businessIntent.needKind === "COMMERCE" &&
    canonicalInput.technicalContext.legacyTechStack === "WORDPRESS" &&
    !canonicalInput.technicalContext.wpHeadless
  ) {
    return "WOOCOMMERCE_STANDARD";
  }

  if (
    canonicalInput.technicalContext.legacyTechStack === "WORDPRESS" &&
    canonicalInput.technicalContext.wpHeadless
  ) {
    return "HEADLESS_WP";
  }

  if (canonicalInput.technicalContext.legacyTechStack === "WORDPRESS") {
    return canonicalInput.businessIntent.needKind === "BUSINESS_PRESENCE"
      ? "WP_BUSINESS_EXTENDED"
      : "WP_EDITORIAL_STANDARD";
  }

  if (canonicalInput.technicalContext.legacyTechStack === "NEXTJS") {
    return "NEXT_MDX_EDITORIAL";
  }

  return "JAMSTACK_CONTENT_SITE";
}

export function mapCommercialProfileFromCanonical(
  canonicalInput: CanonicalProjectInputDraft,
  deliveryModel: DeliveryModel
): CommercialProfile {
  if (deliveryModel === "OPERATED_PRODUCT") {
    return "OPERATED_SUBSCRIPTION";
  }

  if (deliveryModel === "MANAGED_STANDARDIZED") {
    return "STANDARDIZED_MONTHLY_PLAN";
  }

  if (deliveryModel === "MANAGED_CUSTOM") {
    return "SETUP_PLUS_MANAGED_RETAINER";
  }

  return canonicalInput.technicalContext.billingMode === "SOUS_TRAITANT"
    ? "SETUP_PLUS_MANAGED_RETAINER"
    : "ONE_SHOT_DELIVERY";
}

export function buildCanonicalDecisionOutputFromDraft(args: {
  canonicalInput: CanonicalProjectInputDraft;
  finalCategory: Category;
}): CanonicalDecisionOutput {
  const { canonicalInput, finalCategory } = args;

  const solutionFamily = mapSolutionFamilyFromCanonical(canonicalInput);
  const deliveryModel = mapDeliveryModelFromCanonical(canonicalInput);
  const mutualizationLevel = mapMutualizationLevelFromCanonical(
    canonicalInput,
    finalCategory
  );
  const implementationStrategy =
    mapImplementationStrategyFromCanonical(canonicalInput);
  const technicalProfile = mapTechnicalProfileFromCanonical(canonicalInput);
  const commercialProfile = mapCommercialProfileFromCanonical(
    canonicalInput,
    deliveryModel
  );

  const notes: string[] = [];

  if (
    canonicalInput.technicalContext.legacyTechStack === "WORDPRESS" &&
    canonicalInput.technicalContext.wpHeadless
  ) {
    notes.push(
      "Legacy mapping: WordPress headless currently biases the decision toward HEADLESS_CONTENT_SITE."
    );
  }

  if (canonicalInput.technicalContext.billingMode === "SOUS_TRAITANT") {
    notes.push(
      "Legacy mapping: billing mode SOUS_TRAITANT currently biases the decision toward MANAGED_CUSTOM."
    );
  }

  if (canonicalInput.identity.legacyProjectType === "APP") {
    notes.push(
      "Legacy mapping: projectType APP currently biases the decision toward CUSTOM_WEB_APP."
    );
  }

  return {
    solutionFamily,
    deliveryModel,
    mutualizationLevel,
    implementationStrategy,
    technicalProfile,
    commercialProfile,
    notes,
    legacyMapping: {
      projectType: canonicalInput.identity.legacyProjectType,
      finalCategory,
      techStack: canonicalInput.technicalContext.legacyTechStack,
      deployTarget: canonicalInput.technicalContext.deployTarget,
      wpHeadless: canonicalInput.technicalContext.wpHeadless
    }
  };
}
