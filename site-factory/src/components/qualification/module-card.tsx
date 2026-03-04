"use client";

import {
  CATEGORY_COLORS,
  CATEGORY_SHORT,
  type ModuleDef,
  type LegacyTechStack as TechStack,
  type Category,
  type ProjectType,
} from "@/lib/referential";
import type { ModuleCatSelection } from "@/lib/qualification-runtime";
import { resolveModulePrice, resolveModuleMonthly } from "@/lib/module-pricing";
import { MODULE_ICONS } from "@/lib/ui/module-icons";
import { formatEur } from "@/lib/currency";
import { TierSelector } from "./tier-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Wrench } from "lucide-react";
import Link from "next/link";

// ── Props ──────────────────────────────────────────────────────────

interface ModuleCardProps {
  mod: ModuleDef;
  isSelected: boolean;
  onToggle: () => void;
  tierSel?: ModuleCatSelection;
  onTierChange: (modId: string, tierSel: ModuleCatSelection) => void;
  techStack: TechStack;
  projectType: ProjectType;
  wpHeadless: boolean;
  /** Catégorie initiale (avant modules) — sert à afficher l'alerte "requalifie ↑" */
  initialCategory?: Category;
  isMandatory?: boolean;
  isIncluded?: boolean;
  backendMultiplier?: number;
}

// ── Component ──────────────────────────────────────────────────────

export function ModuleCard({
  mod,
  isSelected,
  onToggle,
  tierSel,
  onTierChange,
  techStack,
  projectType,
  wpHeadless,
  initialCategory,
  isMandatory = false,
  isIncluded = false,
  backendMultiplier = 1,
}: ModuleCardProps) {
  const ModIcon = MODULE_ICONS[mod.icon] ?? Wrench;
  const hasTiers = !!(mod.setupCats || mod.subscriptionCats);
  const isLocked = isMandatory || isIncluded;

  // Résoudre le requalifiesTo en tenant compte du tier sélectionné
  const effectiveRequalTo =
    hasTiers && tierSel?.setupCatId
      ? (mod.setupCats?.find((t) => t.id === tierSel.setupCatId)
          ?.requalifiesTo ?? mod.requalifiesTo)
      : mod.requalifiesTo;

  const catOrder = ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"];
  const wouldRequalify =
    effectiveRequalTo &&
    initialCategory &&
    catOrder.indexOf(effectiveRequalTo) > catOrder.indexOf(initialCategory);

  const resolved = resolveModulePrice(
    mod,
    projectType,
    techStack,
    wpHeadless,
    tierSel,
    backendMultiplier,
  );
  const monthly = resolveModuleMonthly(mod, tierSel);

  return (
    <div className="flex flex-col gap-0">
      <button
        type="button"
        onClick={onToggle}
        disabled={isLocked}
        className={`group relative flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all ${
          isSelected
            ? `border-primary bg-primary/5 shadow-sm ${hasTiers ? "rounded-b-none" : ""}`
            : "border-border hover:border-muted-foreground/30"
        } ${isLocked ? "cursor-not-allowed opacity-70" : ""}`}
      >
        <div
          className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <ModIcon className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{mod.name}</span>
            {mod.isStructurant && (
              <Badge variant="outline" className="text-[9px] px-1 py-0">
                structurant
              </Badge>
            )}
            {isMandatory && (
              <Badge variant="destructive" className="text-[9px] px-1 py-0">
                obligatoire
              </Badge>
            )}
            {isIncluded && !isMandatory && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0">
                inclus
              </Badge>
            )}
          </div>

          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {mod.description}
          </p>

          {techStack === "WORDPRESS" && mod.wpNote && (
            <p className="text-[10px] text-blue-500/70 dark:text-blue-400/70">
              {mod.wpNote}
            </p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            <span>
              {`${formatEur(resolved.setup)}${
                resolved.setupMax ? `–${formatEur(resolved.setupMax)}` : ""
              }`}
            </span>

            {monthly > 0 && (
              <span className="text-amber-600 dark:text-amber-400">
                + {String(monthly)} €/mois
              </span>
            )}

            {effectiveRequalTo && (
              <Badge
                variant="outline"
                className={`text-[9px] px-1 py-0 ${CATEGORY_COLORS[effectiveRequalTo]}`}
              >
                → {CATEGORY_SHORT[effectiveRequalTo]}
              </Badge>
            )}

            {wouldRequalify && !isSelected && (
              <Badge
                variant="outline"
                className="text-[9px] px-1 py-0 text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700"
              >
                requalifie ↑
              </Badge>
            )}
          </div>
        </div>

        {isSelected && (
          <div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-3" />
          </div>
        )}
      </button>

      {/* Tier selectors — visible quand le module est sélectionné et possède des tiers */}
      {isSelected && hasTiers && (
        <TierSelector
          mod={mod}
          tierSel={tierSel}
          onTierChange={(newSel) => { onTierChange(mod.id, newSel); }}
        />
      )}

      <div className="mt-2">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/dashboard/modules/${mod.id}`}>Voir details</Link>
        </Button>
      </div>
    </div>
  );
}
