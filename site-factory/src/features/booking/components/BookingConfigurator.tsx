"use client";

import { Calendar } from "lucide-react";
import { StepCard } from "@/shared/components/StepCard";
import { InlineHint } from "@/shared/components/InlineHint";
import { Switch } from "@/shared/components/ui/switch";
import { FieldSelect } from "@/shared/components/FieldSelect";
import { useBookingModule } from "../hooks/use-booking-module";
import {
  BOOKING_PROVIDERS,
  BOOKING_PROVIDER_LABELS,
  BOOKING_STRATEGY_LABELS,
  BOOKING_TYPES,
  BOOKING_TYPE_LABELS,
  type BookingProvider,
  type BookingType,
} from "../lib/booking-config";

export function BookingConfigurator() {
  const { isEnabled, setEnabled, config, setConfig, issues } = useBookingModule();

  const typeOptions = BOOKING_TYPES.map((type) => ({
    value: type,
    label: BOOKING_TYPE_LABELS[type],
  }));

  const providerOptions = BOOKING_PROVIDERS.map((provider) => ({
    value: provider,
    label: BOOKING_PROVIDER_LABELS[provider],
  }));

  return (
    <StepCard
      title="Booking"
      icon={Calendar}
      description="Configuration du module Booking (MVP)."
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Activer le module</p>
          <p className="text-xs text-muted-foreground">
            Reservations, rendez-vous, tables ou evenements.
          </p>
        </div>
        <Switch checked={isEnabled} onCheckedChange={setEnabled} />
      </div>

      {!isEnabled ? (
        <InlineHint>Activez Booking pour choisir un type et un provider.</InlineHint>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldSelect
              label="Type"
              placeholder="Choisir un type"
              value={config.type ?? ""}
              onChange={(value) => setConfig({ type: value as BookingType })}
              options={typeOptions}
            />
            <FieldSelect
              label="Provider"
              placeholder="Choisir un provider"
              value={config.provider ?? ""}
              onChange={(value) => setConfig({ provider: value as BookingProvider })}
              options={providerOptions}
              helpText="Par defaut: Calendly."
            />
          </div>

          <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Strategie: {BOOKING_STRATEGY_LABELS.EXTERNAL_WIDGET} (EXTERNAL_WIDGET).
          </div>

          {issues.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {issues.join(" ")}
            </div>
          )}
        </>
      )}
    </StepCard>
  );
}
