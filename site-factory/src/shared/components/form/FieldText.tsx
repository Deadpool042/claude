"use client";

import { Info } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

type FieldLayout = "stack" | "inline";

type FieldTextProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  inputClassName?: string;
  helpText?: string;
  tooltip?: string;
  required?: boolean;
  layout?: FieldLayout;
  disabled?: boolean;
};

export function FieldText({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  inputClassName,
  helpText,
  tooltip,
  required,
  layout = "stack",
  disabled,
}: FieldTextProps) {
  const isInline = layout === "inline";
  const wrapperClass = isInline
    ? "grid grid-cols-[120px_1fr] items-center gap-2"
    : "space-y-2";
  const labelClass = isInline ? "text-xs text-muted-foreground" : undefined;

  const inputEl = (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      className={cn(isInline ? "h-7 text-xs" : undefined, inputClassName)}
    />
  );

  if (!label) {
    return className ? <div className={className}>{inputEl}</div> : inputEl;
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
      {inputEl}
      {helpText ? (
        <p className={cn("text-xs text-muted-foreground", isInline ? "col-span-2" : undefined)}>
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
