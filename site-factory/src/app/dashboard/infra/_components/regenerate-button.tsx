"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RegenerateButton() {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRegenerate() {
    setIsPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/traefik/regenerate", { method: "POST" });
      if (res.ok) {
        setMessage("Configuration régénérée");
        // Reload after a short delay to show updated routes
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        setMessage("Erreur lors de la régénération");
      }
    } catch {
      setMessage("Erreur réseau");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {message ? (
        <span className="text-xs text-muted-foreground">{message}</span>
      ) : null}
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => void handleRegenerate()}
      >
        <RefreshCw
          className={`size-4 ${isPending ? "animate-spin" : ""}`}
        />
        {isPending ? "Régénération..." : "Régénérer Traefik"}
      </Button>
    </div>
  );
}
