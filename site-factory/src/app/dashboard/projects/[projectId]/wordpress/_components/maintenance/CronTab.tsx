import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { WpCronEvent } from "../types";
import { formatArgs, formatDate } from "./utils/helpers";

interface CronTabProps {
  cronEvents: WpCronEvent[] | null;
  disableRuntimeActions: boolean;
  isRefreshingCron: boolean;
  onRefreshCron: () => void;
}

function getNextCron(events: WpCronEvent[] | null): string | null {
  if (!events || events.length === 0) return null;
  let best: { ts: number; raw: string } | null = null;
  for (const event of events) {
    const ts = Date.parse(event.next_run);
    if (Number.isNaN(ts)) continue;
    if (!best || ts < best.ts) best = { ts, raw: event.next_run };
  }
  return best ? best.raw : events[0]?.next_run ?? null;
}

export default function CronTab({
  cronEvents,
  disableRuntimeActions,
  isRefreshingCron,
  onRefreshCron,
}: CronTabProps) {
  const nextCron = getNextCron(cronEvents);
  const sortedCronEvents = cronEvents
    ? [...cronEvents].sort((a, b) => {
        const aTs = Date.parse(a.next_run);
        const bTs = Date.parse(b.next_run);
        if (Number.isNaN(aTs) || Number.isNaN(bTs)) return 0;
        return aTs - bTs;
      })
    : [];

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">WP-Cron</p>
          <p className="text-xs text-muted-foreground">
            Liste complete des events planifies.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          disabled={disableRuntimeActions}
          onClick={onRefreshCron}
        >
          {isRefreshingCron ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
          Rafraichir
        </Button>
      </div>
      <div className="text-xs text-muted-foreground">
        <p>Events detectes: {cronEvents ? String(cronEvents.length) : "n/a"}</p>
        <p>Prochain: {formatDate(nextCron)}</p>
      </div>
      {sortedCronEvents.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucun event detecte.</p>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
            <span>Hook</span>
            <span>Prochain run</span>
            <span>Schedule</span>
          </div>
          <div className="max-h-80 overflow-auto divide-y">
            {sortedCronEvents.map((event) => (
              <div key={`${event.hook}-${event.next_run}`} className="px-3 py-2 text-xs">
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-2">
                  <code className="text-[11px]">{event.hook}</code>
                  <span>{formatDate(event.next_run)}</span>
                  <span>{event.schedule ?? "n/a"}</span>
                </div>
                {event.next_run_relative ? (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {event.next_run_relative}
                  </p>
                ) : null}
                {event.args ? (
                  <details className="text-[11px] text-muted-foreground mt-1">
                    <summary className="cursor-pointer">Args</summary>
                    <pre className="mt-1 whitespace-pre-wrap">{formatArgs(event.args)}</pre>
                  </details>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
