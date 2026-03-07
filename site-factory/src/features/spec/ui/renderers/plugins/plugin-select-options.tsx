"use client";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { SelectOption } from "@/shared/components/FieldSelect";
import {
  PRICING_MODES,
  PRICING_COLORS,
  BILLING_CYCLES,
  BILLING_CYCLE_LABELS,
  AMORTIZATION_MODES,
  AMORTIZATION_LABELS,
} from "../../../logic/spec-constants";
import { LABELS } from "../../../logic/spec-labels";

export const PRICING_MODE_OPTIONS: SelectOption[] = PRICING_MODES.map((mode) => ({
  value: mode,
  label:
    mode === "FREE"
      ? LABELS.plugins.free
      : mode === "PAID"
        ? LABELS.plugins.paid
        : LABELS.plugins.mixed,
  render: () => (
    <>
      <Badge variant="outline" className={cn("mr-1 text-[10px]", PRICING_COLORS[mode])}>
        {mode}
      </Badge>
      {mode === "FREE"
        ? LABELS.plugins.free
        : mode === "PAID"
          ? LABELS.plugins.paid
          : LABELS.plugins.mixed}
    </>
  ),
}));

export const BILLING_CYCLE_OPTIONS: SelectOption[] = BILLING_CYCLES.map((cycle) => ({
  value: cycle,
  label: BILLING_CYCLE_LABELS[cycle],
}));

export const AMORTIZATION_OPTIONS: SelectOption[] = AMORTIZATION_MODES.map((mode) => ({
  value: mode,
  label: AMORTIZATION_LABELS[mode],
}));

export const MODE_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", label: LABELS.allModes },
  ...PRICING_MODES.map((mode) => ({ value: mode, label: mode })),
];
