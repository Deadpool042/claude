//src/app/dashboard/projects/new/_components/step-type-stack.tsx
"use client";

import { useWizard } from "../logic/WizardProvider";
import { Badge } from "@/shared/components/ui/badge";
import { InlineHint } from "@/shared/components/InlineHint";
import { StepCard } from "@/shared/components/StepCard";
import { AlertTriangle, Wrench } from "lucide-react";
import { ModuleCard } from "@/features/dashboard/projects/components/module-card";
import { BookingConfigurator } from "@/features/booking/components/BookingConfigurator";
import { BOOKING_MODULE_ID } from "@/features/booking/lib/booking-config";
import { GROUP_ICONS } from "@/shared/lib/ui/module-icons";
import { formatEur } from "@/shared/lib/currency";
import {
  MODULE_GROUPS,
  MODULE_CATALOG,
  CATEGORY_COLORS,
  CATEGORY_SHORT,
  getModulesByGroup,
  type ModuleDef,
} from "@/lib/referential";
import { suggestModuleRecommendationsFromDiscovery } from "../logic/module-suggestions";
import { buildWizardDecisionFlow } from "../logic/wizard-flow";
import { WizardDecisionFlowPanel } from "./wizard-decision-flow-panel";

function toModuleLabels(ids: Iterable<string>): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const moduleName = MODULE_CATALOG.find((module) => module.id === id)?.name;
    if (moduleName) labels.push(moduleName);
  }
  return labels;
}

