"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SummaryBadge, type SummaryStatus, type SummaryItem } from "./maintenance/utils/SummaryBadge";
import OverviewTab from "./maintenance/OverviewTab";
import MuTab from "./maintenance/MuTab";
import TestsTab from "./maintenance/TestsTab";
import MonitoringTab from "./maintenance/MonitoringTab";
import CronTab from "./maintenance/CronTab";
import BackupsTab from "./maintenance/BackupsTab";
import LogsTab from "./maintenance/LogsTab";
import AnalyticsTab from "./maintenance/AnalyticsTab";
import { DEV_MODE_OPTIONS, MAINTENANCE_TABS, formatEnv } from "./maintenance/constants";
import { runtimeStatusClass, runtimeStatusLabel } from "./maintenance/utils/status";
import type {
  DevMode,
  HostingProfileId,
  RuntimeStatus,
  RuntimeStatusState,
  WpInfo,
  SocleSnapshot,
  MaintenanceStatus,
  BackupEntry,
  MonitoringSnapshot,
  WpCronEvent,
  MaintenanceLogEntry,
  LogFilters,
  HoneypotCheck,
  HoneypotTest,
} from "./types";
import type { WpInfraFeature } from "@/lib/wp-features";
import type { WpInfraStatusValue } from "@/lib/wp-infra";
import { cn } from "@/lib/utils";
import { INFRA_FEATURES } from "@/lib/wp-features";

