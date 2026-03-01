"use client";

import { useEffect, useRef, useState } from "react";
import { X, Pause, Play, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogsTerminalProps {
  projectId: string;
  service?: string | undefined;
  mode: "dev" | "prod-like";
  onClose: () => void;
}

export function LogsTerminal({ projectId, service, mode, onClose }: LogsTerminalProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    setLines([]);
    const params = new URLSearchParams();
    params.set("mode", mode);
    if (service) params.set("service", service);
    const eventSource = new EventSource(`/api/docker/projects/${projectId}/logs?${params.toString()}`);

    eventSource.onmessage = (event) => {
      if (pausedRef.current) return;
      try {
        const line = JSON.parse(event.data as string) as string;
        setLines((prev) => {
          const next = [...prev, line];
          // Keep last 500 lines to avoid memory issues
          return next.length > 500 ? next.slice(-500) : next;
        });
      } catch {
        // ignore parse errors
      }
    };

    eventSource.onerror = () => {
      setLines((prev) => [...prev, "[Connexion aux logs interrompue]"]);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [projectId, service, mode]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines, autoScroll]);

  function handleScroll() {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
    setAutoScroll(isAtBottom);
  }

  const label = service ? service : "Tous les services";

  return (
    <div className="rounded-lg border bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-red-500" />
            <div className="size-3 rounded-full bg-yellow-500" />
            <div className="size-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs font-mono text-zinc-400">
            logs — {label}
          </span>
          <span className="text-xs text-zinc-600">
            {String(lines.length)} lignes
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            onClick={() => { setPaused(!paused); }}
            title={paused ? "Reprendre" : "Pause"}
          >
            {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
          </Button>
          {!autoScroll ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              onClick={() => {
                setAutoScroll(true);
                if (containerRef.current) {
                  containerRef.current.scrollTop = containerRef.current.scrollHeight;
                }
              }}
              title="Défiler vers le bas"
            >
              <ArrowDown className="size-3" />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            onClick={onClose}
            title="Fermer"
          >
            <X className="size-3" />
          </Button>
        </div>
      </div>

      {/* Log output */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-80 overflow-auto p-4 font-mono text-xs leading-relaxed"
      >
        {lines.length === 0 ? (
          <p className="text-zinc-600">En attente de logs…</p>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all hover:bg-zinc-900/50">
              {colorize(line)}
            </div>
          ))
        )}
      </div>

      {/* Status bar */}
      {paused ? (
        <div className="border-t border-zinc-800 px-4 py-1 text-center">
          <span className="text-xs text-yellow-500">⏸ Flux en pause</span>
        </div>
      ) : null}
    </div>
  );
}

/** Simple ANSI-less colorization based on log content */
function colorize(line: string): React.JSX.Element {
  // Error patterns
  if (/error|fatal|crit/i.test(line)) {
    return <span className="text-red-400">{line}</span>;
  }
  // Warning patterns
  if (/warn|notice|AH00558/i.test(line)) {
    return <span className="text-yellow-400">{line}</span>;
  }
  // Success patterns
  if (/success|✅|installed|ready|started/i.test(line)) {
    return <span className="text-green-400">{line}</span>;
  }
  // Info patterns (timestamps, docker prefix)
  if (/^\S+\s+\|/.test(line)) {
    const pipeIdx = line.indexOf("|");
    return (
      <span>
        <span className="text-cyan-600">{line.slice(0, pipeIdx + 1)}</span>
        <span className="text-zinc-300">{line.slice(pipeIdx + 1)}</span>
      </span>
    );
  }
  return <span className="text-zinc-300">{line}</span>;
}
