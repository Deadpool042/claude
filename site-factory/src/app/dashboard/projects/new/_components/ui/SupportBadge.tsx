"use client";

import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

export function SupportBadge({ children }: { children: ReactNode }) {
  return (
    <Badge variant="outline" className="text-[10px]">
      {children}
    </Badge>
  );
}
