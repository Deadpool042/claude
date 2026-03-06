"use client";

import { useMemo } from "react";
import {
  FieldMultiSelect,
  FieldSelect,
  FieldText,
  FieldTextarea,
  type SelectOption,
} from "@/shared/components/form";
import { Label } from "@/shared/components/ui/label";
import type { JsonValue } from "../../logic/spec-types";

const CMS_KIND_VALUES = [
  "CONTENT_CMS",
  "ECOMMERCE_CMS",
  "ECOMMERCE_SAAS",
  "HEADLESS_STACK",
];

const CMS_TYPE_VALUES = ["CMS", "COMMERCE_CMS", "HEADLESS"];
const CMS_EDITORIAL_VALUES = ["NATIVE", "CONFIGURABLE"];
const CMS_EXTENSION_VALUES = ["PLUGIN", "APP", "MODULE", "MODULE_OR_CUSTOM"];
const CMS_CONTENT_MODES = ["GIT_MDX", "HEADLESS_CMS", "CUSTOM_ADMIN"];

type JsonRecord = Record<string, JsonValue>;

function mergeOptions(values: string[], extra?: string[]): SelectOption[] {
  const merged = new Set<string>();
  for (const value of values) {
    if (value.trim()) merged.add(value);
  }
  for (const value of extra ?? []) {
    if (value.trim()) merged.add(value);
  }
  return Array.from(merged).map((value) => ({ value, label: value }));
}

export function deriveCmsIdFromLabel(label: string): string {
  const slug = label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug ? `cms.${slug}` : "";
}

export function normalizeCmsId(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("cms.") ? trimmed : `cms.${trimmed}`;
}

export function isCmsHeadless(draft: JsonRecord): boolean {
  const kind = typeof draft.kind === "string" ? draft.kind : "";
  const type = typeof draft.type === "string" ? draft.type : "";
  return kind === "HEADLESS_STACK" || type === "HEADLESS";
}

export function collectCmsFrontends(items: JsonRecord[]): string[] {
  const values = new Set<string>();
  for (const item of items) {
    const raw = item.supportedFrontends;
    if (!Array.isArray(raw)) continue;
    for (const entry of raw) {
      if (typeof entry !== "string") continue;
      const trimmed = entry.trim();
      if (trimmed) values.add(trimmed);
    }
  }
  return Array.from(values).sort((left, right) => left.localeCompare(right, "fr"));
}

export function sanitizeCmsDraft(draft: JsonRecord): JsonRecord {
  const next: JsonRecord = {};

  for (const [key, value] of Object.entries(draft)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) next[key] = trimmed;
      continue;
    }
    if (Array.isArray(value)) {
      const cleaned = value.filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.trim().length > 0,
      );
      if (cleaned.length > 0) next[key] = cleaned;
      continue;
    }
    next[key] = value;
  }

  if (typeof next.id === "string") {
    const normalized = normalizeCmsId(next.id);
    if (normalized) next.id = normalized;
    else delete next.id;
  }

  if (typeof next.cmsId === "string") {
    const normalized = normalizeCmsId(next.cmsId);
    if (normalized) next.cmsId = normalized;
    else delete next.cmsId;
  } else if (typeof next.id === "string") {
    next.cmsId = next.id;
  }

  if (!isCmsHeadless(next)) {
    delete next.supportedFrontends;
    delete next.supportedContentModes;
  }

  return next;
}

