"use client";

import {
  Check,
  Download,
  ExternalLink,
  Info,
  Loader2,
  Plug,
  Search,
  Star,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import type { WpPluginSearchResult } from "@/app/api/wp-plugins/search/route";
import { formatInstalls } from "./types";

// ── SearchTab (Store WordPress.org) ───────────────────────────────────

export function SearchTab({
  searchQuery,
  searchResults,
  searchLoading,
  searchPage,
  searchTotalPages,
  searchTotalResults,
  installedSlugs,
  actionLoading,
  onSearchInput,
  onPageChange,
  onInstallPlugin,
}: {
  searchQuery: string;
  searchResults: WpPluginSearchResult[];
  searchLoading: boolean;
  searchPage: number;
  searchTotalPages: number;
  searchTotalResults: number;
  installedSlugs: Set<string>;
  actionLoading: string | null;
  onSearchInput: (v: string) => void;
  onPageChange: (p: number) => void;
  onInstallPlugin: (slug: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un plugin sur WordPress.org…"
            value={searchQuery}
            onChange={(e) => {
              onSearchInput(e.target.value);
            }}
            className="h-9 pl-8"
          />
        </div>
        {searchLoading ? (
          <div className="flex items-center px-2">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : null}
      </div>

      {searchTotalResults > 0 ? (
        <p className="text-xs text-muted-foreground">
          {String(searchTotalResults)} résultat
          {searchTotalResults > 1 ? "s" : ""} trouvé
          {searchTotalResults > 1 ? "s" : ""}
        </p>
      ) : null}

      {/* Results grid */}
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {searchResults.map((plugin) => {
            const installed = installedSlugs.has(plugin.slug);
            return (
              <div
                key={plugin.slug}
                className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                  installed
                    ? "bg-green-500/5 border-green-500/20"
                    : "hover:bg-muted/30"
                }`}
              >
                {/* Icon */}
                {plugin.icon ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={plugin.icon}
                    alt=""
                    className="size-10 rounded shrink-0 object-cover"
                  />
                ) : (
                  <div className="size-10 rounded bg-muted flex items-center justify-center shrink-0">
                    <Plug className="size-5 text-muted-foreground" />
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">
                      {plugin.name}
                    </p>
                    {plugin.homepage ? (
                      <a
                        href={plugin.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        title="Voir sur WordPress.org"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {plugin.shortDescription}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Star className="size-3 text-yellow-500" />
                      {String(Math.round(plugin.rating / 20))}/5
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Download className="size-3" />
                      {formatInstalls(plugin.activeInstalls)}
                    </span>
                    <span>v{plugin.version}</span>
                  </div>
                </div>

                {/* Install button */}
                <div className="shrink-0 flex items-start">
                  {installed ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-green-600 border-green-500/30"
                    >
                      <Check className="size-2.5 mr-0.5" /> Installé
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      disabled={actionLoading !== null}
                      onClick={() => {
                        onInstallPlugin(plugin.slug);
                      }}
                    >
                      {actionLoading === `install-${plugin.slug}` ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Download className="size-3" />
                      )}
                      Installer
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Empty state */}
      {searchQuery.length >= 2 &&
      !searchLoading &&
      searchResults.length === 0 ? (
        <div className="text-center py-8">
          <Info className="size-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Aucun plugin trouvé pour « {searchQuery} »
          </p>
        </div>
      ) : null}

      {searchQuery.length === 0 ? (
        <div className="text-center py-8">
          <Search className="size-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Recherchez des plugins sur le store officiel WordPress.org
          </p>
        </div>
      ) : null}

      {/* Pagination */}
      {searchTotalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            disabled={searchPage <= 1 || searchLoading}
            onClick={() => {
              onPageChange(searchPage - 1);
            }}
          >
            Précédent
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {String(searchPage)} / {String(searchTotalPages)}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            disabled={searchPage >= searchTotalPages || searchLoading}
            onClick={() => {
              onPageChange(searchPage + 1);
            }}
          >
            Suivant
          </Button>
        </div>
      ) : null}
    </div>
  );
}
