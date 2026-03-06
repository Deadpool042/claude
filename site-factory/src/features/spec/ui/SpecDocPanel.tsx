"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileJson,
  Info,
  Link2,
  Lightbulb,
  Route,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { SpecOverviewSummary } from "../logic/spec-types";
import { FIELD_TOOLTIPS } from "../logic/field-tooltips";

interface SpecDocPanelProps {
  specFile: string;
  overview: SpecOverviewSummary;
  hidePurpose?: boolean;
}

export function SpecDocPanel({
  specFile,
  overview,
  hidePurpose = false,
}: SpecDocPanelProps) {
  const tooltips = FIELD_TOOLTIPS[specFile];

  return (
    <div className="space-y-4">
      {!hidePurpose && (
        <Card className="border-border/60 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">{specFile}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {overview.summary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/40">
        <CardContent className="p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Route className="h-3.5 w-3.5" />
            Gouvernance de lecture
          </h4>
          <div className="space-y-3">
            {overview.governance.map((entry) => (
              <div key={entry.label} className="rounded-md border border-border/30 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{entry.label}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {entry.source}
                  </Badge>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground/70">
                  {entry.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardContent className="p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ArrowRight className="h-3.5 w-3.5" />
            Consommateurs techniques
          </h4>
          {overview.consumers.length > 0 ? (
            <div className="space-y-1.5">
              {overview.consumers.map((consumer) => (
                <div
                  key={consumer}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                  <code className="text-[11px] text-primary/70">{consumer}</code>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60">
              Aucun consommateur explicite declare dans <code>_meta.consumedBy</code>.
            </p>
          )}
        </CardContent>
      </Card>

      {overview.concepts.length > 0 && (
        <Card className="border-border/40">
          <CardContent className="p-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5" />
              Concepts cles
            </h4>
            <div className="space-y-3">
              {overview.concepts.map((concept) => (
                <div key={concept.term}>
                  <Badge variant="outline" className="mb-1 text-[10px] font-mono">
                    {concept.term}
                  </Badge>
                  <p className="ml-0.5 text-xs leading-relaxed text-muted-foreground/80">
                    {concept.definition}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {overview.relatedSpecs.length > 0 && (
        <Card className="border-border/40">
          <CardContent className="p-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" />
              Relations avec les autres specs
            </h4>
            <div className="space-y-3">
              {overview.relatedSpecs.map((relation) => (
                <div key={relation.spec} className="rounded-md border border-border/30 p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <FileJson className="h-3.5 w-3.5 text-primary/50" />
                    <Link
                      href={`/dashboard/spec/${relation.spec}`}
                      className="text-xs font-medium text-primary/80 transition-colors hover:text-primary"
                    >
                      {relation.spec}
                    </Link>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground/70">
                    {relation.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tooltips && Object.keys(tooltips).length > 0 && (
        <Card className="border-border/40">
          <CardContent className="p-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              Reference des champs
            </h4>
            <div className="space-y-2">
              {Object.entries(tooltips).map(([field, description]) => (
                <div
                  key={field}
                  className="grid grid-cols-[120px_1fr] gap-2 border-b border-border/20 py-1 last:border-0"
                >
                  <code className="text-[10px] font-mono text-primary/70">{field}</code>
                  <span className="text-[11px] text-muted-foreground/70">{description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {overview.editGuide.length > 0 && (
        <Card className="border-emerald-500/20">
          <CardContent className="p-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400/80">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Checklist avant modification
            </h4>
            <div className="space-y-2">
              {overview.editGuide.map((item) => (
                <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-0.5 shrink-0 text-emerald-400/60">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {overview.impactWarning && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80" />
              <div>
                <h4 className="mb-1 text-xs font-semibold text-amber-400/80">
                  Impact des modifications
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground/70">
                  {overview.impactWarning}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
