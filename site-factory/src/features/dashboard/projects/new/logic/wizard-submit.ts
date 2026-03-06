import { useActionState } from "react";
import { createProjectAction } from "@/features/dashboard/projects/server-actions";
import { defaultHostingProviderForDeployTarget } from "@/lib/hosting";
import type { FormFields, WizardQueryPrefill } from "./wizard-types";

export function createInitialWizardFormFields(
  queryPrefill: Pick<
    WizardQueryPrefill,
    | "defaultClientId"
    | "prefillName"
    | "prefillDescription"
    | "prefillDomain"
    | "prefillPort"
    | "prefillGitRepo"
  >,
): FormFields {
  return {
    name: queryPrefill.prefillName,
    clientId: queryPrefill.defaultClientId,
    description: queryPrefill.prefillDescription,
    domain: queryPrefill.prefillDomain,
    port: queryPrefill.prefillPort,
    gitRepo: queryPrefill.prefillGitRepo,
    hostingProviderId: defaultHostingProviderForDeployTarget("DOCKER"),
  };
}

export function useWizardSubmitAction() {
  const [state, formAction, isPending] = useActionState(createProjectAction, {
    error: null as string | null,
  });

  return {
    formAction,
    isPending,
    actionError: state.error,
  };
}
