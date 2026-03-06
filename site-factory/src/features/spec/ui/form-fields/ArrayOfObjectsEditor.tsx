"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import type { JsonPath, JsonValue } from "../../logic/spec-types";
import {
  buildItemTemplate,
  createDefaultItem,
  deleteAtPath,
  detectEnumFields,
  getItemId,
  getItemSummary,
  setAtPath,
} from "../../logic/spec-helpers";
import {
  CmsDraftEditor,
  CmsItemEditor,
  collectCmsFrontends,
  deriveCmsIdFromLabel,
  sanitizeCmsDraft,
} from "./CmsFieldEditor";

type JsonRecord = Record<string, JsonValue>;

interface ObjectFieldsRendererProps {
  value: JsonRecord;
  path: JsonPath;
  onUpdate: (path: JsonPath, value: JsonValue) => void;
  onDelete: (path: JsonPath) => void;
  detectedEnums?: Record<string, string[]>;
}

interface ItemCardProps {
  item: JsonRecord;
  path: JsonPath;
  onUpdate: (path: JsonPath, value: JsonValue) => void;
  onDelete: (path: JsonPath) => void;
  detectedEnums: Record<string, string[]>;
  defaultCollapsed: boolean;
  renderObjectFields: (props: ObjectFieldsRendererProps) => ReactNode;
  title?: string;
  renderContent?: ReactNode;
}

export function ItemCard({
  item,
  path,
  onUpdate,
  onDelete,
  detectedEnums,
  defaultCollapsed,
  renderObjectFields,
  title,
  renderContent,
}: ItemCardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const summary = title ?? getItemSummary(item);
  const itemId = !title ? getItemId(item) : null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-0 pt-3 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground transition"
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {itemId && (
            <Badge
              variant="outline"
              className="text-[10px] font-mono shrink-0"
            >
              {itemId}
            </Badge>
          )}

          <span className="text-sm font-medium truncate flex-1">{summary}</span>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(path)}
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent className="pt-3 px-4 pb-4">
          {renderContent ??
            renderObjectFields({
              value: item,
              path,
              onUpdate,
              onDelete,
              detectedEnums,
            })}
        </CardContent>
      )}
    </Card>
  );
}

interface ArrayOfObjectsFieldProps {
  items: JsonRecord[];
  sectionKey?: string;
  path: JsonPath;
  onUpdate: (path: JsonPath, value: JsonValue) => void;
  onDelete: (path: JsonPath) => void;
  renderObjectFields: (props: ObjectFieldsRendererProps) => ReactNode;
}

