"use client";

import { useMemo } from "react";
import type { SelectOption } from "@/shared/components/form/FieldSelect";
import { buildSelectOptions } from "../lib/spec-form-helpers";

export function useSpecReferences(items: Array<{ id: string; label?: string; name?: string }>) {
  return useMemo<SelectOption[]>(
    () => buildSelectOptions(items),
    [items],
  );
}
