"use client";

import { FieldSelect } from "@/shared/components/form";
import { useSpecFieldOptions } from "../../hooks/useSpecFieldOptions";
import { LABELS } from "../../logic/spec-labels";
import type { FeatureItem } from "../../logic/spec-types";

export function FeatureDomainSelect({
  value,
  onChange,
  required,
}: {
  value: FeatureItem["domain"];
  onChange: (value: FeatureItem["domain"]) => void;
  required?: boolean;
}) {
  const { domainOptions } = useSpecFieldOptions();

  return (
    <FieldSelect
      label={LABELS.features.domain}
      tooltip={LABELS.features.domainHint}
      value={value}
      onChange={(next) => onChange(next as FeatureItem["domain"])}
      options={domainOptions}
      size="sm"
      layout="inline"
      required={Boolean(required)}
    />
  );
}
