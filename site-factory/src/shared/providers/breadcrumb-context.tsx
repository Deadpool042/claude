"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

type Overrides = Record<string, string>;

interface BreadcrumbContextValue {
  overrides: Overrides;
  setOverrides: (overrides: Overrides) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  overrides: {},
  setOverrides: () => {
    // noop
  },
});

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides>({});

  return (
    <BreadcrumbContext value={{ overrides, setOverrides }}>
      {children}
    </BreadcrumbContext>
  );
}

export function useBreadcrumbOverrides(): Overrides {
  return useContext(BreadcrumbContext).overrides;
}

/**
 * Drop-in component for Server Component pages.
 * Renders nothing visible — just pushes label overrides into the breadcrumb.
 *
 * Usage:
 *   <BreadcrumbOverride segments={{ [clientId]: client.name }} />
 */
export function BreadcrumbOverride({ segments }: { segments: Overrides }) {
  const { setOverrides } = useContext(BreadcrumbContext);

  const stableKey = Object.entries(segments)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const update = useCallback(() => {
    setOverrides(segments);
  }, [setOverrides, stableKey]);

  useEffect(() => {
    update();
    return () => { setOverrides({}); };
  }, [update, setOverrides]);

  return null;
}
