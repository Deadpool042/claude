"use client";

import { useCallback, useState } from "react";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type {
  JsonValue,
  SpecRendererProps,
  PriceBand,
  MaintenancePlan,
  DeployFee,
  HostingCost,
  SaasCost,
} from "../../logic/spec-types";
import {
  COMMERCIAL_SECTIONS,
  COMMERCIAL_SECTION_LABELS,
  COMMERCIAL_SECTION_ICONS,
} from "../../logic/spec-constants";
import { LABELS } from "../../logic/spec-labels";
import { AnnexCostsSection } from "./commercial/AnnexCostsSection";
import { CommercialRulesSection } from "./commercial/CommercialRulesSection";
import { DeployCard } from "./commercial/DeployCard";
import { HostingRow } from "./commercial/HostingRow";
import { MaintenanceCard } from "./commercial/MaintenanceCard";
import { PriceBandRow } from "./commercial/PriceBandRow";
import { SaasCostsSection } from "./commercial/SaasCostsSection";
import { StackDeployCompatSection } from "./commercial/StackDeployCompatSection";

export function CommercialRenderer({ value, onChange }: SpecRendererProps) {
  const [activeTab, setActiveTab] = useState<string>("basePackageBandsByCategory");

  const root = value as Record<string, JsonValue>;

  const bands = root.basePackageBandsByCategory as Record<string, PriceBand> | undefined;
  const maintenance = root.maintenanceByCategory as Record<string, MaintenancePlan> | undefined;
  const deploy = root.deployFees as Record<string, DeployFee> | undefined;
  const hosting = root.hostingCosts as Record<string, HostingCost> | undefined;
  const saas = root.saasCosts as Record<string, SaasCost> | undefined;
  const compat = root.stackDeployCompat as Record<string, string[]> | undefined;
  const annex = root.annexCosts as Record<string, JsonValue> | undefined;
  const rules = root.rules as Record<string, JsonValue> | undefined;

  const bandKeys = bands ? Object.keys(bands) : [];
  const totalSetupMin = bandKeys.reduce(
    (sum, key) => sum + (bands?.[key]?.from ?? 0),
    0,
  );
  const totalSetupMax = bandKeys.reduce(
    (sum, key) => sum + (bands?.[key]?.to ?? 0),
    0,
  );
  const totalMaintMin = maintenance
    ? Object.values(maintenance).reduce(
      (sum, plan) => sum + (plan?.monthly ?? 0),
      0,
    )
    : 0;

  const activeSections = COMMERCIAL_SECTIONS.filter((section) => root[section] != null);
  const commercialLabels = LABELS.commercial;

  const updateSection = useCallback(
    (section: string, key: string, field: string, sectionValue: JsonValue) => {
      const sectionData = { ...(root[section] as Record<string, JsonValue>) };
      const entry = { ...(sectionData[key] as Record<string, JsonValue>) };
      entry[field] = sectionValue;
      sectionData[key] = entry;
      onChange({ ...root, [section]: sectionData });
    },
    [root, onChange],
  );

  const updateRuleField = useCallback(
    (key: string, ruleValue: JsonValue) => {
      const nextRules = { ...(root.rules as Record<string, JsonValue>) };
      nextRules[key] = ruleValue;
      onChange({ ...root, rules: nextRules });
    },
    [root, onChange],
  );

  const updateAnnexField = useCallback(
    (key: string, annexValue: JsonValue) => {
      const nextAnnex = { ...(root.annexCosts as Record<string, JsonValue>) };
      nextAnnex[key] = annexValue;
      onChange({ ...root, annexCosts: nextAnnex });
    },
    [root, onChange],
  );

  const updateCompatTargets = useCallback(
    (stack: string, targets: string[]) => {
      onChange({
        ...root,
        stackDeployCompat: {
          ...(root.stackDeployCompat as Record<string, JsonValue>),
          [stack]: targets,
        },
      });
    },
    [root, onChange],
  );

  const removeCompatStack = useCallback(
    (stack: string) => {
      const nextCompat = { ...(root.stackDeployCompat as Record<string, JsonValue>) };
      delete nextCompat[stack];
      onChange({ ...root, stackDeployCompat: nextCompat });
    },
    [root, onChange],
  );

  const addCompatStack = useCallback(
    (stack: string) => {
      onChange({
        ...root,
        stackDeployCompat: {
          ...(root.stackDeployCompat as Record<string, JsonValue>),
          [stack]: [],
        },
      });
    },
    [root, onChange],
  );

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8 w-full justify-start overflow-x-auto">
            {activeSections.map((section) => (
              <TabsTrigger key={section} value={section} className="h-7 gap-1 px-2.5 text-xs">
                <span>{COMMERCIAL_SECTION_ICONS[section]}</span>
                <span className="hidden sm:inline">
                  {COMMERCIAL_SECTION_LABELS[section]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-3 rounded-md bg-muted/30 px-3 py-2 text-[11px]">
          <span className="font-medium text-muted-foreground">
            {COMMERCIAL_SECTION_LABELS[activeTab]}
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span className="text-muted-foreground">
            Setup :
            {" "}
            <span className="font-mono text-emerald-400">{totalSetupMin}€</span>
            <span className="mx-0.5">→</span>
            <span className="font-mono text-amber-400">{totalSetupMax}€</span>
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span className="text-muted-foreground">
            Maintenance totale :
            {" "}
            <span className="font-mono text-sky-400">
              {totalMaintMin} {commercialLabels.perMonth}
            </span>
          </span>
        </div>

        {activeTab === "basePackageBandsByCategory" && bands && (
          <div className="grid gap-2">
            {Object.entries(bands).map(([categoryKey, band]) => (
              <PriceBandRow
                key={categoryKey}
                catKey={categoryKey}
                band={band}
                onUpdate={(field, fieldValue) =>
                  updateSection(
                    "basePackageBandsByCategory",
                    categoryKey,
                    field,
                    fieldValue,
                  )
                }
              />
            ))}
          </div>
        )}

        {activeTab === "maintenanceByCategory" && maintenance && (
          <div className="grid gap-2">
            {Object.entries(maintenance).map(([categoryKey, plan]) => (
              <MaintenanceCard
                key={categoryKey}
                catKey={categoryKey}
                plan={plan}
                onUpdate={(field, fieldValue) =>
                  updateSection("maintenanceByCategory", categoryKey, field, fieldValue)
                }
              />
            ))}
          </div>
        )}

        {activeTab === "deployFees" && deploy && (
          <div className="grid gap-2">
            {Object.entries(deploy).map(([deployKey, fee]) => (
              <DeployCard
                key={deployKey}
                fee={fee}
                onUpdate={(field, fieldValue) =>
                  updateSection("deployFees", deployKey, field, fieldValue)
                }
              />
            ))}
          </div>
        )}

        {activeTab === "hostingCosts" && hosting && (
          <div className="grid gap-2">
            {Object.entries(hosting).map(([hostingKey, entry]) => (
              <HostingRow
                key={hostingKey}
                entryKey={hostingKey}
                entry={entry}
                onUpdate={(field, fieldValue) =>
                  updateSection("hostingCosts", hostingKey, field, fieldValue)
                }
              />
            ))}
          </div>
        )}

        {activeTab === "saasCosts" && saas && (
          <SaasCostsSection
            saas={saas}
            onUpdate={(key, field, fieldValue) =>
              updateSection("saasCosts", key, field, fieldValue)
            }
          />
        )}

        {activeTab === "stackDeployCompat" && compat && (
          <StackDeployCompatSection
            compat={compat}
            onAddStack={addCompatStack}
            onRemoveStack={removeCompatStack}
            onUpdateTargets={updateCompatTargets}
          />
        )}

        {activeTab === "annexCosts" && annex && (
          <AnnexCostsSection annex={annex} onUpdateField={updateAnnexField} />
        )}

        {activeTab === "rules" && rules && (
          <CommercialRulesSection rules={rules} onUpdateField={updateRuleField} />
        )}

        <p className="text-[10px] text-muted-foreground/50">
          {commercialLabels.footer(activeSections.length)}
        </p>
      </div>
    </TooltipProvider>
  );
}
