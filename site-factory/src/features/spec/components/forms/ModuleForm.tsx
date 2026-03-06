"use client";

import {
  FieldCheckbox,
  FieldNumber,
  FieldSelect,
  FieldTagList,
  FieldText,
  FieldTextarea,
  type SelectOption,
} from "@/shared/components/form";
import { LABELS } from "../../logic/spec-labels";
import { MODULE_FORM_CONFIG } from "../../lib/spec-form-config";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  MODULE_GROUPS,
  MODULE_GROUP_COLORS,
  MODULE_GROUP_LABELS,
} from "../../logic/spec-constants";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import type { JsonValue, ModuleItem } from "../../logic/spec-types";

const PRICING_MODE_OPTIONS: SelectOption[] = [
  { value: "FIXED", label: "FIXED" },
  { value: "RANGE", label: "RANGE" },
  { value: "QUOTE_REQUIRED", label: "QUOTE_REQUIRED" },
];

const GROUP_OPTIONS: SelectOption[] = MODULE_GROUPS.map((group) => ({
  value: group,
  label: MODULE_GROUP_LABELS[group] ?? group,
  render: () => (
    <Badge variant="outline" className={cn("text-[10px] mr-1", MODULE_GROUP_COLORS[group])}>
      {MODULE_GROUP_LABELS[group] ?? group}
    </Badge>
  ),
}));

const CATEGORY_OPTIONS: SelectOption[] = Object.keys(CATEGORY_LABELS).map((cat) => ({
  value: cat,
  label: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat,
  render: () => (
    <Badge
      variant="outline"
      className={cn("text-[10px] mr-1", CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS])}
    >
      {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
    </Badge>
  ),
}));

export function ModuleForm({
  module,
  onUpdate,
}: {
  module: ModuleItem;
  onUpdate: (field: keyof ModuleItem, value: JsonValue) => void;
}) {
  const details = module.details ?? [];
  const featureIds = module.featureIds ?? [];
  const fields = MODULE_FORM_CONFIG.fields;

  const updateNumber = (field: keyof ModuleItem) => (value: number | null) => {
    onUpdate(field, value ?? 0);
  };

  return (
    <div className="space-y-3">
      <FieldText
        label={LABELS.modules.label}
        value={module.label}
        onChange={(value) => onUpdate("label", value)}
        layout="inline"
        required={fields.label.required}
        inputClassName="h-7 text-xs"
      />

      <FieldTextarea
        label={LABELS.modules.description}
        value={module.description ?? ""}
        onChange={(value) => onUpdate("description", value)}
        layout="inline"
        rows={2}
        required={fields.description.required}
      />

      <FieldSelect
        label={LABELS.modules.group}
        value={module.group}
        onChange={(value) => onUpdate("group", value)}
        options={GROUP_OPTIONS}
        layout="inline"
        size="sm"
        required={fields.group.required}
      />

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <FieldSelect
          label={LABELS.modules.category}
          value={module.targetCategory}
          onChange={(value) => onUpdate("targetCategory", value)}
          options={CATEGORY_OPTIONS}
          size="sm"
          layout="stack"
          required={fields.targetCategory.required}
        />
        <FieldSelect
          label={LABELS.modules.minCategory}
          value={module.minCategory}
          onChange={(value) => onUpdate("minCategory", value)}
          options={CATEGORY_OPTIONS}
          size="sm"
          layout="stack"
          required={fields.minCategory.required}
        />
        <FieldSelect
          label={LABELS.modules.requalifiesTo}
          value={module.requalifiesTo}
          onChange={(value) => onUpdate("requalifiesTo", value)}
          options={CATEGORY_OPTIONS}
          size="sm"
          layout="stack"
          required={fields.requalifiesTo.required}
        />
      </div>

      <FieldTagList
        label={LABELS.modules.details}
        values={details}
        onChange={(value) => onUpdate("details", value)}
        layout="inline"
        required={fields.details.required}
      />

      <FieldTagList
        label={LABELS.modules.features}
        values={featureIds}
        onChange={(value) => onUpdate("featureIds", value)}
        layout="inline"
        required={fields.featureIds.required}
      />

      <FieldSelect
        label="Pricing mode"
        value={module.pricingMode}
        onChange={(value) => onUpdate("pricingMode", value)}
        options={PRICING_MODE_OPTIONS}
        layout="inline"
        size="sm"
        required={fields.pricingMode.required}
      />

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <FieldNumber
          label="Setup min"
          value={module.priceSetupMin}
          onChange={updateNumber("priceSetupMin")}
          layout="inline"
          required={fields.priceSetupMin.required}
        />
        <FieldNumber
          label="Setup max"
          value={module.priceSetupMax}
          onChange={updateNumber("priceSetupMax")}
          layout="inline"
          required={fields.priceSetupMax.required}
        />
        <FieldNumber
          label="Mensuel min"
          value={module.priceMonthlyMin}
          onChange={updateNumber("priceMonthlyMin")}
          layout="inline"
          required={fields.priceMonthlyMin.required}
        />
        <FieldNumber
          label="Mensuel max"
          value={module.priceMonthlyMax}
          onChange={updateNumber("priceMonthlyMax")}
          layout="inline"
          required={fields.priceMonthlyMax.required}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <FieldNumber
          label={LABELS.modules.jsMultiplier}
          value={module.jsMultiplier}
          onChange={updateNumber("jsMultiplier")}
          layout="inline"
          required={fields.jsMultiplier.required}
        />
        <FieldNumber
          label={LABELS.modules.splitSetup}
          value={module.splitPrestataireSetup}
          onChange={updateNumber("splitPrestataireSetup")}
          layout="inline"
          required={fields.splitPrestataireSetup.required}
        />
        <FieldNumber
          label={LABELS.modules.splitMonthly}
          value={module.splitPrestataireMonthly}
          onChange={updateNumber("splitPrestataireMonthly")}
          layout="inline"
          required={fields.splitPrestataireMonthly.required}
        />
      </div>

      <FieldCheckbox
        label={LABELS.modules.structurant}
        checked={module.isStructurant}
        onChange={(value) => onUpdate("isStructurant", value)}
        layout="inline"
        required={fields.isStructurant.required}
      />

      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
        <span className="text-xs text-muted-foreground">ID</span>
        <code className="text-[10px] text-muted-foreground/60 font-mono">
          {module.id}
        </code>
      </div>
    </div>
  );
}
