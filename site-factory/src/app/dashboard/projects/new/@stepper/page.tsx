import { WizardStepper } from "@/features/dashboard/projects/new";

/**
 * Slot parallèle @stepper.
 * Server component qui délègue au composant client WizardStepper.
 */
export default function StepperSlot() {
  return <WizardStepper />;
}
