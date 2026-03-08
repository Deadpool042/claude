import type { Category } from "../maintenance-cat";
import type { DeployTarget } from "../deploy";
import type { LegacyTechStack } from "../stack-profiles";
import type { ProjectType } from "../project";

export type SolutionFamily =
  | "SHOWCASE_SITE"
  | "BUSINESS_SITE"
  | "CONTENT_PLATFORM"
  | "ECOMMERCE"
  | "MEMBER_PORTAL"
  | "BOOKING_PLATFORM"
  | "BUSINESS_APP"
  | "OPERATED_PRODUCT";

export type DeliveryModel =
  | "DELIVERED_CUSTOM"
  | "MANAGED_CUSTOM"
  | "MANAGED_STANDARDIZED"
  | "OPERATED_PRODUCT";

export type MutualizationLevel =
  | "DEDICATED"
  | "SHARED_SOCLE"
  | "MUTUALIZED_SINGLE_TENANT"
  | "MUTUALIZED_MULTI_TENANT";

export type ImplementationStrategy =
  | "CMS_CONFIGURED"
  | "CMS_EXTENDED"
  | "HEADLESS_CONTENT_SITE"
  | "CUSTOM_WEB_APP"
  | "OPERATED_TEMPLATE_PRODUCT"
  | "HYBRID_STACK";

export type TechnicalProfile =
  | "WP_EDITORIAL_STANDARD"
  | "WP_BUSINESS_EXTENDED"
  | "WOOCOMMERCE_STANDARD"
  | "HEADLESS_WP"
  | "NEXT_MDX_EDITORIAL"
  | "JAMSTACK_CONTENT_SITE"
  | "CUSTOM_APP_MANAGED"
  | "OPERATED_CONTENT_PRODUCT";

export type CommercialProfile =
  | "ONE_SHOT_DELIVERY"
  | "SETUP_PLUS_MANAGED_RETAINER"
  | "STANDARDIZED_MONTHLY_PLAN"
  | "OPERATED_SUBSCRIPTION";

export interface DecisionLegacyMapping {
  projectType: ProjectType;
  finalCategory: Category;
  techStack: LegacyTechStack;
  deployTarget: DeployTarget;
  wpHeadless: boolean;
}

export interface CanonicalDecisionOutput {
  solutionFamily: SolutionFamily;
  deliveryModel: DeliveryModel;
  mutualizationLevel: MutualizationLevel;
  implementationStrategy: ImplementationStrategy;
  technicalProfile: TechnicalProfile;
  commercialProfile: CommercialProfile;
  notes: string[];
  legacyMapping: DecisionLegacyMapping;
}