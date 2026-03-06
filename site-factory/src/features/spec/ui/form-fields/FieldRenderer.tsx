"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import type { JsonPath, JsonValue } from "../../logic/spec-types";
import { formatLabel, isRangePair } from "../../logic/spec-helpers";
import {
  BooleanField,
  EnumField,
  NumberField,
  RangePairField,
  StringField,
  TagListField,
} from "./PrimitiveFields";
import { ArrayOfObjectsField } from "./ArrayOfObjectsEditor";

interface FieldRendererProps {
  fieldKey: string;
  value: JsonValue;
  path: JsonPath;
  onUpdate: (path: JsonPath, value: JsonValue) => void;
  onDelete: (path: JsonPath) => void;
  detectedEnums?: Record<string, string[]>;
}

export function FieldRenderer({
  fieldKey,
  value,
  path,
  onUpdate,
  onDelete,
  detectedEnums,
}: FieldRendererProps) {
  if (value === null) {
    return (
      <Badge variant="outline" className="text-[10px] text-muted-foreground">
        null
      </Badge>
    );
  }

  if (typeof value === "boolean") {
    return (
      <BooleanField
        fieldKey={fieldKey}
        value={value}
        onChange={(nextValue) => onUpdate(path, nextValue)}
      />
    );
  }

  if (typeof value === "number") {
    const normalizedKey = fieldKey.toLowerCase();
    const suffix = normalizedKey.includes("price") ||
      normalizedKey.includes("cost") ||
      normalizedKey.includes("monthly") ||
      normalizedKey.includes("fee")
      ? "€"
      : normalizedKey.includes("multiplier") || normalizedKey.includes("factor")
        ? "×"
        : undefined;

    return (
      <NumberField
        value={value}
        onChange={(nextValue) => onUpdate(path, nextValue)}
        {...(suffix ? { suffix } : {})}
      />
    );
  }

  if (typeof value === "string") {
    if (detectedEnums?.[fieldKey]) {
      return (
        <EnumField
          value={value}
          options={detectedEnums[fieldKey]}
          onChange={(nextValue) => onUpdate(path, nextValue)}
        />
      );
    }

    return <StringField value={value} onChange={(nextValue) => onUpdate(path, nextValue)} />;
  }

  if (Array.isArray(value)) {
    if (value.every((entry) => typeof entry === "string")) {
      return <TagListField value={value} path={path} onUpdate={onUpdate} />;
    }

    if (
      value.every(
        (entry) => entry !== null && typeof entry === "object" && !Array.isArray(entry),
      )
    ) {
      return (
        <ArrayOfObjectsField
          items={value as Record<string, JsonValue>[]}
          path={path}
          onUpdate={onUpdate}
          onDelete={onDelete}
          renderObjectFields={(props) => <ObjectFieldsGrid {...props} />}
        />
      );
    }

    return (
      <Textarea
        value={JSON.stringify(value, null, 2)}
        onChange={(event) => {
          try {
            onUpdate(path, JSON.parse(event.target.value) as JsonValue);
          } catch {
            // Ignorer les erreurs de parsing pendant la saisie.
          }
        }}
        rows={4}
        className="font-mono text-xs"
      />
    );
  }

  if (typeof value === "object") {
    const objectValue = value as Record<string, JsonValue>;
    const rangePair = isRangePair(objectValue);

    if (rangePair) {
      return (
        <RangePairField
          lo={rangePair.lo}
          hi={rangePair.hi}
          loVal={objectValue[rangePair.lo] as number}
          hiVal={objectValue[rangePair.hi] as number}
          extra={rangePair.extra}
          obj={objectValue}
          path={path}
          onUpdate={onUpdate}
        />
      );
    }

    return (
      <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
        <ObjectFieldsGrid
          value={objectValue}
          path={path}
          onUpdate={onUpdate}
          onDelete={onDelete}
          {...(detectedEnums ? { detectedEnums } : {})}
        />
      </div>
    );
  }

  return null;
}

interface ObjectFieldsGridProps {
  value: Record<string, JsonValue>;
  path: JsonPath;
  onUpdate: (path: JsonPath, value: JsonValue) => void;
  onDelete: (path: JsonPath) => void;
  detectedEnums?: Record<string, string[]>;
}

export function ObjectFieldsGrid({
  value,
  path,
  onUpdate,
  onDelete,
  detectedEnums,
}: ObjectFieldsGridProps) {
  const keys = Object.keys(value);
  const consumedKeys = new Set<string>();

  return (
    <div className="space-y-3">
      {keys.map((key) => {
        if (consumedKeys.has(key)) return null;
        consumedKeys.add(key);

        if (key.endsWith("Min")) {
          const baseKey = key.slice(0, -3);
          const maxKey = `${baseKey}Max`;

          if (
            keys.includes(maxKey) &&
            typeof value[key] === "number" &&
            typeof value[maxKey] === "number"
          ) {
            consumedKeys.add(maxKey);
            const normalizedKey = baseKey.toLowerCase();
            const suffix =
              normalizedKey.includes("price") || normalizedKey.includes("cost")
                ? " €"
                : "";

            return (
              <div
                key={key}
                className="grid grid-cols-[140px_1fr] items-center gap-x-3"
              >
                <Label className="text-xs text-muted-foreground">
                  {formatLabel(baseKey)}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={value[key] as number}
                    onChange={(event) =>
                      onUpdate([...path, key], Number(event.target.value))
                    }
                    className="h-8 w-28 text-xs font-mono"
                  />
                  <span className="text-muted-foreground/40">–</span>
                  <Input
                    type="number"
                    value={value[maxKey] as number}
                    onChange={(event) =>
                      onUpdate([...path, maxKey], Number(event.target.value))
                    }
                    className="h-8 w-28 text-xs font-mono"
                  />
                  {suffix && (
                    <span className="text-[10px] text-muted-foreground">
                      {suffix}
                    </span>
                  )}
                </div>
              </div>
            );
          }
        }

        const fieldValue = value[key];
        const isComplexValue = fieldValue !== null && typeof fieldValue === "object";

        return (
          <div
            key={key}
            className={cn(
              "grid gap-x-3",
              isComplexValue
                ? "grid-cols-1"
                : "grid-cols-[140px_1fr] items-center",
            )}
          >
            <Label
              className={cn(
                "text-xs text-muted-foreground",
                isComplexValue && "mb-1.5 font-medium text-foreground/70",
              )}
            >
              {formatLabel(key)}
            </Label>
            <FieldRenderer
              fieldKey={key}
              value={fieldValue}
              path={[...path, key]}
              onUpdate={onUpdate}
              onDelete={onDelete}
              {...(detectedEnums ? { detectedEnums } : {})}
            />
          </div>
        );
      })}
    </div>
  );
}
