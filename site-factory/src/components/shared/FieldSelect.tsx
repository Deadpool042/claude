// _components/field-select.tsx
"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { value: string; label: string; disabled?: boolean };

type FieldSelectProps = {
  label: string;
  placeholder?: string;
  value?: string | null;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  helpText?: string;
};

export function FieldSelect({
  label,
  placeholder = "Sélectionner…",
  value,
  onChange,
  options,
  className,
  helpText,
}: FieldSelectProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled ?? false}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {helpText ? <p className="text-xs text-muted-foreground">{helpText}</p> : null}
    </div>
  );
}