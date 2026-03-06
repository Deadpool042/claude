"use client";

import { cn } from "@/shared/lib/utils";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

interface InlineHintProps {
  children: ReactNode;
  className?: string | undefined;
}

export function InlineHint({ children, className }: InlineHintProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
