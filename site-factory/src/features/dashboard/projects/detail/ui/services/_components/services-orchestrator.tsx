"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileCode,
  Loader2,
  PackagePlus,
  AlertTriangle,
  Wifi,
  WifiOff,
  Wrench,
  Monitor,
  Server,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ServiceCard } from "./service-card";
import { LogsTerminal } from "./logs-terminal";
import { GlobalActions } from "./global-actions";

// ── Types ──────────────────────────────────────────────────────────────

export interface ServiceInfo {
  service: string;
  label: string;
  state: string;
  status: string;
  ports: string[];
  description: string;
  expected: boolean;
}

type ComposeMode = "dev" | "prod-like";

function isStatusPayload(x: unknown): x is { project: { services: ServiceInfo[] } } {
  if (!x || typeof x !== "object") return false;
  const o = x as { project?: { services?: unknown[] } };
  return !!o.project && Array.isArray(o.project.services);
}

interface ServicesOrchestratorProps {
  projectId: string;
  projectSlug: string;
  techStack: string | null;
  deployTarget: string;
}

// ── Component ──────────────────────────────────────────────────────────

export function ServicesOrchestrator({
  projectId,
  projectSlug: _projectSlug,
  techStack,
  deployTarget: _deployTarget,
}: ServicesOrchestratorProps) {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeLog, setActiveLog] = useState<string | null>(null);
  const [composeExists, setComposeExists] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const [mode, setMode] = useState<ComposeMode>("dev");

  const isWordpress = techStack === "WORDPRESS";
  const esRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const connIdRef = useRef(0);

  // ── Initial fetch (for composeExists check) ────────────────────────

  const fetchServices = useCallback(async (
    m:ComposeMode, connId:number
  ) => {
    try {
      const res = await fetch(`/api/docker/projects/${projectId}?mode=${m}`,{cache: "no-store"});
      const data = (await res.json()) as { services: ServiceInfo[]; composeExists: boolean };

      // ignore if outdated response (stale connection)
      if (connId !== connIdRef.current) return;

      setServices(data.services);
      setComposeExists(data.composeExists !== false);
      setError(null);
    } catch {
      if(connId !== connIdRef.current) return;
      setError("Impossible de récupérer l'état des services.");
    } finally {
      if(connId !== connIdRef.current) 
      setLoading(false);
    }
  }, [projectId]);


  const cleanupSSE = useCallback(() => {
    if (retryTimeoutRef.current != null) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  }, []);


  // ── SSE status stream ──────────────────────────────────────────────

   const connectSSE = useCallback(
    (m: ComposeMode, connId: number, attempt = 0) => {
      // always cleanup before (re)connect
      cleanupSSE();

      const es = new EventSource(`/api/docker/projects/${projectId}/status/stream?mode=${m}`);
      esRef.current = es;

      es.addEventListener("status", (event: MessageEvent<string>) => {
        if (connId !== connIdRef.current) return; // outdated
        try {
          const parsed = JSON.parse(event.data) as unknown;
          if (!isStatusPayload(parsed)) return;
          setServices(parsed.project.services);
          setSseConnected(true);
          setLoading(false);
          setError(null);
        } catch {
          // ignore
        }
      });

      es.addEventListener("heartbeat", () => {
        if (connId !== connIdRef.current) return;
        setSseConnected(true);
      });

      es.addEventListener("error", () => {
        if (connId !== connIdRef.current) return;

        setSseConnected(false);
        try {
          es.close();
        } catch {
          // ignore
        }
        esRef.current = null;

        // backoff capped at 10s
        const delay = Math.min(1000 * 2 ** attempt, 10_000);

        retryTimeoutRef.current = window.setTimeout(() => {
          // IMPORTANT: reuse SAME mode + connId
          connectSSE(m, connId, attempt + 1);
        }, delay);
      });
    },
    [cleanupSSE, projectId],
  );

  useEffect(() => {
    // new connection "version"
    connIdRef.current += 1;
    const connId = connIdRef.current;

    setLoading(true);
    setSseConnected(false);

    // fetch once (composeExists + initial list)
    void fetchServices(mode, connId);

    // then realtime
    connectSSE(mode, connId);

    return () => {
      cleanupSSE();
    };
  }, [mode, fetchServices, connectSSE, cleanupSSE]);

  useEffect(() => {
    setActiveLog(null);
  }, [mode]);

  // ── Actions ────────────────────────────────────────────────────────

  async function performAction(action: string, service?: string) {
    const key = service ? `${action}-${service}` : `${action}-all`;
    setActionLoading(key);
    setError(null);
    try {
      const res = await fetch(`/api/docker/projects/${projectId}?mode=${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, service }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        setError(data.error);
      }
      // SSE will pick up the new status automatically
    } catch {
      setError("Erreur lors de l'exécution de l'action.");
    } finally {
      setActionLoading(null);
    }
  }
  const runningCount = services.filter((s) => s.state === "running").length;
  const allRunning = services.length > 0 && runningCount === services.length;


  // ── Mode toggle ─────────────────────────────────────────────────────

  const modeToggle = (
    <div className="inline-flex items-center rounded-lg border bg-muted p-0.5 gap-0.5">
      <button
        type="button"
        onClick={() => { setMode("dev"); }}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          mode === "dev"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Monitor className="size-3.5" />
        Local
      </button>
      <button
        type="button"
        onClick={() => { setMode("prod-like"); }}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          mode === "prod-like"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Server className="size-3.5" />
        Prod-like
      </button>
    </div>
  );

  // ── No compose file ─────────────────────────────────────────────────

  if (!loading && !composeExists) {
    return (
      <Card className="border-dashed border-amber-500/40">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-amber-500/10">
            <FileCode className="size-7 text-amber-500" />
          </div>
          <CardTitle className="text-lg">docker-compose.yml introuvable</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Le fichier de configuration Docker n&apos;existe pas encore pour ce projet.
            Générez-le pour pouvoir démarrer les services.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 pt-0">
          {error ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="size-4" />
              {error}
            </div>
          ) : null}
          <Button
            onClick={() => { void performAction("generate"); }}
            disabled={actionLoading !== null}
          >
            {actionLoading === "generate-all" ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <PackagePlus className="size-4 mr-2" />
            )}
            Générer le docker-compose.yml
          </Button>
          <p className="text-xs text-muted-foreground">
            Le fichier sera créé d&apos;après la configuration du projet (stack, base de données, services).
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────

  if (loading && services.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin mr-2" />
        Chargement des services…
      </div>
    );
  }

  // ── Main view ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── SSE status + Mode toggle + WP link ─────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {sseConnected ? (
            <Badge variant="outline" className="gap-1.5 text-xs text-emerald-600">
              <Wifi className="size-3" />
              Temps réel
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 text-xs text-muted-foreground">
              <WifiOff className="size-3" />
              Reconnexion…
            </Badge>
          )}
          {modeToggle}
        </div>

        {isWordpress ? (
          <Link href={`/dashboard/projects/${projectId}/wordpress`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Wrench className="size-3.5" />
              WordPress Toolbox
            </Button>
          </Link>
        ) : null}
      </div>

      {/* ── Global actions bar ────────────────────────────────── */}
      <GlobalActions
        services={services}
        loading={loading}
        actionLoading={actionLoading}
        allRunning={allRunning}
        runningCount={runningCount}
        error={error}
        onAction={(action: string) => {
          void performAction(action);
        }}
        onShowLogs={() => {
          setActiveLog(activeLog === "all" ? null : "all");
        }}
        activeLog={activeLog}
      />

      {/* ── Service grid ──────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((svc) => (
          <ServiceCard
            key={svc.service}
            service={svc}
            actionLoading={actionLoading}
            onAction={(action: string) => {
              void performAction(action, svc.service);
            }}
            onShowLogs={() => {
              setActiveLog(activeLog === svc.service ? null : svc.service);
            }}
            isLogActive={activeLog === svc.service}
          />
        ))}
      </div>

      {/* ── Logs terminal ─────────────────────────────────────── */}
      {activeLog !== null ? (
        <LogsTerminal
          projectId={projectId}
          service={activeLog === "all" ? undefined : activeLog}
          mode={mode}
          onClose={() => {
            setActiveLog(null);
          }}
        />
      ) : null}
    </div>
  );
}
