"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode, ComponentType } from "react";

export type StepCardProps = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  tone?: string;
  description?: string;
  children: ReactNode;
};

export function StepCard({ title, icon: Icon, tone, description, children }: StepCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <div
            className={`flex size-7 items-center justify-center rounded-lg ${
              tone ?? "bg-muted text-muted-foreground"
            }`}
          >
            <Icon className="size-4" />
          </div>
          {title}
        </CardTitle>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
