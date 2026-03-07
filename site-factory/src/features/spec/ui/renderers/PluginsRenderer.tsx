"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type { JsonValue, SpecRendererProps, PluginItem } from "../../logic/spec-types";
import { CMS_IDS, CMS_SHORT } from "../../logic/spec-constants";
import { LABELS } from "../../logic/spec-labels";
import { PluginCard } from "./plugins/PluginCard";
import { PluginsSummaryBar } from "./plugins/PluginsSummaryBar";
import { PluginsToolbar } from "./plugins/PluginsToolbar";
import {
  countPluginsByCms,
  filterPlugins,
  summarizePluginCosts,
  updatePluginField,
} from "./plugins/plugin-renderer-helpers";

export function PluginsRenderer({ value, onChange }: SpecRendererProps) {
  const [filter, setFilter] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [cmsTab, setCmsTab] = useState<string>("all");

  const root = value as Record<string, JsonValue>;
  const plugins = (root.plugins ?? []) as unknown as PluginItem[];

  const countByCms = useMemo(() => countPluginsByCms(plugins), [plugins]);

  const activeCmsTabs = useMemo(
    () => CMS_IDS.filter((cmsId) => (countByCms[cmsId] ?? 0) > 0),
    [countByCms],
  );

  const filtered = useMemo(
    () => filterPlugins(plugins, { cmsTab, filter, modeFilter }),
    [plugins, cmsTab, filter, modeFilter],
  );

  const summary = useMemo(() => summarizePluginCosts(filtered), [filtered]);

  const handleUpdate = (
    pluginId: string,
    field: keyof PluginItem,
    fieldValue: JsonValue,
  ) => {
    onChange({
      ...root,
      plugins: updatePluginField(
        plugins,
        pluginId,
        field,
        fieldValue,
      ) as unknown as JsonValue,
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <Tabs value={cmsTab} onValueChange={setCmsTab}>
          <TabsList className="h-8 w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="h-7 px-3 text-xs">
              {LABELS.all}
              <Badge variant="outline" className="ml-1.5 h-4 px-1 text-[9px]">
                {plugins.length}
              </Badge>
            </TabsTrigger>
            {activeCmsTabs.map((cmsId) => (
              <TabsTrigger key={cmsId} value={cmsId} className="h-7 px-3 text-xs">
                {CMS_SHORT[cmsId]}
                <Badge variant="outline" className="ml-1.5 h-4 px-1 text-[9px]">
                  {countByCms[cmsId]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <PluginsToolbar
            filter={filter}
            resultCount={filtered.length}
            modeFilter={modeFilter}
            onFilterChange={setFilter}
            onModeFilterChange={setModeFilter}
          />

          <PluginsSummaryBar cmsTab={cmsTab} summary={summary} />

          <div className="mt-1 grid gap-2">
            {filtered.map((plugin) => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                onUpdate={(field, fieldValue) =>
                  handleUpdate(plugin.id, field, fieldValue)
                }
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground/50">
              {LABELS.plugins.noPlugin}
              {cmsTab !== "all" ? ` pour ${CMS_SHORT[cmsTab]}` : ""}
            </div>
          )}
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