function getCmsOptions(
  detectedEnums: Record<string, string[]>,
  item: JsonRecord,
  availableFrontends: string[],
) {
  const kind = typeof item.kind === "string" ? item.kind : "";
  const type = typeof item.type === "string" ? item.type : "";
  const editorialModel =
    typeof item.editorialModel === "string" ? item.editorialModel : "";
  const extensionModel =
    typeof item.extensionModel === "string" ? item.extensionModel : "";
  const supportedFrontends = Array.isArray(item.supportedFrontends)
    ? item.supportedFrontends.filter((entry): entry is string => typeof entry === "string")
    : [];
  const supportedContentModes = Array.isArray(item.supportedContentModes)
    ? item.supportedContentModes.filter((entry): entry is string => typeof entry === "string")
    : [];

  return {
    kind: mergeOptions(CMS_KIND_VALUES, [...(detectedEnums.kind ?? []), kind]),
    type: mergeOptions(CMS_TYPE_VALUES, [...(detectedEnums.type ?? []), type]),
    editorialModel: mergeOptions(CMS_EDITORIAL_VALUES, [
      ...(detectedEnums.editorialModel ?? []),
      editorialModel,
    ]),
    extensionModel: mergeOptions(CMS_EXTENSION_VALUES, [
      ...(detectedEnums.extensionModel ?? []),
      extensionModel,
    ]),
    supportedFrontends: mergeOptions(availableFrontends, supportedFrontends),
    supportedContentModes: mergeOptions(CMS_CONTENT_MODES, supportedContentModes),
  };
}

interface CmsItemEditorProps {
  item: JsonRecord;
  onChange: (next: JsonRecord) => void;
  detectedEnums: Record<string, string[]>;
  availableFrontends: string[];
}

export function CmsItemEditor({
  item,
  onChange,
  detectedEnums,
  availableFrontends,
}: CmsItemEditorProps) {
  const options = useMemo(
    () => getCmsOptions(detectedEnums, item, availableFrontends),
    [availableFrontends, detectedEnums, item],
  );

  const cmsIdRaw = typeof item.id === "string" ? item.id : "";
  const cmsIdPreview = normalizeCmsId(
    typeof item.cmsId === "string" ? item.cmsId : cmsIdRaw,
  );
  const cmsFrontends = Array.isArray(item.supportedFrontends)
    ? item.supportedFrontends.filter((entry): entry is string => typeof entry === "string")
    : [];
  const cmsContentModes = Array.isArray(item.supportedContentModes)
    ? item.supportedContentModes.filter((entry): entry is string => typeof entry === "string")
    : [];
  const cmsIsHeadless = isCmsHeadless(item);

  const updateItem = (patch: JsonRecord) => {
    const next = { ...item, ...patch };
    if (!isCmsHeadless(next)) {
      delete next.supportedFrontends;
      delete next.supportedContentModes;
    }
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <FieldText
        label="ID"
        value={cmsIdRaw}
        onChange={() => {}}
        helpText="ID immuable (généré lors de la création)."
        required
        disabled
      />
      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
        <Label className="text-xs text-muted-foreground">cmsId</Label>
        <code className="text-[10px] text-muted-foreground/60 font-mono">
          {cmsIdPreview || "cms.*"}
        </code>
      </div>

      <FieldText
        label="Label"
        value={typeof item.label === "string" ? item.label : ""}
        onChange={(value) => updateItem({ label: value })}
        required
      />

      <FieldTextarea
        label="Description"
        value={typeof item.description === "string" ? item.description : ""}
        onChange={(value) => updateItem({ description: value })}
        rows={3}
        required
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldSelect
          label="Kind"
          value={typeof item.kind === "string" ? item.kind : ""}
          onChange={(value) => updateItem({ kind: value })}
          options={options.kind}
          required
        />
        <FieldSelect
          label="Type"
          value={typeof item.type === "string" ? item.type : ""}
          onChange={(value) => updateItem({ type: value })}
          options={options.type}
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldSelect
          label="Modèle éditorial"
          value={typeof item.editorialModel === "string" ? item.editorialModel : ""}
          onChange={(value) => updateItem({ editorialModel: value })}
          options={options.editorialModel}
        />
        <FieldSelect
          label="Modèle d’extension"
          value={typeof item.extensionModel === "string" ? item.extensionModel : ""}
          onChange={(value) => updateItem({ extensionModel: value })}
          options={options.extensionModel}
        />
      </div>

      {cmsIsHeadless ? (
        <>
          <FieldMultiSelect
            label="Frontends supportés"
            values={cmsFrontends}
            onChange={(value) => updateItem({ supportedFrontends: value })}
            options={options.supportedFrontends}
            placeholder="Filtrer…"
          />
          <FieldMultiSelect
            label="Content modes"
            values={cmsContentModes}
            onChange={(value) => updateItem({ supportedContentModes: value })}
            options={options.supportedContentModes}
            placeholder="Filtrer…"
          />
        </>
      ) : null}
    </div>
  );
}

