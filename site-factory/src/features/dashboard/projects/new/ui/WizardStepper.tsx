"use client";

import { Check, ChevronRight } from "lucide-react";
import { WIZARD_STEPS } from "@/lib/wizard-domain";
import { useWizard } from "../logic/WizardProvider";

export function WizardStepper() {
	const { step, setStep } = useWizard();

	return (
		<nav className="mb-8 overflow-x-auto">
			<div className="mx-auto flex min-w-max items-center justify-start gap-1 px-1 md:justify-center">
			{WIZARD_STEPS.map((s, i) => {
				const isActive = step === i;
				const isDone = step > i;
				const isClickable = isDone;
				return (
					<div key={s.id} className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => {
								if (isClickable) setStep(i);
							}}
							disabled={!isClickable}
							aria-current={isActive ? "step" : undefined}
							className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
								isActive
									? "border-primary/50 bg-primary text-primary-foreground shadow-sm"
									: isDone
										? "cursor-pointer border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"
										: "cursor-default border-border bg-muted text-muted-foreground"
							}`}
						>
							<span
								className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
									isDone
										? "bg-primary text-primary-foreground"
										: isActive
											? "bg-primary-foreground/20"
											: "bg-muted-foreground/20"
								}`}
							>
								{isDone ? <Check className="size-3" /> : i + 1}
							</span>
							<span className="sm:hidden">{s.short}</span>
							<span className="hidden sm:inline">{s.label}</span>
						</button>
						{i < WIZARD_STEPS.length - 1 && (
							<ChevronRight className="size-4 text-muted-foreground/40" />
						)}
					</div>
				);
			})}
			</div>
		</nav>
	);
}
