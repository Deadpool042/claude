"use client";

import { useState } from "react";
import {
  Power,
  PowerOff,
  ScrollText,
  Loader2,
  Trash2,
  Eraser,
  Bomb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ServiceInfo } from "./services-orchestrator";

interface GlobalActionsProps {
  services: ServiceInfo[];
  loading: boolean;
  actionLoading: string | null;
  allRunning: boolean;
  runningCount: number;
  error: string | null;
  onAction: (action: string) => void;
  onShowLogs: () => void;
  activeLog: string | null;
}

export function GlobalActions({
  services,
  loading,
  actionLoading,
  allRunning,
  runningCount,
  error,
  onAction,
  onShowLogs,
  activeLog,
}: GlobalActionsProps) {
  const isAnyRunning = runningCount > 0;
  const [confirmClean, setConfirmClean] = useState(false);

  return (
    <div className="space-y-3">
      {/* ── Main actions bar ────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium">État global</h2>
          {!loading && services.length > 0 ? (
            <Badge
              variant={allRunning ? "default" : isAnyRunning ? "secondary" : "outline"}
            >
              {allRunning
                ? "Tous actifs"
                : isAnyRunning
                  ? `${String(runningCount)}/${String(services.length)} actifs`
                  : "Inactifs"}
            </Badge>
          ) : null}
          {error ? (
            <span className="text-xs text-destructive">{error}</span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {!allRunning ? (
            <Button
              size="sm"
              disabled={actionLoading !== null || services.length === 0}
              onClick={() => { onAction("up"); }}
            >
              {actionLoading === "up-all" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Power className="size-4" />
              )}
              Tout démarrer
            </Button>
          ) : null}

          {isAnyRunning ? (
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading !== null}
              onClick={() => { onAction("stop"); }}
            >
              {actionLoading === "stop-all" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PowerOff className="size-4" />
              )}
              Tout arrêter
            </Button>
          ) : null}

          <Button
            variant={activeLog === "all" ? "secondary" : "outline"}
            size="sm"
            disabled={services.length === 0}
            onClick={onShowLogs}
          >
            <ScrollText className="size-4" />
            Logs
          </Button>

          {/* ── Cleanup actions ─────────────────────────────── */}
          <Button
            variant="outline"
            size="sm"
            disabled={actionLoading !== null || services.length === 0}
            onClick={() => { onAction("prune"); }}
          >
            {actionLoading === "prune-all" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Eraser className="size-4" />
            )}
            Nettoyer
          </Button>

          {!confirmClean ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={actionLoading !== null || services.length === 0}
              onClick={() => { setConfirmClean(true); }}
            >
              <Bomb className="size-4" />
              Tout supprimer
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="destructive"
                size="sm"
                disabled={actionLoading !== null}
                onClick={() => {
                  setConfirmClean(false);
                  onAction("down-clean");
                }}
              >
                {actionLoading === "down-clean-all" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Confirmer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setConfirmClean(false); }}
              >
                Annuler
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
