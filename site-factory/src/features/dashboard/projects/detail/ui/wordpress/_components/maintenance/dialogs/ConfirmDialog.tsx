import { useState, type ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Loader2 } from "lucide-react";

export function ConfirmDialog({
  title,
  description,
  triggerLabel,
  confirmLabel,
  triggerVariant = "outline",
  disabled,
  busy,
  onConfirm,
}: {
  title: string;
  description: ReactNode;
  triggerLabel: string;
  confirmLabel: string;
  triggerVariant?: "outline" | "destructive" | "ghost" | "secondary" | "default";
  disabled: boolean;
  busy: boolean;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={triggerVariant}
          className="h-7 text-xs"
          disabled={disabled || busy}
        >
          {busy ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
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
              onConfirm();
              setOpen(false);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}