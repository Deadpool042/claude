export const BOOKING_MODULE_ID = "module.BOOKING" as const;
export const BOOKING_MODULE_KEY = "BOOKING" as const;

export const BOOKING_TYPES = ["APPOINTMENT", "TABLE", "EVENT"] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

export const BOOKING_PROVIDERS = ["CALENDLY", "SIMPLEBOOK", "AMELIA", "CUSTOM"] as const;
export type BookingProvider = (typeof BOOKING_PROVIDERS)[number];

export const BOOKING_IMPLEMENTATION_STRATEGIES = ["EXTERNAL_WIDGET"] as const;
export type BookingImplementationStrategy =
  (typeof BOOKING_IMPLEMENTATION_STRATEGIES)[number];

export type BookingConfig = {
  type: BookingType | null;
  provider: BookingProvider | null;
  implementationStrategy: BookingImplementationStrategy;
};

export const DEFAULT_BOOKING_CONFIG: BookingConfig = {
  type: null,
  provider: "CALENDLY",
  implementationStrategy: "EXTERNAL_WIDGET",
};

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  APPOINTMENT: "Rendez-vous",
  TABLE: "Table",
  EVENT: "Evenement",
};

export const BOOKING_PROVIDER_LABELS: Record<BookingProvider, string> = {
  CALENDLY: "Calendly",
  SIMPLEBOOK: "SimplyBook",
  AMELIA: "Amelia",
  CUSTOM: "Custom",
};

export const BOOKING_STRATEGY_LABELS: Record<BookingImplementationStrategy, string> = {
  EXTERNAL_WIDGET: "Widget externe",
};

export function normalizeBookingConfig(input: unknown): BookingConfig {
  if (!input || typeof input !== "object") {
    return { ...DEFAULT_BOOKING_CONFIG };
  }

  const raw = input as Partial<BookingConfig>;
  const type = BOOKING_TYPES.includes(raw.type as BookingType)
    ? (raw.type as BookingType)
    : null;
  const provider = BOOKING_PROVIDERS.includes(raw.provider as BookingProvider)
    ? (raw.provider as BookingProvider)
    : DEFAULT_BOOKING_CONFIG.provider;
  const implementationStrategy = BOOKING_IMPLEMENTATION_STRATEGIES.includes(
    raw.implementationStrategy as BookingImplementationStrategy,
  )
    ? (raw.implementationStrategy as BookingImplementationStrategy)
    : DEFAULT_BOOKING_CONFIG.implementationStrategy;

  return {
    type,
    provider,
    implementationStrategy,
  };
}

export function getBookingConfigIssues(config: BookingConfig): string[] {
  const issues: string[] = [];
  if (!config.type) {
    issues.push("Selectionnez un type de reservation.");
  }
  if (!config.provider) {
    issues.push("Selectionnez un provider.");
  }
  return issues;
}

export function isBookingConfigComplete(config: BookingConfig): boolean {
  return getBookingConfigIssues(config).length === 0;
}
