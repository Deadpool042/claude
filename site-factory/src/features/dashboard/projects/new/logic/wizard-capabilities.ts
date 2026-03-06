export type WizardItemStatus = "enabled" | "disabled" | "configured";

export type WizardModuleKey =
  | "BOOKING"
  | "NEWSLETTER"
  | "FORMS"
  | "ANALYTICS"
  | "REVIEWS"
  | "PAYMENTS";

export type WizardFeatureKey = string;
export type WizardProviderKey = string;
export type WizardProviderKind = WizardModuleKey | "GENERIC";

export type WizardModuleConfig = Record<string, unknown>;
export type WizardFeatureConfig = Record<string, unknown>;
export type WizardProviderConfig = Record<string, unknown>;

export interface WizardModuleDefinition {
  key: WizardModuleKey;
  label: string;
  description: string;
}

export const WIZARD_MODULES: WizardModuleDefinition[] = [
  {
    key: "BOOKING",
    label: "Booking",
    description: "Reservations, appointments, or events with external providers.",
  },
  {
    key: "NEWSLETTER",
    label: "Newsletter",
    description: "Email capture, segmentation, and automation sync.",
  },
  {
    key: "FORMS",
    label: "Forms",
    description: "Contact and lead capture workflows.",
  },
  {
    key: "ANALYTICS",
    label: "Analytics",
    description: "Tracking, dashboards, and KPI visibility.",
  },
  {
    key: "REVIEWS",
    label: "Reviews",
    description: "Customer reviews collection and display.",
  },
  {
    key: "PAYMENTS",
    label: "Payments",
    description: "Online payment processing and settlement.",
  },
];

export interface WizardModuleState {
  status: WizardItemStatus;
  config: WizardModuleConfig;
  featureIds: WizardFeatureKey[];
  providerIds: WizardProviderKey[];
}

export interface WizardFeatureState {
  status: WizardItemStatus;
  config: WizardFeatureConfig;
  moduleKeys: WizardModuleKey[];
  providerIds: WizardProviderKey[];
}

export interface WizardProviderState {
  status: WizardItemStatus;
  kind: WizardProviderKind;
  config: WizardProviderConfig;
  moduleKeys: WizardModuleKey[];
  featureIds: WizardFeatureKey[];
}

export type WizardModuleStates = Record<WizardModuleKey, WizardModuleState>;
export type WizardFeatureStates = Record<WizardFeatureKey, WizardFeatureState>;
export type WizardProviderStates = Record<WizardProviderKey, WizardProviderState>;

const DEFAULT_MODULE_STATE: WizardModuleState = {
  status: "disabled",
  config: {},
  featureIds: [],
  providerIds: [],
};

const DEFAULT_FEATURE_STATE: WizardFeatureState = {
  status: "disabled",
  config: {},
  moduleKeys: [],
  providerIds: [],
};

const DEFAULT_PROVIDER_STATE: WizardProviderState = {
  status: "disabled",
  kind: "GENERIC",
  config: {},
  moduleKeys: [],
  featureIds: [],
};

export function getDefaultWizardModuleState(): WizardModuleState {
  return { ...DEFAULT_MODULE_STATE };
}

export function getDefaultWizardFeatureState(): WizardFeatureState {
  return { ...DEFAULT_FEATURE_STATE };
}

export function getDefaultWizardProviderState(
  kind: WizardProviderKind = "GENERIC",
): WizardProviderState {
  return { ...DEFAULT_PROVIDER_STATE, kind };
}

export function createWizardModuleStates(): WizardModuleStates {
  return WIZARD_MODULES.reduce((acc, moduleDef) => {
    acc[moduleDef.key] = getDefaultWizardModuleState();
    return acc;
  }, {} as WizardModuleStates);
}

export function createWizardFeatureStates(): WizardFeatureStates {
  return {};
}

export function createWizardProviderStates(): WizardProviderStates {
  return {};
}
