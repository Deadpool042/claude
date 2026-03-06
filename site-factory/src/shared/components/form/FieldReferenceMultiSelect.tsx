"use client";

import { useMemo, useState } from "react";
import { Info, Check } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Label } from "@/shared/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import type { SelectOption } from "./FieldSelect";

type FieldLayout = "stack" | "inline";

type FieldReferenceMultiSelectProps = {
  label?: string;
  values: string[];
  options: SelectOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  helpText?: string;
  tooltip?: string;
  required?: boolean;
  layout?: FieldLayout;
};

export function FieldReferenceMultiSelect({
  label,
  values,
  options,
  onChange,
  placeholder = "Filtrer...",
  className,
  helpText,
  tooltip,
  required,
  layout = "stack",
}: FieldReferenceMultiSelectProps) {
  const [filter, setFilter] = useState("");
  const isInline = layout === "inline";
  const wrapperClass = isInline
    ? "grid grid-cols-[120px_1fr] items-start gap-2"
    : "space-y-2";
  const labelClass = isInline ? "text-xs text-muted-foreground mt-1.5" : undefined;

  const selected = Array.isArray(values) ? values : [];
  const filtered = useMemo(() => {
    if (!filter) return options;
    const needle = filter.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(needle) ||
        opt.value.toLowerCase().includes(needle),
    );
  }, [filter, options]);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const renderContent = (
    <div className="space-y-2">
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((value) => (
            <Badge key={value} variant="outline" className="text-[10px]">
              {options.find((o) => o.value === value)?.label ?? value}
            </Badge>
          ))}
        </div>
      ) : null}
      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder={placeholder}
        className={cn("h-7 text-xs", isInline ? "" : "max-w-xs")}
      />
      <div className="grid gap-1.5 sm:grid-cols-2">
        {filtered.map((opt) => {
          const isActive = selected.includes(opt.value);
          return (
            <Button
              key={opt.value}
              type="button"
              variant="outline"
              className={cn(
                "h-7 justify-start gap-2 text-[10px]",
                isActive ? "border-primary/50 bg-primary/5" : "text-muted-foreground/70",
              )}
              onClick={() => toggle(opt.value)}
            >
              <span className="flex items-center gap-1.5">
                {opt.render ? opt.render() : opt.label}
              </span>
              {isActive ? <Check className="ml-auto h-3.5 w-3.5 text-primary" /> : null}
            </Button>
          );
        })}
      </div>
    </div>
  );

  if (!label) {
    return className ? <div className={className}>{renderContent}</div> : renderContent;
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
      {renderContent}
      {helpText ? (
        <p className={cn("text-xs text-muted-foreground", isInline ? "col-span-2" : undefined)}>
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
