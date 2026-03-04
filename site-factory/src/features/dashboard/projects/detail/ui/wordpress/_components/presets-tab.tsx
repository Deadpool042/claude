"use client";

import { Loader2, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  PLUGIN_CATEGORY_LABELS,
  PLUGIN_CATEGORY_EMOJI,
  type PluginCategory,
  WP_FEATURE_LABELS,
} from "@/lib/wp";

import type { WpPreset } from "@/lib/wp";
import { resolveWpPlugins, type ResolvedPlugin } from "@/lib/wp";
import type { HostingProfileId } from "@/lib/hosting";

// ── helpers ───────────────────────────────────────────────────────────

function groupByCategory(plugins: ResolvedPlugin[]) {
  const byCategory = new Map<PluginCategory, ResolvedPlugin[]>();
  for (const p of plugins) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }
  return byCategory;
}

// ── PresetDetails ─────────────────────────────────────────────────────

function PresetDetails(props: {
  preset: WpPreset;
  actionLoading: string | null;
  onApply: () => void;
  hostingProfileId: HostingProfileId;
}) {
  const { preset, actionLoading, onApply, hostingProfileId } = props;
  const isSfTt5 = preset.theme === "sf-tt5";

  const resolved = resolveWpPlugins(preset.features, { profileId: hostingProfileId });
  const byCategory = groupByCategory(resolved.plugins);

  return (
    <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span>{preset.emoji}</span>
          Preset « {preset.label} »
        </h4>

        <Button size="sm" disabled={actionLoading !== null} onClick={onApply}>
          {actionLoading === "apply-preset" ? (
            <Loader2 className="size-3.5 animate-spin mr-1.5" />
          ) : (
            <Sparkles className="size-3.5 mr-1.5" />
          )}
          Appliquer ce preset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        {/* Pages */}
        <div>
          <p className="font-medium text-muted-foreground mb-1">
            📄 Pages ({String(preset.pages.length)})
          </p>
          <ul className="space-y-0.5">
            {preset.pages.map((p) => (
              <li key={p.slug} className="flex items-center gap-1">
                {p.isFrontPage ? (
                  <span title="Page d'accueil">🏠</span>
                ) : (
                  <span className="w-4" />
                )}
                {p.title}
              </li>
            ))}
          </ul>
        </div>

        {/* Plugins proposés (preview via resolver) */}
        <div>
          <p className="font-medium text-muted-foreground mb-1">
            🔌 Plugins proposés ({String(resolved.plugins.length)})
          </p>

          {resolved.warnings.length > 0 ? (
            <div className="text-[11px] text-muted-foreground space-y-1 mb-2">
              {resolved.warnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
            </div>
          ) : null}

          <div className="space-y-1.5">
            {Array.from(byCategory.entries()).map(([cat, plugins]) => (
              <div key={cat}>
                <span className="text-muted-foreground">
                  {PLUGIN_CATEGORY_EMOJI[cat]} {PLUGIN_CATEGORY_LABELS[cat]}
                </span>
                <ul className="ml-3 space-y-0">
                  {plugins.map((p) => (
                    <li key={p.slug} className="flex items-center gap-1">
                      {/* Par défaut: installé mais NON actif => rond vide */}
                      <span className="w-3 h-3 rounded-full border border-muted-foreground/30 inline-block" />
                      {p.label}
                      {p.optional ? (
                        <Badge
                          variant="outline"
                          className="text-[8px] px-1 py-0 ml-1"
                        >
                          opt.
                        </Badge>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Config */}
        <div className="space-y-3">
          <div>
            <p className="font-medium text-muted-foreground mb-1">⚙️ Configuration</p>
            <ul className="space-y-0.5">
              <li>
                Thème :{" "}
                <span className="font-medium">
                  {preset.theme}
                  {isSfTt5 ? " (parent: twentytwentyfive)" : ""}
                </span>
              </li>
              <li>
                Permaliens :{" "}
                <code className="bg-muted px-1 rounded font-mono">
                  {preset.permalink}
                </code>
              </li>
              <li>
                Langue : <span className="font-medium">fr_FR</span>
              </li>
              <li>
                Page d&apos;accueil : <span className="font-medium">Statique</span>
              </li>
            </ul>
          </div>

          {/* (optionnel) résumé features */}
          <div>
            <p className="font-medium text-muted-foreground mb-1">🧩 Features</p>
            <div className="flex flex-wrap gap-1">
              {preset.features.map((f) => {
                const label = WP_FEATURE_LABELS[f] ?? f;
                return (
                  <Badge key={f} variant="outline" className="text-[10px] px-1.5 py-0">
                    {label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PresetsTab ────────────────────────────────────────────────────────

export function PresetsTab(props: {
  presetList: WpPreset[];
  projectType?: string;
  selectedPreset: WpPreset | null;
  presetResult: string[] | null;
  actionLoading: string | null;
  onSelectPreset: (p: WpPreset) => void;
  onApplyPreset: (type: string) => void;
  hostingProfileId: HostingProfileId;
}) {
  const {
    presetList,
    projectType,
    selectedPreset,
    presetResult,
    actionLoading,
    onSelectPreset,
    onApplyPreset,
    hostingProfileId,
  } = props;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Appliquez un preset pour configurer automatiquement le socle technique
        commun (sécurité, RGPD, performance), les pages, les plugins et le thème.
      </p>

      {/* Base commune info (texte marketing, indépendant du resolver) */}
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="size-4 text-blue-500" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            Socle technique commun — inclus dans tous les presets
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs text-muted-foreground">
          <div>🔐 Sécurité + Headers</div>
          <div>🛡️ WAF / Anti-brute-force</div>
          <div>🍪 RGPD / Cookies</div>
          <div>⚡ Cache / Optimisation</div>
          <div>🛡️ Anti-spam</div>
          <div>📈 SEO + Sitemaps</div>
          <div>📝 Formulaires + Stockage</div>
          <div>🔀 Redirections</div>
          <div>✉️ SMTP</div>
          <div>🤖 Captcha simple</div>
          <div>🧰 Backups / Monitoring</div>
          <div>🧪 Health Check</div>
          <div>🐛 Debug (non-prod)</div>
        </div>
      </div>

      {/* Preset cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {presetList.map((preset) => {
          const isSelected = selectedPreset?.type === preset.type;
          const isRecommended = preset.type === projectType;
          const isSfTt5 = preset.theme === "sf-tt5";

          return (
            <button
              key={preset.type}
              type="button"
              disabled={actionLoading !== null}
              onClick={() => onSelectPreset(preset)}
              className={`relative p-4 rounded-lg border text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              {isRecommended ? (
                <Badge className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0">
                  Recommandé
                </Badge>
              ) : null}

              <div className="flex items-start gap-3">
                <span className="text-2xl">{preset.emoji}</span>

                <div className="min-w-0">
                  <p className="font-medium text-sm">{preset.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {preset.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {String(preset.pages.length)} pages
                    </Badge>

                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {String(preset.features.length)} features
                    </Badge>

                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      🎨 {preset.theme}
                      {isSfTt5 ? " + parent" : ""}
                    </Badge>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected preset details */}
      {selectedPreset ? (
        <PresetDetails
          preset={selectedPreset}
          actionLoading={actionLoading}
          hostingProfileId={hostingProfileId}
          onApply={() => onApplyPreset(selectedPreset.type)}
        />
      ) : null}

      {/* Preset result log */}
      {presetResult ? (
        <div className="border rounded-lg p-3 bg-green-500/5 border-green-500/20">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
            ✅ Preset appliqué avec succès
          </p>
          <ul className="space-y-0.5 text-xs text-muted-foreground">
            {presetResult.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
