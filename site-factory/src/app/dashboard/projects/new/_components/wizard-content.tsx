//src/app/dashboard/projects/new/_components/wizard-content.tsx
"use client";

import { useWizard } from "../_providers/wizard-provider";
import { StepTypeStack } from "./step-type-stack";
import { StepModules } from "./step-modules";
import { StepProjectInfo } from "./step-project-info";
import { StepSummary } from "./step-summary";
import { WizardNav } from "./wizard-nav";

export function WizardContent() {
  const { step } = useWizard();

  return (
    <div>
      {step === 0 && <StepTypeStack />}
      {step === 1 && <StepModules />}
      {step === 2 && <StepProjectInfo />}
      {step === 3 && <StepSummary />}

      <WizardNav />
    </div>
  );
}
