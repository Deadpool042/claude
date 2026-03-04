// src/app/dashboard/projects/new/_components/step-questionnaire.tsx
"use client";

import { InlineHint } from "@/components/shared/InlineHint";
import { StepCard } from "@/components/shared/StepCard";
import { ClipboardList } from "lucide-react";
import { useWizard } from "../logic/WizardProvider";
import { ContextSection } from "./questionnaire/context-section";
import { DiscoverySection } from "./questionnaire/discovery-section";
import { EditorialSection } from "./questionnaire/editorial-section";

export function StepQuestionnaire() {
  const {
    projectType,
    changeProjectType,
    needsEditing,
    setNeedsEditing,
    editingMode,
    setEditingMode,
    editingFrequency,
    setEditingFrequency,
    editorialPushOwner,
    setEditorialPushOwner,
    includeOnboardingPack,
    setIncludeOnboardingPack,
    includeMonthlyEditorialValidation,
    setIncludeMonthlyEditorialValidation,
    includeUnblockInterventions,
    setIncludeUnblockInterventions,
    clientAccessPolicy,
    setClientAccessPolicy,
    budgetBand,
    setBudgetBand,
    manualBudgetMax,
    setManualBudgetMax,
    budgetBandEffective,
    clientKnowledge,
    setClientKnowledge,
    primaryGoal,
    setPrimaryGoal,
    ambitionLevel,
    setAmbitionLevel,
    targetTimeline,
    setTargetTimeline,
    commerceModel,
    setCommerceModel,
    productCount,
    setProductCount,
    trafficLevel,
    setTrafficLevel,
    dataSensitivity,
    setDataSensitivity,
    scalabilityLevel,
    setScalabilityLevel,
  } = useWizard();

  const canAskBudget = Boolean(projectType);
  const canAskKnowledge = canAskBudget && budgetBandEffective !== "TO_CONFIRM";
  const canAskGoal = canAskKnowledge && clientKnowledge !== "TO_CONFIRM";
  const canAskAmbition = canAskGoal && primaryGoal !== "TO_CONFIRM";
  const canAskTimeline = canAskAmbition && ambitionLevel !== "TO_CONFIRM";

  let questionIndex = 1;
  const qType = questionIndex++;
  const qBudget = canAskBudget ? questionIndex++ : null;
  const qKnowledge = canAskKnowledge ? questionIndex++ : null;
  const qGoal = canAskGoal ? questionIndex++ : null;
  const qAmbition = canAskAmbition ? questionIndex++ : null;
  const qTimeline = canAskTimeline ? questionIndex++ : null;
  const qNeedsEditing = questionIndex++;
  const qEditingMode = needsEditing ? questionIndex++ : null;
  const qEditingFrequency = needsEditing ? questionIndex++ : null;
  const qEditorialOwner = needsEditing && editingMode === "GIT_MDX" ? questionIndex++ : null;
  const qClientAccess =
    needsEditing && editingMode === "GIT_MDX" && editorialPushOwner === "CLIENT"
      ? questionIndex++
      : null;
  const qCommerceModel = projectType === "ECOM" ? questionIndex++ : null;
  const qProductCount = projectType === "ECOM" ? questionIndex++ : null;

  return (
    <div className="space-y-4">
      <StepCard
        title="Questionnaire client ↔ agence"
        icon={ClipboardList}
        tone="bg-primary/10 text-primary"
        description="Qualification des besoins avant proposition technique."
      >
        <div className="space-y-6">
          <InlineHint>
            Format conversationnel client/agence : réponses métier en priorité, traduction technique ensuite.
          </InlineHint>
          <InlineHint>
            Le cadrage technique et les modules sont pré-remplis automatiquement à partir de ces réponses, avec ajustements possibles à l’étape suivante.
          </InlineHint>

          <DiscoverySection
            projectType={projectType}
            changeProjectType={changeProjectType}
            budgetBand={budgetBand}
            setBudgetBand={setBudgetBand}
            manualBudgetMax={manualBudgetMax}
            setManualBudgetMax={setManualBudgetMax}
            budgetBandEffective={budgetBandEffective}
            clientKnowledge={clientKnowledge}
            setClientKnowledge={setClientKnowledge}
            primaryGoal={primaryGoal}
            setPrimaryGoal={setPrimaryGoal}
            ambitionLevel={ambitionLevel}
            setAmbitionLevel={setAmbitionLevel}
            targetTimeline={targetTimeline}
            setTargetTimeline={setTargetTimeline}
            commerceModel={commerceModel}
            trafficLevel={trafficLevel}
            dataSensitivity={dataSensitivity}
            scalabilityLevel={scalabilityLevel}
            needsEditing={needsEditing}
            editingMode={editingMode}
            editorialPushOwner={editorialPushOwner}
            qType={qType}
            qBudget={qBudget}
            qKnowledge={qKnowledge}
            qGoal={qGoal}
            qAmbition={qAmbition}
            qTimeline={qTimeline}
          />

          <EditorialSection
            projectType={projectType}
            needsEditing={needsEditing}
            setNeedsEditing={setNeedsEditing}
            editingMode={editingMode}
            setEditingMode={setEditingMode}
            editingFrequency={editingFrequency}
            setEditingFrequency={setEditingFrequency}
            editorialPushOwner={editorialPushOwner}
            setEditorialPushOwner={setEditorialPushOwner}
            clientAccessPolicy={clientAccessPolicy}
            setClientAccessPolicy={setClientAccessPolicy}
            includeOnboardingPack={includeOnboardingPack}
            setIncludeOnboardingPack={setIncludeOnboardingPack}
            includeMonthlyEditorialValidation={includeMonthlyEditorialValidation}
            setIncludeMonthlyEditorialValidation={setIncludeMonthlyEditorialValidation}
            includeUnblockInterventions={includeUnblockInterventions}
            setIncludeUnblockInterventions={setIncludeUnblockInterventions}
            qNeedsEditing={qNeedsEditing}
            qEditingMode={qEditingMode}
            qEditingFrequency={qEditingFrequency}
            qEditorialOwner={qEditorialOwner}
            qClientAccess={qClientAccess}
          />

          <ContextSection
            projectType={projectType}
            commerceModel={commerceModel}
            setCommerceModel={setCommerceModel}
            productCount={productCount}
            setProductCount={setProductCount}
            trafficLevel={trafficLevel}
            setTrafficLevel={setTrafficLevel}
            dataSensitivity={dataSensitivity}
            setDataSensitivity={setDataSensitivity}
            scalabilityLevel={scalabilityLevel}
            setScalabilityLevel={setScalabilityLevel}
            qCommerceModel={qCommerceModel}
            qProductCount={qProductCount}
          />
        </div>
      </StepCard>
    </div>
  );
}
