"use client";

import Link from "next/link";
import { ArrowRight, Clock, FileJson, Layers3, PencilLine } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { formatBytes, formatDate } from "../../logic/spec-helpers";
import type { SpecFileInfo } from "../../logic/spec-types";
import { buildSpecViewHref } from "../../logic/spec-view";

interface SpecCatalogCardProps {
  file: SpecFileInfo;
}

export function SpecCatalogCard({ file }: SpecCatalogCardProps) {
  return (
    <Card className="h-full border-border/60">
      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileJson className="h-4 w-4 text-primary/60" />
              <Link
                href={buildSpecViewHref(file.name, "overview")}
                className="transition hover:text-primary"
              >
                {file.label}
              </Link>
            </CardTitle>
            <code className="text-xs text-muted-foreground">{file.name}</code>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {file.coverage}
          </Badge>
          {file.itemCount !== null && (
            <Badge variant="outline" className="text-[10px]">
              {file.itemCount} éléments
            </Badge>
          )}
          {file.version && (
            <Badge variant="outline" className="text-[10px]">
              v{file.version}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground/80">Rôle</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{file.role}</p>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground/80">Vue d’ensemble</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{file.summary}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {file.topLevelKeys.slice(0, 4).map((section) => (
            <Badge key={section} variant="outline" className="text-[10px] text-muted-foreground">
              {section}
            </Badge>
          ))}
          {file.topLevelKeys.length > 4 && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              +{file.topLevelKeys.length - 4}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
            {formatBytes(file.size)}
          </Badge>
          <span className="flex items-center gap-1">
            <Layers3 className="h-3 w-3" />
            {file.relatedSpecs.length} liens
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(file.lastModified)}
          </span>
        </div>

        <div className="rounded-md border border-border/40 bg-muted/15 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Parcours
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Catalogue {"->"} vue détaillée {"->"} édition, sans changer de route.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={buildSpecViewHref(file.name, "overview")}>Vue détaillée</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={buildSpecViewHref(file.name, "edit")}>
                <PencilLine className="h-3.5 w-3.5" />
                Édition
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
