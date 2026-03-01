"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWizard } from "../_providers/wizard-provider";
import { MODULE_CATALOG } from "@/lib/qualification";

export default function ModulesSlot() {
  const {
    projectType,
    compatibleModuleIds,
    selectedModules,
    mandatoryModuleIds,
    includedModuleIds,
  } = useWizard();

  if (!projectType) return null;

  const selectedSet = new Set(selectedModules);
  const mandatorySet = new Set(mandatoryModuleIds);
  const includedSet = new Set(includedModuleIds);
  const visibleModules = MODULE_CATALOG.filter((mod) =>
    compatibleModuleIds.includes(mod.id),
  );

  return (
    <Card className="max-h-[70vh] overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Details modules</CardTitle>
        <CardDescription>
          Contenu et perimetre des modules compatibles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 overflow-auto pr-2">
        {projectType === "STARTER" || visibleModules.length === 0 ? (
          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            Aucun module disponible pour cette offre.
          </div>
        ) : (
          visibleModules.map((mod) => (
            <div key={mod.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{mod.name}</span>
                {selectedSet.has(mod.id) && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                    selectionne
                  </Badge>
                )}
                {mandatorySet.has(mod.id) && (
                  <Badge variant="destructive" className="text-[9px] px-1 py-0">
                    obligatoire
                  </Badge>
                )}
                {!mandatorySet.has(mod.id) && includedSet.has(mod.id) && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0">
                    inclus
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{mod.description}</p>
              {mod.details && mod.details.length > 0 ? (
                <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                  {mod.details.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
