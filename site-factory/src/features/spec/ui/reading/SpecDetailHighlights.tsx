"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { SpecDetailSection } from "../../logic/spec-types";

interface SpecDetailHighlightsProps {
  sections: SpecDetailSection[];
}

export function SpecDetailHighlights({ sections }: SpecDetailHighlightsProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {sections.map((section) => (
        <Card key={section.title} className="border-border/60">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-sm font-semibold">{section.title}</CardTitle>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {section.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {section.metrics.map((item) => (
                <div
                  key={`${section.title}-${item.label}`}
                  className="rounded-md border border-border/40 bg-muted/20 px-3 py-2"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm font-medium text-foreground",
                      item.tone === "accent" && "text-primary",
                      item.tone === "warning" && "text-amber-400",
                    )}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            {section.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {section.tags.map((tag) => (
                  <Badge key={`${section.title}-${tag}`} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
