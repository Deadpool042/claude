import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Loader2, Info } from "lucide-react";
import { resolveMonitoringProfile, evaluateThreshold } from "@/lib/monitoring";
import { getProfile } from "@/lib/hosting";
import { StatusLine } from "./utils/StatusLine";
import { SparklineChart } from "./utils/SparklineChart";
import { formatDate } from "./utils/helpers";
import {
  formatMs,
  formatPercent,
  formatRate,
  metricStatusClass,
  metricStatusLabel,
  worstStatus,
} from "./utils/status";
import { WP_FEATURE_LABELS, type WpInfraFeature } from "@/lib/wp";
import type { HostingProfileId } from "../types";
import type { MaintenanceStatus, MonitoringSnapshot } from "../types";
import type { WpInfraStatus, WpInfraStatusValue } from "@/lib/wp";

interface MonitoringTabProps {
  hostingProfileId?: HostingProfileId | null;
  monitoringSnapshot: MonitoringSnapshot | null;
  maintenanceStatus: MaintenanceStatus | null;
  infraFeatures: WpInfraFeature[];
  infraStatus: WpInfraStatus;
  actionLoading: string | null;
  isProd: boolean;
  runtimeBlocked: boolean;
  runtimeNote: string | null;
  envLabel: string;
  disableRuntimeActions: boolean;
  isRefreshing: boolean;
  isPurging: boolean;
  isHealthRunning: boolean;
  autoRefreshPaused: boolean;
  autoRefreshLabel: string | null;
  onToggleAutoRefresh: () => void;
  onRefreshMonitoring: () => void;
  onPurgeMonitoring: () => void;
  onRunHealthCheck: () => void;
  onUpdateInfraStatus: (feature: WpInfraFeature, status: WpInfraStatusValue) => void;
}

