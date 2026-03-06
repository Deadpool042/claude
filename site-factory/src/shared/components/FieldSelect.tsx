"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Label } from "@/shared/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Info } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  render?: () => ReactNode;
};

type FieldSelectProps = {
  label?: string;
  placeholder?: string;
  value?: string | null;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  triggerClassName?: string;
  helpText?: string;
  tooltip?: string;
  size?: "default" | "sm";
};

export function FieldSelect({
  label,
  placeholder = "Sélectionner…",
  value,
  onChange,
  options,
  className,
  triggerClassName,
  helpText,
  tooltip,
  size = "default",
}: FieldSelectProps) {
  const triggerSize = size === "sm" ? "h-7 text-xs" : "";

  const selectElement = (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger
        className={cn("w-full", triggerSize, triggerClassName)}
        size={size === "sm" ? "sm" : "default"}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled ?? false}
            className={size === "sm" ? "text-xs" : undefined}
          >
            {opt.render ? opt.render() : opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (!label) {
    return className ? <div className={className}>{selectElement}</div> : selectElement;
  }

  return (
    <div className={cn("space-y-2", className)}>
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

      {selectElement}

      {helpText ? <p className="text-xs text-muted-foreground">{helpText}</p> : null}
    </div>
  );
}