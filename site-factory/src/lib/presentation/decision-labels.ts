import type {
  CanonicalDecisionOutput,
  CommercialProfile,
  DeliveryModel,
  ImplementationStrategy,
  MutualizationLevel,
  SolutionFamily,
  TechnicalProfile,
} from "@/lib/referential";

export const SOLUTION_FAMILY_LABELS: Record<SolutionFamily, string> = {
  SHOWCASE_SITE: "Site vitrine",
  BUSINESS_SITE: "Site business",
  CONTENT_PLATFORM: "Plateforme de contenu",
  ECOMMERCE: "E-commerce",
  MEMBER_PORTAL: "Portail membre",
  BOOKING_PLATFORM: "Plateforme de réservation",
  BUSINESS_APP: "Application métier",
  OPERATED_PRODUCT: "Produit opéré",
};

export const DELIVERY_MODEL_LABELS: Record<DeliveryModel, string> = {
  DELIVERED_CUSTOM: "Custom livré",
  MANAGED_CUSTOM: "Custom managé",
  MANAGED_STANDARDIZED: "Offre managée standardisée",
  OPERATED_PRODUCT: "Produit opéré",
};

export const MUTUALIZATION_LEVEL_LABELS: Record<MutualizationLevel, string> = {
  DEDICATED: "Dédié",
  SHARED_SOCLE: "Socle partagé",
  MUTUALIZED_SINGLE_TENANT: "Mutualisé single-tenant",
  MUTUALIZED_MULTI_TENANT: "Mutualisé multi-tenant",
};

export const IMPLEMENTATION_STRATEGY_LABELS: Record<
  ImplementationStrategy,
  string
> = {
  CMS_CONFIGURED: "CMS configuré",
  CMS_EXTENDED: "CMS étendu",
  HEADLESS_CONTENT_SITE: "Site de contenu headless",
  CUSTOM_WEB_APP: "Application web custom",
  OPERATED_TEMPLATE_PRODUCT: "Produit opéré à base template",
  HYBRID_STACK: "Stack hybride",
};

export const TECHNICAL_PROFILE_LABELS: Record<TechnicalProfile, string> = {
  WP_EDITORIAL_STANDARD: "WordPress éditorial standard",
  WP_BUSINESS_EXTENDED: "WordPress business étendu",
  WOOCOMMERCE_STANDARD: "WooCommerce standard",
  HEADLESS_WP: "WordPress headless",
  NEXT_MDX_EDITORIAL: "Next.js + MDX éditorial",
  JAMSTACK_CONTENT_SITE: "Site de contenu Jamstack",
  CUSTOM_APP_MANAGED: "Application custom managée",
  OPERATED_CONTENT_PRODUCT: "Produit de contenu opéré",
};

export const COMMERCIAL_PROFILE_LABELS: Record<CommercialProfile, string> = {
  ONE_SHOT_DELIVERY: "Livraison one-shot",
  SETUP_PLUS_MANAGED_RETAINER: "Setup + récurrent managé",
  STANDARDIZED_MONTHLY_PLAN: "Forfait mensuel standardisé",
  OPERATED_SUBSCRIPTION: "Abonnement opéré",
};

export function getSolutionFamilyLabel(value: SolutionFamily): string {
  return SOLUTION_FAMILY_LABELS[value];
}

export function getDeliveryModelLabel(value: DeliveryModel): string {
  return DELIVERY_MODEL_LABELS[value];
}

export function getMutualizationLevelLabel(
  value: MutualizationLevel,
): string {
  return MUTUALIZATION_LEVEL_LABELS[value];
}

export function getImplementationStrategyLabel(
  value: ImplementationStrategy,
): string {
  return IMPLEMENTATION_STRATEGY_LABELS[value];
}

export function getTechnicalProfileLabel(value: TechnicalProfile): string {
  return TECHNICAL_PROFILE_LABELS[value];
}

export function getCommercialProfileLabel(value: CommercialProfile): string {
  return COMMERCIAL_PROFILE_LABELS[value];
}

export interface DecisionDisplayItem {
  label: string;
  value: string;
}

export function getDecisionDisplayItems(
  decision: CanonicalDecisionOutput,
): DecisionDisplayItem[] {
  return [
    {
      label: "Famille de solution",
      value: getSolutionFamilyLabel(decision.solutionFamily),
    },
    {
      label: "Delivery model",
      value: getDeliveryModelLabel(decision.deliveryModel),
    },
    {
      label: "Mutualisation",
      value: getMutualizationLevelLabel(decision.mutualizationLevel),
    },
    {
      label: "Stratégie d’implémentation",
      value: getImplementationStrategyLabel(decision.implementationStrategy),
    },
    {
      label: "Profil technique",
      value: getTechnicalProfileLabel(decision.technicalProfile),
    },
    {
      label: "Profil commercial",
      value: getCommercialProfileLabel(decision.commercialProfile),
    },
  ];
}