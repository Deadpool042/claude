"use client";

import { useCallback, useState } from "react";
import { Globe, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface Website {
  id: string;
  label: string;
  url: string;
}

interface ClientWebsitesProps {
  clientId: string;
  initialWebsites: Website[];
}

export function ClientWebsites({
  clientId,
  initialWebsites,
}: ClientWebsitesProps) {
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = useCallback(async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/websites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, url }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? "Erreur lors de l'ajout");
        return;
      }
      const website = (await res.json()) as Website;
      setWebsites((prev) => [...prev, website]);
      setLabel("");
      setUrl("");
      setAdding(false);
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }, [clientId, label, url]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/clients/${clientId}/websites`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        setWebsites((prev) => prev.filter((w) => w.id !== id));
      } catch {
        // silently fail
      }
    },
    [clientId],
  );

  return (
    <div className="space-y-3">
      {websites.length === 0 && !adding ? (
        <p className="text-sm text-muted-foreground">Aucun site web</p>
      ) : (
        <ul className="space-y-2">
          {websites.map((w) => (
            <li key={w.id} className="flex items-center gap-2 text-sm">
              <Globe className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{w.label}</span>
              <span className="text-muted-foreground">—</span>
              <a
                href={w.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-muted-foreground hover:underline"
              >
                {w.url.replace(/^https?:\/\//, "")}
              </a>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto size-7 shrink-0 p-0 text-destructive hover:text-destructive"
                onClick={() => void handleDelete(w.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="space-y-3 rounded-md border p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="website-label">Label</Label>
              <Input
                id="website-label"
                placeholder="ex: Site principal"
                value={label}
                onChange={(e) => { setLabel(e.target.value); }}
              />
            </div>
            <div>
              <Label htmlFor="website-url">URL</Label>
              <Input
                id="website-url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => { setUrl(e.target.value); }}
              />
            </div>
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void handleAdd()} disabled={saving}>
              {saving ? "Ajout…" : "Ajouter"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setLabel("");
                setUrl("");
                setError(null);
              }}
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setAdding(true); }}
        >
          <Plus className="size-3.5" />
          Ajouter un site
        </Button>
      )}
    </div>
  );
}
