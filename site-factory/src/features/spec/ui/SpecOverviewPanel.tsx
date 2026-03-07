"use client";

import { BookOpen, FileJson, Settings2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { JsonValue } from "../logic/spec-types";
import { buildSpecOverview } from "../logic/spec-catalog";
import { SpecDocPanel } from "./SpecDocPanel";
import { SpecDetailHighlights } from "./reading/SpecDetailHighlights";

const SECTION_KIND_LABELS = {
  collection: "collection",
  dictionary: "dictionnaire",
  object: "objet",
  list: "liste",
  scalar: "scalaire",
} as const;

interface SpecOverviewPanelProps {
  specFile: string;
  value: JsonValue;
  stats: {
    keys: number;
    lines: number;
  };
}

export function SpecOverviewPanel({
  specFile,
  value,
  stats,
}: SpecOverviewPanelProps) {
  const overview = buildSpecOverview(specFile, value);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="border-border/60">
          <CardContent className="space-y-4 p-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {overview.domain}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {overview.coverage}
                </Badge>
                {overview.version && (
                  <Badge variant="outline" className="text-[10px]">
                    v{overview.version}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-foreground">Résumé</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {overview.summary}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rôle de ce fichier
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                {overview.role}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Repères techniques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 px-3 py-2">
              <span className="flex items-center gap-2">
                <FileJson className="h-4 w-4 text-primary/60" />
                Sections
              </span>
              <span className="font-medium text-foreground">{overview.sections.length}</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 px-3 py-2">
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary/60" />
                Clés JSON
              </span>
              <span className="font-medium text-foreground">{stats.keys}</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 px-3 py-2">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary/60" />
                Lignes
              </span>
              <span className="font-medium text-foreground">{stats.lines}</span>
            </div>
            {overview.requiredTopLevelKeys.length > 0 && (
              <div className="space-y-2 rounded-md border border-border/40 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Clés principales requises
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {overview.requiredTopLevelKeys.map((key) => (
                    <Badge key={key} variant="outline" className="text-[10px]">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SpecDetailHighlights sections={overview.detailSections} />

      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Structure détaillée</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {overview.sections.map((section) => (
            <div
              key={section.key}
              className="rounded-lg border border-border/40 bg-muted/15 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <code className="text-xs font-medium text-primary/80">{section.key}</code>
                <Badge variant="outline" className="text-[10px]">
                  {SECTION_KIND_LABELS[section.kind]}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {section.count !== null
                  ? `${section.count} élément${section.count > 1 ? "s" : ""}`
                  : "Valeur simple"}
              </p>
              {section.sampleKeys.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {section.sampleKeys.map((sampleKey) => (
                    <Badge key={sampleKey} variant="secondary" className="text-[10px]">
                      {sampleKey}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <SpecDocPanel specFile={specFile} overview={overview} hidePurpose />
    </div>
  );
}
