"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Tip } from "@/shared/components/Tip";
import { FieldSelect } from "@/shared/components/FieldSelect";
import type { JsonValue, PluginItem } from "../../../logic/spec-types";
import { LABELS } from "../../../logic/spec-labels";
import { PRICING_MODE_OPTIONS } from "./plugin-select-options";

interface PluginBasicsFieldsProps {
  plugin: PluginItem;
  onUpdate: (field: keyof PluginItem, value: JsonValue) => void;
}

export function PluginBasicsFields({
  plugin,
  onUpdate,
}: PluginBasicsFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-[120px_1fr] items-start gap-2">
        <Tip content="Description courte du plugin — affichée dans les devis et la documentation">
          <Label className="mt-1.5 cursor-help text-xs text-muted-foreground">
            Description
          </Label>
        </Tip>
        <textarea
          value={plugin.description ?? ""}
          onChange={(event) => onUpdate("description", event.target.value)}
          rows={2}
          className="min-h-8 resize-y rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
        <Tip content="Mode de facturation du plugin : gratuit, payant, ou mixte (freemium)">
          <Label className="cursor-help text-xs text-muted-foreground">
            {LABELS.plugins.pricingMode}
          </Label>
        </Tip>
        <FieldSelect
          value={plugin.pricingMode}
          onChange={(value) => onUpdate("pricingMode", value)}
          options={PRICING_MODE_OPTIONS}
          size="sm"
        />
      </div>

      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
        <Tip content="Notes sur la politique de facturation, affichées dans le devis">
          <Label className="cursor-help text-xs text-muted-foreground">
            {LABELS.plugins.billingNotes}
          </Label>
        </Tip>
        <Input
          value={plugin.billingNotes ?? ""}
          onChange={(event) => onUpdate("billingNotes", event.target.value || null)}
          className="h-7 text-xs"
          placeholder="Optionnel…"
        />
      </div>
    </>
  );
}
