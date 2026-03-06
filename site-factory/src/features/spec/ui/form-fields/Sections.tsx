"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import type { JsonValue, JsonPath } from "../../logic/spec-types";
import { isRangePair, formatLabel } from "../../logic/spec-helpers";
import { TagListField, RangePairField } from "./PrimitiveFields";
import {
  FieldRenderer,
  ObjectFieldsGrid,
} from "./FieldRenderer";
import { ItemCard, ArrayOfObjectsField } from "./ArrayOfObjectsEditor";

// ── Meta section (collapsed by default) ──────────

export function MetaSection({
  value,
  path,
  onUpdate,
  onDelete,
}: {
  value: Record<string, JsonValue>;
  path: JsonPath;
  onUpdate: (path: JsonPath, val: JsonValue) => void;
  onDelete: (path: JsonPath) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-border/30 bg-muted/10">
      <button
        className="flex w-full items-center gap-2 px-4 py-2"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <CardTitle className="text-xs text-muted-foreground font-medium">
          _meta
        </CardTitle>
        {!open && typeof value.purpose === "string" && (
          <span className="text-[10px] text-muted-foreground/50 truncate">
            {value.purpose as string}
          </span>
        )}
      </button>
      {open && (
        <CardContent className="px-4 pb-3 pt-0">
          <ObjectFieldsGrid
            value={value}
            path={path}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </CardContent>
      )}
    </Card>
  );
}

// ── Section header ───────────────────────────────

export function SectionHeader({
  label,
  count,
  tooltip,
}: {
  label: string;
  count?: number;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-3">
      <div className="flex-1 border-t border-border/40" />
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        {formatLabel(label)}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </h3>
      {count !== undefined && (
        <Badge variant="outline" className="text-[10px]">
          {count} {count === 1 ? "élément" : "éléments"}
        </Badge>
      )}
      <div className="flex-1 border-t border-border/40" />
    </div>
  );
}

// ── Root key section ─────────────────────────────

export function RootKeySection({
  sectionKey,
  value,
  path,
  onUpdate,
  onDelete,
  tooltip,
}: {
  sectionKey: string;
  value: JsonValue;
  path: JsonPath;
  onUpdate: (path: JsonPath, val: JsonValue) => void;
  onDelete: (path: JsonPath) => void;
  tooltip?: string;
}) {
  // _meta → collapsible metadata section
  if (
    sectionKey === "_meta" &&
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return (
      <MetaSection
        value={value as Record<string, JsonValue>}
        path={path}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );
  }

  // Primitive at root level
  if (value === null || typeof value !== "object") {
    return (
      <div className="grid grid-cols-[140px_1fr] items-center gap-x-3 py-1">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          {formatLabel(sectionKey)}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </Label>
        <FieldRenderer
          fieldKey={sectionKey}
          value={value}
          path={path}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </div>
    );
  }

  // Array
  if (Array.isArray(value)) {
    if (
      value.every(
        (v) => v !== null && typeof v === "object" && !Array.isArray(v),
      )
    ) {
      return (
        <>
          <SectionHeader label={sectionKey} count={value.length} {...(tooltip ? { tooltip } : {})} />
          <ArrayOfObjectsField
            items={value as Record<string, JsonValue>[]}
            sectionKey={sectionKey}
            path={path}
            onUpdate={onUpdate}
            onDelete={onDelete}
            renderObjectFields={(props) => <ObjectFieldsGrid {...props} />}
          />
        </>
      );
    }
    if (value.every((v) => typeof v === "string")) {
      return (
        <div className="grid grid-cols-[140px_1fr] items-start gap-x-3 py-1">
          <Label className="text-xs font-medium text-muted-foreground pt-1 flex items-center gap-1">
            {formatLabel(sectionKey)}
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            )}
          </Label>
          <TagListField
            value={value as string[]}
            path={path}
            onUpdate={onUpdate}
          />
        </div>
      );
    }
    return (
      <>
        <SectionHeader label={sectionKey} count={value.length} {...(tooltip ? { tooltip } : {})} />
        <Textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              onUpdate(path, JSON.parse(e.target.value));
            } catch {
              /* skip */
            }
          }}
          rows={6}
          className="font-mono text-xs"
        />
      </>
    );
  }

  // Object
  const obj = value as Record<string, JsonValue>;
  const children = Object.values(obj);

  // Dict of objects → render each entry as a card
  const allChildrenAreObjects =
    children.length > 1 &&
    children.every(
      (v) => v !== null && typeof v === "object" && !Array.isArray(v),
    );

  if (allChildrenAreObjects) {
    return (
      <>
        <SectionHeader label={sectionKey} count={children.length} {...(tooltip ? { tooltip } : {})} />
        <div className="space-y-2">
          {Object.entries(obj).map(([key, child]) => {
            const childObj = child as Record<string, JsonValue>;
            const rp = isRangePair(childObj);
            if (rp) {
              return (
                <Card key={key} className="border-border/40">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono shrink-0"
                      >
                        {key}
                      </Badge>
                      <RangePairField
                        lo={rp.lo}
                        hi={rp.hi}
                        loVal={childObj[rp.lo] as number}
                        hiVal={childObj[rp.hi] as number}
                        extra={rp.extra}
                        obj={childObj}
                        path={[...path, key]}
                        onUpdate={onUpdate}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return (
              <ItemCard
                key={key}
                item={childObj}
                path={[...path, key]}
                onUpdate={onUpdate}
                onDelete={onDelete}
                detectedEnums={{}}
                defaultCollapsed={children.length > 5}
                title={key}
                renderObjectFields={(props) => <ObjectFieldsGrid {...props} />}
              />
            );
          })}
        </div>
      </>
    );
  }

  // Regular object → fields card
  return (
    <>
      <SectionHeader label={sectionKey} {...(tooltip ? { tooltip } : {})} />
      <Card className="border-border/50">
        <CardContent className="p-4">
          <ObjectFieldsGrid
            value={obj}
            path={path}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>
    </>
  );
}
