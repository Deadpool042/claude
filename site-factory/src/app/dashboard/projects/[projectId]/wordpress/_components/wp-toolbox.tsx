"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Globe,
  FileText,
  Plug,
  Palette,
  ShieldCheck,
  Wrench,
  RefreshCw,
  Link2,
  Loader2,
  Sparkles,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WP_PRESET_LIST, type WpPreset } from "@/lib/wp-presets";
import type {
  WpPluginSearchResult,
  WpPluginSearchResponse,
} from "@/app/api/wp-plugins/search/route";
import type { WpInfraStatus } from "@/lib/wp-infra";
import { INFRA_FEATURES, type WpInfraFeature } from "@/lib/wp-features";

import type {
  LogFilters,
  MonitoringSnapshot,
  MaintenanceLogEntry,
  MaintenanceStatus,
  BackupEntry,
  RuntimeMode,
  RuntimeStatus,
  WpInfo,
  WpToolboxProps,
  TabId,
  WpCronEvent,
} from "./types";
import { PresetsTab } from "./presets-tab";
import { PermalinksTab } from "./permalinks-tab";
import { PagesTab } from "./pages-tab";
import { PluginsTab } from "./plugins-tab";
import { SearchTab } from "./search-tab";
import { ThemesTab } from "./themes-tab";
import { SocleTab } from "./socle-tab";
import { MaintenanceTab } from "./maintenance-tab";
import type { DevMode } from "@/generated/prisma/client";

const DEFAULT_LOG_TYPES = [
  "maintenance",
  "http",
  "docker",
  "wordpress",
  "infra",
  "security",
  "audit",
] as const;

type DockerServiceState = {
  state?: string;
};

function defaultLogEnv(devMode?: DevMode | null): LogFilters["env"] {
  switch (devMode) {
    case "DEV_PROD_LIKE":
      return "prod-like";
    case "PROD":
      return "prod";
    case "DEV_COMFORT":
    default:
      return "dev";
  }
}

function runtimeModeFromDevMode(devMode?: DevMode | null): RuntimeMode {
  if (devMode === "DEV_PROD_LIKE") return "prod-like";
  if (devMode === "PROD") return "prod";
  return "dev";
}


// ── Component ──────────────────────────────────────────────────────────

