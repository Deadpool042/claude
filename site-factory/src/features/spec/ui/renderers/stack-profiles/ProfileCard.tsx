"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/lib/utils";
import { Tip } from "@/shared/components/Tip";
import { FieldSelect } from "@/shared/components/FieldSelect";
import type { JsonValue, StackProfile } from "../../../logic/spec-types";
import { LABELS } from "../../../logic/spec-labels";
import { FAMILY_COLORS } from "./constants";

export function ProfileCard({
  profile,
  familyIds,
  onUpdate,
}: {
  profile: StackProfile;
  familyIds: string[];
  onUpdate: (field: string, value: JsonValue) => void;
}) {
  const [open, setOpen] = useState(false);

  const familyOptions = familyIds.map((fId) => ({ value: fId, label: fId }));

  return (
    <Card className="overflow-hidden border-border/30 bg-card/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/20 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        )}
        <Badge
          variant="outline"
          className={cn("text-[10px] shrink-0", FAMILY_COLORS[profile.family])}
        >
          {profile.family}
        </Badge>
        <span className="text-xs font-medium flex-1">{profile.label}</span>
        <span className="text-[10px] text-muted-foreground/60 max-w-[30%] line-clamp-1">
          {profile.summary}
        </span>
        <Badge variant="outline" className="text-[9px] font-mono">
          ×{profile.complexityFactor}
        </Badge>
        {profile.hasPluginEcosystem && (
          <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
            plugins
          </Badge>
        )}
      </button>

      {open && (
        <CardContent className="pt-0 px-3 pb-3 space-y-2 border-t border-border/30">
          <div className="grid grid-cols-[120px_1fr] items-center gap-2 pt-2">
            <Label className="text-[10px] text-muted-foreground/50">Label</Label>
            <Input
              value={profile.label}
              onChange={(e) => onUpdate("label", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label className="text-[10px] text-muted-foreground/50">
              {LABELS.stackProfiles.profiles.family}
            </Label>
            <FieldSelect
              value={profile.family}
              onChange={(v) => onUpdate("family", v)}
              options={familyOptions}
              size="sm"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-start gap-2">
            <Label className="text-[10px] text-muted-foreground/50 mt-1.5">
              {LABELS.stackProfiles.profiles.summary}
            </Label>
            <textarea
              value={profile.summary}
              onChange={(e) => onUpdate("summary", e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-8"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">
                <Tip content={LABELS.stackProfiles.profiles.complexityFactorHint}>
                  {LABELS.stackProfiles.profiles.complexityFactor}
                </Tip>
              </Label>
              <Input
                type="number"
                step={0.1}
                value={profile.complexityFactor}
                onChange={(e) => onUpdate("complexityFactor", Number(e.target.value))}
                className="h-7 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">
                <Tip content={LABELS.stackProfiles.profiles.maintenanceFloorIndexHint}>
                  {LABELS.stackProfiles.profiles.maintenanceFloorIndex}
                </Tip>
              </Label>
              <Input
                type="number"
                value={profile.maintenanceFloorIndex}
                onChange={(e) => onUpdate("maintenanceFloorIndex", Number(e.target.value))}
                className="h-7 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/50">
                <Tip content={LABELS.stackProfiles.profiles.legacyTechStackHint}>
                  {LABELS.stackProfiles.profiles.legacyTechStack}
                </Tip>
              </Label>
              <Input
                value={profile.legacyTechStack ?? ""}
                onChange={(e) => onUpdate("legacyTechStack", e.target.value || null)}
                placeholder="null"
                className="h-7 text-xs font-mono"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={profile.hasPluginEcosystem}
              onCheckedChange={(v) => onUpdate("hasPluginEcosystem", v)}
            />
            <Label className="text-xs">
              <Tip content={LABELS.stackProfiles.profiles.pluginEcosystemHint}>
                {LABELS.stackProfiles.profiles.pluginEcosystem}
              </Tip>
            </Label>
          </div>

          {/* Capabilities */}
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground/50">
              {LABELS.stackProfiles.profiles.capabilities}
            </Label>
            {profile.capabilities.map((cap, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[9px] h-5 px-1.5">{cap}</Badge>
                <Input
                  value={cap}
                  onChange={(e) => {
                    const next = [...profile.capabilities];
                    next[i] = e.target.value;
                    onUpdate("capabilities", next);
                  }}
                  className="h-7 text-xs flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground/50 hover:text-destructive shrink-0"
                  onClick={() =>
                    onUpdate("capabilities", profile.capabilities.filter((_, j) => j !== i))
                  }
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground/60 hover:text-foreground gap-1 mt-1"
              onClick={() => onUpdate("capabilities", [...profile.capabilities, ""])}
            >
              <Plus className="h-3 w-3" /> Ajouter
            </Button>
          </div>

          {/* Hosting compat */}
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground/50">
              {LABELS.stackProfiles.profiles.hostingCompat}
            </Label>
            {profile.hostingCompat.map((h, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-sky-500/30 text-sky-400">{h}</Badge>
                <Input
                  value={h}
                  onChange={(e) => {
                    const next = [...profile.hostingCompat];
                    next[i] = e.target.value;
                    onUpdate("hostingCompat", next);
                  }}
                  className="h-7 text-xs flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground/50 hover:text-destructive shrink-0"
                  onClick={() =>
                    onUpdate("hostingCompat", profile.hostingCompat.filter((_, j) => j !== i))
                  }
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground/60 hover:text-foreground gap-1 mt-1"
              onClick={() => onUpdate("hostingCompat", [...profile.hostingCompat, ""])}
            >
              <Plus className="h-3 w-3" /> Ajouter
            </Button>
          </div>

          {/* Pricing notes */}
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground/50">
              {LABELS.stackProfiles.profiles.pricingNotes}
            </Label>
            {profile.pricingNotes.map((note, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-amber-400 text-xs">•</span>
                <Input
                  value={note}
                  onChange={(e) => {
                    const next = [...profile.pricingNotes];
                    next[i] = e.target.value;
                    onUpdate("pricingNotes", next);
                  }}
                  className="h-7 text-xs flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground/50 hover:text-destructive shrink-0"
                  onClick={() =>
                    onUpdate("pricingNotes", profile.pricingNotes.filter((_, j) => j !== i))
                  }
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground/60 hover:text-foreground gap-1 mt-1"
              onClick={() => onUpdate("pricingNotes", [...profile.pricingNotes, ""])}
            >
              <Plus className="h-3 w-3" /> Ajouter
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
