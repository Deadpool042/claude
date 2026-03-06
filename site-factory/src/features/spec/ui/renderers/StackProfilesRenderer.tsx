"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Tip } from "@/shared/components/Tip";
import { FieldSelect } from "@/shared/components/FieldSelect";
import type {
  JsonValue,
  SpecRendererProps,
  StackFamily,
  StackProfile,
} from "../../logic/spec-types";
import { LABELS } from "../../logic/spec-labels";

import { FamilyCard } from "./stack-profiles/FamilyCard";
import { ProfileCard } from "./stack-profiles/ProfileCard";
import { MappingRow } from "./stack-profiles/MappingRow";

type TabKey = "families" | "profiles" | "implMapping" | "familyMapping";
const TAB_KEYS: TabKey[] = ["families", "profiles", "implMapping", "familyMapping"];

export function StackProfilesRenderer({ value, onChange }: SpecRendererProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("families");
  const [search, setSearch] = useState("");
  const [familyFilter, setFamilyFilter] = useState("__all__");

  const root = value as Record<string, JsonValue>;
  const families = (root.families ?? []) as unknown as StackFamily[];
  const profiles = (root.profiles ?? []) as unknown as StackProfile[];
  const implMapping = (root.implementationMapping ?? {}) as Record<string, string>;
  const familyMapping = (root.projectFamilyMapping ?? {}) as Record<string, string>;

  const familyIds = useMemo(() => families.map((f) => f.id), [families]);

  const familyFilterOptions = useMemo(
    () => [
      { value: "__all__", label: LABELS.stackProfiles.profiles.allFamilies },
      ...familyIds.map((fId) => ({ value: fId, label: fId })),
    ],
    [familyIds],
  );

  // ── Filtered profiles ──
  const filtered = useMemo(() => {
    let list = profiles;
    if (familyFilter !== "__all__") {
      list = list.filter((p) => p.family === familyFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.label.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q),
      );
    }
    return list;
  }, [profiles, familyFilter, search]);

  // ── Update helpers ──
  const updateFamily = useCallback(
    (idx: number, field: string, val: JsonValue) => {
      const arr = root.families as JsonValue[];
      const next = [...arr];
      (next[idx] as Record<string, JsonValue>)[field] = val;
      onChange({ ...root, families: next });
    },
    [root, onChange],
  );

  const updateProfile = useCallback(
    (profileId: string, field: string, val: JsonValue) => {
      const arr = root.profiles as JsonValue[];
      const next = arr.map((p) => {
        const pr = p as Record<string, JsonValue>;
        if (pr.id === profileId) return { ...pr, [field]: val };
        return pr;
      });
      onChange({ ...root, profiles: next });
    },
    [root, onChange],
  );

  const updateImplMapping = useCallback(
    (key: string, val: string) => {
      onChange({ ...root, implementationMapping: { ...implMapping, [key]: val } });
    },
    [implMapping, root, onChange],
  );

  const deleteImplMapping = useCallback(
    (key: string) => {
      const next = { ...implMapping };
      delete next[key];
      onChange({ ...root, implementationMapping: next });
    },
    [implMapping, root, onChange],
  );

  const updateFamilyMapping = useCallback(
    (key: string, val: string) => {
      onChange({ ...root, projectFamilyMapping: { ...familyMapping, [key]: val } });
    },
    [familyMapping, root, onChange],
  );

  const deleteFamilyMapping = useCallback(
    (key: string) => {
      const next = { ...familyMapping };
      delete next[key];
      onChange({ ...root, projectFamilyMapping: next });
    },
    [familyMapping, root, onChange],
  );

  // ── New mapping entry helpers ──
  const [newImplKey, setNewImplKey] = useState("");
  const [newFamilyKey, setNewFamilyKey] = useState("");

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
          <TabsList className="w-full flex">
            {TAB_KEYS.map((k) => (
              <TabsTrigger key={k} value={k} className="flex-1 text-xs">
                {LABELS.stackProfiles.tabs[k]}
                <Badge variant="secondary" className="ml-1.5 text-[9px] px-1.5 py-0">
                  {k === "families"
                    ? families.length
                    : k === "profiles"
                      ? profiles.length
                      : k === "implMapping"
                        ? Object.keys(implMapping).length
                        : Object.keys(familyMapping).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* ── Families tab ── */}
        {activeTab === "families" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <Tip content={LABELS.stackProfiles.families.hint}>
                <span className="font-medium">{LABELS.stackProfiles.families.title}</span>
              </Tip>
              <span className="ml-auto">{families.length} familles</span>
            </div>
            <div className="space-y-2">
              {families.map((family, idx) => (
                <FamilyCard
                  key={family.id}
                  family={family}
                  onUpdate={(field, val) => updateFamily(idx, field, val)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Profiles tab ── */}
        {activeTab === "profiles" && (
          <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                <Input
                  placeholder={LABELS.stackProfiles.profiles.filterPlaceholder(profiles.length)}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 text-xs pl-8"
                />
              </div>
              <FieldSelect
                value={familyFilter}
                onChange={setFamilyFilter}
                options={familyFilterOptions}
                size="sm"
                triggerClassName="w-44"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <Tip content={LABELS.stackProfiles.profiles.hint}>
                <span className="font-medium">{LABELS.stackProfiles.profiles.title}</span>
              </Tip>
              <span className="ml-auto">
                {filtered.length === profiles.length
                  ? `${profiles.length} profils`
                  : `${filtered.length} / ${profiles.length} profils`}
              </span>
            </div>

            <div className="space-y-2">
              {filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground/40 text-center py-8">
                  {LABELS.stackProfiles.profiles.noProfile}
                </p>
              ) : (
                filtered.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    familyIds={familyIds}
                    onUpdate={(field, val) => updateProfile(profile.id, field, val)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Implementation mapping tab ── */}
        {activeTab === "implMapping" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <Tip content={LABELS.stackProfiles.implMapping.hint}>
                <span className="font-medium">{LABELS.stackProfiles.implMapping.title}</span>
              </Tip>
              <span className="ml-auto">{Object.keys(implMapping).length} entrées</span>
            </div>
            <div className="space-y-1">
              {Object.entries(implMapping).map(([k, v]) => (
                <MappingRow
                  key={k}
                  entryKey={k}
                  entryValue={v}
                  onUpdate={(val) => updateImplMapping(k, val)}
                  onDelete={() => deleteImplMapping(k)}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
              <Input
                placeholder="Clé CMS (ex: GHOST)"
                value={newImplKey}
                onChange={(e) => setNewImplKey(e.target.value)}
                className="h-7 text-xs font-mono flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground/60 hover:text-foreground gap-1"
                disabled={!newImplKey || newImplKey in implMapping}
                onClick={() => {
                  updateImplMapping(newImplKey, "");
                  setNewImplKey("");
                }}
              >
                <Plus className="h-3 w-3" /> Ajouter
              </Button>
            </div>
          </div>
        )}

        {/* ── Project family mapping tab ── */}
        {activeTab === "familyMapping" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <Tip content={LABELS.stackProfiles.familyMapping.hint}>
                <span className="font-medium">{LABELS.stackProfiles.familyMapping.title}</span>
              </Tip>
              <span className="ml-auto">{Object.keys(familyMapping).length} entrées</span>
            </div>
            <div className="space-y-1">
              {Object.entries(familyMapping).map(([k, v]) => (
                <MappingRow
                  key={k}
                  entryKey={k}
                  entryValue={v}
                  onUpdate={(val) => updateFamilyMapping(k, val)}
                  onDelete={() => deleteFamilyMapping(k)}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
              <Input
                placeholder="Type projet (ex: CMS_MONO)"
                value={newFamilyKey}
                onChange={(e) => setNewFamilyKey(e.target.value)}
                className="h-7 text-xs font-mono flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground/60 hover:text-foreground gap-1"
                disabled={!newFamilyKey || newFamilyKey in familyMapping}
                onClick={() => {
                  updateFamilyMapping(newFamilyKey, "");
                  setNewFamilyKey("");
                }}
              >
                <Plus className="h-3 w-3" /> Ajouter
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-[10px] text-muted-foreground/40 text-center pt-2 border-t border-border/20">
          {LABELS.stackProfiles.profiles.footer(profiles.length, familyIds.length)}
        </div>
      </div>
    </TooltipProvider>
  );
}
