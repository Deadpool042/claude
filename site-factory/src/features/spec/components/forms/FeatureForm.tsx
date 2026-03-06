"use client";

import { Label } from "@/shared/components/ui/label";
import {
  FieldCheckbox,
  FieldMultiSelect,
  FieldTagList,
  FieldText,
  FieldTextarea,
  type SelectOption,
} from "@/shared/components/form";
import { FEATURE_FORM_CONFIG } from "../../lib/spec-form-config";
import { LABELS } from "../../logic/spec-labels";
import type { FeatureItem, JsonValue } from "../../logic/spec-types";
import { FeatureDomainSelect } from "../fields/FeatureDomainSelect";
import { FeatureTypeSelect } from "../fields/FeatureTypeSelect";

export function FeatureForm({
  feature,
  onUpdate,
  dependencyOptions,
}: {
  feature: FeatureItem;
  onUpdate: (field: keyof FeatureItem, value: JsonValue) => void;
  dependencyOptions: SelectOption[];
}) {
  const fields = FEATURE_FORM_CONFIG.fields;
  const uiNote = feature.uiOnly ? "Pas d'impact sur le prix" : "Impacte la categorie";
  const dependencies = feature.dependencies ?? [];
  const tags = feature.tags ?? [];
  const availableDependencyOptions = dependencyOptions.filter(
    (opt) => opt.value !== feature.id,
  );

  return (
    <div className="space-y-3">
      <FieldText
        label={LABELS.features.label}
        tooltip={LABELS.features.labelHint}
        value={feature.label}
        onChange={(value) => onUpdate("label", value)}
        required={fields.label.required}
        layout="inline"
        inputClassName="h-7 text-xs"
      />

      <FieldTextarea
        label={LABELS.features.description}
        tooltip={LABELS.features.descriptionHint}
        value={feature.description ?? ""}
        onChange={(value) => onUpdate("description", value)}
        required={fields.description.required}
        layout="inline"
        rows={2}
        textareaClassName="min-h-8"
      />

      <FeatureDomainSelect
        value={feature.domain}
        onChange={(value) => onUpdate("domain", value)}
        required={fields.domain.required}
      />

      <FeatureTypeSelect
        value={feature.type}
        onChange={(value) => onUpdate("type", value)}
        required={fields.type.required}
      />

      <FieldCheckbox
        label={LABELS.features.uiOnly}
        tooltip={feature.uiOnly ? LABELS.features.uiOnlyHint : LABELS.features.functionalHint}
        checked={feature.uiOnly}
        onChange={(value) => onUpdate("uiOnly", value)}
        description={uiNote}
        required={fields.uiOnly.required}
        layout="inline"
      />

      <FieldMultiSelect
        label={LABELS.features.dependencies}
        tooltip={LABELS.features.dependenciesHint}
        values={dependencies}
        options={availableDependencyOptions}
        onChange={(value) => onUpdate("dependencies", value)}
        layout="inline"
      />

      <FieldTagList
        label={LABELS.features.tags}
        tooltip={LABELS.features.tagsHint}
        values={tags}
        onChange={(value) => onUpdate("tags", value)}
        layout="inline"
      />

      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
        <Label className="text-xs text-muted-foreground">
          {LABELS.features.id}
        </Label>
        <code className="text-[10px] text-muted-foreground/60 font-mono">
          {feature.id}
        </code>
      </div>
    </div>
  );
}
