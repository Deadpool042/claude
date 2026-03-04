import type { MaintenanceStatus, WpCronEvent } from "../types";
import { formatDate } from "./utils/helpers";
import { SummaryBadge, type SummaryStatus } from "./utils/SummaryBadge";

interface OverviewTabProps {
  testsStatus: SummaryStatus;
  monitoringStatus: SummaryStatus;
  cronStatus: SummaryStatus;
  backupStatus: SummaryStatus;
  maintenanceStatus: MaintenanceStatus | null;
  cronEvents: WpCronEvent[] | null;
  honeypotTest: { testedAt: string } | null;
}

export default function OverviewTab({
  testsStatus,
  monitoringStatus,
  cronStatus,
  backupStatus,
  maintenanceStatus,
  cronEvents,
  honeypotTest,
}: OverviewTabProps) {
  const nextCron = cronEvents && cronEvents.length > 0 ? cronEvents[0].next_run : null;
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-lg border p-4 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Tests</p>
          <SummaryBadge item={{ id: "tests", label: "Tests", status: testsStatus }} />
        </div>
        <p className="text-sm font-medium">Honeypot CF7</p>
        <p className="text-[11px] text-muted-foreground">
          Dernier test: {honeypotTest ? honeypotTest.testedAt : "n/a"}
        </p>
      </div>
      <div className="rounded-lg border p-4 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Monitoring</p>
          <SummaryBadge item={{ id: "monitoring", label: "Monitoring", status: monitoringStatus }} />
        </div>
        <p className="text-sm font-medium">Health check</p>
        <p className="text-[11px] text-muted-foreground">
          Dernier check: {formatDate(maintenanceStatus?.last_health_at)}
        </p>
      </div>
      <div className="rounded-lg border p-4 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Cron</p>
          <SummaryBadge item={{ id: "cron", label: "Cron", status: cronStatus }} />
        </div>
        <p className="text-sm font-medium">
          {cronEvents ? `${String(cronEvents.length)} events` : "n/a"}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Prochain: {formatDate(nextCron)}
        </p>
      </div>
      <div className="rounded-lg border p-4 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Sauvegardes</p>
          <SummaryBadge item={{ id: "backups", label: "Backups", status: backupStatus }} />
        </div>
        <p className="text-sm font-medium">Backup local</p>
        <p className="text-[11px] text-muted-foreground">
          Derniere: {formatDate(maintenanceStatus?.last_backup_at)}
        </p>
      </div>
    </div>
  );
}
