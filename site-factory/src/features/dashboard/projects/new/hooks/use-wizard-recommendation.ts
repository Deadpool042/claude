import { useWizard } from "./use-wizard";

export function useWizardRecommendation() {
  const {
    qualification,
    qualificationProjectType,
    offerProjectType,
    canonicalTaxonomyResolution,
  } = useWizard();

  return {
    qualification,
    qualificationProjectType,
    offerProjectType,
    canonicalTaxonomyResolution,
  };
}
