import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  createWizardModuleStates,
  createWizardFeatureStates,
  createWizardProviderStates,
  getDefaultWizardModuleState,
  getDefaultWizardFeatureState,
  getDefaultWizardProviderState,
  type WizardItemStatus,
  type WizardModuleKey,
  type WizardModuleStates,
  type WizardModuleConfig,
  type WizardFeatureKey,
  type WizardFeatureStates,
  type WizardFeatureConfig,
  type WizardProviderKey,
  type WizardProviderStates,
  type WizardProviderConfig,
  type WizardProviderKind,
} from "./wizard-capabilities";

export interface WizardCapabilitiesState {
  wizardModules: WizardModuleStates;
  setWizardModules: Dispatch<SetStateAction<WizardModuleStates>>;
  enableWizardModule: (key: WizardModuleKey) => void;
  disableWizardModule: (key: WizardModuleKey) => void;
  configureWizardModule: (key: WizardModuleKey, config: WizardModuleConfig) => void;
  wizardFeatures: WizardFeatureStates;
  setWizardFeatures: Dispatch<SetStateAction<WizardFeatureStates>>;
  setWizardFeatureStatus: (key: WizardFeatureKey, status: WizardItemStatus) => void;
  configureWizardFeature: (key: WizardFeatureKey, config: WizardFeatureConfig) => void;
  wizardProviders: WizardProviderStates;
  setWizardProviders: Dispatch<SetStateAction<WizardProviderStates>>;
  setWizardProviderStatus: (
    key: WizardProviderKey,
    status: WizardItemStatus,
    kind?: WizardProviderKind,
  ) => void;
  configureWizardProvider: (
    key: WizardProviderKey,
    config: WizardProviderConfig,
    kind?: WizardProviderKind,
  ) => void;
  resetWizardCapabilities: () => void;
}

export function useWizardCapabilitiesState(): WizardCapabilitiesState {
  const [wizardModules, setWizardModules] = useState<WizardModuleStates>(() =>
    createWizardModuleStates(),
  );
  const [wizardFeatures, setWizardFeatures] = useState<WizardFeatureStates>(() =>
    createWizardFeatureStates(),
  );
  const [wizardProviders, setWizardProviders] = useState<WizardProviderStates>(
    () => createWizardProviderStates(),
  );

  const updateWizardModule = useCallback(
    (
      key: WizardModuleKey,
      updater: (
        current: WizardModuleStates[WizardModuleKey],
      ) => WizardModuleStates[WizardModuleKey],
    ) => {
      setWizardModules((prev) => {
        const current = prev[key] ?? getDefaultWizardModuleState();
        return { ...prev, [key]: updater(current) };
      });
    },
    [],
  );

  const enableWizardModule = useCallback(
    (key: WizardModuleKey) => {
      updateWizardModule(key, (current) => ({ ...current, status: "enabled" }));
    },
    [updateWizardModule],
  );

  const disableWizardModule = useCallback((key: WizardModuleKey) => {
    setWizardModules((prev) => ({ ...prev, [key]: getDefaultWizardModuleState() }));
  }, []);

  const configureWizardModule = useCallback(
    (key: WizardModuleKey, config: WizardModuleConfig) => {
      updateWizardModule(key, (current) => ({
        ...current,
        status: "configured",
        config,
      }));
    },
    [updateWizardModule],
  );

  const updateWizardFeature = useCallback(
    (
      key: WizardFeatureKey,
      updater: (
        current: WizardFeatureStates[WizardFeatureKey],
      ) => WizardFeatureStates[WizardFeatureKey],
    ) => {
      setWizardFeatures((prev) => {
        const current = prev[key] ?? getDefaultWizardFeatureState();
        return { ...prev, [key]: updater(current) };
      });
    },
    [],
  );

  const setWizardFeatureStatus = useCallback(
    (key: WizardFeatureKey, status: WizardItemStatus) => {
      if (status === "disabled") {
        setWizardFeatures((prev) => ({
          ...prev,
          [key]: getDefaultWizardFeatureState(),
        }));
        return;
      }
      updateWizardFeature(key, (current) => ({ ...current, status }));
    },
    [updateWizardFeature],
  );

  const configureWizardFeature = useCallback(
    (key: WizardFeatureKey, config: WizardFeatureConfig) => {
      updateWizardFeature(key, (current) => ({
        ...current,
        status: "configured",
        config,
      }));
    },
    [updateWizardFeature],
  );

  const updateWizardProvider = useCallback(
    (
      key: WizardProviderKey,
      updater: (
        current: WizardProviderStates[WizardProviderKey],
      ) => WizardProviderStates[WizardProviderKey],
      kind?: WizardProviderKind,
    ) => {
      setWizardProviders((prev) => {
        const current = prev[key] ?? getDefaultWizardProviderState(kind);
        return { ...prev, [key]: updater(current) };
      });
    },
    [],
  );

  const setWizardProviderStatus = useCallback(
    (key: WizardProviderKey, status: WizardItemStatus, kind?: WizardProviderKind) => {
      if (status === "disabled") {
        setWizardProviders((prev) => ({
          ...prev,
          [key]: getDefaultWizardProviderState(kind),
        }));
        return;
      }
      updateWizardProvider(
        key,
        (current) => ({
          ...current,
          status,
          kind: kind ?? current.kind,
        }),
        kind,
      );
    },
    [updateWizardProvider],
  );

  const configureWizardProvider = useCallback(
    (key: WizardProviderKey, config: WizardProviderConfig, kind?: WizardProviderKind) => {
      updateWizardProvider(
        key,
        (current) => ({
          ...current,
          status: "configured",
          config,
          kind: kind ?? current.kind,
        }),
        kind,
      );
    },
    [updateWizardProvider],
  );

  const resetWizardCapabilities = useCallback(() => {
    setWizardModules(createWizardModuleStates());
    setWizardFeatures(createWizardFeatureStates());
    setWizardProviders(createWizardProviderStates());
  }, []);

  return {
    wizardModules,
    setWizardModules,
    enableWizardModule,
    disableWizardModule,
    configureWizardModule,
    wizardFeatures,
    setWizardFeatures,
    setWizardFeatureStatus,
    configureWizardFeature,
    wizardProviders,
    setWizardProviders,
    setWizardProviderStatus,
    configureWizardProvider,
    resetWizardCapabilities,
  };
}
