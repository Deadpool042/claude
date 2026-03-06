"use client";

import { createContext, useContext } from "react";
import type { WizardContextType } from "./wizard-types";

export const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard(): WizardContextType {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}
