"use client";

import {
  Play,
  Square,
  RotateCcw,
  ScrollText,
  Loader2,
  Circle,
  Database,
  Globe,
  Mail,
  HardDrive,
  Server,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ServiceInfo } from "./services-orchestrator";

interface ServiceCardProps {
  service: ServiceInfo;
  actionLoading: string | null;
  onAction: (action: string) => void;
  onShowLogs: () => void;
  isLogActive: boolean;
}

function serviceIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("wordpress") || l.includes("next")) return <Globe className="size-5" />;
  if (l.includes("mariadb") || l.includes("postgres")) return <Database className="size-5" />;
  if (l.includes("phpmyadmin")) return <LayoutDashboard className="size-5" />;
  if (l.includes("redis")) return <HardDrive className="size-5" />;
  if (l.includes("mailpit")) return <Mail className="size-5" />;
  return <Server className="size-5" />;
}

function stateColor(state: string): string {
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
      return "Redémarrage…";
    case "dead":
      return "Mort";
    default:
      return state;
  }
}

function stateBadgeVariant(state: string): "default" | "secondary" | "outline" | "destructive" {
  switch (state) {
    case "running":
      return "default";
    case "exited":
    case "dead":
      return "destructive";
    case "not_created":
      return "outline";
    default:
      return "secondary";
  }
}

export function ServiceCard({
  service: svc,
  actionLoading,
  onAction,
  onShowLogs,
  isLogActive,
}: ServiceCardProps) {
  const isLoading = (key: string) => actionLoading === key;
  const isRunning = svc.state === "running";
  const isNotCreated = svc.state === "not_created";

  return (
    <Card className={`transition-colors ${isRunning ? "border-green-500/30" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={isRunning ? "text-green-500" : "text-muted-foreground"}>
              {serviceIcon(svc.label)}
            </div>
            <div>
              <CardTitle className="text-base">{svc.label}</CardTitle>
              <p className="text-xs text-muted-foreground font-mono">{svc.service}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle className={`size-2 fill-current ${stateColor(svc.state)}`} />
            <Badge variant={stateBadgeVariant(svc.state)} className="text-xs">
              {stateLabel(svc.state)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{svc.description}</p>

        {svc.status ? (
          <p className="text-xs text-muted-foreground">
            {svc.status}
          </p>
        ) : null}

        {svc.ports.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {svc.ports.map((p) => (
              <Badge key={p} variant="outline" className="font-mono text-xs">
                {p}
              </Badge>
            ))}
          </div>
        ) : null}

        {!svc.expected ? (
          <Badge variant="outline" className="text-xs text-yellow-600">
            Service résiduel
          </Badge>
        ) : null}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1 border-t">
          {!isRunning ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={actionLoading !== null}
              onClick={() => { onAction("up"); }}
              title="Démarrer"
            >
              {isLoading(`up-${svc.service}`) ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5" />
              )}
              Démarrer
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={actionLoading !== null}
                onClick={() => { onAction("restart"); }}
                title="Redémarrer"
              >
                {isLoading(`restart-${svc.service}`) ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="size-3.5" />
                )}
                Relancer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={actionLoading !== null}
                onClick={() => { onAction("stop"); }}
                title="Arrêter"
              >
                {isLoading(`stop-${svc.service}`) ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Square className="size-3.5" />
                )}
                Arrêter
              </Button>
            </>
          )}
          <Button
            variant={isLogActive ? "secondary" : "ghost"}
            size="sm"
            disabled={isNotCreated}
            onClick={onShowLogs}
            title="Logs"
          >
            <ScrollText className="size-3.5" />
            Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
