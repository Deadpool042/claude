"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import type { JsonValue, JsonPath } from "../../logic/spec-types";
import { formatLabel } from "../../logic/spec-helpers";

// ── String ──

export function StringField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  if (value.length > 120) {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="font-mono text-xs"
      />
    );
  }
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-xs"
    />
  );
}

// ── Number ──

export function NumberField({
  value,
  onChange,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-28 text-xs font-mono"
      />
      {suffix && (
        <span className="text-[10px] text-muted-foreground">{suffix}</span>
      )}
    </div>
  );
}

// ── Boolean ──

export function BooleanField({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = `sw-${fieldKey}`;
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={value} onCheckedChange={onChange} />
      <Label
        htmlFor={id}
        className="text-xs text-muted-foreground cursor-pointer select-none"
      >
        {value ? "Oui" : "Non"}
      </Label>
    </div>
  );
}

// ── Enum ──

export function EnumField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const cleanedOptions = [...new Set(options)]
    .map((opt) => opt.trim())
    .filter((opt) => opt.length > 0);

  if (cleanedOptions.length === 0) {
    return <StringField value={value} onChange={onChange} />;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-xs w-full" size="sm">
        <SelectValue placeholder="Sélectionner…" />
      </SelectTrigger>
      <SelectContent>
        {cleanedOptions.map((opt) => (
          <SelectItem key={opt} value={opt} className="text-xs">
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── Tag list (string[]) ──

export function TagListField({
  value,
  path,
  onUpdate,
}: {
  value: string[];
  path: JsonPath;
  onUpdate: (path: JsonPath, val: JsonValue) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    if (!draft.trim()) return;
    onUpdate(path, [...value, draft.trim()]);
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {value.map((tag, i) => (
        <Badge
          key={`${tag}-${i}`}
          variant="secondary"
          className="gap-1 text-[10px] pr-1"
        >
          {tag}
          <button
            onClick={() => onUpdate(path, value.filter((_, j) => j !== i))}
            className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
      {adding ? (
        <div className="flex items-center gap-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setAdding(false);
                setDraft("");
              }
            }}
            className="h-6 w-36 text-[10px]"
            autoFocus
            placeholder="Nouvelle valeur…"
          />
          <Button variant="ghost" size="icon-xs" onClick={handleAdd}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setAdding(true)}
          className="h-5 w-5"
        >
          <Plus className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// ── Range pair ({from,to} or {min,max}) ──

export function RangePairField({
  lo,
  hi,
  loVal,
  hiVal,
  extra,
  obj,
  path,
  onUpdate,
}: {
  lo: string;
  hi: string;
  loVal: number;
  hiVal: number;
  extra: string[];
  obj: Record<string, JsonValue>;
  path: JsonPath;
  onUpdate: (path: JsonPath, val: JsonValue) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="text-[10px] text-muted-foreground/60 w-8 text-right">
          {lo}
        </div>
        <Input
          type="number"
          value={loVal}
          onChange={(e) =>
            onUpdate(path, { ...obj, [lo]: Number(e.target.value) })
          }
          className="h-8 w-28 text-xs font-mono"
        />
        <span className="text-muted-foreground/40">–</span>
        <Input
          type="number"
          value={hiVal}
          onChange={(e) =>
            onUpdate(path, { ...obj, [hi]: Number(e.target.value) })
          }
          className="h-8 w-28 text-xs font-mono"
        />
        <div className="text-[10px] text-muted-foreground/60">{hi}</div>
      </div>
      {extra.map((k) =>
        typeof obj[k] === "string" ? (
          <div key={k} className="flex items-center gap-2 pl-10">
            <Label className="text-[10px] text-muted-foreground w-16">
              {formatLabel(k)}
            </Label>
            <Input
              value={obj[k] as string}
              onChange={(e) =>
                onUpdate(path, { ...obj, [k]: e.target.value })
              }
              className="h-6 text-[10px] flex-1"
            />
          </div>
        ) : null,
      )}
    </div>
  );
}
