import type { LogLevel } from "../../types";

export function logLevelClass(level: LogLevel): string {
  switch (level) {
    case "error":
      return "border-rose-500/40 text-rose-500";
    case "warn":
      return "border-amber-500/40 text-amber-500";
    case "debug":
      return "border-muted-foreground/40 text-muted-foreground";
    case "info":
    default:
      return "border-sky-500/40 text-sky-500";
  }
}