export function WpToolbox({
  projectId,
  projectType,
  hostingProfileId,
  devMode,
  socle,
  isRunning: isRunningProp,
}: WpToolboxProps) {
  const hasSocle = socle !== undefined;
  const [info, setInfo] = useState<WpInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPluginSlug, setNewPluginSlug] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("presets");
  const [presetResult, setPresetResult] = useState<string[] | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<WpPreset | null>(
    () => WP_PRESET_LIST.find((p) => p.type === projectType) ?? null
  );
  const [socleState, setSocleState] = useState(socle ?? null);
  const [devModeState, setDevModeState] = useState<DevMode | null>(devMode ?? null);
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(
    null
  );
  const [backupEntries, setBackupEntries] = useState<BackupEntry[]>([]);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [monitoringSnapshot, setMonitoringSnapshot] = useState<MonitoringSnapshot | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [cronEvents, setCronEvents] = useState<WpCronEvent[] | null>(null);
  const [logEntries, setLogEntries] = useState<MaintenanceLogEntry[]>([]);
  const [logServices, setLogServices] = useState<string[]>([]);
  const [logFilters, setLogFilters] = useState<LogFilters>(() => ({
    date: new Date().toISOString().slice(0, 10),
    types: [...DEFAULT_LOG_TYPES],
    level: "all",
    env: defaultLogEnv(devMode ?? null),
    service: "all",
    search: "",
  }));
  const [honeypotCheck, setHoneypotCheck] = useState<{
    cf7Active: boolean;
    muPluginPresent: boolean;
    checkedAt: string;
  } | null>(null);
  const [honeypotTest, setHoneypotTest] = useState<{
    ok: boolean;
    message: string;
    details?: {
      cf7Active: boolean;
      emptyPass: boolean | null;
      filledBlocked: boolean | null;
    };
    testedAt: string;
  } | null>(null);
  const [autoDetectedRunning, setAutoDetectedRunning] = useState<boolean | null>(
    null
  );
  const isRunning = isRunningProp ?? autoDetectedRunning ?? false;

  // Plugin search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WpPluginSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(0);
  const [searchTotalResults, setSearchTotalResults] = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logsLoaded = useRef(false);
  const pendingEnvRefresh = useRef(false);
  const hasMounted = useRef(false);

  const fetchRuntimeStatus = useCallback(async (
    modeOverride?: RuntimeMode,
  ): Promise<RuntimeStatus | null> => {
    const mode = modeOverride ?? runtimeModeFromDevMode(devModeState);
    if (mode === "prod") {
      const nextStatus: RuntimeStatus = {
        mode,
        status: "prod",
        composeExists: false,
        runningCount: 0,
        totalCount: 0,
        updatedAt: new Date().toISOString(),
      };
      setRuntimeStatus(nextStatus);
      return nextStatus;
    }

    try {
      const res = await fetch(`/api/docker/projects/${projectId}?mode=${mode}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as {
        services?: DockerServiceState[];
        composeExists?: boolean;
      };
      const services = Array.isArray(data.services) ? data.services : [];
      const runningCount = services.filter((svc) => svc.state === "running").length;
      const totalCount = services.length;
      const composeExists = data.composeExists !== false;
      let status: RuntimeStatus["status"] = "unknown";
      if (!composeExists) status = "no_compose";
      else if (totalCount === 0 || runningCount === 0) status = "stopped";
      else if (runningCount === totalCount) status = "running";
      else status = "partial";

      const nextStatus: RuntimeStatus = {
        mode,
        status,
        composeExists,
        runningCount,
        totalCount,
        updatedAt: new Date().toISOString(),
      };
      setRuntimeStatus(nextStatus);
      return nextStatus;
    } catch {
      const nextStatus: RuntimeStatus = {
        mode,
        status: "unknown",
        composeExists: false,
        runningCount: 0,
        totalCount: 0,
        updatedAt: new Date().toISOString(),
      };
      setRuntimeStatus(nextStatus);
      return nextStatus;
    }
  }, [projectId, devModeState]);

  const fetchInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/docker/projects/${projectId}/wp`);
      if (!res.ok) {
        if (res.status === 404) {
          setAutoDetectedRunning(false);
          setInfo(null);
          return;
        }
        throw new Error("Impossible de récupérer les informations WordPress");
      }
      const data = (await res.json()) as WpInfo;
      setInfo(data);
      setAutoDetectedRunning(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      if (isRunningProp === undefined) setAutoDetectedRunning(false);
    } finally {
      setLoading(false);
    }
  }, [projectId, isRunningProp]);

  useEffect(() => {
    if (isRunningProp === false) {
      setInfo(null);
      setLoading(false);
      return;
    }
    void fetchInfo();
  }, [fetchInfo, isRunningProp]);

  useEffect(() => {
    if (socle !== undefined) {
      setSocleState(socle ?? null);
    }
  }, [socle]);
  useEffect(() => {
    setDevModeState(devMode ?? null);
  }, [devMode]);

  useEffect(() => {
    void fetchRuntimeStatus();
  }, [fetchRuntimeStatus, devModeState]);

  const resetMaintenanceState = useCallback(() => {
    setMaintenanceStatus(null);
    setBackupEntries([]);
    setBackupError(null);
    setMonitoringSnapshot(null);
    setCronEvents(null);
    setHoneypotCheck(null);
    setHoneypotTest(null);
    setLogEntries([]);
    setLogServices([]);
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    resetMaintenanceState();
    setLogFilters((prev) => ({
      ...prev,
      env: prev.env === "all" ? "all" : defaultLogEnv(devModeState),
    }));
    pendingEnvRefresh.current = true;
  }, [devModeState, resetMaintenanceState]);

  // ── Action helper ─────────────

  const postAction = useCallback(
    async (action: string, args?: Record<string, string>): Promise<Record<string, unknown>> => {
      const res = await fetch(`/api/docker/projects/${projectId}/wp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, args }),
      });
      const body = (await res.json()) as { error?: string; details?: string[] };
      if (!res.ok) {
        throw new Error(body.error ?? "Erreur");
      }
      return body;
    },
    [projectId],
  );

  async function performAction(
    action: string,
    args?: Record<string, string>,
    loadingKey?: string,
    refreshAfter: boolean = true
  ) {
    const key = loadingKey ?? action;
    setActionLoading(key);
    setPresetResult(null);
    try {
      const body = await postAction(action, args);
      if (action === "apply-preset" && Array.isArray(body.details)) {
        setPresetResult(body.details as string[]);
      }
      if (refreshAfter) await fetchInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  }

  async function performBulk(
    actions: Array<{ action: string; args?: Record<string, string> }>,
    loadingKey: string
  ) {
    if (actions.length === 0) return;
    setActionLoading(loadingKey);
    setPresetResult(null);
    try {
      for (const entry of actions) {
        await postAction(entry.action, entry.args);
      }
      await fetchInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  }

  const handleSyncMuPlugins = () => {
    void performAction(
      "sync-mu-plugins",
      undefined,
      "sync-mu-plugins",
      isRunning
    );
  };

  const handleHoneypotCheck = () => {
    if (!info) return;
    setActionLoading("honeypot-check");
    const cf7Active = info.plugins.some(
      (p) => p.name === "contact-form-7" && p.status === "active"
    );
    const muPluginPresent = info.plugins.some(
      (p) => p.name === "sf-cf7-honeypot" && p.status === "must-use"
    );
    setHoneypotCheck({
      cf7Active,
      muPluginPresent,
      checkedAt: new Date().toLocaleTimeString("fr-FR"),
    });
    setActionLoading(null);
  };

  const handleHoneypotTest = async () => {
    setActionLoading("test-honeypot");
    try {
      const body = await postAction("test-honeypot");
      const ok = Boolean(body.ok);
      const details = body.details as
        | {
            cf7_active?: boolean;
            empty_pass?: boolean | null;
            filled_blocked?: boolean | null;
          }
        | undefined;
      const normalizedDetails = details
        ? {
            cf7Active: Boolean(details.cf7_active),
            emptyPass: typeof details.empty_pass === "boolean" ? details.empty_pass : null,
            filledBlocked: typeof details.filled_blocked === "boolean" ? details.filled_blocked : null,
          }
        : null;
      const nextResult: {
        ok: boolean;
        message: string;
        testedAt: string;
        details?: {
          cf7Active: boolean;
          emptyPass: boolean | null;
          filledBlocked: boolean | null;
        };
      } = {
        ok,
        message: (body.message as string) ?? (ok ? "Test OK" : "Test KO"),
        testedAt: new Date().toLocaleTimeString("fr-FR"),
      };
      if (normalizedDetails) {
        nextResult.details = normalizedDetails;
      }
      setHoneypotTest(nextResult);
    } catch (err) {
      setHoneypotTest({
        ok: false,
        message: err instanceof Error ? err.message : "Erreur de test",
        testedAt: new Date().toLocaleTimeString("fr-FR"),
      });
    } finally {
      setActionLoading(null);
    }
  };

  const refreshMaintenanceStatus = useCallback(async () => {
    const body = await postAction("maintenance-status");
    if (body.status && typeof body.status === "object") {
      setMaintenanceStatus(body.status as MaintenanceStatus);
    }
  }, [postAction]);

  const fetchBackups = useCallback(async () => {
    if (devModeState === "PROD") {
      setBackupEntries([]);
      setBackupError(null);
      return;
    }
    const res = await fetch(`/api/projects/${projectId}/backups?limit=30`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const body = (await res.json()) as {
      error?: string;
      entries?: BackupEntry[];
      meta?: MaintenanceStatus;
    };
    if (!res.ok) {
      throw new Error(body.error ?? "Erreur");
    }
    setBackupEntries(Array.isArray(body.entries) ? body.entries : []);
    if (body.meta && typeof body.meta === "object") {
      setMaintenanceStatus((prev) => ({ ...(prev ?? {}), ...body.meta }));
    }
    setBackupError(null);
  }, [projectId, devModeState]);

  const fetchMonitoringSnapshot = useCallback(
    async (collect: boolean) => {
      const env = runtimeModeFromDevMode(devModeState);
      const res = await fetch(`/api/projects/${projectId}/monitoring?env=${encodeURIComponent(env)}`, {
        method: collect ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
      });
      const body = (await res.json()) as { error?: string; snapshot?: MonitoringSnapshot };
      if (!res.ok) {
        throw new Error(body.error ?? "Erreur");
      }
      if (body.snapshot) {
        setMonitoringSnapshot(body.snapshot);
      }
    },
    [projectId, devModeState],
  );

  useEffect(() => {
    if (!info) return;
    if (pendingEnvRefresh.current) return;
    const runtimeReady =
      runtimeStatus?.status === "running" || runtimeStatus?.status === "partial";
    if (devModeState !== "PROD" && runtimeStatus && !runtimeReady) {
      setMonitoringSnapshot(null);
      return;
    }
    void fetchMonitoringSnapshot(false);
  }, [fetchMonitoringSnapshot, info, devModeState, runtimeStatus]);

  const refreshCronEvents = useCallback(async () => {
    const body = await postAction("list-cron");
    if (Array.isArray(body.events)) {
      setCronEvents(body.events as WpCronEvent[]);
    } else {
      setCronEvents([]);
    }
  }, [postAction]);

  const handleRefreshOverview = async () => {
    setActionLoading("maintenance-overview");
    try {
      await Promise.all([
        refreshMaintenanceStatus(),
        refreshCronEvents(),
        fetchMonitoringSnapshot(true),
        fetchBackups(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshMonitoring = async () => {
    setActionLoading("monitoring-refresh");
    try {
      await Promise.all([refreshMaintenanceStatus(), fetchMonitoringSnapshot(true)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshCron = async () => {
    setActionLoading("list-cron");
    try {
      await refreshCronEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunHealthCheck = async () => {
    setActionLoading("run-health-check");
    try {
      const body = await postAction("run-health-check");
      if (body.status && typeof body.status === "object") {
        setMaintenanceStatus(body.status as MaintenanceStatus);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunBackup = async () => {
    setActionLoading("run-backup");
    try {
      const body = await postAction("run-backup");
      if (body.status && typeof body.status === "object") {
        setMaintenanceStatus(body.status as MaintenanceStatus);
      }
      await fetchBackups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshBackups = async () => {
    setActionLoading("backups-refresh");
    try {
      await fetchBackups();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setBackupError(message);
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreBackup = async (payload: {
    type: "db" | "uploads" | "full";
    db?: string;
    uploads?: string;
  }) => {
    setActionLoading("restore-backup");
    try {
      const args: Record<string, string> = { type: payload.type };
      if (payload.db) args.db = payload.db;
      if (payload.uploads) args.uploads = payload.uploads;
      const body = await postAction("restore-backup", args);
      if (body.status && typeof body.status === "object") {
        setMaintenanceStatus(body.status as MaintenanceStatus);
      }
      await fetchBackups();
      setBackupError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setBackupError(message);
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBackup = async (stamp: string) => {
    setActionLoading("backups-delete");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/backups?stamp=${encodeURIComponent(stamp)}`,
        { method: "DELETE" },
      );
      const body = (await res.json()) as {
        error?: string;
        entries?: BackupEntry[];
        meta?: MaintenanceStatus;
      };
      if (!res.ok) {
        throw new Error(body.error ?? "Erreur");
      }
      setBackupEntries(Array.isArray(body.entries) ? body.entries : []);
      if (body.meta && typeof body.meta === "object") {
        setMaintenanceStatus((prev) => ({ ...(prev ?? {}), ...body.meta }));
      }
      setBackupError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setBackupError(message);
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const fetchLogs = useCallback(
    async (filters: LogFilters) => {
      const payload = {
        action: "query",
        date: filters.date,
        types: filters.types,
        level: filters.level,
        env: filters.env,
        service: filters.service,
        search: filters.search || undefined,
        limit: 250,
      };
      const res = await fetch(`/api/projects/${projectId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { error?: string; entries?: MaintenanceLogEntry[] };
      if (!res.ok) {
        throw new Error(body.error ?? "Erreur");
      }
      const entries = Array.isArray(body.entries) ? body.entries : [];
      setLogEntries(entries);
      const services = Array.from(
        new Set(entries.map((entry) => entry.service).filter(Boolean)),
      ) as string[];
      setLogServices(services.sort());
    },
    [projectId],
  );

  const handleRefreshLogs = async () => {
    setActionLoading("logs-refresh");
    try {
      const res = await fetch(`/api/projects/${projectId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh" }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Erreur");
      }
      await fetchLogs(logFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApplyLogFilters = async () => {
    setActionLoading("logs-query");
    try {
      await fetchLogs(logFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePurgeLogs = async () => {
    setActionLoading("logs-purge");
    try {
      const payload: {
        action: "purge";
        env: LogFilters["env"];
        types?: string[];
      } = {
        action: "purge",
        env: logFilters.env,
      };
      if (logFilters.types.length > 0) {
        payload.types = logFilters.types;
      }
      const res = await fetch(`/api/projects/${projectId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Erreur");
      }
      await fetchLogs(logFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePurgeMonitoring = async () => {
    setActionLoading("monitoring-purge");
    try {
      const env = runtimeModeFromDevMode(devModeState);
      const res = await fetch(`/api/projects/${projectId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "purge", env, types: ["http"] }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Erreur");
      }
      await fetchMonitoringSnapshot(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  };

  const autoRefreshMaintenance = useCallback(async () => {
    setActionLoading("maintenance-overview");
    try {
      await Promise.all([
        refreshMaintenanceStatus(),
        refreshCronEvents(),
        fetchMonitoringSnapshot(true),
      ]);
      const nextFilters = {
        ...logFilters,
        env: logFilters.env === "all" ? "all" : defaultLogEnv(devModeState),
      };
      await fetchLogs(nextFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  }, [
    refreshMaintenanceStatus,
    refreshCronEvents,
    fetchMonitoringSnapshot,
    fetchLogs,
    logFilters,
    devModeState,
  ]);

  useEffect(() => {
    if (!pendingEnvRefresh.current) return;
    if (!info) return;
    if (devModeState === "PROD") {
      pendingEnvRefresh.current = false;
      return;
    }
    const runtimeReady =
      runtimeStatus?.status === "running" || runtimeStatus?.status === "partial";
    if (!runtimeReady) return;
    pendingEnvRefresh.current = false;
    void autoRefreshMaintenance();
  }, [autoRefreshMaintenance, devModeState, info, runtimeStatus]);

  useEffect(() => {
    if (!info || logsLoaded.current) return;
    logsLoaded.current = true;
    void fetchLogs(logFilters);
  }, [fetchLogs, info, logFilters]);

  const handleSetDevMode = async (nextMode: DevMode) => {
    if (devModeState === nextMode) return;
    setActionLoading("dev-mode");
    try {
      const res = await fetch(`/api/projects/${projectId}/dev-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devMode: nextMode }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Erreur");
      }
      setDevModeState(nextMode);
      resetMaintenanceState();
      pendingEnvRefresh.current = true;
      setLogFilters((prev) => ({
        ...prev,
        env: prev.env === "all" ? "all" : defaultLogEnv(nextMode),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  };

  async function updateInfraStatus(
    feature: WpInfraFeature,
    status: "todo" | "done"
  ) {
    const loadingKey = `infra-${feature}`;
    setActionLoading(loadingKey);
    setPresetResult(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/wp-infra`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, status }),
      });
      const body = (await res.json()) as { error?: string; infraStatus?: WpInfraStatus };
      if (!res.ok) {
        throw new Error(body.error ?? "Erreur");
      }
      if (body.infraStatus && socleState) {
        setSocleState({ ...socleState, infraStatus: body.infraStatus });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Plugin search ─────────────

  async function searchPlugins(q: string, page: number = 1) {
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `/api/wp-plugins/search?q=${encodeURIComponent(q)}&page=${String(page)}`
      );
      if (!res.ok) throw new Error("Erreur de recherche");
      const data = (await res.json()) as WpPluginSearchResponse;
      setSearchResults(data.plugins);
      setSearchPage(data.page);
      setSearchTotalPages(data.totalPages);
      setSearchTotalResults(data.totalResults);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  function handleSearchInput(value: string) {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      void searchPlugins(value, 1);
    }, 400);
  }

  // ── Not running state ─────────

  if (!isRunning && !loading) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center py-8">
          <Globe className="size-10 mx-auto text-muted-foreground mb-2" />
          <CardTitle className="text-base">WordPress Toolbox</CardTitle>
          <CardDescription>
            Démarrez le conteneur WordPress pour accéder aux outils de
            configuration.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 gap-3">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Chargement des données WordPress…
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error && !info) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-destructive mb-3">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchInfo()}
          >
            <RefreshCw className="size-3.5 mr-1.5" /> Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!info) return null;

  const IGNORED_EXTRA_STATUSES = new Set(["must-use", "dropin"]);
  const IGNORED_EXTRA_SLUGS = new Set(["sf-local-ssl", "sf-cf7-honeypot", "db.php"]);

  const socleStats =
    socleState && socleState.features.length > 0
      ? (() => {
          const installedMap = new Map(
            info.plugins.map((p) => [p.name, p.status])
          );
          const expectedSlugs = new Set(socleState.plugins.map((p) => p.slug));
          let missingRequiredCount = 0;
          let inactiveCount = 0;

          for (const plugin of socleState.plugins) {
            const status = installedMap.get(plugin.slug);
            if (!status) {
              if (!plugin.optional) missingRequiredCount += 1;
              continue;
            }
            if (status !== "active") inactiveCount += 1;
          }

          const extraCount = info.plugins.filter(
            (p) =>
              !expectedSlugs.has(p.name) &&
              !IGNORED_EXTRA_STATUSES.has(p.status) &&
              !IGNORED_EXTRA_SLUGS.has(p.name)
          ).length;
          const activeTheme =
            info.themes.find((t) => t.status === "active")?.name ?? null;
          const themeExpected = socleState.themeExpected ?? "sf-tt5";
          const themeOk = activeTheme ? activeTheme === themeExpected : false;
          const hasIssues = missingRequiredCount > 0 || !themeOk;

          const infraStatus = socleState.infraStatus ?? {};
          const infraTotal = INFRA_FEATURES.length;
          const infraDone = INFRA_FEATURES.filter(
            (feature) => infraStatus[feature] === "done"
          ).length;

          const themeExpectedLabel =
            themeExpected === "sf-tt5"
              ? "sf-tt5 (parent: twentytwentyfive)"
              : themeExpected;

          return {
            missingRequiredCount,
            inactiveCount,
            extraCount,
            activeTheme,
            themeExpected,
            themeExpectedLabel,
            themeOk,
            hasIssues,
            infraTotal,
            infraDone,
          };
        })()
      : null;



  // ── Installed plugin slugs for search tab ──
  const installedSlugs = new Set(info.plugins.map((p) => p.name));

  // ── Tabs ──────────────────────

  const tabs: Array<{
    id: TabId;
    label: string;
    icon: typeof Globe;
    count?: number;
  }> = [
    { id: "presets", label: "Presets", icon: Sparkles },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "permalinks", label: "Permaliens", icon: Link2 },
    { id: "pages", label: "Pages", icon: FileText, count: info.pages.length },
    {
      id: "plugins",
      label: "Plugins",
      icon: Plug,
      count: info.plugins.length,
    },
    { id: "search", label: "Store", icon: Search },
    { id: "themes", label: "Thèmes", icon: Palette },
  ];
  if (hasSocle) {
    const socleCount =
      socleStats && socleStats.missingRequiredCount > 0
        ? socleStats.missingRequiredCount
        : undefined;
    const socleTab = socleCount !== undefined
      ? {
          id: "socle" as const,
          label: "Socle",
          icon: ShieldCheck,
          count: socleCount,
        }
      : {
          id: "socle" as const,
          label: "Socle",
          icon: ShieldCheck,
        };
    tabs.splice(1, 0, socleTab);
  }
  const installPlugins = (slugs: string[], loadingKey: string) => {
    const unique = Array.from(new Set(slugs));
    void performBulk(
      unique.map((slug) => ({
        action: "install-plugin",
        args: { plugin: slug },
      })),
      loadingKey
    );
  };

  const activatePlugins = (slugs: string[], loadingKey: string) => {
    const unique = Array.from(new Set(slugs));
    void performBulk(
      unique.map((slug) => ({
        action: "toggle-plugin",
        args: { plugin: slug, activate: "true" },
      })),
      loadingKey
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="size-5 text-blue-500" />
            <CardTitle className="text-base">WordPress Toolbox</CardTitle>
            {info.siteUrl ? (
              <a
                href={info.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:underline"
              >
                {info.siteUrl}
              </a>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => void fetchInfo()}
            title="Rafraîchir"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </CardHeader>

      {hasSocle ? (
        <div className="px-6 pb-3">
          <div className="rounded-lg border bg-muted/20 p-3 text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className={`size-4 ${
                  socleStats?.hasIssues ? "text-amber-500" : "text-emerald-500"
                }`}
              />
              <span className="font-medium">Socle technique</span>
              <Badge
                variant={socleStats?.hasIssues ? "outline" : "secondary"}
                className="text-[10px] px-1.5 py-0"
              >
                {socleStats
                  ? socleStats.hasIssues
                    ? "Action requise"
                    : "OK"
                  : "Non initialisé"}
              </Badge>
            </div>

            {socleStats ? (
              <div className="flex flex-wrap gap-2 text-muted-foreground">
                <span>
                  Manquants requis:{" "}
                  <span className="text-foreground">
                    {String(socleStats.missingRequiredCount)}
                  </span>
                </span>
                <span>
                  Inactifs:{" "}
                  <span className="text-foreground">
                    {String(socleStats.inactiveCount)}
                  </span>
                </span>
                <span>
                  Hors socle:{" "}
                  <span className="text-foreground">
                    {String(socleStats.extraCount)}
                  </span>
                </span>
                <span>
                  Infra:{" "}
                  <span className="text-foreground">
                    {String(socleStats.infraDone)}/{String(socleStats.infraTotal)}
                  </span>
                </span>
                <span>
                  Thème:{" "}
                  <span
                    className={`${
                      socleStats.themeOk ? "text-foreground" : "text-rose-600"
                    }`}
                  >
                    {socleStats.activeTheme
                      ? `${socleStats.activeTheme}${
                          socleStats.activeTheme === "sf-tt5"
                            ? " (parent: twentytwentyfive)"
                            : ""
                        }`
                      : "non détecté"}
                  </span>
                  {!socleStats.themeOk ? (
                    <span className="ml-1 text-muted-foreground">
                      (attendu: {socleStats.themeExpectedLabel})
                    </span>
                  ) : null}
                </span>
              </div>
            ) : (
              <div className="text-muted-foreground">
                Applique un preset pour initialiser le socle.
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setActiveTab(socleStats ? "socle" : "presets")
              }
            >
              {socleStats ? "Voir l'audit" : "Appliquer un preset"}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Tab bar */}
      <div className="border-b px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                activeTab === id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
              {count !== undefined ? (
                <Badge
                  variant="secondary"
                  className="ml-1 text-[10px] px-1.5 py-0"
                >
                  {String(count)}
                </Badge>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <CardContent className="pt-4">
        {error ? (
          <div className="text-xs text-destructive mb-3 p-2 bg-destructive/5 rounded">
            {error}
          </div>
        ) : null}

        {/* ── Presets Tab ──────────────────────────── */}
        {activeTab === "presets" ? (
          <PresetsTab
            presetList={WP_PRESET_LIST}
          {...(projectType ? { projectType } : {})}
            selectedPreset={selectedPreset}
            presetResult={presetResult}
            actionLoading={actionLoading}
            onSelectPreset={(p) => {
              setSelectedPreset(p);
              setPresetResult(null);
            }}
            onApplyPreset={(type) =>
              void performAction("apply-preset", { preset: type }, "apply-preset")
            }
            hostingProfileId={hostingProfileId}
          />
        ) : null}

        {/* ── Socle Tab ───────────────────────────── */}
        {activeTab === "socle" && hasSocle ? (
          <SocleTab
            socle={socleState ?? null}
            info={info}
            actionLoading={actionLoading}
            onInstallRequired={(slugs) =>
              installPlugins(slugs, "socle-install-required")
            }
            onInstallOptional={(slugs) =>
              installPlugins(slugs, "socle-install-optional")
            }
            onActivateInactive={(slugs) =>
              activatePlugins(slugs, "socle-activate-inactive")
            }
            onUpdateInfraStatus={updateInfraStatus}
            onSyncMuPlugins={handleSyncMuPlugins}
          />
        ) : null}

        {/* ── Maintenance Tab ─────────────────────── */}
        {activeTab === "maintenance" ? (
          <MaintenanceTab
            devMode={devModeState ?? null}
            hostingProfileId={hostingProfileId ?? null}
            runtimeStatus={runtimeStatus}
            info={info}
            socle={socleState ?? null}
            maintenanceStatus={maintenanceStatus}
            backupEntries={backupEntries}
            backupError={backupError}
            monitoringSnapshot={monitoringSnapshot}
            cronEvents={cronEvents}
            logEntries={logEntries}
            logFilters={logFilters}
            logServices={logServices}
            actionLoading={actionLoading}
            honeypotCheck={honeypotCheck}
            honeypotTest={honeypotTest}
            onSetDevMode={handleSetDevMode}
            onRunHoneypotCheck={handleHoneypotCheck}
            onRunHoneypotTest={handleHoneypotTest}
            onRefreshOverview={handleRefreshOverview}
            onRefreshMonitoring={handleRefreshMonitoring}
            onRefreshCron={handleRefreshCron}
            onRefreshLogs={handleRefreshLogs}
            onPurgeLogs={handlePurgeLogs}
            onApplyLogFilters={handleApplyLogFilters}
            onUpdateLogFilters={setLogFilters}
            onRunHealthCheck={handleRunHealthCheck}
            onRunBackup={handleRunBackup}
            onRefreshBackups={handleRefreshBackups}
            onRestoreBackup={handleRestoreBackup}
            onDeleteBackup={handleDeleteBackup}
            onPurgeMonitoring={handlePurgeMonitoring}
            onSyncMuPlugins={handleSyncMuPlugins}
            onUpdateInfraStatus={updateInfraStatus}
          />
        ) : null}

        {/* ── Permalinks Tab ───────────────────────── */}
        {activeTab === "permalinks" ? (
          <PermalinksTab
            currentPermalink={info.permalink}
            actionLoading={actionLoading}
            onSetPermalink={(v) =>
              void performAction(
                "set-permalink",
                { structure: v },
                `permalink-${v}`
              )
            }
          />
        ) : null}

        {/* ── Pages Tab ────────────────────────────── */}
        {activeTab === "pages" ? (
          <PagesTab
            pages={info.pages}
            newPageTitle={newPageTitle}
            actionLoading={actionLoading}
            onSetTitle={setNewPageTitle}
            onCreatePage={(title) => {
              void performAction("create-page", { title }, "create-page");
              setNewPageTitle("");
            }}
            onDeletePage={(id) =>
              void performAction(
                "delete-page",
                { pageId: String(id) },
                `delete-${String(id)}`
              )
            }
          />
        ) : null}

        {/* ── Plugins Tab ──────────────────────────── */}
        {activeTab === "plugins" ? (
          <PluginsTab
            plugins={info.plugins}
            newPluginSlug={newPluginSlug}
            actionLoading={actionLoading}
            onSetSlug={setNewPluginSlug}
            onInstallPlugin={(slug) => {
              void performAction(
                "install-plugin",
                { plugin: slug },
                "install-plugin"
              );
              setNewPluginSlug("");
            }}
            onTogglePlugin={(name, activate) =>
              void performAction(
                "toggle-plugin",
                { plugin: name, activate: activate ? "true" : "false" },
                `toggle-${name}`
              )
            }
            onDeletePlugin={(name) =>
              void performAction(
                "delete-plugin",
                { plugin: name },
                `delete-plugin-${name}`
              )
            }
            onUpdatePlugin={(name) =>
              void performAction(
                "update-plugin",
                { plugin: name },
                `update-${name}`
              )
            }
            onSyncMuPlugins={handleSyncMuPlugins}
          />
        ) : null}

        {/* ── Store Search Tab ─────────────────────── */}
        {activeTab === "search" ? (
          <SearchTab
            searchQuery={searchQuery}
            searchResults={searchResults}
            searchLoading={searchLoading}
            searchPage={searchPage}
            searchTotalPages={searchTotalPages}
            searchTotalResults={searchTotalResults}
            installedSlugs={installedSlugs}
            actionLoading={actionLoading}
            onSearchInput={handleSearchInput}
            onPageChange={(p) => void searchPlugins(searchQuery, p)}
            onInstallPlugin={(slug) =>
              void performAction(
                "install-plugin",
                { plugin: slug },
                `install-${slug}`
              )
            }
          />
        ) : null}

        {/* ── Themes Tab ───────────────────────────── */}
        {activeTab === "themes" ? (
          <ThemesTab
            themes={info.themes}
            actionLoading={actionLoading}
            onActivateTheme={(name) =>
              void performAction(
                "activate-theme",
                { theme: name },
                `theme-${name}`
              )
            }
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
