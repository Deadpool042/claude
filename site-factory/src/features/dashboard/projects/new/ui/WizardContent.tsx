"use client";

import { useWizard } from "../logic/WizardProvider";
import { StepQuestionnaire } from "./step-questionnaire";
import { StepTypeStack } from "./step-type-stack";
import { StepModules } from "./step-modules";
import { StepProjectInfo } from "./step-project-info";
import { StepSummary } from "./step-summary";
import { WizardNav } from "./wizard-nav";

export function WizardContent() {
	const { step } = useWizard();

	return (
		<div>
			{step === 0 && <StepQuestionnaire />}
			{step === 1 && <StepTypeStack />}
			{step === 2 && <StepModules />}
			{step === 3 && <StepProjectInfo />}
			{step === 4 && <StepSummary />}

			<WizardNav />
		</div>
	);
}
