//src/app/dashboard/projects/new/_components/step-type-stack.tsx
"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { FieldSelect } from "@/shared/components/FieldSelect";
import { FieldSwitch } from "@/shared/components/FieldSwitch";
import { InlineHint } from "@/shared/components/InlineHint";
import { OptionTiles } from "@/shared/components/OptionTiles";
import { StepCard } from "@/shared/components/StepCard";
import { SupportBadge } from "@/shared/components/SupportBadge";
import { Info, Layers, Server, Zap, Workflow } from "lucide-react";
import {
  getFrontendImplementationLabel,
  getImplementationLabel,
} from "@/lib/project-choices";
import {
  HOSTING_TARGET_LABELS,
} from "@/lib/validators";
import type { HostingTargetInput } from "@/lib/validators";
import type {
  DataSensitivity,
  ProductBucket,
  ScalabilityLevel,
  TrafficLevel,
} from "@/lib/referential";
import { useTypeStackVM } from "./type-stack/use-type-stack-vm";
import { useWizard } from "../logic/WizardProvider";
import { buildWizardDecisionFlow } from "../logic/wizard-flow";
import { WizardDecisionFlowPanel } from "./wizard-decision-flow-panel";

export function StepTypeStack() {
  const wizardFlow = useWizard();
  const {
    applyPatch,
    viewModel,
    showAllImplementations,
    toggleSupportFilter,
    editingOptions,
    commerceOptions,
    trafficOptions,
    productOptions,
    sensitivityOptions,
    scalabilityOptions,
    backendModeOptions,
    backendFamilyOptions,
    showCommerceModel,
    showHeadlessToggle,
    showBackendSection,
    showBackendFamily,
    showProductCount,
    implementationLabel,
    implementationHint,
    hostingSelectionMode,
    hostingBaseOptions,
    hostingBackOptions,
    hostingFrontOptions,
    commerceModelHint,
    wizard,
  } = useTypeStackVM();
  const decisionFlowItems = buildWizardDecisionFlow({
    projectType: wizardFlow.projectType,
    offerProjectType: wizardFlow.offerProjectType,
    projectFamily: wizardFlow.projectFamily,
    projectImplementation: wizardFlow.projectImplementation,
    projectImplementationLabel: wizardFlow.projectImplementationLabel,
    projectFrontendImplementation: wizardFlow.projectFrontendImplementation,
    projectFrontendImplementationLabel: wizardFlow.projectFrontendImplementationLabel,
    hostingSelectionMode: wizardFlow.hostingSelectionMode,
    hostingTarget: wizardFlow.hostingTarget,
    hostingTargetBack: wizardFlow.hostingTargetBack,
    hostingTargetFront: wizardFlow.hostingTargetFront,
    selectedModules: wizardFlow.selectedModules,
    formFields: wizardFlow.formFields,
    qualification: wizardFlow.qualification,
    budgetBandEffective: wizardFlow.budgetBandEffective,
    clientKnowledge: wizardFlow.clientKnowledge,
    primaryGoal: wizardFlow.primaryGoal,
    ambitionLevel: wizardFlow.ambitionLevel,
    targetTimeline: wizardFlow.targetTimeline,
    needsEditing: wizardFlow.needsEditing,
    editingMode: wizardFlow.editingMode,
    editingFrequency: wizardFlow.editingFrequency,
    editorialPushOwner: wizardFlow.editorialPushOwner,
    clientAccessPolicy: wizardFlow.clientAccessPolicy,
    trafficLevel: wizardFlow.trafficLevel,
    dataSensitivity: wizardFlow.dataSensitivity,
    scalabilityLevel: wizardFlow.scalabilityLevel,
    canonicalTaxonomyResolution: wizardFlow.canonicalTaxonomyResolution,
  });

  const {
    projectType,
    budgetBandEffective,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    backendMode,
    backendFamily,
    backendOpsHeavy,
  } = wizard;
  const { activeImplementation, activeFront } = viewModel;
  const isVeryLowBudget = budgetBandEffective === "UNDER_1200";
  const isLowBudget = budgetBandEffective === "UNDER_1200" || budgetBandEffective === "UP_TO_1800";
  const isEntryEcomBudget =
    budgetBandEffective === "UNDER_1200" ||
    budgetBandEffective === "UP_TO_1800" ||
    budgetBandEffective === "UP_TO_3500";
  const isLowBudgetSite =
    isLowBudget && (projectType === "VITRINE" || projectType === "BLOG");
  const isEntryBudgetEcom = isEntryEcomBudget && projectType === "ECOM";
  const projectTypeOptions = isVeryLowBudget
    ? viewModel.projectTypeOptions.filter(
        (opt) => opt.value !== "APP" && opt.value !== "ECOM"
      )
    : viewModel.projectTypeOptions;
  const hostingBaseOptionsEffective = isLowBudgetSite
    ? hostingBaseOptions.filter(
        (opt) => opt.value === "SHARED_PHP" || opt.value === "TO_CONFIRM"
      )
    : hostingBaseOptions;

  return (
    <div className="space-y-4">
      <WizardDecisionFlowPanel
        currentStep={wizardFlow.step}
        items={decisionFlowItems}
        description="La recommandation est déjà posée. Cette étape verrouille l’implémentation, l’architecture et l’hébergement retenus."
      />

      <InlineHint>
        Cette étape traduit la recommandation en choix de mise en œuvre : stack, architecture, édition et hébergement.
      </InlineHint>

      <StepCard title="Périmètre retenu" icon={Zap} tone="bg-primary/10 text-primary">
        <OptionTiles
          options={projectTypeOptions.map((pt) => ({
            value: pt.value,
            title: pt.label,
            description: pt.description,
            icon: pt.icon,
          }))}
          value={projectType}
          onChange={(value) => applyPatch({ projectType: value })}
        />
        {isVeryLowBudget && (
          <InlineHint>
            Budget &lt; 1 200 € : les options App et E-commerce sont masquées. Privilégier Vitrine/Blog en CMS monolithique économique.
          </InlineHint>
        )}
        <InlineHint>
          L&apos;offre Starter est gérée via les offres, pas via ce wizard.
        </InlineHint>
      </StepCard>

      <StepCard title="Contraintes clés" icon={Info} tone="bg-sky-500/10 text-sky-500">
        <FieldSwitch
          label="Besoin d'édition"
          description="Back-office requis pour modifier le contenu."
          tooltip="À désactiver si le projet reste 100 % statique (sans CMS)."
          checked={wizard.needsEditing}
          onCheckedChange={(v) => applyPatch({ needsEditing: v })}
        />

        {wizard.needsEditing && (
          <FieldSelect
            label="Fréquence d’édition"
            value={wizard.editingFrequency}
            onChange={(value) => applyPatch({ editingFrequency: value as (typeof editingOptions)[number]["value"] })}
            options={editingOptions.map((freq) => ({
              value: freq.value,
              label: freq.label,
            }))}
            tooltip="Rythme de publication utilisé pour calibrer la proposition technique."
          />
        )}

        {showCommerceModel ? (
          <>
            <FieldSelect
              label="Modèle e‑commerce"
              value={wizard.commerceModel}
              onChange={(value) => applyPatch({ commerceModel: value as (typeof commerceOptions)[number]["value"] })}
              options={commerceOptions.map((model) => ({
                value: model.value,
                label: model.label,
              }))}
              tooltip="Modèle d’exploitation e-commerce retenu pour la suite de la qualification."
              {...(commerceModelHint ? { helpText: commerceModelHint } : {})}
            />
            {isEntryBudgetEcom && (
              <InlineHint>
                E-commerce d’entrée de gamme (≤ 3 500 €) : privilégier un modèle SaaS (ex. Shopify) pour limiter le coût de socle.
              </InlineHint>
            )}
          </>
        ) : showHeadlessToggle ? (
          <FieldSwitch
            label="Headless requis"
            description="API + front séparé nécessaire."
            tooltip="À activer uniquement lorsque le découplage est imposé (SEO, scalabilité front ou contraintes SI)."
            checked={wizard.headlessRequired}
            onCheckedChange={(v) => applyPatch({ headlessRequired: v })}
          />
        ) : null}

        <FieldSelect
          label="Trafic attendu"
          value={wizard.trafficLevel}
          onChange={(v) => applyPatch({ trafficLevel: v as TrafficLevel })}
          options={trafficOptions}
          tooltip="Volume attendu de trafic applicatif."
          helpText="Estimation du volume de visites pour dimensionner la stack."
        />

        {showProductCount && (
          <FieldSelect
            label="Volume produits"
            value={wizard.productCount}
            onChange={(v) => applyPatch({ productCount: v as ProductBucket })}
            options={productOptions}
            placeholder="Sélectionner le volume"
            tooltip="Volume catalogue pris en compte pour le dimensionnement e-commerce."
            helpText="Nombre de références produits à gérer."
          />
        )}

        <FieldSelect
          label="Sensibilité des données"
          value={wizard.dataSensitivity}
          onChange={(v) => applyPatch({ dataSensitivity: v as DataSensitivity })}
          options={sensitivityOptions}
          tooltip="Niveau de sensibilité et d’exigence conformité des données traitées."
          helpText="Niveau de sensibilité des données à gérer."
        />

        <FieldSelect
          label="Scalabilité attendue"
          value={wizard.scalabilityLevel}
          onChange={(v) => applyPatch({ scalabilityLevel: v as ScalabilityLevel })}
          options={scalabilityOptions}
          tooltip="Niveau d’élasticité attendu en croissance fonctionnelle et en charge."
          helpText="Capacité à gérer la croissance du projet."
        />
      </StepCard>

      {showBackendSection && (
        <StepCard
          title="Architecture App Custom"
          icon={Workflow}
          tone="bg-violet-500/10 text-violet-500"
          description="Front et backend séparés lorsque l’app nécessite une API dédiée."
        >
          <OptionTiles
            options={backendModeOptions.map((opt) => ({
              value: opt.value,
              title: opt.label,
              description: opt.description,
            }))}
            value={backendMode}
            onChange={(value) => applyPatch({ backendMode: value })}
            columns={2}
          />
          <InlineHint>
            Full‑stack = backend intégré dans l&apos;app. Séparé = API/BaaS dédié.
          </InlineHint>

          {showBackendFamily && (
            <div className="space-y-3 rounded-lg border border-dashed p-4">
              <div className="space-y-2">
                <Label>Famille backend</Label>
                <OptionTiles
                  options={backendFamilyOptions.map((opt) => ({
                    value: opt.value,
                    title: opt.label,
                    description: opt.description,
                  }))}
                  value={backendFamily}
                  onChange={(value) => applyPatch({ backendFamily: value })}
                  columns={1}
                />
              </div>
              <FieldSwitch
                label="Ops lourds"
                description="DB, backups, monitoring gérés par nous."
                tooltip="À activer si l’infrastructure backend impose une exploitation renforcée."
                checked={backendOpsHeavy}
                onCheckedChange={(v) => applyPatch({ backendOpsHeavy: v })}
              />
              <InlineHint>
                Exemples BaaS : Supabase, Firebase, Appwrite (à titre indicatif).
              </InlineHint>
            </div>
          )}
        </StepCard>
      )}

      <StepCard
        title="Hébergement cible"
        icon={Server}
        tone="bg-emerald-500/10 text-emerald-500"
        description="Infrastructure cible. L’architecture (headless/SaaS) est déduite des contraintes."
      >
        {hostingSelectionMode === "NONE" ? (
          <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            Hébergement géré par le provider (SaaS/BaaS). Aucun choix requis.
          </div>
        ) : hostingSelectionMode === "SINGLE" ? (
          <>
            <OptionTiles
              options={hostingBaseOptionsEffective.map((opt) => ({
                value: opt.value,
                title: opt.label,
                description: opt.description,
              }))}
              value={hostingTarget}
              onChange={(value) => applyPatch({ hostingTarget: value })}
            />
            {isLowBudgetSite && (
              <InlineHint>
                Cohérence budget/marché : en vitrine/blog à petit budget, privilégier l’hébergement mutualisé (type o2switch).
              </InlineHint>
            )}
            <InlineHint>
              Option “À confirmer” à utiliser si l’hébergement n’est pas encore arbitré.
            </InlineHint>
          </>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {hostingSelectionMode === "SPLIT" && (
              <FieldSelect
                label="Hébergement back"
                value={hostingTargetBack ?? ""}
                onChange={(value) => applyPatch({ hostingTargetBack: value as HostingTargetInput })}
                options={hostingBackOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                tooltip="Environnement d’exécution du backend (CMS/commerce/API)."
                helpText="Infrastructure côté CMS/commerce ou API."
              />
            )}
            <FieldSelect
              label="Hébergement front"
              value={hostingTargetFront ?? ""}
              onChange={(value) => applyPatch({ hostingTargetFront: value as HostingTargetInput })}
              options={hostingFrontOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              tooltip="Environnement d’exécution du front public ou applicatif."
              helpText="Infrastructure côté front (app ou site public)."
            />
          </div>
        )}
      </StepCard>

      <StepCard
        title="Architecture choisie"
        icon={Layers}
        tone="bg-indigo-500/10 text-indigo-500"
        description="Famille et implémentation recommandées selon les contraintes capturées."
      >
        <div className="space-y-2">
          <Label>Famille</Label>
          <OptionTiles
            options={viewModel.familyOptions.map((family) => ({
              value: family.value,
              title: family.label,
              description: family.description,
            }))}
            value={wizard.projectFamily}
            onChange={(value) => applyPatch({ projectFamily: value })}
          />
          <InlineHint>
            Famille proposée automatiquement selon les contraintes, avec ajustement manuel possible.
          </InlineHint>
          {isLowBudgetSite && (
            <InlineHint>
              Petit budget site : privilégier une famille CMS monolithique (WordPress en priorité, alternatives possibles selon besoin), plutôt qu’un socle applicatif SSG/SSR.
            </InlineHint>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Label>{implementationLabel}</Label>
          <Button type="button" variant="ghost" size="sm" onClick={toggleSupportFilter}>
            {showAllImplementations ? "Supportés uniquement" : "Voir tous"}
          </Button>
        </div>
        {implementationHint ? <InlineHint>{implementationHint}</InlineHint> : null}
        {viewModel.implementationOptions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            Aucune implémentation supportée pour cette famille. Activer “Voir tous” ou modifier la famille.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {viewModel.implementationOptions.map((impl) => (
              <button
                key={`${impl.value}:${impl.label}`}
                type="button"
                onClick={() =>
                  applyPatch({
                    projectImplementation: impl.value,
                    projectImplementationLabel:
                      impl.value === "OTHER" ? impl.label : "",
                  })
                }
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                  wizard.projectImplementation === impl.value &&
                  (impl.value !== "OTHER" || wizard.projectImplementationLabel === impl.label)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <span>{impl.label}</span>
                {impl.support ? <SupportBadge>{impl.support}</SupportBadge> : null}
              </button>
            ))}
          </div>
        )}

        {wizard.projectImplementation === "OTHER" && (
          <div className="space-y-2">
            <Label>Implémentation (autre)</Label>
            <Input
              value={wizard.projectImplementationLabel}
              onChange={(e) => applyPatch({ projectImplementationLabel: e.target.value })}
              placeholder="Nom de la technologie"
            />
          </div>
        )}

            {viewModel.showHeadlessSelectors && (
              <div className="space-y-4 rounded-lg border border-dashed p-4">
                  <p className="text-xs text-muted-foreground">
                    Headless requis : sélection du front associé.
                  </p>
            <div className="space-y-2">
              <Label>Front</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {viewModel.frontOptions.map((front) => (
                  <button
                    key={front.value}
                    type="button"
                    onClick={() => applyPatch({ projectFrontendImplementation: front.value })}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                      wizard.projectFrontendImplementation === front.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <span>{front.label}</span>
                    {front.support ? <SupportBadge>{front.support}</SupportBadge> : null}
                  </button>
                ))}
              </div>
            </div>

            {wizard.projectFrontendImplementation === "OTHER" && (
              <div className="space-y-2">
                <Label>Front (autre)</Label>
                <Input
                  value={wizard.projectFrontendImplementationLabel}
                  onChange={(e) =>
                    applyPatch({ projectFrontendImplementationLabel: e.target.value })
                  }
                  placeholder="Framework front"
                />
              </div>
            )}

          </div>
        )}

        {activeImplementation && (
          <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <p>
              Implémentation sélectionnée :{" "}
              <span className="font-medium text-foreground">
                {activeImplementation.label ?? getImplementationLabel(activeImplementation.value)}
              </span>
            </p>
            {activeFront && (
              <p className="mt-1">
                Front :{" "}
                <span className="font-medium text-foreground">
                  {activeFront.label ?? getFrontendImplementationLabel(activeFront.value)}
                </span>
              </p>
            )}
            <p className="mt-1 text-[11px] text-muted-foreground">
              Hébergement :{" "}
              {hostingSelectionMode === "NONE"
                ? "Géré par l’hébergeur"
                : hostingSelectionMode === "SINGLE"
                  ? HOSTING_TARGET_LABELS[hostingTarget]
                  : hostingSelectionMode === "FRONT_ONLY"
                    ? `Front ${HOSTING_TARGET_LABELS[hostingTargetFront ?? "TO_CONFIRM"]}`
                    : `Back ${HOSTING_TARGET_LABELS[hostingTargetBack ?? "TO_CONFIRM"]} / Front ${HOSTING_TARGET_LABELS[hostingTargetFront ?? "TO_CONFIRM"]}`}
            </p>
          </div>
        )}
      </StepCard>
    </div>
  );
}
