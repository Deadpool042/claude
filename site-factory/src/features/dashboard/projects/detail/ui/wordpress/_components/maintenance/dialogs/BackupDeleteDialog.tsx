import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { BackupEntry } from "../../types";

export function BackupDeleteDialog({
  entry,
  disabled,
  busy,
  onDelete,
}: {
  entry: BackupEntry;
  disabled: boolean;
  busy: boolean;
  onDelete: (stamp: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          className="h-7 text-xs"
          disabled={disabled || busy}
        >
          {busy ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
          Supprimer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer la sauvegarde</DialogTitle>
          <DialogDescription>
            Cette action supprime les fichiers DB et uploads pour ce snapshot.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          <p>Date: {entry.createdAt}</p>
          <p>DB: {entry.db?.name ?? "n/a"}</p>
          <p>Uploads: {entry.uploads?.name ?? "n/a"}</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={busy}
            onClick={() => setOpen(false)}
          >
            Annuler
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 text-xs"
            disabled={busy}
            onClick={() => {
              onDelete(entry.stamp);
              setOpen(false);
            }}
          >
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
