import { WizardStepper } from "../_components/wizard-stepper";

/**
 * Slot parallèle @stepper.
 * Server component qui délègue au composant client WizardStepper.
 */
export default function StepperSlot() {
  return <WizardStepper />;
}
