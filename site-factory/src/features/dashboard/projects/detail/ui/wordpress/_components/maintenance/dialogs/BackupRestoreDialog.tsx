import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { BackupEntry } from "../../types";

export function BackupRestoreDialog({
  entry,
  disabled,
  busy,
  onRestore,
}: {
  entry: BackupEntry;
  disabled: boolean;
  busy: boolean;
  onRestore: (payload: { type: "db" | "uploads" | "full"; db?: string; uploads?: string }) => void;
}) {
  const dbPath = entry.db?.path;
  const uploadsPath = entry.uploads?.path;
  const hasDb = Boolean(dbPath);
  const hasUploads = Boolean(uploadsPath);
  const canFull = hasDb && hasUploads;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          disabled={disabled || busy || (!hasDb && !hasUploads)}
        >
          {busy ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
          Restaurer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restaurer la sauvegarde</DialogTitle>
          <DialogDescription>
            Restauration complete (DB + uploads). Cette action remplace les donnees existantes pour l&apos;environnement courant.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          <p>Date: {entry.createdAt}</p>
          <p>DB: {entry.db?.name ?? "n/a"}</p>
          <p>Uploads: {entry.uploads?.name ?? "n/a"}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={disabled || busy || !canFull}
            onClick={() => {
              if (!dbPath || !uploadsPath) return;
              onRestore({
                type: "full",
                db: dbPath,
                uploads: uploadsPath,
              });
            }}
          >
            Restaurer complet (DB + uploads)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
