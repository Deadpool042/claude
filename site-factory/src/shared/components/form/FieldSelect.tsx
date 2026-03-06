"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Label } from "@/shared/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  render?: () => ReactNode;
};

type FieldLayout = "stack" | "inline";

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
  layout?: FieldLayout;
  required?: boolean;
};

export function FieldSelect({
  label,
  placeholder = "Selectionner...",
  value,
  onChange,
  options,
  className,
  triggerClassName,
  helpText,
  tooltip,
  size = "default",
  layout = "stack",
  required,
}: FieldSelectProps) {
  const isInline = layout === "inline";
  const wrapperClass = isInline
    ? "grid grid-cols-[120px_1fr] items-center gap-2"
    : "space-y-2";
  const labelClass = isInline ? "text-xs text-muted-foreground" : undefined;
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
    <div className={cn(wrapperClass, className)}>
      <div className="flex items-center gap-1">
        <Label className={labelClass}>
          {label}
          {required ? <span className="text-destructive/70"> *</span> : null}
        </Label>
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

      {helpText ? (
        <p className={cn("text-xs text-muted-foreground", isInline ? "col-span-2" : undefined)}>
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
