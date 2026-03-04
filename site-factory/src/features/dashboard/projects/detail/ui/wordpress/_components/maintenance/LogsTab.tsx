import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LogFilters, MaintenanceLogEntry } from "../types";
import { ConfirmDialog } from "./dialogs/ConfirmDialog";
import {
  LOG_ENV_OPTIONS,
  LOG_LEVEL_OPTIONS,
  LOG_TYPE_LABELS,
  LOG_TYPE_OPTIONS,
} from "./constants";
import { formatLogTimestamp } from "./utils/helpers";
import { logLevelClass } from "./utils/logs";

interface LogsTabProps {
  isProd: boolean;
  disableActions: boolean;
  logEntries: MaintenanceLogEntry[];
  logFilters: LogFilters;
  logServices: string[];
  isRefreshing: boolean;
  isQuerying: boolean;
  isPurging: boolean;
  onApply: () => void;
  onRefresh: () => void;
  onPurge: () => void;
  onUpdateFilters: (next: LogFilters) => void;
}

export default function LogsTab({
  isProd,
  disableActions,
  logEntries,
  logFilters,
  logServices,
  isRefreshing,
  isQuerying,
  isPurging,
  onApply,
  onRefresh,
  onPurge,
  onUpdateFilters,
}: LogsTabProps) {
  const updateLogFilters = (patch: Partial<LogFilters>) => {
    onUpdateFilters({ ...logFilters, ...patch });
  };

  const toggleLogType = (type: string) => {
    const next = logFilters.types.includes(type)
      ? logFilters.types.filter((t) => t !== type)
      : [...logFilters.types, type];
    updateLogFilters({ types: next });
  };

  const serviceOptions = ["all", ...logServices].filter(
    (value, index, self) => self.indexOf(value) === index,
  );
  const activeTypeCount = logFilters.types.length;
  const totalTypeCount = LOG_TYPE_OPTIONS.length;
  const hasTypeSelection = activeTypeCount > 0;
  const logTypeLabels = logFilters.types.map(
    (type) => LOG_TYPE_LABELS[type as keyof typeof LOG_TYPE_LABELS] ?? type,
  );
  const logTypeSummary =
    logFilters.types.length === 0
      ? "Aucun type sélectionné."
      : logFilters.types.length === LOG_TYPE_OPTIONS.length
        ? "Tous les types."
        : `${logTypeLabels.join(", ")}.`;
  const logEnvLabel = logFilters.env === "all" ? "tous" : logFilters.env;
  const isLogsBusy = isRefreshing || isQuerying || isPurging;

  return (
    <>
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Logs centralises</p>
            <p className="text-xs text-muted-foreground">
              HTTP (Traefik), Docker, WordPress et actions de maintenance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={isProd || disableActions}
              onClick={onApply}
            >
              {isQuerying ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
              Appliquer
            </Button>
            <ConfirmDialog
              title="Purger les logs"
              description={
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Supprime les logs pour le scope sélectionné.</p>
                  <p>Env: {logEnvLabel}</p>
                  <p>Types: {logTypeSummary}</p>
                </div>
              }
              triggerLabel="Purger"
              confirmLabel="Purger"
              triggerVariant="destructive"
              disabled={isProd || disableActions || !hasTypeSelection}
              busy={isPurging}
              onConfirm={onPurge}
            />
            <Button
              size="sm"
              className="h-7 text-xs"
              disabled={isProd || disableActions}
              onClick={onRefresh}
            >
              {isRefreshing ? (
                <Loader2 className="size-3 animate-spin mr-1" />
              ) : null}
              Rafraîchir
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Date</span>
            <Input
              type="date"
              value={logFilters.date}
              onChange={(event) => updateLogFilters({ date: event.target.value })}
            />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Env</span>
            <Select
              value={logFilters.env}
              onValueChange={(value) =>
                updateLogFilters({ env: value as LogFilters["env"] })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Env" />
              </SelectTrigger>
              <SelectContent>
                {LOG_ENV_OPTIONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Niveau</span>
            <Select
              value={logFilters.level}
              onValueChange={(value) =>
                updateLogFilters({ level: value as LogFilters["level"] })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                {LOG_LEVEL_OPTIONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Service</span>
            <Select
              value={logFilters.service}
              onValueChange={(value) => updateLogFilters({ service: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                {serviceOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">
              Types actifs: {String(activeTypeCount)}/{String(totalTypeCount)}
            </span>
            <Button
              size="xs"
              variant="ghost"
              className="h-6 text-[10px]"
              disabled={isLogsBusy}
              onClick={() =>
                onUpdateFilters({ ...logFilters, types: [...LOG_TYPE_OPTIONS] })
              }
            >
              Tout sélectionner
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {LOG_TYPE_OPTIONS.map((type) => {
              const selected = logFilters.types.includes(type);
              return (
                <Button
                  key={type}
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-7 text-xs",
                    selected
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                      : "border-muted-foreground/30 text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => toggleLogType(type)}
                  disabled={isLogsBusy}
                >
                  {selected ? <Check className="size-3" /> : null}
                  {LOG_TYPE_LABELS[type] ?? type}
                </Button>
              );
            })}
          </div>
          {!hasTypeSelection ? (
            <p className="text-[11px] text-amber-400">
              Aucun type sélectionné.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-50 flex-1">
            <Input
              placeholder="Rechercher dans les logs..."
              value={logFilters.search}
              onChange={(event) => updateLogFilters({ search: event.target.value })}
            />
          </div>
          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
            {String(logEntries.length)} lignes
          </Badge>
        </div>

        {isProd ? (
          <p className="text-xs text-muted-foreground">
            Les logs en production seront disponibles quand la cible sera branchée.
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border overflow-hidden">
        {logEntries.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground">
            Aucun log pour la période sélectionnée.
          </div>
        ) : (
          <div className="max-h-105 overflow-auto">
            <div className="grid grid-cols-[140px_90px_130px_1fr] gap-2 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
              <span>Horodatage</span>
              <span>Niveau</span>
              <span>Service</span>
              <span>Message</span>
            </div>
            <div className="divide-y">
              {logEntries.map((entry, index) => (
                <div key={`${entry.ts}-${String(index)}`} className="px-3 py-2 text-xs">
                  <div className="grid grid-cols-[140px_90px_130px_1fr] gap-2 items-start">
                    <span className="text-[11px] text-muted-foreground">
                      {formatLogTimestamp(entry.ts)}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${logLevelClass(entry.level)}`}
                    >
                      {entry.level}
                    </Badge>
                    <span className="text-[11px]">
                      {entry.service ?? entry.source}
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-medium">{entry.message}</p>
                      <div className="text-[10px] text-muted-foreground">
                        Env: {entry.env} | Type: {entry.type} | Source: {entry.source}
                      </div>
                      {entry.meta ? (
                        <details className="text-[10px] text-muted-foreground">
                          <summary className="cursor-pointer">Details</summary>
                          <pre className="mt-1 whitespace-pre-wrap">
                            {JSON.stringify(entry.meta, null, 2)}
                          </pre>
                        </details>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
