"use client";

import { GitBranch, Layers, PackageCheck } from "lucide-react";
import type { CanonicalDecisionOutput } from "@/lib/referential";
import { getDecisionDisplayItems } from "@/lib/presentation/decision-labels";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/shared/components/ui/card";
import { InlineHint } from "@/shared/components/InlineHint";

interface DecisionSummaryCardProps {
  decision?: CanonicalDecisionOutput | null;
  title?: string;
  compact?: boolean;
}

export function DecisionSummaryCard({
  decision,
  title = "Décision canonique",
  compact = false
}: DecisionSummaryCardProps) {
  if (!decision) {
    return null;
  }

  const items = getDecisionDisplayItems(decision);

  return (
    <Card>
      <CardHeader className={compact ? "pb-3" : undefined}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              {title}
            </CardTitle>
            <InlineHint className="mt-2">
              Lecture domaine du moteur : on expose ici la sortie canonique,
              distincte des catégories legacy encore utilisées en compatibilité.
            </InlineHint>
          </div>

          <Badge variant="outline">Lot 4</Badge>
        </div>
      </CardHeader>

      <CardContent className={compact ? "space-y-3" : "space-y-4"}>
        <div className="grid gap-3 md:grid-cols-2">
          {items.map(item => (
            <div
              key={item.label}
              className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="mt-1 font-medium">{item.value}</div>
            </div>
          ))}
        </div>

        {decision.notes.length > 0 ? (
          <div className="rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Layers className="h-4 w-4" />
              Notes de transition
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {decision.notes.map(note => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="rounded-lg border p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <PackageCheck className="h-4 w-4" />
            Mapping legacy courant
          </div>
          <div className="grid gap-3 md:grid-cols-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Project type</div>
              <div className="mt-1 font-medium">
                {decision.legacyMapping.projectType}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Catégorie finale
              </div>
              <div className="mt-1 font-medium">
                {decision.legacyMapping.finalCategory}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tech stack</div>
              <div className="mt-1 font-medium">
                {decision.legacyMapping.techStack}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Deploy target</div>
              <div className="mt-1 font-medium">
                {decision.legacyMapping.deployTarget}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">WP headless</div>
              <div className="mt-1 font-medium">
                {decision.legacyMapping.wpHeadless ? "Oui" : "Non"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