function isJsonRecord(value: JsonValue): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function ArrayOfObjectsField({
  items,
  sectionKey,
  path,
  onUpdate,
  onDelete,
  renderObjectFields,
}: ArrayOfObjectsFieldProps) {
  const [filter, setFilter] = useState("");
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftItem, setDraftItem] = useState<JsonRecord | null>(null);
  const [cmsIdMode, setCmsIdMode] = useState<"auto" | "manual">("auto");

  const isCmsSection = sectionKey === "cms";
  const detectedEnums = useMemo(() => detectEnumFields(items), [items]);
  const template = useMemo(() => buildItemTemplate(items), [items]);
  const availableFrontends = useMemo(
    () => (isCmsSection ? collectCmsFrontends(items) : []),
    [isCmsSection, items],
  );
  const defaultCollapsed = items.length > 5;

  const cmsCanSave = !isCmsSection
    ? true
    : Boolean(
        typeof draftItem?.id === "string" &&
          draftItem.id.trim() &&
          typeof draftItem.label === "string" &&
          draftItem.label.trim() &&
          typeof draftItem.description === "string" &&
          draftItem.description.trim() &&
          typeof draftItem.kind === "string" &&
          draftItem.kind.trim() &&
          typeof draftItem.type === "string" &&
          draftItem.type.trim(),
      );

  const indexedItems = items.map((item, index) => ({ item, index }));
  const filteredItems = filter
    ? indexedItems.filter(({ item }) => {
        const normalizedFilter = filter.toLowerCase();
        const summary = getItemSummary(item).toLowerCase();
        const itemId = getItemId(item)?.toLowerCase() ?? "";
        return summary.includes(normalizedFilter) || itemId.includes(normalizedFilter);
      })
    : indexedItems;

  const openDraft = () => {
    const nextDraft = isCmsSection ? {} : createDefaultItem(template);
    if (!isCmsSection) {
      for (const [key, options] of Object.entries(detectedEnums)) {
        if (typeof nextDraft[key] === "string" && options.length > 0) {
          nextDraft[key] = options[0];
        }
      }
    } else {
      setCmsIdMode("auto");
    }
    setDraftItem(nextDraft);
    setDraftOpen(true);
  };

  const closeDraft = () => {
    setDraftOpen(false);
    setDraftItem(null);
  };

  const updateDraftAtPath = (draftPath: JsonPath, value: JsonValue) => {
    setDraftItem((previous) => {
      if (!previous) return previous;
      const next = setAtPath(previous, draftPath, value);
      return isJsonRecord(next) ? next : previous;
    });
  };

  const deleteDraftAtPath = (draftPath: JsonPath) => {
    setDraftItem((previous) => {
      if (!previous) return previous;
      const next = deleteAtPath(previous, draftPath);
      return isJsonRecord(next) ? next : previous;
    });
  };

  return (
    <div className="space-y-2 mt-1">
      {items.length > 5 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-muted-foreground/40" />
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={`Filtrer (${items.length} éléments)…`}
            className="h-7 pl-8 text-xs"
          />
        </div>
      )}

      {filteredItems.map(({ item, index }) => (
        <ItemCard
          key={getItemId(item) ?? index}
          item={item}
          path={[...path, index]}
          onUpdate={onUpdate}
          onDelete={onDelete}
          detectedEnums={detectedEnums}
          defaultCollapsed={defaultCollapsed}
          renderObjectFields={renderObjectFields}
          renderContent={
            isCmsSection ? (
              <CmsItemEditor
                item={item}
                onChange={(next) => onUpdate([...path, index], next)}
                detectedEnums={detectedEnums}
                availableFrontends={availableFrontends}
              />
            ) : undefined
          }
        />
      ))}

      {filteredItems.length === 0 && filter && (
        <div className="py-4 text-center text-xs text-muted-foreground/50">
          Aucun résultat pour &laquo; {filter} &raquo;
        </div>
      )}

      <Button variant="outline" size="sm" onClick={openDraft} className="w-full">
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Ajouter un élément
      </Button>

      <Drawer open={draftOpen} onOpenChange={(open) => (open ? setDraftOpen(true) : closeDraft())}>
        <DrawerContent className="max-h-[85vh] w-full overflow-y-auto sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-3xl">
          <DrawerHeader>
            <DrawerTitle>Ajouter un élément</DrawerTitle>
            <DrawerDescription>
              Renseignez les champs requis et optionnels avant d&apos;enregistrer.
            </DrawerDescription>
          </DrawerHeader>

          {draftItem ? (
            isCmsSection ? (
              <CmsDraftEditor
                item={draftItem}
                onChange={setDraftItem}
                detectedEnums={detectedEnums}
                availableFrontends={availableFrontends}
                idMode={cmsIdMode}
                onIdModeChange={setCmsIdMode}
              />
            ) : Object.keys(template).length > 0 ? (
              renderObjectFields({
                value: draftItem,
                path: [],
                onUpdate: updateDraftAtPath,
                onDelete: deleteDraftAtPath,
                detectedEnums,
              })
            ) : (
              <Textarea
                value={JSON.stringify(draftItem, null, 2)}
                onChange={(event) => {
                  try {
                    const parsed = JSON.parse(event.target.value) as JsonValue;
                    if (isJsonRecord(parsed)) {
                      setDraftItem(parsed);
                    }
                  } catch {
                    // Ignorer les erreurs tant que l’utilisateur saisit.
                  }
                }}
                rows={8}
                className="font-mono text-xs"
              />
            )
          ) : null}

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeDraft}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!draftItem) return;
                let nextDraft = draftItem;
                if (
                  isCmsSection &&
                  typeof nextDraft.label === "string" &&
                  (!nextDraft.id ||
                    typeof nextDraft.id !== "string" ||
                    nextDraft.id.trim().length === 0)
                ) {
                  nextDraft = {
                    ...nextDraft,
                    id: deriveCmsIdFromLabel(nextDraft.label),
                  };
                }
                const nextItem = isCmsSection ? sanitizeCmsDraft(nextDraft) : nextDraft;
                onUpdate(path, [...items, nextItem]);
                closeDraft();
              }}
              disabled={!draftItem || !cmsCanSave}
            >
              Enregistrer
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
