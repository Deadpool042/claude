"use client";

import { useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { SelectOption } from "@/shared/components/form/FieldSelect";
import {
  DOMAIN_COLORS,
  DOMAIN_LABELS,
  FEATURE_DOMAINS,
  FEATURE_TYPES,
  FEATURE_TYPE_LABELS,
} from "../logic/spec-constants";

export function useSpecFieldOptions() {
  const domainOptions = useMemo<SelectOption[]>(
    () =>
      FEATURE_DOMAINS.map((domain) => ({
        value: domain,
        label: domain,
        render: () => (
          <>
            <Badge variant="outline" className={cn("text-[10px] mr-1", DOMAIN_COLORS[domain])}>
              {DOMAIN_LABELS[domain]}
            </Badge>
            {domain}
          </>
        ),
      })),
    [],
  );

  const typeOptions = useMemo<SelectOption[]>(
    () =>
      FEATURE_TYPES.map((type) => ({
        value: type,
        label: FEATURE_TYPE_LABELS[type],
      })),
    [],
  );

  return { domainOptions, typeOptions };
}
