"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useWizard } from "@/features/dashboard/projects/new";
import { getDefaultWizardModuleState } from "@/features/dashboard/projects/new/logic/wizard-capabilities";
import {
  BOOKING_MODULE_ID,
  getBookingConfigIssues,
  isBookingConfigComplete,
  normalizeBookingConfig,
  type BookingConfig,
} from "../lib/booking-config";

export function useBookingModule() {
  const {
    selectedModules,
    toggleModule,
    wizardModules,
    setWizardModules,
  } = useWizard();

  const isEnabled = selectedModules.has(BOOKING_MODULE_ID);
  const moduleState = wizardModules.BOOKING ?? getDefaultWizardModuleState();
  const config = useMemo(
    () => normalizeBookingConfig(moduleState.config),
    [moduleState.config],
  );

  const setEnabled = useCallback(
    (nextEnabled: boolean) => {
      if (nextEnabled === isEnabled) return;
      toggleModule(BOOKING_MODULE_ID);
    },
    [isEnabled, toggleModule],
  );

  const setConfig = useCallback(
    (patch: Partial<BookingConfig>) => {
      setWizardModules((prev) => {
        const current = prev.BOOKING ?? getDefaultWizardModuleState();
        const currentConfig = normalizeBookingConfig(current.config);
        const nextConfig = normalizeBookingConfig({ ...currentConfig, ...patch });
        const status = isEnabled
          ? isBookingConfigComplete(nextConfig)
            ? "configured"
            : "enabled"
          : current.status;
        return {
          ...prev,
          BOOKING: {
            ...current,
            status,
            config: nextConfig,
          },
        };
      });
    },
    [isEnabled, setWizardModules],
  );

  useEffect(() => {
    if (isEnabled) return;
    setWizardModules((prev) => {
      const current = prev.BOOKING ?? getDefaultWizardModuleState();
      const isDefault =
        current.status === "disabled" &&
        Object.keys(current.config ?? {}).length === 0 &&
        current.featureIds.length === 0 &&
        current.providerIds.length === 0;
      if (isDefault) return prev;
      return { ...prev, BOOKING: getDefaultWizardModuleState() };
    });
  }, [isEnabled, setWizardModules]);

  const issues = useMemo(
    () => (isEnabled ? getBookingConfigIssues(config) : []),
    [config, isEnabled],
  );

  return {
    isEnabled,
    setEnabled,
    config,
    setConfig,
    issues,
    isValid: issues.length === 0,
  };
}
