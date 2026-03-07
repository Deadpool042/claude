//src/app/dashboard/projects/new/_components/wizard-nav.tsx
"use client";

import { useWizard } from "../logic/WizardProvider";
import { Button } from "@/shared/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  FolderPlus,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { resolveCmsIdFromImplementation, resolveFrontendStack } from "@/lib/project-choices";

export function WizardNav() {
  const {
    step,
    prev,
    next,
    canGoNext,
    nextReasons,
    isPending,
    actionError,
    formAction,
    formFields,
    projectType,
    taxonomySignal,
    techStack,
    deployTarget,
    isHeadless,
    wpHeadless,
    hostingTarget,
    hostingTargetBack,
    hostingTargetFront,
    needsEditing,
    editingFrequency,
    commerceModel,
    backendMode,
    backendFamily,
    backendOpsHeavy,
    headlessRequired,
    trafficLevel,
    productCount,
    dataSensitivity,
    scalabilityLevel,
    manualBudgetMax,
    projectFamily,
    projectImplementation,
    projectImplementationLabel,
    projectFrontendImplementation,
    projectFrontendImplementationLabel,
    selectedModules,
    catSelections,
    qualification,
  } = useWizard();

  const projectImplementationId = resolveCmsIdFromImplementation(
    projectImplementation,
    projectImplementationLabel,
  );

  return (
    <>
      {/* ── Error ────────────────────────────────── */}
      {actionError && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* ── Blockers ─────────────────────────────── */}
      {!canGoNext && nextReasons.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" />
            {step === 4
              ? "Éléments à compléter avant création"
              : "Éléments à compléter"}
          </div>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            {nextReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Navigation ───────────────────────────── */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prev}
          disabled={step === 0}
          className="gap-1.5"
        >
          <ArrowLeft className="size-4" />
          Précédent
        </Button>

        {step < 4 ? (
          <Button
            type="button"
            onClick={next}
            disabled={!canGoNext}
            className="gap-1.5"
          >
            Suivant
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <form action={formAction}>
            {/* Hidden fields for the server action */}
            <input type="hidden" name="name" value={formFields.name} />
            <input
              type="hidden"
              name="clientId"
              value={formFields.clientId}
            />
            <input
              type="hidden"
              name="type"
              value={projectType ?? "VITRINE"}
            />
            <input
              type="hidden"
              name="taxonomySignal"
              value={taxonomySignal ?? ""}
            />
            <input
              type="hidden"
              name="description"
              value={formFields.description}
            />
            <input type="hidden" name="domain" value={formFields.domain} />
            <input type="hidden" name="port" value={formFields.port} />
            <input
              type="hidden"
              name="gitRepo"
              value={formFields.gitRepo}
            />
            <input
              type="hidden"
              name="hostingProviderId"
              value={formFields.hostingProviderId}
            />
            <input type="hidden" name="techStack" value={techStack ?? ""} />
            <input
              type="hidden"
              name="deployTarget"
              value={deployTarget}
            />
            <input type="hidden" name="hostingTarget" value={hostingTarget} />
            <input
              type="hidden"
              name="hostingTargetBack"
              value={hostingTargetBack ?? ""}
            />
            <input
              type="hidden"
              name="hostingTargetFront"
              value={hostingTargetFront ?? ""}
            />
            <input
              type="hidden"
              name="needsEditing"
              value={needsEditing ? "true" : "false"}
            />
            <input
              type="hidden"
              name="editingFrequency"
              value={editingFrequency}
            />
            <input
              type="hidden"
              name="commerceModel"
              value={commerceModel}
            />
            <input
              type="hidden"
              name="backendMode"
              value={backendMode}
            />
            <input
              type="hidden"
              name="headlessRequired"
              value={headlessRequired ? "true" : "false"}
            />
            <input
              type="hidden"
              name="backendFamily"
              value={backendFamily ?? ""}
            />
            <input
              type="hidden"
              name="backendOpsHeavy"
              value={backendOpsHeavy ? "true" : "false"}
            />
            <input
              type="hidden"
              name="trafficLevel"
              value={trafficLevel}
            />
            <input
              type="hidden"
              name="productCount"
              value={productCount}
            />
            <input
              type="hidden"
              name="dataSensitivity"
              value={dataSensitivity}
            />
            <input
              type="hidden"
              name="scalabilityLevel"
              value={scalabilityLevel}
            />
            <input
              type="hidden"
              name="estimatedBudget"
              value={manualBudgetMax}
            />
            <input
              type="hidden"
              name="projectFamily"
              value={projectFamily ?? ""}
            />
            <input
              type="hidden"
              name="projectImplementation"
              value={projectImplementation ?? ""}
            />
            <input
              type="hidden"
              name="projectImplementationId"
              value={projectImplementationId ?? ""}
            />
            <input
              type="hidden"
              name="projectImplementationLabel"
              value={projectImplementationLabel}
            />
            <input
              type="hidden"
              name="projectFrontendImplementation"
              value={projectFrontendImplementation ?? ""}
            />
            <input
              type="hidden"
              name="projectFrontendImplementationLabel"
              value={projectFrontendImplementationLabel}
            />
            <input
              type="hidden"
              name="wpHeadless"
              value={wpHeadless ? "true" : "false"}
            />
            {isHeadless && (
              <input
                type="hidden"
                name="frontendStack"
                value={resolveFrontendStack(projectFrontendImplementation) ?? ""}
              />
            )}
            <input
              type="hidden"
              name="category"
              value={qualification?.finalCategory ?? ""}
            />
            <input
              type="hidden"
              name="modules"
              value={JSON.stringify(Array.from(selectedModules))}
            />
            <input
              type="hidden"
              name="catSelections"
              value={JSON.stringify(catSelections)}
            />
            <input
              type="hidden"
              name="maintenanceLevel"
              value={qualification?.maintenance ?? ""}
            />

            <Button
              type="submit"
              size="lg"
              className="gap-2"
              disabled={isPending || !canGoNext}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FolderPlus className="size-4" />
              )}
              {isPending ? "Création…" : "Créer le projet"}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
