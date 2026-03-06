"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { JsonValue } from "../../../logic/spec-types";

export function CompatAddRow({
  existingKeys,
  onAdd,
}: {
  existingKeys: Record<string, JsonValue>;
  onAdd: (key: string) => void;
}) {
  const [newKey, setNewKey] = useState("");
  return (
    <div className="flex items-center gap-2 pt-2 border-t border-border/30">
      <Input
        placeholder="Stack (ex: SVELTEKIT)"
        value={newKey}
        onChange={(e) => setNewKey(e.target.value)}
        className="h-7 text-xs font-mono w-40"
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground/60 hover:text-foreground gap-1"
        disabled={!newKey || newKey in existingKeys}
        onClick={() => {
          onAdd(newKey);
          setNewKey("");
        }}
      >
        <Plus className="h-3 w-3" /> Ajouter
      </Button>
    </div>
  );
}
