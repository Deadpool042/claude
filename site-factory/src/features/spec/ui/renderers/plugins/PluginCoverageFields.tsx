"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Tip } from "@/shared/components/Tip";
import { cn } from "@/shared/lib/utils";
import type { JsonValue, PluginItem } from "../../../logic/spec-types";
import { CMS_IDS, CMS_SHORT } from "../../../logic/spec-constants";
import { LABELS } from "../../../logic/spec-labels";

interface PluginCoverageFieldsProps {
  plugin: PluginItem;
  onUpdate: (field: keyof PluginItem, value: JsonValue) => void;
}

export function PluginCoverageFields({
  plugin,
  onUpdate,
}: PluginCoverageFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-[120px_1fr] items-start gap-2">
        <Tip content="CMS compatibles avec ce plugin (utilisé par le moteur de décision pour le matching)">
          <Label className="cursor-help pt-1 text-xs text-muted-foreground">
            {LABELS.plugins.cmsCompat}
          </Label>
        </Tip>
        <div className="flex flex-wrap gap-1.5">
          {CMS_IDS.map((cmsId) => {
            const active = plugin.cmsIds.includes(cmsId);

            return (
              <Button
                key={cmsId}
                type="button"
                variant={active ? "default" : "outline"}
                size="xs"
                className={cn("h-6 text-[10px]", !active && "opacity-40")}
                onClick={() => {
                  const nextCmsIds = active
                    ? plugin.cmsIds.filter((value) => value !== cmsId)
                    : [...plugin.cmsIds, cmsId];
                  onUpdate("cmsIds", nextCmsIds);
                }}
              >
                {CMS_SHORT[cmsId]}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[120px_1fr] items-start gap-2">
        <Tip content="Fonctionnalités couvertes par ce plugin (utilisé dans la matrice de capacité)">
          <Label className="cursor-help pt-1 text-xs text-muted-foreground">
            {LABELS.plugins.features}
          </Label>
        </Tip>
        <div className="flex flex-wrap gap-1">
          {plugin.featureIds.map((featureId) => (
            <Badge key={featureId} variant="secondary" className="text-[10px]">
              {featureId.replace("feature.", "")}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
}
