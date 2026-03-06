"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { ReactNode, ComponentType } from "react";

export type StepCardProps = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  tone?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
};

export function StepCard({
  title,
  icon: Icon,
  tone,
  description,
  children,
  className,
  contentClassName,
  headerClassName,
}: StepCardProps) {
  return (
    <Card className={className}>
      <CardHeader className={headerClassName ?? "pb-4"}>
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
      <CardContent className={contentClassName ?? "space-y-4"}>{children}</CardContent>
    </Card>
  );
}
