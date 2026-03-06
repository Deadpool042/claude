"use client";

import { useState } from "react";
import { Info, Plus, X } from "lucide-react";
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

type FieldLayout = "stack" | "inline";

type FieldTagListProps = {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  helpText?: string;
  tooltip?: string;
  required?: boolean;
  layout?: FieldLayout;
};

export function FieldTagList({
  label,
  values,
  onChange,
  placeholder = "Ajouter...",
  className,
  helpText,
  tooltip,
  required,
  layout = "stack",
}: FieldTagListProps) {
  const [draft, setDraft] = useState("");
  const isInline = layout === "inline";
  const wrapperClass = isInline
    ? "grid grid-cols-[120px_1fr] items-start gap-2"
    : "space-y-2";
  const labelClass = isInline ? "text-xs text-muted-foreground mt-1.5" : undefined;

  const normalizedValues = Array.isArray(values) ? values : [];

  const handleAdd = () => {
    const next = draft.trim();
    if (!next) return;
    if (normalizedValues.includes(next)) {
      setDraft("");
      return;
    }
    onChange([...normalizedValues, next]);
    setDraft("");
  };

  const handleRemove = (value: string) => {
    onChange(normalizedValues.filter((v) => v !== value));
  };

  const inputRow = (
    <div className="flex items-center gap-2">
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className={cn("h-7 text-xs", isInline ? "" : "max-w-xs")}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground/70 hover:text-foreground"
        onClick={handleAdd}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  if (!label) {
    return (
      <div className={cn("space-y-2", className)}>
        {normalizedValues.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {normalizedValues.map((value) => (
              <Badge key={value} variant="outline" className="text-[10px]">
                {value}
                <button
                  type="button"
                  onClick={() => handleRemove(value)}
                  className="ml-1 text-muted-foreground/60 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : null}
        {inputRow}
        {helpText ? <p className="text-xs text-muted-foreground">{helpText}</p> : null}
      </div>
    );
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
      <div className="space-y-2">
        {normalizedValues.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {normalizedValues.map((value) => (
              <Badge key={value} variant="outline" className="text-[10px]">
                {value}
                <button
                  type="button"
                  onClick={() => handleRemove(value)}
                  className="ml-1 text-muted-foreground/60 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : null}
        {inputRow}
      </div>
      {helpText ? (
        <p className={cn("text-xs text-muted-foreground", isInline ? "col-span-2" : undefined)}>
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
