"use client";

import { CMS_SHORT } from "../../../logic/spec-constants";
import { LABELS } from "../../../logic/spec-labels";
import type { PluginCostSummary } from "./plugin-renderer-helpers";

interface PluginsSummaryBarProps {
  cmsTab: string;
  summary: PluginCostSummary;
}

export function PluginsSummaryBar({
  cmsTab,
  summary,
}: PluginsSummaryBarProps) {
  const hasCosts = summary.monthlyMin > 0
    || summary.monthlyMax > 0
    || summary.annualTotal > 0
    || summary.oneShotTotal > 0;

  if (!hasCosts) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md bg-muted/30 px-3 py-2 text-[11px]">
      <span className="font-medium text-muted-foreground">
        {cmsTab === "all" ? LABELS.plugins.total : CMS_SHORT[cmsTab]} :
      </span>
      {(summary.monthlyMin > 0 || summary.monthlyMax > 0) && (
        <span className="font-mono">
          {summary.monthlyMin}–{summary.monthlyMax}
          {" "}
          <span className="text-muted-foreground">€/mois</span>
        </span>
      )}
      {summary.annualTotal > 0 && (
        <span className="font-mono">
          {summary.annualTotal}
          {" "}
          <span className="text-muted-foreground">€/an</span>
          <span className="ml-1 text-muted-foreground/50">
            ≈ {(summary.annualTotal / 12).toFixed(0)} €/mois
          </span>
        </span>
      )}
      {summary.oneShotTotal > 0 && (
        <span className="font-mono">
          {summary.oneShotTotal}
          {" "}
          <span className="text-muted-foreground">€ one-shot</span>
        </span>
      )}
    </div>
  );
}
