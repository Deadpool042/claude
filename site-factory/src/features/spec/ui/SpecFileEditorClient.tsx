"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  PencilLine,
  RefreshCw,
  Save,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { SpecEditorProvider, useSpecEditor } from "@/features/spec/providers/spec-editor-provider";
import { buildSpecViewHref, normalizeSpecView, type SpecView } from "../logic/spec-view";
import { SpecEditPanel } from "./SpecEditPanel";
import { SpecOverviewPanel } from "./SpecOverviewPanel";

interface SpecFileEditorProps {
  specFile: string;
}

export function SpecFileEditorClient({ specFile }: SpecFileEditorProps) {
  return (
    <SpecEditorProvider specFile={specFile}>
      <SpecFileEditorInner />
    </SpecEditorProvider>
  );
}

function SpecFileEditorInner() {
  const {
    specFile,
    raw,
    parsed,
    loading,
    saveState,
    jsonError,
    validationError,
    hasValidationErrors,
    errorMsg,
    stats,
    isDirty,
    loadFile,
    handleRawChange,
    handleTreeChange,
    handleSave,
    handleFormat,
    handleCopy,
  } = useSpecEditor();

  const router = useRouter();
  const searchParams = useSearchParams();
  const routeView = normalizeSpecView(searchParams.get("view"));
  const [activeView, setActiveView] = useState<SpecView>(routeView);

  useEffect(() => {
    setActiveView(routeView);
  }, [routeView]);

  const handleViewChange = useCallback(
    (nextView: string) => {
      const normalized = normalizeSpecView(nextView);
      setActiveView(normalized);
      startTransition(() => {
        router.replace(buildSpecViewHref(specFile, normalized));
      });
    },
    [router, specFile],
  );

  if (loading) {
    return <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/dashboard/spec">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Retour
          </Button>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">
            {stats.lines} lignes
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {stats.keys} cles
          </Badge>
          {isDirty && (
            <Badge className="border-amber-500/40 bg-amber-500/20 text-[10px] text-amber-400">
              Modifie
            </Badge>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Copier
        </Button>

        <Button variant="outline" size="sm" onClick={handleFormat} disabled={!!jsonError}>
          Formater
        </Button>

        <Button variant="outline" size="sm" onClick={loadFile}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Recharger
        </Button>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || !!jsonError || hasValidationErrors || saveState === "saving"}
        >
          {saveState === "saving" ? (
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : saveState === "saved" ? (
            <Check className="mr-1.5 h-3.5 w-3.5" />
          ) : (
            <Save className="mr-1.5 h-3.5 w-3.5" />
          )}
          {saveState === "saving"
            ? "Sauvegarde..."
            : saveState === "saved"
              ? "Sauve !"
              : "Sauvegarder"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/dashboard/spec" className="transition hover:text-foreground">
          Catalogue
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
        <button
          onClick={() => handleViewChange("overview")}
          className={cn(
            "transition hover:text-foreground",
            activeView === "overview" && "text-foreground",
          )}
        >
          Detail lisible
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
        <button
          onClick={() => handleViewChange("edit")}
          className={cn(
            "transition hover:text-foreground",
            activeView === "edit" && "text-foreground",
          )}
        >
          Edition
        </button>
        <span className="text-[10px] text-muted-foreground/50">{specFile}</span>
      </div>

      {jsonError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong>JSON invalide :</strong> {jsonError}
          </div>
        </div>
      )}

      {validationError && !jsonError && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="whitespace-pre-line">{validationError}</div>
        </div>
      )}

      {errorMsg && !jsonError && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{errorMsg}</div>
        </div>
      )}

      <Tabs value={activeView} onValueChange={handleViewChange}>
        <div className="mb-3 flex items-center gap-3">
          <TabsList>
            <TabsTrigger value="overview" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Detail lisible
            </TabsTrigger>
            <TabsTrigger value="edit" className="gap-1.5">
              <PencilLine className="h-3.5 w-3.5" />
              Edition
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          {parsed !== null ? (
            <SpecOverviewPanel specFile={specFile} value={parsed} stats={stats} />
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground/70">
              Aucune structure JSON valide disponible pour la lecture detaillee.
            </div>
          )}
        </TabsContent>

        <TabsContent value="edit">
          <SpecEditPanel
            specFile={specFile}
            raw={raw}
            parsed={parsed}
            jsonError={jsonError}
            onRawChange={handleRawChange}
            onTreeChange={handleTreeChange}
          />
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        <kbd className="rounded border px-1.5 py-0.5 text-[10px]">⌘S</kbd> pour sauvegarder
        {" • "}Les modifications sont ecrites dans <code className="text-primary/80">Docs/_spec/</code>
        {" "}puis synchronisees vers l&apos;app.
      </p>
    </div>
  );
}
