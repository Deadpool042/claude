"use client";

import { Check, Loader2, Lock, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { WpTheme } from "./types";

// ── ThemesTab ─────────────────────────────────────────────────────────

export function ThemesTab({
  themes,
  actionLoading,
  onActivateTheme,
}: {
  themes: WpTheme[];
  actionLoading: string | null;
  onActivateTheme: (name: string) => void;
}) {
  const hasChildTheme = themes.some((theme) => theme.name === "sf-tt5");
  const childTheme = themes.find((theme) => theme.name === "sf-tt5");
  const childActive = childTheme?.status === "active";
  const parentActive = themes.some(
    (theme) => theme.name === "twentytwentyfive" && theme.status === "active"
  );
  const suggestChildActivation = hasChildTheme && parentActive && !childActive;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-1.5">
      {themes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun thème
        </p>
      ) : (
        themes.map((theme) => {
          const isActive = theme.status === "active";
          const isParentTheme = theme.name === "twentytwentyfive";
          const lockParentActivation =
            hasChildTheme && isParentTheme && !isActive;
          const showActivateChild = isParentTheme && isActive && suggestChildActivation;
          const hideChildActivate =
            theme.name === "sf-tt5" && suggestChildActivation && !isActive;
          const parentLabel =
            theme.name === "sf-tt5" ? "parent: twentytwentyfive" : null;
          return (
            <div
              key={theme.name}
              className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Palette className="size-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{theme.name}</span>
                {parentLabel ? (
                  <span className="text-[10px] text-muted-foreground">
                    ({parentLabel})
                  </span>
                ) : null}
                <span className="text-xs text-muted-foreground">
                  v{theme.version}
                </span>
                {isActive ? (
                  <Badge className="text-[10px] px-1.5 py-0">Actif</Badge>
                ) : lockParentActivation ? (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    <Lock className="size-2.5 mr-1" /> Parent requis
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {!isActive ? (
                  hideChildActivate ? null : lockParentActivation ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            disabled
                          >
                            <Lock className="size-3" />
                            Activer
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs">
                        Le thème parent doit rester installé, mais le thème
                        actif doit être <strong>sf-tt5</strong>.
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      disabled={actionLoading !== null}
                      onClick={() => {
                        onActivateTheme(theme.name);
                      }}
                    >
                      {actionLoading === `theme-${theme.name}` ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Check className="size-3" />
                      )}
                      Activer
                    </Button>
                  )
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    <Check className="size-2.5 mr-1" /> En cours
                  </Badge>
                )}
                {showActivateChild ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    disabled={actionLoading !== null}
                    onClick={() => {
                      onActivateTheme("sf-tt5");
                    }}
                  >
                    {actionLoading === "theme-sf-tt5" ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Check className="size-3" />
                    )}
                    Activer sf-tt5
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })
      )}
      </div>
    </TooltipProvider>
  );
}
