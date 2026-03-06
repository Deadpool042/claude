import { useWizard } from "./use-wizard";

export function useWizardNavigation() {
  const { step, setStep, next, prev, canGoNext, nextReasons } = useWizard();

  return {
    step,
    setStep,
    next,
    prev,
    canGoNext,
    nextReasons,
  };
}
