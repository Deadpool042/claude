"use client";

import { SummaryBudgetCard } from "./summary/SummaryBudgetCard";
import { SummaryDecisionCard } from "./summary/SummaryDecisionCard";
import { SummaryImplementationCard } from "./summary/SummaryImplementationCard";
import { SummaryModulesCard } from "./summary/SummaryModulesCard";

interface StepSummaryProps {
  showProjectIdentity?: boolean;
}

export function StepSummary({ showProjectIdentity = true }: StepSummaryProps) {
  return (
    <div className="space-y-4">
      <SummaryDecisionCard showProjectIdentity={showProjectIdentity} />
      <SummaryImplementationCard />
      <SummaryBudgetCard />
      <SummaryModulesCard />
    </div>
  );
}
