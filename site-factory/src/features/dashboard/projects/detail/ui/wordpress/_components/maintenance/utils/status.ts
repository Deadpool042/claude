import type { MetricStatus } from "@/lib/monitoring";
import type { RuntimeStatusState } from "../../types";

export function runtimeStatusLabel(
  state: RuntimeStatusState,
  runningCount: number,
  totalCount: number,
): string {
  switch (state) {
    case "running":
      return `Services OK (${String(runningCount)}/${String(totalCount)})`;
    case "partial":
      return `Services partiels (${String(runningCount)}/${String(totalCount)})`;
    case "stopped":
      return "Services arretes";
    case "no_compose":
      return "Compose manquant";
    case "prod":
      return "Production";
    default:
      return "Etat inconnu";
  }
}

export function runtimeStatusClass(state: RuntimeStatusState): string {
  switch (state) {
    case "running":
      return "border-emerald-500/30 text-emerald-600";
    case "partial":
      return "border-amber-500/30 text-amber-500";
    case "stopped":
    case "no_compose":
      return "border-rose-500/30 text-rose-600";
    case "prod":
      return "border-sky-500/30 text-sky-500";
    default:
      return "border-muted-foreground/30 text-muted-foreground";
  }
}

export function metricStatusLabel(status: MetricStatus): string {
  if (status === "ok") return "OK";
  if (status === "warn") return "Alerte";
  if (status === "ko") return "KO";
  return "n/a";
}

export function metricStatusClass(status: MetricStatus): string {
  if (status === "ok") return "border-emerald-500/30 text-emerald-600";
  if (status === "warn") return "border-amber-500/30 text-amber-500";
  if (status === "ko") return "border-rose-500/30 text-rose-600";
  return "border-muted-foreground/30 text-muted-foreground";
}

export function worstStatus(statuses: MetricStatus[]): MetricStatus {
  const filtered = statuses.filter((status) => status !== "na");
  if (filtered.length === 0) return "na";
  if (filtered.includes("ko")) return "ko";
  if (filtered.includes("warn")) return "warn";
  return "ok";
}

export function formatPercent(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return `${value.toFixed(1)}%`;
}

export function formatMs(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return `${Math.round(value)} ms`;
}

export function formatRate(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return `${value.toFixed(2)}/s`;
}
