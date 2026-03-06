"use client";

import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";

export interface OptionTile<T extends string> {
  value: T;
  title: string;
  description?: string | undefined;
  icon?: ReactNode | undefined;
  badge?: ReactNode | undefined;
}

interface OptionTilesProps<T extends string> {
  options: OptionTile<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function OptionTiles<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
  className,
}: OptionTilesProps<T>) {
  const grid =
    columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1";

  return (
    <div className={cn("grid gap-3", grid, className)}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "group relative flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all",
              active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30",
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xl">{opt.icon}</span>
              {opt.badge}
            </div>
            <span className="text-sm font-medium">{opt.title}</span>
            {opt.description ? (
              <span className="text-xs text-muted-foreground">{opt.description}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
