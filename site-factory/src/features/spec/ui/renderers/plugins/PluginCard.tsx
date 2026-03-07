"use client";

import { useState } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { JsonValue, PluginItem } from "../../../logic/spec-types";
import { PluginBasicsFields } from "./PluginBasicsFields";
import { PluginCardHeader } from "./PluginCardHeader";
import { PluginCoverageFields } from "./PluginCoverageFields";
import { PluginPricingFields } from "./PluginPricingFields";

interface PluginCardProps {
  plugin: PluginItem;
  onUpdate: (field: keyof PluginItem, value: JsonValue) => void;
}

export function PluginCard({ plugin, onUpdate }: PluginCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-0">
        <PluginCardHeader
          plugin={plugin}
          expanded={expanded}
          onToggle={() => setExpanded((current) => !current)}
        />

        {expanded && (
          <div className="space-y-3 border-t border-border/30 px-4 py-3">
            <PluginBasicsFields plugin={plugin} onUpdate={onUpdate} />
            <PluginPricingFields plugin={plugin} onUpdate={onUpdate} />
            <PluginCoverageFields plugin={plugin} onUpdate={onUpdate} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