export default function MonitoringTab({
  hostingProfileId,
  monitoringSnapshot,
  maintenanceStatus,
  infraFeatures,
  infraStatus,
  actionLoading,
  isProd,
  runtimeBlocked,
  runtimeNote,
  envLabel,
  disableRuntimeActions,
  isRefreshing,
  isPurging,
  isHealthRunning,
  autoRefreshPaused,
  autoRefreshLabel,
  onToggleAutoRefresh,
  onRefreshMonitoring,
  onPurgeMonitoring,
  onRunHealthCheck,
  onUpdateInfraStatus,
}: MonitoringTabProps) {
  const monitoringProfile = resolveMonitoringProfile(hostingProfileId ?? null);
  const profile = hostingProfileId ? getProfile(hostingProfileId) : null;
  const monitoringAvailable = monitoringSnapshot?.available ?? false;
  const monitoringWindow =
    monitoringSnapshot?.windowMinutes ?? monitoringProfile.windows.httpMinutes;
  const httpMetrics = monitoringSnapshot?.http;
  const trafficMetrics = monitoringSnapshot?.traffic;
  const securityMetrics = monitoringSnapshot?.security;
  const mailMetrics = monitoringSnapshot?.mail;
  const monitoringSeries = monitoringSnapshot?.series;
  const monitoringNotice = !monitoringAvailable
    ? isProd
      ? "Monitoring prod: source non branchee pour l'instant."
      : runtimeBlocked
        ? runtimeNote ?? "Services non disponibles pour cet environnement."
        : "Aucune donnee pour cette fenetre."
    : null;

  const successStatus = evaluateThreshold(
    httpMetrics?.successRate ?? null,
    monitoringProfile.thresholds.successRate,
  );
  const latencyStatus = evaluateThreshold(
    httpMetrics?.p95Ms ?? null,
    monitoringProfile.thresholds.latencyP95Ms,
  );
  const errorStatus = evaluateThreshold(
    httpMetrics?.errorRate5xx ?? null,
    monitoringProfile.thresholds.errorRate5xx,
  );

  const mailErrorStatus = evaluateThreshold(
    mailMetrics?.errorRate ?? null,
    monitoringProfile.thresholds.mailErrorRate,
  );
  const mailLatencyStatus = evaluateThreshold(
    mailMetrics?.latencyMs ?? null,
    monitoringProfile.thresholds.mailLatencyMs,
  );

  const rate4xxStatus = evaluateThreshold(
    trafficMetrics?.rate4xx ?? null,
    monitoringProfile.thresholds.rate4xx,
  );
  const rate401Status = evaluateThreshold(
    securityMetrics?.rate401 ?? null,
    monitoringProfile.thresholds.rate401,
  );
  const rate403Status = evaluateThreshold(
    securityMetrics?.rate403 ?? null,
    monitoringProfile.thresholds.rate403,
  );
  const rate429Status = evaluateThreshold(
    securityMetrics?.rate429 ?? null,
    monitoringProfile.thresholds.rate429,
  );

  return (
    <>
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Monitoring</p>
            <p className="text-xs text-muted-foreground">
              Synthese health & trafic (fenetre {String(monitoringWindow)} min).{" "}
              {profile ? `Profil: ${profile.label}.` : null}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              disabled={runtimeBlocked || isProd}
              onClick={onToggleAutoRefresh}
            >
              {autoRefreshPaused ? "Reprendre auto" : "Pause auto"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={disableRuntimeActions}
              onClick={onRefreshMonitoring}
            >
              {isRefreshing ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
              Rafraîchir
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={disableRuntimeActions}
              onClick={onPurgeMonitoring}
            >
              {isPurging ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
              Purger
            </Button>
            {autoRefreshLabel ? (
              <span className="text-[11px] text-muted-foreground">
                Auto-refresh: {autoRefreshLabel}
              </span>
            ) : null}
          </div>
        </div>
        {!monitoringAvailable ? (
          <p className="text-xs text-muted-foreground">{monitoringNotice}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Success rate HTTP</p>
                <Badge variant="outline" className={metricStatusClass(successStatus)}>
                  {metricStatusLabel(successStatus)}
                </Badge>
              </div>
              <p className="text-lg font-semibold">
                {formatPercent(httpMetrics?.successRate)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Total: {String(httpMetrics?.total ?? 0)}
              </p>
              <SparklineChart
                values={monitoringSeries?.successRate ?? []}
                color="var(--chart-2)"
                className="text-emerald-400/70"
              />
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Latence p95</p>
                <Badge variant="outline" className={metricStatusClass(latencyStatus)}>
                  {metricStatusLabel(latencyStatus)}
                </Badge>
              </div>
              <p className="text-lg font-semibold">
                {formatMs(httpMetrics?.p95Ms)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Moyenne: {formatMs(httpMetrics?.avgMs)}
              </p>
              <SparklineChart
                values={monitoringSeries?.p95Ms ?? []}
                color="var(--chart-3)"
                className="text-sky-400/70"
              />
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Taux 5xx</p>
                <Badge variant="outline" className={metricStatusClass(errorStatus)}>
                  {metricStatusLabel(errorStatus)}
                </Badge>
              </div>
              <p className="text-lg font-semibold">
                {formatPercent(httpMetrics?.errorRate5xx)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                4xx: {formatPercent(trafficMetrics?.rate4xx)} · 5xx:{" "}
                {String(httpMetrics?.statusCounts.s5xx ?? 0)}
              </p>
              <SparklineChart
                values={monitoringSeries?.errorRate5xx ?? []}
                color="var(--chart-1)"
                className="text-rose-400/70"
              />
            </div>
          </div>
        )}
        <div className="text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Cadence HTTP: {String(monitoringProfile.cadence.http)} min</span>
          <span>Genere: {formatDate(monitoringSnapshot?.generatedAt)}</span>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Mail</p>
            <Badge
              variant="outline"
              className={metricStatusClass(worstStatus([mailErrorStatus, mailLatencyStatus]))}
            >
              {metricStatusLabel(worstStatus([mailErrorStatus, mailLatencyStatus]))}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Dernier envoi: {formatDate(mailMetrics?.lastSendAt ?? null)}</p>
            <p>Erreur SMTP: {formatPercent(mailMetrics?.errorRate)}</p>
            <p>Latence: {formatMs(mailMetrics?.latencyMs)}</p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {mailMetrics?.note ?? "Source: tests SMTP."}
          </p>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Traffic / Rate</p>
            <Badge variant="outline" className={metricStatusClass(rate4xxStatus)}>
              {metricStatusLabel(rate4xxStatus)}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>RPS moyen: {formatRate(trafficMetrics?.rpsAvg)}</p>
            <p>Pic 5 min: {formatRate(trafficMetrics?.rpsPeak)}</p>
            <p>4xx: {formatPercent(trafficMetrics?.rate4xx)}</p>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Top routes:{" "}
            {trafficMetrics?.topRoutes?.length
              ? trafficMetrics.topRoutes
                  .map((route) => `${route.path} (${String(route.count)})`)
                  .join(" · ")
              : "n/a"}
          </div>
          <SparklineChart
            values={monitoringSeries?.total ?? []}
            color="var(--chart-4)"
            className="text-violet-400/70"
          />
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Security</p>
            <Badge
              variant="outline"
              className={metricStatusClass(
                worstStatus([rate401Status, rate403Status, rate429Status]),
              )}
            >
              {metricStatusLabel(
                worstStatus([rate401Status, rate403Status, rate429Status]),
              )}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>401: {formatPercent(securityMetrics?.rate401)}</p>
            <p>403: {formatPercent(securityMetrics?.rate403)}</p>
            <p>429: {formatPercent(securityMetrics?.rate429)}</p>
            <p>Login fails: {String(securityMetrics?.loginFails ?? 0)}</p>
            <p>XMLRPC hits: {String(securityMetrics?.xmlrpcHits ?? 0)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Health check</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex text-muted-foreground">
                  <Info className="size-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Test rapide DB, FS, uploads, version WP/PHP.
              </TooltipContent>
            </Tooltip>
          </div>
          <Button
            size="sm"
            className="h-7 text-xs"
            disabled={disableRuntimeActions}
            onClick={onRunHealthCheck}
          >
            {isHealthRunning ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
            Lancer
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Dernier check: {formatDate(maintenanceStatus?.last_health_at)}</p>
            <p>
              Statut:{" "}
              {maintenanceStatus?.last_health_ok === undefined
                ? "n/a"
                : maintenanceStatus.last_health_ok
                  ? "OK"
                  : "KO"}
            </p>
            <p>Prochain: {formatDate(maintenanceStatus?.next_health_at)}</p>
          </div>
          {maintenanceStatus?.last_health_details ? (
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>DB: {maintenanceStatus.last_health_details.db_ok ? "OK" : "KO"}</p>
              <p>Cron: {maintenanceStatus.last_health_details.cron_ok ? "OK" : "KO"}</p>
              <p>FS: {maintenanceStatus.last_health_details.fs_ok ? "OK" : "KO"}</p>
              <p>
                Uploads:{" "}
                {maintenanceStatus.last_health_details.uploads_ok ? "OK" : "KO"}
              </p>
              <p>PHP: {maintenanceStatus.last_health_details.php_version ?? "n/a"}</p>
              <p>WP: {maintenanceStatus.last_health_details.wp_version ?? "n/a"}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Infra / Code</p>
        </div>
        {infraFeatures.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Aucune feature infra. Applique un preset pour initialiser le socle.
          </p>
        ) : (
          <ul className="space-y-1">
            {infraFeatures.map((f) => {
              const status = infraStatus[f] ?? "todo";
              const isDone = status === "done";
              const isUpdating = actionLoading === `infra-${f}`;
              return (
                <li key={f} className="flex items-center justify-between gap-2">
                  <StatusLine
                    label={WP_FEATURE_LABELS[f] ?? f}
                    ok={isDone}
                    okLabel="Valide"
                    failLabel="A faire"
                  />
                  <Button
                    size="xs"
                    variant="ghost"
                    className="h-6 text-[10px]"
                    disabled={isProd || actionLoading !== null}
                    onClick={() => onUpdateInfraStatus(f, isDone ? "todo" : "done")}
                  >
                    {isUpdating ? <Loader2 className="size-3 animate-spin" /> : null}
                    {isDone ? "Marquer a faire" : "Valider"}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {runtimeBlocked ? (
        <p className="text-[11px] text-muted-foreground">
          Env: {envLabel}. {runtimeNote ?? "Services non disponibles."}
        </p>
      ) : null}
    </>
  );
}
