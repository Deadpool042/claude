export type FormFieldKind =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "checkbox"
  | "readonly"
  | "tagList";

export type FeatureFormFieldKey =
  | "label"
  | "description"
  | "domain"
  | "type"
  | "uiOnly"
  | "dependencies"
  | "tags"
  | "id";

export const FEATURE_FORM_CONFIG = {
  resource: "features",
  idKey: "id",
  fields: {
    label: { kind: "text", required: true },
    description: { kind: "textarea", required: true },
    domain: { kind: "select", required: true },
    type: { kind: "select", required: true },
    uiOnly: { kind: "checkbox", required: true },
    dependencies: { kind: "tagList", required: false },
    tags: { kind: "tagList", required: false },
    id: { kind: "readonly", required: true },
  } satisfies Record<FeatureFormFieldKey, { kind: FormFieldKind; required: boolean }>,
} as const;

export type ModuleFormFieldKey =
  | "label"
  | "description"
  | "group"
  | "targetCategory"
  | "minCategory"
  | "requalifiesTo"
  | "details"
  | "featureIds"
  | "pricingMode"
  | "priceSetupMin"
  | "priceSetupMax"
  | "priceMonthlyMin"
  | "priceMonthlyMax"
  | "jsMultiplier"
  | "splitPrestataireSetup"
  | "splitPrestataireMonthly"
  | "isStructurant"
  | "id";

export const MODULE_FORM_CONFIG = {
  resource: "modules",
  idKey: "id",
  fields: {
    label: { kind: "text", required: true },
    description: { kind: "textarea", required: true },
    group: { kind: "select", required: true },
    targetCategory: { kind: "select", required: true },
    minCategory: { kind: "select", required: true },
    requalifiesTo: { kind: "select", required: true },
    details: { kind: "tagList", required: true },
    featureIds: { kind: "tagList", required: true },
    pricingMode: { kind: "select", required: true },
    priceSetupMin: { kind: "number", required: true },
    priceSetupMax: { kind: "number", required: true },
    priceMonthlyMin: { kind: "number", required: true },
    priceMonthlyMax: { kind: "number", required: true },
    jsMultiplier: { kind: "number", required: true },
    splitPrestataireSetup: { kind: "number", required: true },
    splitPrestataireMonthly: { kind: "number", required: true },
    isStructurant: { kind: "checkbox", required: true },
    id: { kind: "readonly", required: true },
  } satisfies Record<ModuleFormFieldKey, { kind: FormFieldKind; required: boolean }>,
} as const;
