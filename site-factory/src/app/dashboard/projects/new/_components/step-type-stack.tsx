//src/app/dashboard/projects/new/_components/step-type-stack.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldSelect } from "@/components/shared/FieldSelect";
import { Info, Layers, Server, Zap, Workflow } from "lucide-react";
import {
  HOSTING_TARGET_LABELS,
  PROJECT_FRONTEND_IMPLEMENTATION_LABELS,
  PROJECT_IMPLEMENTATION_LABELS,
} from "@/lib/validators/project";
import type { HostingTargetInput } from "@/lib/validators/project";
import type {
  DataSensitivity,
  ProductBucket,
  ScalabilityLevel,
  TrafficLevel,
} from "@/lib/referential";
import { useTypeStackVM } from "./type-stack/use-type-stack-vm";
import { StepCard } from "./ui/StepCard";
import { OptionTiles } from "./ui/OptionTiles";
import { FieldSwitch } from "./ui/FieldSwitch";
import { InlineHint } from "./ui/InlineHint";
import { SupportBadge } from "./ui/SupportBadge";

const nativeSelectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export function StepTypeStack() {
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

  const {
    projectType,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    backendMode,
    backendFamily,
    backendOpsHeavy,
  } = wizard;
  const { activeImplementation, activeFront } = viewModel;

  return (
    <div className="space-y-4">
      <StepCard title="Type fonctionnel" icon={Zap} tone="bg-primary/10 text-primary">
        <OptionTiles
          options={viewModel.projectTypeOptions.map((pt) => ({
            value: pt.value,
            title: pt.label,
            description: pt.description,
            icon: pt.icon,
          }))}
          value={projectType}
          onChange={(value) => applyPatch({ projectType: value })}
        />
        <InlineHint>
          L&apos;offre Starter est gérée via les offres, pas via ce wizard.
        </InlineHint>
      </StepCard>

      <StepCard title="Contraintes clés" icon={Info} tone="bg-sky-500/10 text-sky-500">
        <FieldSwitch
          label="Besoin d'édition"
          description="Back-office requis pour modifier le contenu."
          tooltip="Désactivez si le projet est 100% statique (pas de CMS)."
          checked={wizard.needsEditing}
          onCheckedChange={(v) => applyPatch({ needsEditing: v })}
        />

        {wizard.needsEditing && (
          <div className="space-y-2">
            <Label>Fréquence d&apos;édition</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {editingOptions.map((freq) => (
                <Button
                  key={freq.value}
                  type="button"
                  variant={wizard.editingFrequency === freq.value ? "secondary" : "outline"}
                  onClick={() => applyPatch({ editingFrequency: freq.value })}
                >
                  {freq.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {showCommerceModel ? (
          <div className="space-y-2">
            <Label>Modèle e‑commerce</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {commerceOptions.map((model) => (
                <Button
                  key={model.value}
                  type="button"
                  variant={wizard.commerceModel === model.value ? "secondary" : "outline"}
                  onClick={() => applyPatch({ commerceModel: model.value })}
                >
                  {model.label}
                </Button>
              ))}
            </div>
            {commerceModelHint ? <InlineHint>{commerceModelHint}</InlineHint> : null}
          </div>
        ) : showHeadlessToggle ? (
          <FieldSwitch
            label="Headless requis"
            description="API + front séparé nécessaire."
            tooltip="Activez uniquement si le découplage est imposé (SEO/scale front ou contraintes SI)."
            checked={wizard.headlessRequired}
            onCheckedChange={(v) => applyPatch({ headlessRequired: v })}
          />
        ) : null}

        <FieldSelect
          label="Trafic attendu"
          value={wizard.trafficLevel}
          onChange={(v) => applyPatch({ trafficLevel: v as TrafficLevel })}
          options={trafficOptions}
          className={nativeSelectClass}
          helpText="Estimation du volume de visites pour dimensionner la stack."
        />

        {showProductCount && (
          <FieldSelect
            label="Volume produits"
            value={wizard.productCount}
            onChange={(v) => applyPatch({ productCount: v as ProductBucket })}
            options={productOptions}
            placeholder="Sélectionner le volume"
            className={nativeSelectClass}
            helpText="Nombre de références produits à gérer."
          />
        )}

        <FieldSelect
          label="Sensibilité des données"
          value={wizard.dataSensitivity}
          onChange={(v) => applyPatch({ dataSensitivity: v as DataSensitivity })}
          options={sensitivityOptions}
          className={nativeSelectClass}
          helpText="Niveau de sensibilité des données à gérer."
        />

        <FieldSelect
          label="Scalabilité attendue"
          value={wizard.scalabilityLevel}
          onChange={(v) => applyPatch({ scalabilityLevel: v as ScalabilityLevel })}
          options={scalabilityOptions}
          className={nativeSelectClass}
          helpText="Capacité à gérer la croissance du projet."
        />
      </StepCard>

      {showBackendSection && (
        <StepCard
          title="Architecture App Custom"
          icon={Workflow}
          tone="bg-violet-500/10 text-violet-500"
          description="Séparez front et backend si l'app nécessite une API dédiée."
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
                tooltip="Activez si l'infra backend est auto‑hébergée ou avec contraintes fortes."
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
              options={hostingBaseOptions.map((opt) => ({
                value: opt.value,
                title: opt.label,
                description: opt.description,
              }))}
              value={hostingTarget}
              onChange={(value) => applyPatch({ hostingTarget: value })}
            />
            <InlineHint>
              Choisissez “À confirmer” si l’hébergement n’est pas décidé.
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
                className={nativeSelectClass}
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
              className={nativeSelectClass}
              helpText="Infrastructure côté front (app ou site public)."
            />
          </div>
        )}
      </StepCard>

      <StepCard
        title="Proposition technique"
        icon={Layers}
        tone="bg-indigo-500/10 text-indigo-500"
        description="Famille et implémentation proposées selon les contraintes."
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
            La famille est proposée automatiquement selon vos contraintes. Vous pouvez la modifier si besoin.
          </InlineHint>
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
            Aucune implémentation supportée pour cette famille. Essayez “Voir tous” ou changez de famille.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {viewModel.implementationOptions.map((impl) => (
              <button
                key={impl.value}
                type="button"
                onClick={() => applyPatch({ projectImplementation: impl.value })}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                  wizard.projectImplementation === impl.value
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
                  Headless requis : choisissez le front associé.
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
                {activeImplementation.label ??
                  PROJECT_IMPLEMENTATION_LABELS[activeImplementation.value]}
              </span>
            </p>
            {activeFront && (
              <p className="mt-1">
                Front :{" "}
                <span className="font-medium text-foreground">
                  {activeFront.label ?? PROJECT_FRONTEND_IMPLEMENTATION_LABELS[activeFront.value]}
                </span>
              </p>
            )}
            <p className="mt-1 text-[11px] text-muted-foreground">
              Hébergement :{" "}
              {hostingSelectionMode === "NONE"
                ? "Géré par le provider"
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
