"use client";

import { FieldSelect } from "@/shared/components/form";
import { useSpecFieldOptions } from "../../hooks/useSpecFieldOptions";
import { LABELS } from "../../logic/spec-labels";
import type { FeatureItem } from "../../logic/spec-types";

export function FeatureTypeSelect({
  value,
  onChange,
  required,
}: {
  value: FeatureItem["type"];
  onChange: (value: FeatureItem["type"]) => void;
  required?: boolean;
}) {
  const { typeOptions } = useSpecFieldOptions();

  return (
    <FieldSelect
      label={LABELS.features.type}
      tooltip={LABELS.features.typeHint}
      value={value}
      onChange={(next) => onChange(next as FeatureItem["type"])}
      options={typeOptions}
      size="sm"
      layout="inline"
      required={Boolean(required)}
    />
  );
}