interface CmsDraftEditorProps {
  item: JsonRecord;
  onChange: (next: JsonRecord) => void;
  detectedEnums: Record<string, string[]>;
  availableFrontends: string[];
  idMode: "auto" | "manual";
  onIdModeChange: (mode: "auto" | "manual") => void;
}

export function CmsDraftEditor({
  item,
  onChange,
  detectedEnums,
  availableFrontends,
  idMode,
  onIdModeChange,
}: CmsDraftEditorProps) {
  const options = useMemo(
    () => getCmsOptions(detectedEnums, item, availableFrontends),
    [availableFrontends, detectedEnums, item],
  );

  const cmsIdRaw = typeof item.id === "string" ? item.id : "";
  const cmsIdPreview = normalizeCmsId(cmsIdRaw);
  const cmsFrontends = Array.isArray(item.supportedFrontends)
    ? item.supportedFrontends.filter((entry): entry is string => typeof entry === "string")
    : [];
  const cmsContentModes = Array.isArray(item.supportedContentModes)
    ? item.supportedContentModes.filter((entry): entry is string => typeof entry === "string")
    : [];
  const cmsIsHeadless = isCmsHeadless(item);

  const updateDraft = (patch: JsonRecord) => {
    const next = { ...item, ...patch };
    if (!isCmsHeadless(next)) {
      delete next.supportedFrontends;
      delete next.supportedContentModes;
    }
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <FieldText
        label="ID"
        value={cmsIdRaw}
        onChange={(value) => {
          onIdModeChange("manual");
          updateDraft({ id: value });
        }}
        placeholder="cms.MY_CMS"
        helpText="Auto depuis le label (modifiable si besoin)."
        required
      />
      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
        <Label className="text-xs text-muted-foreground">cmsId</Label>
        <code className="text-[10px] text-muted-foreground/60 font-mono">
          {cmsIdPreview || "cms.*"}
        </code>
      </div>

      <FieldText
        label="Label"
        value={typeof item.label === "string" ? item.label : ""}
        onChange={(value) => {
          const next: JsonRecord = { ...item, label: value };
          if (idMode === "auto") {
            next.id = deriveCmsIdFromLabel(value);
          }
          onChange(next);
        }}
        required
      />

      <FieldTextarea
        label="Description"
        value={typeof item.description === "string" ? item.description : ""}
        onChange={(value) => updateDraft({ description: value })}
        rows={3}
        required
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldSelect
          label="Kind"
          value={typeof item.kind === "string" ? item.kind : ""}
          onChange={(value) => updateDraft({ kind: value })}
          options={options.kind}
          required
        />
        <FieldSelect
          label="Type"
          value={typeof item.type === "string" ? item.type : ""}
          onChange={(value) => updateDraft({ type: value })}
          options={options.type}
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldSelect
          label="Modèle éditorial"
          value={typeof item.editorialModel === "string" ? item.editorialModel : ""}
          onChange={(value) => updateDraft({ editorialModel: value })}
          options={options.editorialModel}
        />
        <FieldSelect
          label="Modèle d’extension"
          value={typeof item.extensionModel === "string" ? item.extensionModel : ""}
          onChange={(value) => updateDraft({ extensionModel: value })}
          options={options.extensionModel}
        />
      </div>

      {cmsIsHeadless ? (
        <>
          <FieldMultiSelect
            label="Frontends supportés"
            values={cmsFrontends}
            onChange={(value) => updateDraft({ supportedFrontends: value })}
            options={options.supportedFrontends}
            placeholder="Filtrer…"
          />
          <FieldMultiSelect
            label="Content modes"
            values={cmsContentModes}
            onChange={(value) => updateDraft({ supportedContentModes: value })}
            options={options.supportedContentModes}
            placeholder="Filtrer…"
          />
        </>
      ) : null}
    </div>
  );
}
