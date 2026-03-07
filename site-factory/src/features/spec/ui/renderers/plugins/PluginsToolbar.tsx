"use client";

import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { FieldSelect } from "@/shared/components/FieldSelect";
import { LABELS } from "../../../logic/spec-labels";
import { MODE_FILTER_OPTIONS } from "./plugin-select-options";

interface PluginsToolbarProps {
  filter: string;
  resultCount: number;
  modeFilter: string;
  onFilterChange: (value: string) => void;
  onModeFilterChange: (value: string) => void;
}

export function PluginsToolbar({
  filter,
  resultCount,
  modeFilter,
  onFilterChange,
  onModeFilterChange,
}: PluginsToolbarProps) {
  return (
    <div className="mt-3 flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-muted-foreground/40" />
        <Input
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          placeholder={LABELS.plugins.filterPlaceholder(resultCount)}
          className="h-7 pl-8 text-xs"
        />
      </div>
      <FieldSelect
        value={modeFilter}
        onChange={onModeFilterChange}
        options={MODE_FILTER_OPTIONS}
        size="sm"
        triggerClassName="w-32"
      />
    </div>
  );
}
