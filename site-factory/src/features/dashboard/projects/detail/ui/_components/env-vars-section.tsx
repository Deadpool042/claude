"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function EnvVarsSection(props: {
  envVars: { key: string; value: string }[];
  envVarsJson: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: "key" | "value", val: string) => void;
}) {
  const { envVars, envVarsJson, onAdd, onRemove, onUpdate } = props;

  return (
    <div className="border-t pt-5">
      <input type="hidden" name="envVarsJson" value={envVarsJson} />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Variables d&apos;environnement</Label>
          <Button type="button" variant="outline" size="sm" onClick={onAdd}>
            <Plus className="mr-1 size-3.5" />
            Ajouter
          </Button>
        </div>

        {envVars.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune variable définie. Cliquez sur « Ajouter » pour injecter des variables dans le conteneur.
          </p>
        ) : (
          <div className="space-y-2">
            {envVars.map((envVar, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={envVar.key}
                  onChange={(e) => onUpdate(index, "key", e.target.value)}
                  placeholder="NOM_VARIABLE"
                  className="font-mono text-xs"
                />
                <span className="shrink-0 text-muted-foreground">=</span>
                <Input
                  value={envVar.value}
                  onChange={(e) => onUpdate(index, "value", e.target.value)}
                  placeholder="valeur"
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}