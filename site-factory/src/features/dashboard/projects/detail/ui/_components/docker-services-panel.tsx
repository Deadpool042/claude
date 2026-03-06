"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Play,
  Square,
  RotateCcw,
  ScrollText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Power,
  PowerOff,
  Container,
  X,
  Circle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

// ── Types ──────────────────────────────────────────────────────────────

interface ServiceInfo {
  service: string;
  label: string;
  state: string;
  status: string;
  ports: string[];
  description: string;
  expected: boolean;
}

interface DockerServicesPanelProps {
  projectId: string;
}

// ── Helpers ────────────────────────────────────────────────────────────

function stateVariant(state: string): "default" | "secondary" | "outline" | "destructive" {
  switch (state) {
    case "running":
      return "default";
    case "exited":
    case "dead":
      return "destructive";
    case "not_created":
      return "outline";
    case "paused":
      return "secondary";
    default:
      return "outline";
  }
}

function stateLabel(state: string): string {
  switch (state) {
    case "running":
      return "En cours";
    case "exited":
      return "Arrêté";
    case "not_created":
      return "Non démarré";
    case "created":
      return "Créé";
    case "paused":
      return "Pause";
    case "restarting":
      return "Redémarrage";
    case "dead":
      return "Mort";
    default:
      return state;
  }
}

function stateDot(state: string): string {
  switch (state) {
    case "running":
      return "text-green-500";
    case "exited":
    case "dead":
      return "text-red-500";
    case "not_created":
      return "text-muted-foreground/40";
    default:
      return "text-yellow-500";
  }
}

// ── Component ──────────────────────────────────────────────────────────

export function DockerServicesPanel({ projectId }: DockerServicesPanelProps) {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [logs, setLogs] = useState<string | null>(null);
  const [logsService, setLogsService] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`/api/docker/projects/${projectId}`);
      const data = (await res.json()) as { services: ServiceInfo[] };
      setServices(data.services);
      setError(null);
    } catch {
      setError("Impossible de récupérer l'état des services.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void fetchServices();
    const interval = setInterval(() => { void fetchServices(); }, 10_000);
    return () => { clearInterval(interval); };
  }, [fetchServices]);

  async function performAction(action: string, service?: string) {
    const key = service ? `${action}-${service}` : `${action}-all`;
    setActionLoading(key);
    setError(null);
    try {
      const res = await fetch(`/api/docker/projects/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, service }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        setError(data.error);
      }
      await fetchServices();
    } catch {
      setError("Erreur lors de l'exécution de l'action.");
    } finally {
      setActionLoading(null);
    }
  }

  async function fetchLogs(service?: string) {
    const target = service ?? "all";
    if (logsService === target && logs !== null) {
      setLogs(null);
      setLogsService(null);
      return;
    }
    setActionLoading(`logs-${target}`);
    try {
      const res = await fetch(`/api/docker/projects/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logs", service }),
      });
      const data = (await res.json()) as { logs: string };
      setLogs(data.logs || "(Aucun log)");
      setLogsService(target);
    } catch {
      setError("Impossible de récupérer les logs.");
    } finally {
      setActionLoading(null);
    }
  }

  const runningCount = services.filter((s) => s.state === "running").length;
  const isAnyRunning = runningCount > 0;
  const allRunning = services.length > 0 && runningCount === services.length;

  function isLoading(key: string) {
    return actionLoading === key;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Services Docker</CardTitle>
            {!loading && services.length > 0 ? (
              <Badge variant={allRunning ? "default" : isAnyRunning ? "secondary" : "outline"}>
                {allRunning
                  ? "Tous actifs"
                  : isAnyRunning
                    ? `${String(runningCount)}/${String(services.length)} actifs`
                    : "Inactifs"}
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            {services.length > 0 ? (
              <>
                {!allRunning ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading !== null}
                    onClick={() => { void performAction("up"); }}
                    title="Démarrer tout"
                  >
                    {isLoading("up-all") ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Power className="size-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">Tout démarrer</span>
                  </Button>
                ) : null}
                {isAnyRunning ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading !== null}
                    onClick={() => { void performAction("stop"); }}
                    title="Arrêter tout"
                  >
                    {isLoading("stop-all") ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <PowerOff className="size-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">Tout arrêter</span>
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { void fetchLogs(); }}
                  disabled={actionLoading !== null}
                  title="Logs de tous les services"
                >
                  {isLoading("logs-all") ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ScrollText className="size-4" />
                  )}
                </Button>
              </>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setExpanded(!expanded); }}
            >
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          </div>
        </div>
        <CardDescription>
          Gérez les conteneurs Docker de ce projet.
        </CardDescription>
      </CardHeader>

      {expanded ? (
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Chargement des services…
            </div>
          ) : null}

          {!loading && services.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Container className="size-4" />
              Aucun service configuré. Configurez la stack technique et les services optionnels.
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          {/* Service list */}
          {services.length > 0 ? (
            <div className="divide-y rounded-md border">
              {services.map((svc) => (
                <div
                  key={svc.service}
                  className="flex items-center justify-between gap-2 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Circle className={`size-2.5 shrink-0 fill-current ${stateDot(svc.state)}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{svc.label}</p>
                        <Badge variant={stateVariant(svc.state)} className="text-[10px] px-1.5 py-0">
                          {stateLabel(svc.state)}
                        </Badge>
                        {!svc.expected ? (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-yellow-600">
                            Résidu
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground truncate">{svc.description}</p>
                        {svc.status ? (
                          <span className="text-xs text-muted-foreground shrink-0">· {svc.status}</span>
                        ) : null}
                        {svc.ports.length > 0 ? (
                          <span className="font-mono text-xs text-muted-foreground shrink-0">
                            ({svc.ports.join(", ")})
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    {svc.state !== "running" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={actionLoading !== null}
                        onClick={() => { void performAction("up", svc.service); }}
                        title="Démarrer"
                      >
                        {isLoading(`up-${svc.service}`) ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Play className="size-3.5" />
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          disabled={actionLoading !== null}
                          onClick={() => { void performAction("restart", svc.service); }}
                          title="Redémarrer"
                        >
                          {isLoading(`restart-${svc.service}`) ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          disabled={actionLoading !== null}
                          onClick={() => { void performAction("stop", svc.service); }}
                          title="Arrêter"
                        >
                          {isLoading(`stop-${svc.service}`) ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Square className="size-3.5" />
                          )}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      disabled={actionLoading !== null || svc.state === "not_created"}
                      onClick={() => { void fetchLogs(svc.service); }}
                      title="Logs"
                    >
                      {isLoading(`logs-${svc.service}`) ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <ScrollText className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Logs panel */}
          {logs !== null ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Logs {logsService === "all" ? "(tous les services)" : `— ${String(logsService)}`}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => { setLogs(null); setLogsService(null); }}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
              <pre className="max-h-64 overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-xs leading-relaxed">
                {logs}
              </pre>
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
