"use client";

import { useState } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Tip } from "@/shared/components/Tip";
import { SectionTitle } from "@/shared/components/SectionTitle";
import type { JsonValue, SpecRendererProps, ConstraintDef } from "../../logic/spec-types";
import { LABELS } from "../../logic/spec-labels";
import { useDeepUpdate } from "../../hooks/useDeepUpdate";

import { ConstraintSection } from "./decision-rules/ConstraintSection";
import { EconomicRulesSection } from "./decision-rules/EconomicRulesSection";
import { ComplexitySection } from "./decision-rules/ComplexitySection";
import { InvariantsSection } from "./decision-rules/InvariantsSection";
import { BackendFamiliesSection } from "./decision-rules/BackendFamiliesSection";

// ── Main renderer ──

export function DecisionRulesRenderer({
  value,
  onChange,
}: SpecRendererProps) {
  const [activeSection, setActiveSection] = useState<string>("complexity");
  const root = value as Record<string, JsonValue>;
  const handleUpdate = useDeepUpdate(root, onChange);

  const constraints = root.constraints as unknown as
    | Record<string, ConstraintDef>
    | undefined;
  const economicRules = root.economicRules as
    | Record<string, JsonValue>
    | undefined;
  const complexityIndex = root.complexityIndex as
    | Record<string, JsonValue>
    | undefined;
  const invariants = root.invariants as
    | Record<string, JsonValue>
    | undefined;
  const backendFamilies = root.backendFamilies as
    | Record<string, Record<string, JsonValue>>
    | undefined;

  const constraintCount = constraints ? Object.keys(constraints).length : 0;
  const invariantCount = invariants ? Object.keys(invariants).length : 0;
  const backendCount = backendFamilies ? Object.keys(backendFamilies).length : 0;

  const L = LABELS.decision;

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Section tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="h-8 w-full justify-start overflow-x-auto">
            {complexityIndex && (
              <TabsTrigger value="complexity" className="text-xs h-7 px-3">
                {L.tabs.complexity}
              </TabsTrigger>
            )}
            {economicRules && (
              <TabsTrigger value="economics" className="text-xs h-7 px-3">
                {L.tabs.economics}
              </TabsTrigger>
            )}
            {constraints && (
              <TabsTrigger value="constraints" className="text-xs h-7 px-3">
                {L.tabs.constraints}
                <Badge variant="outline" className="ml-1.5 text-[9px] h-4 px-1">
                  {constraintCount}
                </Badge>
              </TabsTrigger>
            )}
            {invariants && (
              <TabsTrigger value="invariants" className="text-xs h-7 px-3">
                {L.tabs.invariants}
                <Badge variant="outline" className="ml-1.5 text-[9px] h-4 px-1">
                  {invariantCount}
                </Badge>
              </TabsTrigger>
            )}
            {(backendFamilies || typeof root.backendOpsHeavyCoefficient === "number") && (
              <TabsTrigger value="backend" className="text-xs h-7 px-3">
                {L.tabs.backend}
                <Badge variant="outline" className="ml-1.5 text-[9px] h-4 px-1">
                  {backendCount}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        {/* Complexity Index */}
        {activeSection === "complexity" && complexityIndex && (
          <section>
            <SectionTitle title={L.complexity.title} tooltip={L.complexity.hint} />
            <ComplexitySection
              ci={complexityIndex}
              path={["complexityIndex"]}
              onUpdate={handleUpdate}
            />
          </section>
        )}

        {/* Economic rules */}
        {activeSection === "economics" && economicRules && (
          <section>
            <SectionTitle title={L.economics.title} tooltip={L.economics.hint} />
            <EconomicRulesSection
              rules={economicRules}
              path={["economicRules"]}
              onUpdate={handleUpdate}
            />
          </section>
        )}

        {/* Constraints */}
        {activeSection === "constraints" && constraints && (
          <section>
            <SectionTitle title={L.constraints.title} tooltip={L.constraints.hint} />
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(constraints).map(([name, def]) => (
                <ConstraintSection
                  key={name}
                  name={name}
                  constraint={def as ConstraintDef}
                  path={["constraints", name]}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          </section>
        )}

        {/* Invariants */}
        {activeSection === "invariants" && invariants && (
          <section>
            <SectionTitle title={L.invariants.title} tooltip={L.invariants.hint} />
            <InvariantsSection
              invariants={invariants}
              path={["invariants"]}
              onUpdate={handleUpdate}
            />
          </section>
        )}

        {/* Backend families */}
        {activeSection === "backend" && (
          <section>
            <SectionTitle title={L.backend.title} tooltip={L.backend.hint} />
            {backendFamilies && (
              <BackendFamiliesSection
                families={backendFamilies}
                path={["backendFamilies"]}
                onUpdate={handleUpdate}
              />
            )}
            {typeof root.backendOpsHeavyCoefficient === "number" && (
              <Card className="border-border/40 mt-3">
                <CardContent className="p-3 flex items-center gap-3">
                  <Tip content={L.backend.opsHeavyHint}>
                    <Label className="text-xs text-muted-foreground cursor-help">
                      {L.backend.opsHeavy}
                    </Label>
                  </Tip>
                  <Input
                    type="number"
                    value={root.backendOpsHeavyCoefficient as number}
                    onChange={(e) =>
                      handleUpdate(
                        ["backendOpsHeavyCoefficient"],
                        Number(e.target.value),
                      )
                    }
                    className="h-7 w-20 text-xs font-mono"
                    step={0.01}
                  />
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </div>
    </TooltipProvider>
  );
}
