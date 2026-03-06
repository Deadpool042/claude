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

type FieldNumberProps = {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  helpText?: string;
  tooltip?: string;
  required?: boolean;
  layout?: FieldLayout;
};

export function FieldNumber({
  label,
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  helpText,
  tooltip,
  required,
  layout = "stack",
}: FieldNumberProps) {
  const isInline = layout === "inline";
  const wrapperClass = isInline
    ? "grid grid-cols-[120px_1fr] items-center gap-2"
    : "space-y-2";
  const labelClass = isInline ? "text-xs text-muted-foreground" : undefined;

  const inputValue = value === null ? "" : String(value);

  const inputEl = (
    <Input
      value={inputValue}
      onChange={(e) => {
        const raw = e.target.value;
        if (!raw) {
          onChange(null);
          return;
        }
        const parsed = Number(raw);
        onChange(Number.isNaN(parsed) ? null : parsed);
      }}
      placeholder={placeholder}
      type="number"
      className={cn(isInline ? "h-7 text-xs font-mono" : "font-mono", inputClassName)}
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
