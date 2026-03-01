"use client";

import { useState, useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  action: (prev: { error: string | null }) => Promise<{ error: string | null }>;
  entityName: string;
  entityLabel: string;
}

export function DeleteButton({
  action,
  entityName,
  entityLabel,
}: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
  });

  if (!confirming) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => { setConfirming(true); }}
      >
        <Trash2 className="size-4" />
        Supprimer
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3">
      <div className="flex-1">
        <p className="text-sm font-medium">
          Supprimer {entityName} &laquo; {entityLabel} &raquo; ?
        </p>
        <p className="text-xs text-muted-foreground">
          Cette action est irréversible.
        </p>
        {state.error ? (
          <p className="mt-1 text-xs text-destructive">{state.error}</p>
        ) : null}
      </div>
      <form action={formAction}>
        <Button
          type="submit"
          variant="destructive"
          size="sm"
          disabled={isPending}
        >
          {isPending ? "Suppression..." : "Confirmer"}
        </Button>
      </form>
      <Button
        variant="outline"
        size="sm"
        onClick={() => { setConfirming(false); }}
        disabled={isPending}
      >
        Annuler
      </Button>
    </div>
  );
}