export function StepModules() {
  const {
    step,
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
    primaryGoal,
    ambitionLevel,
    budgetBandEffective,
    needsEditing,
    editingMode,
    commerceModel,
    trafficLevel,
    dataSensitivity,
    scalabilityLevel,
    projectFamily,
    projectImplementation,
    projectImplementationLabel,
    projectFrontendImplementation,
    projectFrontendImplementationLabel,
    hostingSelectionMode,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    formFields,
    clientKnowledge,
    targetTimeline,
    editingFrequency,
    editorialPushOwner,
    clientAccessPolicy,
    canonicalTaxonomyResolution,
  } = useWizard();

  if (!projectType) return null;
  const decisionFlowItems = buildWizardDecisionFlow({
    projectType,
    offerProjectType,
    projectFamily,
    projectImplementation,
    projectImplementationLabel,
    projectFrontendImplementation,
    projectFrontendImplementationLabel,
    hostingSelectionMode,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    selectedModules,
    formFields,
    qualification,
    budgetBandEffective,
    clientKnowledge,
    primaryGoal,
    ambitionLevel,
    targetTimeline,
    needsEditing,
    editingMode,
    editingFrequency,
    editorialPushOwner,
    clientAccessPolicy,
    trafficLevel,
    dataSensitivity,
    scalabilityLevel,
    canonicalTaxonomyResolution,
  });

  if (!qualification) {
    return (
      <div className="space-y-4">
        <WizardDecisionFlowPanel
          currentStep={step}
          items={decisionFlowItems}
          description="Le socle métier et la mise en œuvre sont déjà établis. Ici, on rend visible ce qui est imposé, conseillé ou arbitré dans le périmètre modules."
        />
        <InlineHint className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          Les modules seront disponibles dès que la qualification et l’implémentation supportée seront stabilisées.
        </InlineHint>
      </div>
    );
  }
  if (!techStack) {
    return (
      <div className="space-y-4">
        <WizardDecisionFlowPanel
          currentStep={step}
          items={decisionFlowItems}
          description="Le socle métier et la mise en œuvre sont déjà établis. Ici, on rend visible ce qui est imposé, conseillé ou arbitré dans le périmètre modules."
        />
        <InlineHint className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          Les modules ne sont pas disponibles tant que l&apos;implémentation n&apos;est pas supportée.
        </InlineHint>
      </div>
    );
  }
  if (offerProjectType === "VITRINE_BLOG") {
    return (
      <div className="space-y-4">
        <WizardDecisionFlowPanel
          currentStep={step}
          items={decisionFlowItems}
          description="Le socle métier et la mise en œuvre sont déjà établis. Ici, on rend visible ce qui est imposé, conseillé ou arbitré dans le périmètre modules."
        />
        <InlineHint className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          Les projets Vitrine / Blog n&apos;incluent pas de modules optionnels.
        </InlineHint>
      </div>
    );
  }

  const compatibleSet = new Set(compatibleModuleIds);
  const mandatorySet = new Set(mandatoryModuleIds);
  const includedSet = new Set(includedModuleIds);
  const essentialModuleIds = [...mandatoryModuleIds, ...includedModuleIds];
  const recommendedRecommendations = suggestModuleRecommendationsFromDiscovery({
    projectType,
    primaryGoal,
    ambitionLevel,
    budgetBand: budgetBandEffective,
    needsEditing,
    editingMode,
    commerceModel,
    trafficLevel,
    dataSensitivity,
    scalabilityLevel,
  });
  const recommendedModuleIds = recommendedRecommendations.map((item) => item.id);
  const recommendedSet = new Set(recommendedModuleIds);
  const optionalModuleIds = compatibleModuleIds.filter(
    (id) =>
      !mandatorySet.has(id) &&
      !includedSet.has(id) &&
      !recommendedSet.has(id),
  );
  const incompatibleModuleIds = MODULE_CATALOG.map((module) => module.id).filter(
    (id) => !compatibleSet.has(id),
  );

  const essentialLabels = toModuleLabels(essentialModuleIds);
  const recommendedLabels = toModuleLabels(
    recommendedModuleIds.filter(
      (id) =>
        compatibleSet.has(id) &&
        !mandatorySet.has(id) &&
        !includedSet.has(id),
    ),
  );
  const optionalLabels = toModuleLabels(optionalModuleIds);
  const incompatibleLabels = toModuleLabels(incompatibleModuleIds);

  const bookingVisible =
    compatibleModuleIds.includes(BOOKING_MODULE_ID) ||
    selectedModules.has(BOOKING_MODULE_ID);

  return (
    <div className="space-y-4">
      <WizardDecisionFlowPanel
        currentStep={step}
        items={decisionFlowItems}
        description="Le socle métier et la mise en œuvre sont déjà établis. Ici, on rend visible ce qui est imposé, conseillé ou arbitré dans le périmètre modules."
      />

      <InlineHint>
        Les modules sont reliés à la recommandation : essentiels, recommandés puis optionnels.
      </InlineHint>

      <StepCard
        title="Priorisation modules"
        icon={Wrench}
        tone="bg-amber-500/10 text-amber-500"
        description="Lecture métier avant arbitrage détaillé des cartes modules."
      >
        <div className="grid gap-3 text-xs sm:grid-cols-2">
          <div className="rounded-lg border p-3">
            <p className="font-medium">Essentiels</p>
            <p className="mt-1 text-muted-foreground">
              {essentialLabels.length > 0 ? essentialLabels.join(" · ") : "Aucun module essentiel."}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="font-medium">Recommandés</p>
            <p className="mt-1 text-muted-foreground">
              {recommendedLabels.length > 0 ? recommendedLabels.join(" · ") : "Aucune recommandation additionnelle."}
            </p>
            {recommendedLabels.length > 0 && (
              <div className="mt-3 space-y-2 text-muted-foreground">
                {recommendedModuleIds
                  .map((id) => {
                    const recommendation = recommendedRecommendations.find((item) => item.id === id);
                    const moduleName = MODULE_CATALOG.find((module) => module.id === id)?.name;
                    if (!recommendation || !moduleName || mandatorySet.has(id) || includedSet.has(id)) {
                      return null;
                    }
                    return (
                      <p key={id} className="text-[11px]">
                        <span className="font-medium text-foreground">{moduleName}</span>
                        {" · "}
                        {recommendation.reasons.slice(0, 2).join(" · ")}
                      </p>
                    );
                  })}
              </div>
            )}
          </div>
          <div className="rounded-lg border p-3">
            <p className="font-medium">Optionnels</p>
            <p className="mt-1 text-muted-foreground">
              {optionalLabels.length > 0 ? optionalLabels.join(" · ") : "Aucun module optionnel pour ce cadrage."}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="font-medium">Incompatibilités</p>
            <p className="mt-1 text-muted-foreground">
              {incompatibleLabels.length > 0
                ? `${incompatibleLabels.length} module(s) hors périmètre de la recommandation actuelle.`
                : "Aucune incompatibilité détectée."}
            </p>
          </div>
        </div>
      </StepCard>

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

      {bookingVisible && <BookingConfigurator />}
    </div>
  );
}
