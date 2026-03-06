"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

/** Compact tooltip wrapper — wraps children with a hover tooltip */
export function Tip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-70">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
