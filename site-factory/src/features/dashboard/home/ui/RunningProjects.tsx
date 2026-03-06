"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Circle,
  ExternalLink,
  Globe,
  Loader2,
  Server,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

// ── Types ───────────────────────────────────────────────────────────────

interface ServiceStatus {
  name: string;
  label: string;
  state: string;
}

interface ProjectDockerStatus {
  projectId: string;
  projectName: string;
  slug: string;
  techStack: string | null;
  port: number | null;
  host: string;
  status: "running" | "partial" | "stopped" | "no_compose" | "error";
  services: ServiceStatus[];
  runningCount: number;
  totalCount: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function statusColor(status: ProjectDockerStatus["status"]): string {
  switch (status) {
    case "running":
      return "text-emerald-500";
    case "partial":
      return "text-amber-500";
    case "stopped":
      return "text-red-500";
    case "no_compose":
      return "text-muted-foreground/40";
    case "error":
      return "text-red-400";
  }
}

function statusLabel(status: ProjectDockerStatus["status"]): string {
  switch (status) {
    case "running":
      return "En ligne";
    case "partial":
      return "Partiel";
    case "stopped":
      return "Arrêté";
    case "no_compose":
      return "Non configuré";
    case "error":
      return "Erreur";
  }
}

function statusBadgeVariant(
  status: ProjectDockerStatus["status"],
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "running":
      return "default";
    case "partial":
      return "secondary";
    case "stopped":
      return "destructive";
    case "no_compose":
      return "outline";
    case "error":
      return "destructive";
  }
}

function stackIcon(techStack: string | null) {
  if (techStack === "WORDPRESS" || techStack === "NEXTJS") {
    return <Globe className="size-4" />;
  }
  return <Server className="size-4" />;
}

function stackLabel(techStack: string | null): string {
  if (techStack === "WORDPRESS") return "WordPress";
  if (techStack === "NEXTJS") return "Next.js";
  return "Docker";
}

// ── Component ───────────────────────────────────────────────────────────

export function RunningProjects() {
  const [projects, setProjects] = useState<ProjectDockerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);

  const connectSSE = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }

    const es = new EventSource("/api/docker/status/stream");
    esRef.current = es;

    es.addEventListener("status", (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as { projects: ProjectDockerStatus[] };
        setProjects(data.projects);
        setConnected(true);
        setLoading(false);
        retryRef.current = 0;
      } catch {
        // Invalid JSON
      }
    });

    es.addEventListener("heartbeat", () => {
      setConnected(true);
    });

    es.addEventListener("error", () => {
      setConnected(false);
      es.close();
      esRef.current = null;
      const delay = Math.min(1000 * 2 ** retryRef.current, 10_000);
      retryRef.current += 1;
      setTimeout(connectSSE, delay);
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setConnected(false);
      }
    };
  }, []);

  useEffect(() => {
    connectSSE();
    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [connectSSE]);

  // Separate active (running/partial) from inactive
  const activeProjects = projects.filter(
    (p) => p.status === "running" || p.status === "partial",
  );
  const inactiveProjects = projects.filter(
    (p) => p.status !== "running" && p.status !== "partial",
  );

  const totalRunning = activeProjects.length;
  const totalProjects = projects.length;

  // ── Loading ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">Projets Docker</CardTitle>
              <CardDescription>Statut temps réel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin mr-2" />
            Connexion à Docker…
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── No projects ───────────────────────────────────────────────────────

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-sm">Projets Docker</CardTitle>
                <CardDescription>Aucun projet Docker configuré</CardDescription>
              </div>
            </div>
            <ConnectionBadge connected={connected} />
          </div>
        </CardHeader>
      </Card>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">Projets Docker</CardTitle>
              <CardDescription>
                {totalRunning} / {totalProjects} en ligne
              </CardDescription>
            </div>
          </div>
          <ConnectionBadge connected={connected} />
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <TooltipProvider delayDuration={200}>
          {/* ── Active projects ──────────────────────────────────── */}
          {activeProjects.map((project) => (
            <ProjectRow key={project.projectId} project={project} />
          ))}

          {/* ── Separator if both lists ──────────────────────────── */}
          {activeProjects.length > 0 && inactiveProjects.length > 0 ? (
            <div className="border-t my-2" />
          ) : null}

          {/* ── Inactive projects ────────────────────────────────── */}
          {inactiveProjects.map((project) => (
            <ProjectRow key={project.projectId} project={project} />
          ))}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────

function ConnectionBadge({ connected }: { connected: boolean }) {
  return connected ? (
    <Badge variant="outline" className="gap-1 text-xs text-emerald-600">
      <Wifi className="size-3" />
      Live
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
      <WifiOff className="size-3" />
      …
    </Badge>
  );
}

function ProjectRow({ project }: { project: ProjectDockerStatus }) {
  return (
    <Link
      href={`/dashboard/projects/${project.projectId}/services`}
      className="flex items-center gap-3 rounded-md px-2 py-2 -mx-2 transition-colors hover:bg-muted/50 group"
    >
      {/* Status dot */}
      <Circle
        className={`size-2.5 shrink-0 fill-current ${statusColor(project.status)}`}
      />

      {/* Project info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{project.projectName}</span>
          <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
            {stackIcon(project.techStack)}
            {stackLabel(project.techStack)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <code className="truncate">{project.host}</code>
          {project.port !== null ? (
            <span className="shrink-0">:{String(project.port)}</span>
          ) : null}
        </div>
      </div>

      {/* Service pills */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant={statusBadgeVariant(project.status)} className="text-xs gap-1">
              {project.status === "running" || project.status === "partial" ? (
                <span className="font-mono">
                  {String(project.runningCount)}/{String(project.totalCount)}
                </span>
              ) : null}
              {statusLabel(project.status)}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-xs">
          <div className="space-y-0.5">
            {project.services.map((svc) => (
              <div key={svc.name} className="flex items-center gap-2">
                <Circle
                  className={`size-1.5 fill-current ${
                    svc.state === "running"
                      ? "text-emerald-500"
                      : svc.state === "exited" || svc.state === "dead"
                        ? "text-red-500"
                        : "text-muted-foreground/40"
                  }`}
                />
                <span>{svc.label}</span>
                <span className="text-muted-foreground">{svc.state}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Arrow on hover */}
      <ExternalLink className="size-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0" />
    </Link>
  );
}
