"use client";

import { Tip } from "./Tip";

/** Section divider with a centered title and optional tooltip */
export function SectionTitle({
  title,
  tooltip,
}: {
  title: string;
  tooltip: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-6 first:mt-0">
      <div className="flex-1 border-t border-border/40" />
      <Tip content={tooltip}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-help">
          {title}
        </h3>
      </Tip>
      <div className="flex-1 border-t border-border/40" />
    </div>
  );
}
