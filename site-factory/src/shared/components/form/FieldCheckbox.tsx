"use client";

import { Info } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

type FieldLayout = "stack" | "inline";

type FieldCheckboxProps = {
  label?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  description?: string;
  className?: string;
  tooltip?: string;
  required?: boolean;
  layout?: FieldLayout;
};

export function FieldCheckbox({
  label,
  checked,
  onChange,
  description,
  className,
  tooltip,
  required,
  layout = "stack",
}: FieldCheckboxProps) {
  const isInline = layout === "inline";
  const wrapperClass = isInline
    ? "grid grid-cols-[120px_1fr] items-center gap-2"
    : "space-y-2";
  const labelClass = isInline ? "text-xs text-muted-foreground" : undefined;

  const checkboxEl = (
    <div className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={onChange} />
      {description ? (
        <span className="text-[10px] text-muted-foreground/60">{description}</span>
      ) : null}
    </div>
  );

  if (!label) {
    return className ? <div className={className}>{checkboxEl}</div> : checkboxEl;
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
      {checkboxEl}
    </div>
  );
}
