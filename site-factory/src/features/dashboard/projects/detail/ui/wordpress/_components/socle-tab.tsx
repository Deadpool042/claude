"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  INFRA_FEATURES,
  PLUGIN_CATEGORY_EMOJI,
  PLUGIN_CATEGORY_LABELS,
  WP_FEATURE_LABELS,
  type WpInfraFeature,
  type PluginCategory,
} from "@/lib/wp/features";
import type { WpInfraStatusValue } from "@/lib/wp/infra-status";
import type { SoclePluginExpectation, SocleSnapshot, WpInfo } from "./types";

type PluginState = "active" | "inactive" | "missing";

const IGNORED_EXTRA_STATUSES = new Set(["must-use", "dropin"]);
const IGNORED_EXTRA_SLUGS = new Set(["sf-local-ssl", "sf-cf7-honeypot", "db.php"]);
const MU_PLUGIN_EXPECTATIONS = [
  { slug: "sf-local-ssl", label: "SSL local (loopback)" },
  { slug: "sf-cf7-honeypot", label: "Honeypot Contact Form 7" },
];

function groupByCategory(plugins: SoclePluginExpectation[]) {
  const byCategory = new Map<PluginCategory, SoclePluginExpectation[]>();
  for (const p of plugins) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }
  return byCategory;
}

function getPluginState(
  slug: string,
  installedMap: Map<string, { status: string }>
): PluginState {
  const installed = installedMap.get(slug);
  if (!installed) return "missing";
  return installed.status === "active" ? "active" : "inactive";
}

function StatusDot({ state }: { state: PluginState }) {
  const className =
    state === "active"
      ? "bg-emerald-500"
      : state === "inactive"
        ? "bg-amber-500"
        : "bg-rose-500";
  return <span className={`inline-block size-2.5 rounded-full ${className}`} />;
}

function StatusLabel({ state }: { state: PluginState }) {
  if (state === "active") return "Actif";
  if (state === "inactive") return "Installé";
  return "Manquant";
}

