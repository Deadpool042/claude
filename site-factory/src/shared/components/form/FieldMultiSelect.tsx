"use client";

import type { SelectOption } from "./FieldSelect";
import { FieldReferenceMultiSelect } from "./FieldReferenceMultiSelect";

type FieldMultiSelectProps = {
  label?: string;
  values: string[];
  options: SelectOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  helpText?: string;
  tooltip?: string;
  required?: boolean;
  layout?: "stack" | "inline";
};

export function FieldMultiSelect(props: FieldMultiSelectProps) {
  return <FieldReferenceMultiSelect {...props} />;
}
