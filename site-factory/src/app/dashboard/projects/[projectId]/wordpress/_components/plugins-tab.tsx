"use client";

import {
  ArrowUpCircle,
  Loader2,
  Plug,
  Plus,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { WpPlugin } from "./types";

// ── PluginsTab ─────────────────────────────────────────────────────────

export function PluginsTab({
  plugins,
  newPluginSlug,
  actionLoading,
  onSetSlug,
  onInstallPlugin,
  onTogglePlugin,
  onDeletePlugin,
  onUpdatePlugin,
  onSyncMuPlugins,
}: {
  plugins: WpPlugin[];
  newPluginSlug: string;
  actionLoading: string | null;
  onSetSlug: (v: string) => void;
  onInstallPlugin: (slug: string) => void;
  onTogglePlugin: (name: string, activate: boolean) => void;
  onDeletePlugin: (name: string) => void;
  onUpdatePlugin: (name: string) => void;
  onSyncMuPlugins: () => void;
}) {
  const muPlugins = plugins.filter((plugin) => plugin.status === "must-use");
  const dropins = plugins.filter((plugin) => plugin.status === "dropin");
  const standardPlugins = plugins.filter(
    (plugin) => plugin.status !== "must-use" && plugin.status !== "dropin"
  );

  return (
    <div className="space-y-4">
      {/* Install by slug */}
      <div className="flex gap-2">
        <Input
          placeholder="Slug du plugin (ex: wordfence)…"
          value={newPluginSlug}
          onChange={(e) => {
            onSetSlug(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newPluginSlug.trim())
              onInstallPlugin(newPluginSlug.trim());
          }}
          className="h-9"
        />
        <Button
          size="sm"
          disabled={!newPluginSlug.trim() || actionLoading !== null}
          onClick={() => {
            onInstallPlugin(newPluginSlug.trim());
          }}
        >
          {actionLoading === "install-plugin" ? (
            <Loader2 className="size-3.5 animate-spin mr-1" />
          ) : (
            <Plus className="size-3.5 mr-1" />
          )}
          Installer
        </Button>
      </div>

      {/* Bulk update */}
      {standardPlugins.length > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {String(standardPlugins.length)} plugin
            {standardPlugins.length > 1 ? "s" : ""} installé
            {standardPlugins.length > 1 ? "s" : ""}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            disabled={actionLoading !== null}
            onClick={() => {
              onUpdatePlugin("--all");
            }}
          >
            {actionLoading === "update---all" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <ArrowUpCircle className="size-3" />
            )}
            Tout mettre à jour
          </Button>
        </div>
      ) : null}

      {/* Plugin list */}
      {standardPlugins.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun plugin
        </p>
      ) : (
        <div className="space-y-1.5">
          {standardPlugins.map((plugin) => {
            const isActive = plugin.status === "active";
            return (
              <div
                key={plugin.name}
                className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Plug className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {plugin.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    v{plugin.version}
                  </span>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="text-[10px] px-1.5 py-0 shrink-0"
                  >
                    {isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {/* Update button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    title="Mettre à jour"
                    disabled={actionLoading !== null}
                    onClick={() => {
                      onUpdatePlugin(plugin.name);
                    }}
                  >
                    {actionLoading === `update-${plugin.name}` ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <ArrowUpCircle className="size-3" />
                    )}
                  </Button>
                  {/* Toggle button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    disabled={actionLoading !== null}
                    onClick={() => {
                      onTogglePlugin(plugin.name, !isActive);
                    }}
                  >
                    {actionLoading === `toggle-${plugin.name}` ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : isActive ? (
                      <PowerOff className="size-3" />
                    ) : (
                      <Power className="size-3" />
                    )}
                    {isActive ? "Désactiver" : "Activer"}
                  </Button>
                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:text-destructive"
                    title="Supprimer"
                    disabled={actionLoading !== null}
                    onClick={() => {
                      onDeletePlugin(plugin.name);
                    }}
                  >
                    {actionLoading === `delete-plugin-${plugin.name}` ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 className="size-3" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MU-plugins */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Extensions obligatoires (MU-plugins)
          </p>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={actionLoading !== null}
            onClick={onSyncMuPlugins}
          >
            {actionLoading === "sync-mu-plugins" ? (
              <Loader2 className="size-3 animate-spin mr-1" />
            ) : null}
            Synchroniser
          </Button>
        </div>
        {muPlugins.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Aucun MU-plugin détecté. Ils sont copiés depuis{" "}
            <code className="bg-muted px-1 rounded font-mono">assets/wp/mu-plugins</code>{" "}
            lors d&apos;un « Installer » ou d&apos;un preset.
          </p>
        ) : (
          <div className="space-y-1.5">
            {muPlugins.map((plugin) => (
              <div
                key={plugin.name}
                className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Plug className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {plugin.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    v{plugin.version}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 shrink-0"
                  >
                    Obligatoire
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drop-ins */}
      {dropins.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Drop-ins</p>
          <div className="space-y-1.5">
            {dropins.map((plugin) => (
              <div
                key={plugin.name}
                className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/10"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Plug className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {plugin.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    v{plugin.version}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 shrink-0"
                  >
                    Drop-in
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
