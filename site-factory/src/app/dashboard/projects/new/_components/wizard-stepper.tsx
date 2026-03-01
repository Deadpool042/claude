"use client";

import { useWizard } from "../_providers/wizard-provider";
import { WIZARD_STEPS } from "@/lib/qualification-ui";
import { Check, ChevronRight } from "lucide-react";

export function WizardStepper() {
  const { step, setStep } = useWizard();

  return (
    <nav className="mb-8 flex items-center justify-center gap-1">
      {WIZARD_STEPS.map((s, i) => {
        const isActive = step === i;
        const isDone = step > i;
        return (
          <div key={s.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (isDone) setStep(i);
              }}
              disabled={!isDone}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isDone
                    ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                    : "bg-muted text-muted-foreground cursor-default"
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
              {s.label}
            </button>
            {i < WIZARD_STEPS.length - 1 && (
              <ChevronRight className="size-4 text-muted-foreground/40" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
