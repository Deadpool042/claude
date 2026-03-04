// _components/field-select.tsx
"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";

type Option = { value: string; label: string; disabled?: boolean };

type FieldSelectProps = {
  label: string;
  placeholder?: string;
  value?: string | null;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  helpText?: string;
  tooltip?: string;
};

export function FieldSelect({
  label,
  placeholder = "Sélectionner…",
  value,
  onChange,
  options,
  className,
  helpText,
  tooltip,
}: FieldSelectProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label>{label}</Label>
        {tooltip ? (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3.5 text-muted-foreground" aria-label="Informations" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>

      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className={cn("w-full", className)}>
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