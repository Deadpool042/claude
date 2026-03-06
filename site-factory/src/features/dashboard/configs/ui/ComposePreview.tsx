"use client";

import * as React from "react";
import { useMediaQuery } from "@/shared/hooks";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";

type ComposeMode = "dev" | "prod-like";

type Props = {
  title: string;
  description?: string;
  client: string;
  project: string;
  mode: ComposeMode;
  pathLabel: string; // ex: docker-compose.local.yml
};

export function ComposePreview(props: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [content, setContent] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        client: props.client,
        project: props.project,
        mode: props.mode,
      });
      const res = await fetch(`/api/docker/compose/file?${qs.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as { ok: boolean; content?: string; error?: string };
      if (!json.ok) throw new Error(json.error || "Impossible de charger le fichier.");
      setContent(json.content || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  function onOpenChange(v: boolean) {
    setOpen(v);
    if (v && !content && !loading && !error) void load();
  }

  const body = (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium text-foreground">{props.pathLabel}</div>
          <div>
            {props.client}/{props.project} — {props.mode}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            Rafraîchir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(content || "")}
            disabled={!content}
          >
            Copier
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Chargement…</div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : (
        <pre className="max-h-[60vh] overflow-auto rounded-md border bg-muted/30 p-3 text-xs leading-relaxed">
          <code>{content || "Fichier vide."}</code>
        </pre>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Voir
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            {props.description ? <DialogDescription>{props.description}</DialogDescription> : null}
          </DialogHeader>
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          Voir
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{props.title}</DrawerTitle>
          {props.description ? <DrawerDescription>{props.description}</DrawerDescription> : null}
        </DrawerHeader>
        <div className="px-4 pb-4">{body}</div>
      </DrawerContent>
    </Drawer>
  );
}