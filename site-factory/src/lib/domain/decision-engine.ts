import type { CanonicalDecisionOutput, Category } from "@/lib/referential";
import type { CanonicalProjectInputDraft } from "./canonical-input";
import { buildCanonicalDecisionOutputFromDraft } from "./canonical-decision-mapping";

export interface DecisionEngineInput {
  canonicalInput: CanonicalProjectInputDraft;
  finalCategory: Category;
}

export function runDecisionEngine(
  input: DecisionEngineInput
): CanonicalDecisionOutput {
  return buildCanonicalDecisionOutputFromDraft({
    canonicalInput: input.canonicalInput,
    finalCategory: input.finalCategory
  });
}
