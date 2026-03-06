"use client";

import { InlineHint } from "@/shared/components/InlineHint";
import { useWizard } from "../logic/WizardProvider";
import { buildWizardDecisionFlow } from "../logic/wizard-flow";
import { StepProjectInfo } from "./step-project-info";
import { StepSummary } from "./step-summary";
import { WizardDecisionFlowPanel } from "./wizard-decision-flow-panel";

export function StepProjectSynthesis() {
  const wizard = useWizard();
  const decisionFlowItems = buildWizardDecisionFlow({
    projectType: wizard.projectType,
    offerProjectType: wizard.offerProjectType,
    projectFamily: wizard.projectFamily,
    projectImplementation: wizard.projectImplementation,
    projectImplementationLabel: wizard.projectImplementationLabel,
    projectFrontendImplementation: wizard.projectFrontendImplementation,
    projectFrontendImplementationLabel: wizard.projectFrontendImplementationLabel,
    hostingSelectionMode: wizard.hostingSelectionMode,
    hostingTarget: wizard.hostingTarget,
    hostingTargetBack: wizard.hostingTargetBack,
    hostingTargetFront: wizard.hostingTargetFront,
    selectedModules: wizard.selectedModules,
    formFields: wizard.formFields,
    qualification: wizard.qualification,
    budgetBandEffective: wizard.budgetBandEffective,
    clientKnowledge: wizard.clientKnowledge,
    primaryGoal: wizard.primaryGoal,
    ambitionLevel: wizard.ambitionLevel,
    targetTimeline: wizard.targetTimeline,
    needsEditing: wizard.needsEditing,
    editingMode: wizard.editingMode,
    editingFrequency: wizard.editingFrequency,
    editorialPushOwner: wizard.editorialPushOwner,
    clientAccessPolicy: wizard.clientAccessPolicy,
    trafficLevel: wizard.trafficLevel,
    dataSensitivity: wizard.dataSensitivity,
    scalabilityLevel: wizard.scalabilityLevel,
    canonicalTaxonomyResolution: wizard.canonicalTaxonomyResolution,
  });

  return (
    <div className="space-y-4">
      <WizardDecisionFlowPanel
        currentStep={wizard.step}
        items={decisionFlowItems}
        description="Dernière lecture transverse du besoin, de la recommandation et des choix retenus avant création du projet."
      />
      <InlineHint>
        Dernière étape : renseigner les informations projet puis valider la recommandation finale avant création.
      </InlineHint>
      <StepProjectInfo />
      <StepSummary showProjectIdentity={false} />
    </div>
  );
}
