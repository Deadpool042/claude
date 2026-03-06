import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { InlineHint } from "@/shared/components/InlineHint";
import { BudgetBreakdown } from "@/features/dashboard/projects/components/budget-breakdown";
import { estimateQuoteFromSpec, type QuoteEstimate } from "@/lib/referential";
import type { Category as SpecCategory } from "@/lib/referential/spec/types";
import { useWizard } from "../../logic/WizardProvider";
import { formatSummaryRange } from "./summary-helpers";

function toSpecCategory(category: string | null): SpecCategory | null {
  const values: SpecCategory[] = ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"];
  return category && values.includes(category as SpecCategory)
    ? (category as SpecCategory)
    : null;
}

export function SummaryModulesCard() {
  const {
    projectType,
    qualificationProjectType,
    techStack,
    wpHeadless,
    selectedModules,
    qualification,
  } = useWizard();

  if (!projectType) {
    return null;
  }

  if (!qualification || !techStack) {
    return (
      <InlineHint className="rounded-lg border-dashed">
        Qualification indisponible pour cette implémentation. Les budgets et modules détaillés ne sont pas calculés.
      </InlineHint>
    );
  }

  const category = toSpecCategory(qualification.finalCategory);
  const estimate = category
    ? (() => {
        try {
          return estimateQuoteFromSpec({
            category,
            moduleIds: Array.from(selectedModules),
          });
        } catch {
          return null;
        }
      })()
    : null;
  const estimateModuleById = new Map<string, QuoteEstimate["modules"][number]>(
    (estimate?.modules ?? []).map((item) => [item.id, item]),
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Modules retenus</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {qualification.modules.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Modules ({String(qualification.modules.length)})
            </p>
            <div className="space-y-1.5">
              {qualification.modules.map((moduleItem) => {
                const moduleEstimate = estimateModuleById.get(moduleItem.id);
                const setupLabel = moduleEstimate
                  ? formatSummaryRange(moduleEstimate.setup.min, moduleEstimate.setup.max)
                  : "—";

                return (
                  <div
                    key={moduleItem.id}
                    className="flex flex-col gap-0.5 rounded-md border p-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{moduleItem.name}</span>
                      <span className="font-medium">{setupLabel}</span>
                    </div>
                    {moduleEstimate?.monthly ? (
                      <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                        <span>↳ Récurrent</span>
                        <span>
                          {formatSummaryRange(
                            moduleEstimate.monthly.min,
                            moduleEstimate.monthly.max,
                            "/mois",
                          )}
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <InlineHint>Aucun module additionnel retenu sur cette configuration.</InlineHint>
        )}

        <BudgetBreakdown
          budget={qualification.budget}
          moduleCount={selectedModules.size}
          projectType={qualificationProjectType ?? projectType}
          techStack={techStack}
          wpHeadless={Boolean(wpHeadless && techStack === "WORDPRESS")}
          variant="full"
        />
      </CardContent>
    </Card>
  );
}
