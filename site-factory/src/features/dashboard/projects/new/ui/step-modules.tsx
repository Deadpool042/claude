//src/app/dashboard/projects/new/_components/step-type-stack.tsx
"use client";

import { useWizard } from "../logic/WizardProvider";
import { Badge } from "@/components/ui/badge";
import { InlineHint } from "@/components/shared/InlineHint";
import { StepCard } from "@/components/shared/StepCard";
import { AlertTriangle, Wrench } from "lucide-react";
import { ModuleCard } from "@/components/qualification/module-card";
import { GROUP_ICONS } from "@/lib/ui/module-icons";
import { formatEur } from "@/lib/currency";
import {
  MODULE_GROUPS,
  CATEGORY_COLORS,
  CATEGORY_SHORT,
  getModulesByGroup,
  type ModuleDef,
} from "@/lib/referential";

export function StepModules() {
  const {
    projectType,
    qualificationProjectType,
    offerProjectType,
    backendMultiplier,
    selectedModules,
    toggleModule,
    catSelections,
    setCatSelections,
    techStack,
    wpHeadless,
    qualification,
    mandatoryModuleIds,
    includedModuleIds,
    compatibleModuleIds,
  } = useWizard();

  if (!qualification) return null;
  if (!projectType) return null;
  if (!techStack) {
    return (
      <div className="space-y-4">
        <InlineHint className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          Les modules ne sont pas disponibles tant que l&apos;implémentation n&apos;est pas supportée.
        </InlineHint>
      </div>
    );
  }
  if (offerProjectType === "VITRINE_BLOG") {
    return (
      <div className="space-y-4">
        <InlineHint className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          Les projets Vitrine / Blog n&apos;incluent pas de modules optionnels.
        </InlineHint>
      </div>
    );
  }

  const compatibleSet = new Set(compatibleModuleIds);
  const mandatorySet = new Set(mandatoryModuleIds);
  const includedSet = new Set(includedModuleIds);

  return (
    <div className="space-y-4">
      <InlineHint>
        Sélection de modules pré-remplie selon les réponses du questionnaire et le cadrage technique. Ajustements possibles avant validation.
      </InlineHint>

      {/* ── Alerte requalification ──────────────────── */}
      {qualification.wasRequalified && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 ${CATEGORY_COLORS[qualification.finalCategory]}`}
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">
              Requalification :{" "}
              {CATEGORY_SHORT[qualification.initialCategory]} →{" "}
              {CATEGORY_SHORT[qualification.finalCategory]}
            </p>
            {qualification.requalifyingModules.length > 0 ? (
              <p className="mt-1 text-xs opacity-80">
                Modules structurants :{" "}
                {qualification.requalifyingModules.map((m) => m.name).join(", ")}
              </p>
            ) : (
              <p className="mt-1 text-xs opacity-80">
                Requalification automatique (contraintes ou plancher stack).
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Barre de résumé ─────────────────────────── */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div className="flex items-center gap-2 text-sm">
          <Badge
            variant="outline"
            className={CATEGORY_COLORS[qualification.finalCategory]}
          >
            {CATEGORY_SHORT[qualification.finalCategory]}
          </Badge>
          <span className="text-muted-foreground">
            {selectedModules.size} module
            {selectedModules.size !== 1 ? "s" : ""} sélectionné
            {selectedModules.size !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="text-sm font-medium">
          {formatEur(qualification.budget.grandTotal)}
        </div>
      </div>

      {/* ── Groupes de modules ──────────────────────── */}
      {Object.entries(getModulesByGroup()).map(([groupKey, mods]) => {
        const visibleMods = mods.filter((mod) => compatibleSet.has(mod.id));
        if (visibleMods.length === 0) return null;

        const GroupIcon = GROUP_ICONS[groupKey] ?? Wrench;
        return (
          <StepCard
            key={groupKey}
            title={MODULE_GROUPS[groupKey as ModuleDef["group"]]}
            icon={GroupIcon}
            headerClassName="pb-3"
            contentClassName=""
          >
              <div className="grid gap-2 sm:grid-cols-2">
                {visibleMods.map((mod) => (
                  <ModuleCard
                    key={mod.id}
                    mod={mod}
                    isSelected={selectedModules.has(mod.id)}
                    onToggle={() => { toggleModule(mod.id); }}
                    tierSel={catSelections[mod.id]}
                    onTierChange={(modId, newSel) => {
                      setCatSelections((ts) => ({ ...ts, [modId]: newSel }));
                    }}
                    techStack={techStack}
                    projectType={qualificationProjectType ?? projectType}
                    wpHeadless={wpHeadless}
                    initialCategory={qualification.initialCategory}
                    isMandatory={mandatorySet.has(mod.id)}
                    isIncluded={includedSet.has(mod.id)}
                    backendMultiplier={backendMultiplier}
                  />
                ))}
              </div>
          </StepCard>
        );
      })}
    </div>
  );
}
