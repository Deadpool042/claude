"use client";

import { Info } from "lucide-react";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

type FieldLayout = "stack" | "inline";

type FieldTextareaProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  textareaClassName?: string;
  helpText?: string;
  tooltip?: string;
  required?: boolean;
  layout?: FieldLayout;
};

export function FieldTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  textareaClassName,
  helpText,
  tooltip,
  required,
  layout = "stack",
}: FieldTextareaProps) {
  const isInline = layout === "inline";
  const wrapperClass = isInline
    ? "grid grid-cols-[120px_1fr] items-start gap-2"
    : "space-y-2";
  const labelClass = isInline ? "text-xs text-muted-foreground mt-1.5" : undefined;

  const textareaEl = (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn("text-xs", textareaClassName)}
    />
  );

  if (!label) {
    return className ? <div className={className}>{textareaEl}</div> : textareaEl;
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
      {textareaEl}
      {helpText ? (
        <p className={cn("text-xs text-muted-foreground", isInline ? "col-span-2" : undefined)}>
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