export function SocleTab(props: {
  socle: SocleSnapshot | null;
  info: WpInfo;
  actionLoading: string | null;
  onInstallRequired: (slugs: string[]) => void;
  onInstallOptional: (slugs: string[]) => void;
  onActivateInactive: (slugs: string[]) => void;
  onUpdateInfraStatus: (feature: WpInfraFeature, status: WpInfraStatusValue) => void;
  onSyncMuPlugins: () => void;
}) {
  const {
    socle,
    info,
    actionLoading,
    onInstallRequired,
    onInstallOptional,
    onActivateInactive,
    onUpdateInfraStatus,
    onSyncMuPlugins,
  } = props;

  if (!socle || socle.features.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        Aucun socle enregistré pour ce projet. Applique un preset pour initialiser
        les features.
      </div>
    );
  }

  const installedMap = new Map(
    info.plugins.map((p) => [p.name, { status: p.status }])
  );
  const expectedSlugs = new Set(socle.plugins.map((p) => p.slug));
  const muPluginSet = new Set(
    info.plugins
      .filter((p) => p.status === "must-use")
      .map((p) => p.name)
  );
  const byCategory = groupByCategory(socle.plugins);

  const pluginStatuses = socle.plugins.map((p) => {
    const state = getPluginState(p.slug, installedMap);
    return { ...p, state };
  });

  const missingRequired = pluginStatuses.filter(
    (p) => p.state === "missing" && !p.optional
  );
  const missingOptional = pluginStatuses.filter(
    (p) => p.state === "missing" && p.optional
  );
  const inactive = pluginStatuses.filter((p) => p.state === "inactive");
  const active = pluginStatuses.filter((p) => p.state === "active");

  const extraPlugins = info.plugins.filter(
    (p) =>
      !expectedSlugs.has(p.name) &&
      !IGNORED_EXTRA_STATUSES.has(p.status) &&
      !IGNORED_EXTRA_SLUGS.has(p.name)
  );
  const infraFeatures = INFRA_FEATURES.filter((f) => socle.features.includes(f));
  const infraStatus = socle.infraStatus ?? {};

  const activeTheme = info.themes.find((t) => t.status === "active")?.name ?? null;
  const themeExpected = socle.themeExpected ?? "sf-tt5";
  const themeOk = activeTheme ? activeTheme === themeExpected : false;
  const themeDisplay = activeTheme
    ? `${activeTheme}${activeTheme === "sf-tt5" ? " (parent: twentytwentyfive)" : ""}`
    : "non détecté";
  const hasActions =
    missingRequired.length > 0 ||
    missingOptional.length > 0 ||
    inactive.length > 0;
  const isBusy = actionLoading !== null;
  const isInstallingRequired = actionLoading === "socle-install-required";
  const isInstallingOptional = actionLoading === "socle-install-optional";
  const isActivatingInactive = actionLoading === "socle-activate-inactive";
  const isSyncingMu = actionLoading === "sync-mu-plugins";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 bg-muted/20 space-y-2">
        <div className="flex items-center gap-2">
          {missingRequired.length > 0 ? (
            <AlertTriangle className="size-4 text-amber-500" />
          ) : (
            <CheckCircle2 className="size-4 text-emerald-500" />
          )}
          <p className="text-sm font-semibold">Audit socle</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-muted-foreground">
          <div>
            Plugins attendus :{" "}
            <span className="font-medium text-foreground">
              {String(socle.plugins.length)}
            </span>
          </div>
          <div>
            Actifs :{" "}
            <span className="font-medium text-foreground">
              {String(active.length)}
            </span>
          </div>
          <div>
            Manquants requis :{" "}
            <span className="font-medium text-foreground">
              {String(missingRequired.length)}
            </span>
          </div>
          <div>
            Hors socle :{" "}
            <span className="font-medium text-foreground">
              {String(extraPlugins.length)}
            </span>
          </div>
          <div>
            Thème :{" "}
            <span className={`font-medium ${themeOk ? "text-emerald-600" : "text-rose-600"}`}>
              {themeDisplay}
            </span>
          </div>
        </div>
        {socle.warnings.length > 0 ? (
          <div className="text-xs text-muted-foreground space-y-1">
            {socle.warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        ) : null}
      </div>

      {hasActions ? (
        <div className="rounded-lg border bg-muted/10 p-3 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <p className="font-medium text-muted-foreground">Actions rapides</p>
            <span className="text-muted-foreground">
              L&apos;installation active automatiquement les plugins.
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingRequired.length > 0 ? (
              <Button
                size="sm"
                variant="default"
                disabled={isBusy}
                onClick={() =>
                  onInstallRequired(missingRequired.map((p) => p.slug))
                }
              >
                {isInstallingRequired ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
                Installer {String(missingRequired.length)} requis
              </Button>
            ) : null}
            {inactive.length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                disabled={isBusy}
                onClick={() =>
                  onActivateInactive(inactive.map((p) => p.slug))
                }
              >
                {isActivatingInactive ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
                Activer {String(inactive.length)} installés
              </Button>
            ) : null}
            {missingOptional.length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                disabled={isBusy}
                onClick={() =>
                  onInstallOptional(missingOptional.map((p) => p.slug))
                }
              >
                {isInstallingOptional ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
                Installer {String(missingOptional.length)} optionnels
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        <div className="space-y-2">
          <p className="font-medium text-muted-foreground">
            🔌 Plugins attendus
          </p>
          <div className="space-y-2">
            {Array.from(byCategory.entries()).map(([cat, plugins]) => (
              <div key={cat}>
                <div className="text-muted-foreground">
                  {PLUGIN_CATEGORY_EMOJI[cat]} {PLUGIN_CATEGORY_LABELS[cat]}
                </div>
                <ul className="ml-3 space-y-1">
                  {plugins.map((p) => {
                    const state = getPluginState(p.slug, installedMap);
                    return (
                      <li key={p.slug} className="flex items-center gap-2">
                        <StatusDot state={state} />
                        <span>{p.label}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0"
                        >
                          <StatusLabel state={state} />
                        </Badge>
                        {p.optional ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0"
                          >
                            opt.
                          </Badge>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {inactive.length > 0 ? (
            <p className="text-[11px] text-muted-foreground">
              <CircleDashed className="inline size-3 mr-1 text-amber-500" />
              Plugins installés mais inactifs : {String(inactive.length)}
            </p>
          ) : null}
          {missingOptional.length > 0 ? (
            <p className="text-[11px] text-muted-foreground">
              <CircleDashed className="inline size-3 mr-1 text-muted-foreground" />
              Manquants optionnels : {String(missingOptional.length)}
            </p>
          ) : null}
          {missingRequired.length > 0 ? (
            <p className="text-[11px] text-rose-600">
              <XCircle className="inline size-3 mr-1" />
              Manquants requis : {String(missingRequired.length)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="font-medium text-muted-foreground">
            🧩 Features infra / code
          </p>
          {infraFeatures.length === 0 ? (
            <p className="text-muted-foreground">Aucune feature infra.</p>
          ) : (
            <ul className="space-y-1">
              {infraFeatures.map((f) => {
                const status = infraStatus[f] ?? "todo";
                const isUpdating = actionLoading === `infra-${f}`;
                const isDone = status === "done";
                return (
                  <li key={f} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StatusDot state={isDone ? "active" : "inactive"} />
                      <span>{WP_FEATURE_LABELS[f] ?? f}</span>
                      <Badge
                        variant={isDone ? "secondary" : "outline"}
                        className="text-[10px] px-1 py-0"
                      >
                        {isDone ? "Validé" : "À faire"}
                      </Badge>
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="h-6 text-[10px]"
                      disabled={isBusy}
                      onClick={() =>
                        onUpdateInfraStatus(f, isDone ? "todo" : "done")
                      }
                    >
                      {isUpdating ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : null}
                      {isDone ? "Marquer à faire" : "Valider"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-muted-foreground">🔧 MU-plugins (code)</p>
            <Button
              size="xs"
              variant="outline"
              className="h-6 text-[10px]"
              disabled={isBusy}
              onClick={onSyncMuPlugins}
            >
              {isSyncingMu ? (
                <Loader2 className="size-3 animate-spin mr-1" />
              ) : null}
              Synchroniser
            </Button>
          </div>
          <ul className="space-y-1">
            {MU_PLUGIN_EXPECTATIONS.map((mu) => {
              const isPresent = muPluginSet.has(mu.slug);
              return (
                <li key={mu.slug} className="flex items-center gap-2">
                  <StatusDot state={isPresent ? "active" : "missing"} />
                  <span>{mu.label}</span>
                  <Badge
                    variant={isPresent ? "secondary" : "outline"}
                    className="text-[10px] px-1 py-0"
                  >
                    {isPresent ? "Installé" : "Manquant"}
                  </Badge>
                </li>
              );
            })}
          </ul>
          <p className="text-[11px] text-muted-foreground">
            Copiés depuis{" "}
            <code className="bg-muted px-1 rounded font-mono">
              assets/wp/mu-plugins
            </code>
            .
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-medium text-muted-foreground">🚫 Hors socle</p>
          {extraPlugins.length === 0 ? (
            <p className="text-muted-foreground">Aucun plugin hors socle détecté.</p>
          ) : (
            <ul className="space-y-1">
              {extraPlugins.map((p) => (
                <li key={p.name} className="flex items-center gap-2">
                  <StatusDot state="inactive" />
                  <span>{p.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    À justifier
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
