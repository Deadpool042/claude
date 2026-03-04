// Tests Tab extrait de maintenance-tab
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Loader2, Info } from "lucide-react";
import { StatusLine } from "./utils/StatusLine";
import { formatDate } from "./utils/helpers";
import type { MaintenanceStatus, HoneypotCheck, HoneypotTest } from "../types";

interface TestsTabProps {
  cf7Active: boolean;
  muHoneypotPresent: boolean;
  honeypotCheck: HoneypotCheck | null;
  honeypotTest: HoneypotTest | null;
  maintenanceStatus: MaintenanceStatus | null;
  disableRuntimeActions: boolean;
  isChecking: boolean;
  isTesting: boolean;
  isHealthRunning: boolean;
  onRunHoneypotCheck: () => void;
  onRunHoneypotTest: () => void;
  onRunHealthCheck: () => void;
}

export default function TestsTab({
  cf7Active,
  muHoneypotPresent,
  honeypotCheck,
  honeypotTest,
  maintenanceStatus,
  disableRuntimeActions,
  isChecking,
  isTesting,
  isHealthRunning,
  onRunHoneypotCheck,
  onRunHoneypotTest,
  onRunHealthCheck,
}: TestsTabProps) {
  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">Anti-spam</p>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            obligatoire
          </Badge>
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">CF7 Honeypot</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex text-muted-foreground">
                    <Info className="size-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Verifie le champ invisible qui bloque les bots sur Contact Form 7.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                disabled={disableRuntimeActions}
                onClick={onRunHoneypotCheck}
              >
                {isChecking ? (
                  <Loader2 className="size-3 animate-spin mr-1" />
                ) : null}
                Verifier
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={disableRuntimeActions}
                onClick={onRunHoneypotTest}
              >
                {isTesting ? (
                  <Loader2 className="size-3 animate-spin mr-1" />
                ) : null}
                Test reel
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Verifie la presence des pieces CF7 + MU-plugin avant le test reel.
          </p>
          <div className="space-y-2">
            <StatusLine label="Contact Form 7 actif" ok={cf7Active} />
            <StatusLine label="MU-plugin honeypot" ok={muHoneypotPresent} />
            {honeypotCheck ? (
              <p className="text-[11px] text-muted-foreground">
                Derniere verification: {honeypotCheck.checkedAt}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Verification non lancee.
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Resultat test reel
            </p>
            {honeypotTest ? (
              <div className="space-y-2">
                <StatusLine
                  label={honeypotTest.message}
                  ok={honeypotTest.ok}
                  okLabel="OK"
                  failLabel="Echec"
                />
                <p className="text-[11px] text-muted-foreground">
                  Dernier test: {honeypotTest.testedAt}
                </p>
                {honeypotTest.details ? (
                  <details className="text-[11px] text-muted-foreground">
                    <summary className="cursor-pointer">Details</summary>
                    <div className="mt-2 space-y-1">
                      <p>CF7 actif: {honeypotTest.details.cf7Active ? "oui" : "non"}</p>
                      <p>
                        Champ vide accepte: {honeypotTest.details.emptyPass == null ? "n/a" : honeypotTest.details.emptyPass ? "oui" : "non"}
                      </p>
                      <p>
                        Champ rempli bloque: {honeypotTest.details.filledBlocked == null ? "n/a" : honeypotTest.details.filledBlocked ? "oui" : "non"}
                      </p>
                    </div>
                  </details>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Aucun test lance.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">Sante applicative</p>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            technique
          </Badge>
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Health check</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex text-muted-foreground">
                    <Info className="size-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Test rapide DB, FS, uploads, version WP/PHP.
                </TooltipContent>
              </Tooltip>
            </div>
            <Button
              size="sm"
              className="h-7 text-xs"
              disabled={disableRuntimeActions}
              onClick={onRunHealthCheck}
            >
              {isHealthRunning ? (
                <Loader2 className="size-3 animate-spin mr-1" />
              ) : null}
              Lancer
            </Button>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Dernier check: {formatDate(maintenanceStatus?.last_health_at)}</p>
            <p>
              Statut: {maintenanceStatus?.last_health_ok === undefined ? "n/a" : maintenanceStatus.last_health_ok ? "OK" : "KO"}
            </p>
          </div>
          {maintenanceStatus?.last_health_details ? (
            <details className="text-[11px] text-muted-foreground">
              <summary className="cursor-pointer">Details</summary>
              <div className="mt-2 space-y-1">
                <p>DB: {maintenanceStatus.last_health_details.db_ok ? "OK" : "KO"}</p>
                <p>Cron: {maintenanceStatus.last_health_details.cron_ok ? "OK" : "KO"}</p>
                <p>FS: {maintenanceStatus.last_health_details.fs_ok ? "OK" : "KO"}</p>
                <p>
                  Uploads: {maintenanceStatus.last_health_details.uploads_ok ? "OK" : "KO"}
                </p>
              </div>
            </details>
          ) : null}
          <p className="text-[11px] text-muted-foreground">
            Utilise WP-CLI. A conserver pour diagnostiquer plus tard.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {[
          { title: "Email", note: "Tests SMTP et delivrabilite." },
          { title: "Performance", note: "Checks cache et temps de reponse." },
          { title: "Securite", note: "Verification headers et hardening." },
          { title: "SEO", note: "Audit rapide sitemap et metadonnees." },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-dashed p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{item.title}</p>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                coming soon
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{item.note}</p>
          </div>
        ))}
      </div>
    </>
  );
}