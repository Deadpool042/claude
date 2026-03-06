"use client";

import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import type { WpPage } from "./types";

// ── PagesTab ──────────────────────────────────────────────────────────

export function PagesTab({
  pages,
  newPageTitle,
  actionLoading,
  onSetTitle,
  onCreatePage,
  onDeletePage,
}: {
  pages: WpPage[];
  newPageTitle: string;
  actionLoading: string | null;
  onSetTitle: (v: string) => void;
  onCreatePage: (title: string) => void;
  onDeletePage: (id: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Titre de la page…"
          value={newPageTitle}
          onChange={(e) => {
            onSetTitle(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newPageTitle.trim())
              onCreatePage(newPageTitle.trim());
          }}
          className="h-9"
        />
        <Button
          size="sm"
          disabled={!newPageTitle.trim() || actionLoading !== null}
          onClick={() => {
            onCreatePage(newPageTitle.trim());
          }}
        >
          {actionLoading === "create-page" ? (
            <Loader2 className="size-3.5 animate-spin mr-1" />
          ) : (
            <Plus className="size-3.5 mr-1" />
          )}
          Ajouter
        </Button>
      </div>

      {pages.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune page
        </p>
      ) : (
        <div className="space-y-1.5">
          {pages.map((page) => (
            <div
              key={page.ID}
              className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="size-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{page.post_title}</span>
                <Badge
                  variant={
                    page.post_status === "publish" ? "default" : "secondary"
                  }
                  className="text-[10px] px-1.5 py-0"
                >
                  {page.post_status === "publish" ? "Publié" : "Brouillon"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                disabled={actionLoading !== null}
                onClick={() => {
                  onDeletePage(page.ID);
                }}
              >
                {actionLoading === `delete-${String(page.ID)}` ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Trash2 className="size-3" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
