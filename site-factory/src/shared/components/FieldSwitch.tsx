"use client";

import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

interface FieldSwitchProps {
  label: string;
  description?: string | undefined;
  tooltip?: string | undefined;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  aside?: ReactNode | undefined;
}

export function FieldSwitch({
  label,
  description,
  tooltip,
  checked,
  onCheckedChange,
  aside,
}: FieldSwitchProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">{label}</Label>
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
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        {aside}
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}