export function MaintenanceTab({
  devMode,
  hostingProfileId,
  runtimeStatus,
  info,
  socle,
  maintenanceStatus,
  backupEntries,
  backupError,
  monitoringSnapshot,
  cronEvents,
  logEntries,
  logFilters,
  logServices,
  actionLoading,
  honeypotCheck,
  honeypotTest,
  onSetDevMode,
  onRunHoneypotCheck,
  onRunHoneypotTest,
  onRefreshOverview,
  onRefreshMonitoring,
  onRefreshCron,
  onRefreshLogs,
  onPurgeLogs,
  onApplyLogFilters,
  onUpdateLogFilters,
  onRunHealthCheck,
  onRunBackup,
  onRefreshBackups,
  onRestoreBackup,
  onDeleteBackup,
  onPurgeMonitoring,
  onSyncMuPlugins,
  onUpdateInfraStatus,
}: {
  devMode?: DevMode | null;
  hostingProfileId?: HostingProfileId | null;
  runtimeStatus: RuntimeStatus | null;
  info: WpInfo;
  socle: SocleSnapshot | null;
  maintenanceStatus: MaintenanceStatus | null;
  backupEntries: BackupEntry[];
  backupError: string | null;
  monitoringSnapshot: MonitoringSnapshot | null;
  cronEvents: WpCronEvent[] | null;
  logEntries: MaintenanceLogEntry[];
  logFilters: LogFilters;
  logServices: string[];
  actionLoading: string | null;
  honeypotCheck: HoneypotCheck | null;
  honeypotTest: HoneypotTest | null;
  onSetDevMode: (nextMode: DevMode) => void;
  onRunHoneypotCheck: () => void;
  onRunHoneypotTest: () => void;
  onRefreshOverview: () => void;
  onRefreshMonitoring: () => void;
  onRefreshCron: () => void;
  onRefreshLogs: () => void;
  onPurgeLogs: () => void;
  onApplyLogFilters: () => void;
  onUpdateLogFilters: (next: LogFilters) => void;
  onRunHealthCheck: () => void;
  onRunBackup: () => void;
  onRefreshBackups: () => void;
  onRestoreBackup: (payload: {
    type: "db" | "uploads" | "full";
    db?: string;
    uploads?: string;
  }) => void;
  onDeleteBackup: (stamp: string) => void;
  onPurgeMonitoring: () => void;
  onSyncMuPlugins: () => void;
  onUpdateInfraStatus: (feature: WpInfraFeature, status: WpInfraStatusValue) => void;
}) {
  const env = formatEnv(devMode);
  const isProd = devMode === "PROD";
  const runtimeState: RuntimeStatusState = runtimeStatus?.status ?? (isProd ? "prod" : "unknown");
  const runtimeReady = runtimeState === "running" || runtimeState === "partial";
  const runtimeBlocked = !isProd && !runtimeReady;
  const runtimeNote = (() => {
    if (isProd) {
      return "Production: actions branchees plus tard selon la cible.";
    }
    switch (runtimeState) {
      case "no_compose":
        return "Compose manquant pour cet environnement. Genere puis demarre les services.";
      case "stopped":
        return "Services Docker arretes pour cet environnement.";
      case "unknown":
        return "Etat runtime indisponible.";
      case "partial":
        return "Services partiels: certaines actions peuvent echouer.";
      default:
        return null;
    }
  })();
  const tabContentClass = (base: string) =>
    cn(base, runtimeBlocked ? "opacity-50 pointer-events-none" : "");

  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefreshPaused, setAutoRefreshPaused] = useState(false);
  const autoRefreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backupsLoadedRef = useRef(false);

  useEffect(() => {
    backupsLoadedRef.current = false;
  }, [devMode]);

  useEffect(() => {
    if (activeTab !== "backups") return;
    if (backupsLoadedRef.current) return;
    backupsLoadedRef.current = true;
    onRefreshBackups();
  }, [activeTab, devMode, onRefreshBackups]);

  const cf7Active = info.plugins.some(
    (p) => p.name === "contact-form-7" && p.status === "active",
  );
  const muHoneypotPresent = info.plugins.some(
    (p) => p.name === "sf-cf7-honeypot" && p.status === "must-use",
  );
  const muLocalSslPresent = info.plugins.some(
    (p) => p.name === "sf-local-ssl" && p.status === "must-use",
  );

  const infraFeatures = socle
    ? INFRA_FEATURES.filter((f) => socle.features.includes(f))
    : [];
  const infraStatus = socle?.infraStatus ?? {};

  const isChecking = actionLoading === "honeypot-check";
  const isTesting = actionLoading === "test-honeypot";
  const isSyncingMu = actionLoading === "sync-mu-plugins";
  const isRefreshing = actionLoading === "monitoring-refresh";
  const isPurgingMonitoring = actionLoading === "monitoring-purge";
  const isRefreshingCron = actionLoading === "list-cron";
  const isRefreshingOverview = actionLoading === "maintenance-overview";
  const isHealthRunning = actionLoading === "run-health-check";
  const isBackupRunning = actionLoading === "run-backup";
  const isRefreshingBackups = actionLoading === "backups-refresh";
  const isRestoringBackup = actionLoading === "restore-backup";
  const isDeletingBackup = actionLoading === "backups-delete";
  const isSwitchingEnv = actionLoading === "dev-mode";
  const isRefreshingLogs = actionLoading === "logs-refresh";
  const isQueryingLogs = actionLoading === "logs-query";
  const isPurgingLogs = actionLoading === "logs-purge";
  const disableRuntimeActions = isProd || runtimeBlocked || actionLoading !== null;

  const testsStatus: SummaryStatus = honeypotTest
    ? honeypotTest.ok
      ? "ok"
      : "ko"
    : "todo";
  const monitoringStatus: SummaryStatus =
    maintenanceStatus?.last_health_ok === undefined
      ? "todo"
      : maintenanceStatus.last_health_ok
        ? "ok"
        : "ko";
  const cronStatus: SummaryStatus = cronEvents
    ? cronEvents.length > 0
      ? "ok"
      : "ko"
    : "todo";
  const backupStatus: SummaryStatus = maintenanceStatus?.last_backup_at
    ? "ok"
    : "todo";

  const summaryItems: SummaryItem[] = [
    { id: "tests", label: "Tests", status: testsStatus },
    { id: "monitoring", label: "Monitoring", status: monitoringStatus },
    { id: "cron", label: "Cron", status: cronStatus },
    { id: "backups", label: "Backups", status: backupStatus },
  ];

  const httpMetrics = monitoringSnapshot?.http;
  const trafficMetrics = monitoringSnapshot?.traffic;

  const autoRefreshEnabled =
    activeTab === "monitoring" && !isProd && !runtimeBlocked && !autoRefreshPaused;
  const autoRefreshIntervalMs = useMemo(() => {
    const rps = trafficMetrics?.rpsAvg ?? 0;
    const total = httpMetrics?.total ?? 0;
    if (rps >= 5) return 30_000;
    if (rps >= 1) return 45_000;
    if (total > 0) return 60_000;
    return 120_000;
  }, [trafficMetrics?.rpsAvg, httpMetrics?.total]);
  const autoRefreshLabel = !isProd && !runtimeBlocked
    ? autoRefreshPaused
      ? "pause"
      : `${Math.round(autoRefreshIntervalMs / 1000)}s`
    : null;

  useEffect(() => {
    if (!autoRefreshEnabled || isRefreshing) {
      if (autoRefreshRef.current) {
        clearTimeout(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
      return;
    }

    autoRefreshRef.current = setTimeout(() => {
      onRefreshMonitoring();
    }, autoRefreshIntervalMs);

    return () => {
      if (autoRefreshRef.current) {
        clearTimeout(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
    };
  }, [autoRefreshEnabled, autoRefreshIntervalMs, isRefreshing, onRefreshMonitoring]);

  return (
    <TooltipProvider delayDuration={150}>
      <Tabs
        orientation="vertical"
        value={activeTab}
        onValueChange={setActiveTab}
        className="gap-6"
      >
        <TabsList
          variant="line"
          className="min-w-50 flex-col items-start border-r pr-4"
        >
          {MAINTENANCE_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="w-full justify-start gap-2"
              >
                <Icon className="size-4 text-muted-foreground" />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="flex-1 space-y-4">
          <div className="rounded-lg border p-4 bg-muted/20 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{env.label}</Badge>
                  <Badge
                    variant="outline"
                    className={runtimeStatusClass(runtimeState)}
                  >
                    {runtimeStatusLabel(
                      runtimeState,
                      runtimeStatus?.runningCount ?? 0,
                      runtimeStatus?.totalCount ?? 0,
                    )}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {env.hint}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DEV_MODE_OPTIONS.map((opt) => (
                    <Button
                      key={opt.id}
                      size="sm"
                      variant={devMode === opt.id ? "default" : "outline"}
                      className="h-7 text-xs"
                      disabled={actionLoading !== null}
                      onClick={() => onSetDevMode(opt.id)}
                    >
                      {isSwitchingEnv && devMode === opt.id ? (
                        <Loader2 className="size-3 animate-spin mr-1" />
                      ) : null}
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <div className="flex flex-wrap gap-2">
                  {summaryItems.map((item) => (
                    <SummaryBadge key={item.id} item={item} />
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  disabled={disableRuntimeActions}
                  onClick={onRefreshOverview}
                >
                  {isRefreshingOverview ? (
                    <Loader2 className="size-3 animate-spin mr-1" />
                  ) : null}
                  Rafraichir tout
                </Button>
              </div>
            </div>
            {runtimeNote ? (
              <p className="text-xs text-muted-foreground">{runtimeNote}</p>
            ) : null}
          </div>

          <TabsContent value="overview" className={tabContentClass("space-y-4")}>
            <OverviewTab
              testsStatus={testsStatus}
              monitoringStatus={monitoringStatus}
              cronStatus={cronStatus}
              backupStatus={backupStatus}
              maintenanceStatus={maintenanceStatus}
              cronEvents={cronEvents}
              honeypotTest={honeypotTest}
            />
          </TabsContent>

          <TabsContent value="mu" className={tabContentClass("space-y-4")}>
            <MuTab
              muLocalSslPresent={muLocalSslPresent}
              muHoneypotPresent={muHoneypotPresent}
              disableRuntimeActions={disableRuntimeActions}
              isSyncingMu={isSyncingMu}
              onSyncMuPlugins={onSyncMuPlugins}
            />
          </TabsContent>

          <TabsContent value="tests" className={tabContentClass("space-y-6")}>
            <TestsTab
              cf7Active={cf7Active}
              muHoneypotPresent={muHoneypotPresent}
              honeypotCheck={honeypotCheck}
              honeypotTest={honeypotTest}
              maintenanceStatus={maintenanceStatus}
              disableRuntimeActions={disableRuntimeActions}
              isChecking={isChecking}
              isTesting={isTesting}
              isHealthRunning={isHealthRunning}
              onRunHoneypotCheck={onRunHoneypotCheck}
              onRunHoneypotTest={onRunHoneypotTest}
              onRunHealthCheck={onRunHealthCheck}
            />
          </TabsContent>

          <TabsContent value="monitoring" className={tabContentClass("space-y-4")}>
            <MonitoringTab
              hostingProfileId={hostingProfileId ?? null}
              monitoringSnapshot={monitoringSnapshot}
              maintenanceStatus={maintenanceStatus}
              infraFeatures={infraFeatures}
              infraStatus={infraStatus}
              actionLoading={actionLoading}
              isProd={isProd}
              runtimeBlocked={runtimeBlocked}
              runtimeNote={runtimeNote}
              envLabel={env.label}
              disableRuntimeActions={disableRuntimeActions}
              isRefreshing={isRefreshing}
              isPurging={isPurgingMonitoring}
              isHealthRunning={isHealthRunning}
              autoRefreshPaused={autoRefreshPaused}
              autoRefreshLabel={autoRefreshLabel}
              onToggleAutoRefresh={() => setAutoRefreshPaused((prev) => !prev)}
              onRefreshMonitoring={onRefreshMonitoring}
              onPurgeMonitoring={onPurgeMonitoring}
              onRunHealthCheck={onRunHealthCheck}
              onUpdateInfraStatus={onUpdateInfraStatus}
            />
          </TabsContent>

          <TabsContent value="cron" className={tabContentClass("space-y-4")}>
            <CronTab
              cronEvents={cronEvents}
              disableRuntimeActions={disableRuntimeActions}
              isRefreshingCron={isRefreshingCron}
              onRefreshCron={onRefreshCron}
            />
          </TabsContent>

          <TabsContent value="backups" className={tabContentClass("space-y-4")}>
            <BackupsTab
              maintenanceStatus={maintenanceStatus}
              backupEntries={backupEntries}
              backupError={backupError}
              isProd={isProd}
              disableRuntimeActions={disableRuntimeActions}
              isBackupRunning={isBackupRunning}
              isRefreshingBackups={isRefreshingBackups}
              isRestoringBackup={isRestoringBackup}
              isDeletingBackup={isDeletingBackup}
              onRefreshBackups={onRefreshBackups}
              onRunBackup={onRunBackup}
              onRestoreBackup={onRestoreBackup}
              onDeleteBackup={onDeleteBackup}
            />
          </TabsContent>

          <TabsContent value="logs" className={tabContentClass("space-y-4")}>
            <LogsTab
              isProd={isProd}
              disableActions={actionLoading !== null}
              logEntries={logEntries}
              logFilters={logFilters}
              logServices={logServices}
              isRefreshing={isRefreshingLogs}
              isQuerying={isQueryingLogs}
              isPurging={isPurgingLogs}
              onApply={onApplyLogFilters}
              onRefresh={onRefreshLogs}
              onPurge={onPurgeLogs}
              onUpdateFilters={onUpdateLogFilters}
            />
          </TabsContent>

          <TabsContent value="analytics" className={tabContentClass("space-y-4")}>
            <AnalyticsTab />
          </TabsContent>
        </div>
      </Tabs>
    </TooltipProvider>
  );
}
