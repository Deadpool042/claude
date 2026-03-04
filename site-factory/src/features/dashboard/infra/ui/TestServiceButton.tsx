"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestServiceButtonProps {
  service: string;
}

export function TestServiceButton({ service }: TestServiceButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    status?: number;
    error?: string;
  } | null>(null);

  async function handleTest() {
    setIsPending(true);
    setResult(null);
    try {
      const res = await fetch(`/api/docker/${service}/test`);
      const data = (await res.json()) as {
        success: boolean;
        status?: number;
        error?: string;
      };
      setResult(data);
    } catch {
      setResult({ success: false, error: "Erreur réseau" });
    } finally {
      setIsPending(false);
      setTimeout(() => { setResult(null); }, 4000);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Button
        size="xs"
        variant="outline"
        disabled={isPending}
        onClick={() => void handleTest()}
      >
        <Zap className={`size-3 ${isPending ? "animate-pulse" : ""}`} />
        {isPending ? "Test…" : "Test"}
      </Button>
      {result ? (
        <span
          className={`text-xs font-medium ${result.success ? "text-green-500" : "text-red-500"}`}
        >
          {result.success ? `OK (${String(result.status)})` : result.error}
        </span>
      ) : null}
    </div>
  );
}
