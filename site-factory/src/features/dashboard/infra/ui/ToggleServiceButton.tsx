"use client";

import { useState, useEffect, useCallback } from "react";
import { Power } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ToggleServiceButtonProps {
  service: string;
}

export function ToggleServiceButton({ service }: ToggleServiceButtonProps) {
  const [running, setRunning] = useState<boolean | null>(null);
  const [isPending, setIsPending] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/docker/${service}`);
      const data = (await res.json()) as { running: boolean };
      setRunning(data.running);
    } catch {
      setRunning(null);
    }
  }, [service]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  async function handleToggle() {
    if (running === null) return;
    setIsPending(true);
    try {
      await fetch(`/api/docker/${service}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: running ? "stop" : "start" }),
      });
      // Petit délai pour laisser Docker réagir
      await new Promise((r) => setTimeout(r, 1500));
      await fetchStatus();
    } catch {
      // ignore
    } finally {
      setIsPending(false);
    }
  }

  const isLoading = running === null && !isPending;

  return (
    <Button
      size="xs"
      variant={running ? "destructive" : "default"}
      disabled={isPending || isLoading}
      onClick={() => void handleToggle()}
    >
      <Power className={`size-3 ${isPending ? "animate-pulse" : ""}`} />
      {isPending
        ? running
          ? "Arrêt…"
          : "Démarrage…"
        : isLoading
          ? "…"
          : running
            ? "Stopper"
            : "Démarrer"}
    </Button>
  );
}