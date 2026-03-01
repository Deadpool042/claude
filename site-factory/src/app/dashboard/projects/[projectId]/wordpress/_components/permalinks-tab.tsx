"use client";

import { Check, Loader2 } from "lucide-react";
import { PERMALINK_PRESETS } from "./types";

// ── PermalinksTab ─────────────────────────────────────────────────────

export function PermalinksTab({
  currentPermalink,
  actionLoading,
  onSetPermalink,
}: {
  currentPermalink: string;
  actionLoading: string | null;
  onSetPermalink: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Structure actuelle :{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
          {currentPermalink || "(par défaut)"}
        </code>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PERMALINK_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            disabled={actionLoading !== null}
            onClick={() => {
              onSetPermalink(preset.value);
            }}
            className={`flex items-center justify-between gap-2 p-3 rounded-lg border text-left text-sm transition-colors ${
              currentPermalink === preset.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div>
              <p className="font-medium">{preset.label}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {preset.value || "/?p=123"}
              </p>
            </div>
            {currentPermalink === preset.value ? (
              <Check className="size-4 text-primary shrink-0" />
            ) : null}
            {actionLoading === `permalink-${preset.value}` ? (
              <Loader2 className="size-4 animate-spin shrink-0" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
