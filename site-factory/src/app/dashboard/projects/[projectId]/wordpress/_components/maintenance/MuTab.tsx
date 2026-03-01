"use client";
// MU-plugins Tab extrait de maintenance-tab
import { Button } from "@/components/ui/button";
import { StatusLine } from "./utils/StatusLine";

interface MuTabProps {
  muLocalSslPresent: boolean;
  muHoneypotPresent: boolean;
  disableRuntimeActions: boolean;
  isSyncingMu: boolean;
  onSyncMuPlugins: () => void;
}

export default function MuTab({
  muLocalSslPresent,
  muHoneypotPresent,
  disableRuntimeActions,
  isSyncingMu,
  onSyncMuPlugins,
}: MuTabProps) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">MU-plugins obligatoires</p>
          <p className="text-xs text-muted-foreground">
            Toujours deployes pour garantir les fonctions critiques.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          disabled={disableRuntimeActions}
          onClick={onSyncMuPlugins}
        >
          {isSyncingMu ? (
            <span className="size-3 animate-spin mr-1">⏳</span>
          ) : null}
          Synchroniser
        </Button>
      </div>
      <div className="space-y-2">
        <StatusLine label="SF Local SSL (dev)" ok={muLocalSslPresent} />
        <StatusLine label="SF CF7 Honeypot" ok={muHoneypotPresent} />
      </div>
      <p className="text-[11px] text-muted-foreground">
        Copie depuis <code className="bg-muted px-1 rounded font-mono">assets/wp/mu-plugins</code>.
      </p>
    </div>
  );
}
