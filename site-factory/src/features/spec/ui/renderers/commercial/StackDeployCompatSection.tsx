"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { CompatAddRow } from "./CompatAddRow";

interface StackDeployCompatSectionProps {
  compat: Record<string, string[]>;
  onAddStack: (key: string) => void;
  onRemoveStack: (stack: string) => void;
  onUpdateTargets: (stack: string, targets: string[]) => void;
}

export function StackDeployCompatSection({
  compat,
  onAddStack,
  onRemoveStack,
  onUpdateTargets,
}: StackDeployCompatSectionProps) {
  return (
    <div className="grid gap-2">
      {Object.entries(compat).map(([stack, targets]) => (
        <div
          key={stack}
          className="flex items-center gap-3 rounded-md bg-muted/20 px-3 py-2"
        >
          <span className="w-28 text-xs font-medium">{stack}</span>
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {targets.map((target, index) => (
              <div key={`${stack}-${index}`} className="flex items-center gap-0.5">
                <Input
                  value={target}
                  onChange={(event) => {
                    const nextTargets = [...targets];
                    nextTargets[index] = event.target.value;
                    onUpdateTargets(stack, nextTargets);
                  }}
                  className="h-7 w-32 text-[10px] font-mono"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground/50 hover:text-destructive"
                  onClick={() =>
                    onUpdateTargets(
                      stack,
                      targets.filter((_, targetIndex) => targetIndex !== index),
                    )
                  }
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground/50 hover:text-foreground"
              onClick={() => onUpdateTargets(stack, [...targets, ""])}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground/40 hover:text-destructive"
            onClick={() => onRemoveStack(stack)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      <CompatAddRow existingKeys={compat} onAdd={onAddStack} />
    </div>
  );
}
