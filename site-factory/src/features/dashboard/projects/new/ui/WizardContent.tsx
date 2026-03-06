"use client";

import { useWizard } from "../logic/WizardProvider";
import { StepQuestionnaire } from "./step-questionnaire";
import { StepRecommendation } from "./step-recommendation";
import { StepTypeStack } from "./step-type-stack";
import { StepModules } from "./step-modules";
import { StepProjectSynthesis } from "./step-project-synthesis";
import { WizardNav } from "./wizard-nav";

export function WizardContent() {
	const { step } = useWizard();

	return (
		<div>
			{step === 0 && <StepQuestionnaire />}
			{step === 1 && <StepRecommendation />}
			{step === 2 && <StepTypeStack />}
			{step === 3 && <StepModules />}
			{step === 4 && <StepProjectSynthesis />}

			<WizardNav />
		</div>
	);
}
