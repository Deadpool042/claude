"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Copy,
  FilePenLine,
  Layers,
  Loader2,
  RefreshCcw,
  Save,
  Search,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmptyState } from "@/components/shell/empty-state";
import { MarkdownPreview } from "./MarkdownPreview";

interface DocMeta {
  id: string;
  title: string;
  category: string;
  categoryKey: string;
  tags: string[];
  moduleId?: string;
  updatedAt: string;
}

interface DocContent {
  doc: DocMeta & { content: string };
}

interface DocsApiResponse {
  docs: DocMeta[];
}

interface DocsProject {
  id: string;
  name: string;
  slug: string;
  type: string;
  techStack: string | null;
  modules: string[];
  docs: string[];
  favorites: string[];
}

interface DocsClientProps {
  projects: DocsProject[];
  globalFavorites: string[];
}

const CATEGORY_ORDER = [
  "ROOT",
  "01-Socle-Technique",
  "02-Complexity-Index",
  "03-Maintenance",
  "04-Modules",
  "05-Bonnes-Pratiques",
  "06-Integration-Technologie",
  "07-Exemples",
  "08-Commercial",
  "09-Interne",
];

const CATEGORY_STYLES: Record<string, string> = {
  ROOT: "bg-primary/10 text-primary border-primary/20",
  "01-Socle-Technique": "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  "02-Complexity-Index": "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  "03-Maintenance": "bg-amber-500/10 text-amber-300 border-amber-500/30",
  "04-Modules": "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  "05-Bonnes-Pratiques": "bg-lime-500/10 text-lime-300 border-lime-500/30",
  "06-Integration-Technologie": "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30",
  "07-Exemples": "bg-teal-500/10 text-teal-300 border-teal-500/30",
  "08-Commercial": "bg-sky-500/10 text-sky-300 border-sky-500/30",
  "09-Interne": "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

const CORE_DOC_CATEGORIES = new Set([
  "01-Socle-Technique",
  "02-Complexity-Index",
  "03-Maintenance",
  "05-Bonnes-Pratiques",
]);

const STACK_DOC_CATEGORIES = new Set([
  "06-Integration-Technologie",
  "07-Exemples",
]);

const INTERNAL_DOC_CATEGORIES = new Set(["09-Interne"]);

function encodeDocId(id: string): string {
  return id
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "n/a"
    : date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export function DocsClient({ projects, globalFavorites }: DocsClientProps) {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocMeta | null>(null);
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("preview");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [scope, setScope] = useState<"global" | "project">("global");
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id ?? "",
  );
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncingDocs, setSyncingDocs] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [projectDocsOverride, setProjectDocsOverride] = useState<Record<string, string[]>>({});
  const [favoriteMap, setFavoriteMap] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {
      global: globalFavorites,
    };
    projects.forEach((project) => {
      map[`project:${project.id}`] = project.favorites;
    });
    return map;
  });
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const handleScopeChange = useCallback(
    (nextScope: "global" | "project") => {
      setScope(nextScope);
      if (nextScope === "project") {
        setShowAllDocs(false);
      }
    },
    [],
  );

  const loadDocs = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch("/api/docs", { cache: "no-store" });
      if (!res.ok) throw new Error("Impossible de charger la documentation.");
      const data = (await res.json()) as DocsApiResponse;
      setDocs(data.docs);
      setSelectedDoc((prev) => prev ?? data.docs[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadDocContent = useCallback(async (doc: DocMeta) => {
    setLoadingDoc(true);
    setError(null);
    setContent("");
    try {
      const res = await fetch(`/api/docs/${encodeDocId(doc.id)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Impossible de charger ce document.");
      const data = (await res.json()) as DocContent;
      setContent(data.doc.content);
      setSelectedDoc(data.doc);
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoadingDoc(false);
    }
  }, []);

  const handleSelectDoc = useCallback(
    async (doc: DocMeta) => {
      if (isDirty) {
        const confirmSwitch = window.confirm(
          "Des modifications non enregistrees sont en cours. Continuer ?",
        );
        if (!confirmSwitch) return;
      }
      await loadDocContent(doc);
    },
    [isDirty, loadDocContent],
  );

  const handleSave = useCallback(async () => {
    if (!selectedDoc) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/docs/${encodeDocId(selectedDoc.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Sauvegarde impossible.");
      const data = (await res.json()) as { doc: DocMeta };
      setSelectedDoc(data.doc);
      setDocs((prev) =>
        prev.map((item) => (item.id === data.doc.id ? data.doc : item)),
      );
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setSaving(false);
    }
  }, [content, selectedDoc]);

  const handleRefresh = useCallback(async () => {
    if (!selectedDoc) return;
    await loadDocContent(selectedDoc);
  }, [loadDocContent, selectedDoc]);

  useEffect(() => {
    void loadDocs();
  }, [loadDocs]);

  useEffect(() => {
    setFavoriteMap((prev) => {
      const next: Record<string, string[]> = { ...prev, global: globalFavorites };
      projects.forEach((project) => {
        next[`project:${project.id}`] = project.favorites;
      });
      return next;
    });
  }, [globalFavorites, projects]);

  useEffect(() => {
    if (loadingDoc) return;
    if (selectedDoc && content) return;
    if (selectedDoc) {
      void loadDocContent(selectedDoc);
    }
  }, [selectedDoc, content, loadDocContent, loadingDoc]);

  useEffect(() => {
    if (scope === "project") {
      setShowAllDocs(false);
    }
  }, [scope]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const favoritesKey = useMemo(() => {
    if (scope === "project" && selectedProject) {
      return `project:${selectedProject.id}`;
    }
    return "global";
  }, [scope, selectedProject]);

  const favoriteIds = useMemo(() => {
    return new Set(favoriteMap[favoritesKey] ?? []);
  }, [favoriteMap, favoritesKey]);

  const relevantModules = useMemo(
    () => new Set(selectedProject?.modules ?? []),
    [selectedProject],
  );

  const projectDocIds = useMemo(() => {
    if (!selectedProject) return new Set<string>();
    const override = projectDocsOverride[selectedProject.id];
    return new Set(override ?? selectedProject.docs ?? []);
  }, [projectDocsOverride, selectedProject]);

  const hasProjectDocs = projectDocIds.size > 0;
  const hasFavorites = favoriteIds.size > 0;

  useEffect(() => {
    if (scope !== "project") return;
    if (!hasProjectDocs && showAllDocs) {
      setShowAllDocs(false);
    }
  }, [hasProjectDocs, scope, showAllDocs]);

  useEffect(() => {
    if (favoritesOnly && !hasFavorites) {
      setFavoritesOnly(false);
    }
  }, [favoritesOnly, hasFavorites]);

  const handleSyncDocs = useCallback(async () => {
    if (!selectedProject) return;
    setSyncingDocs(true);
    setSyncStatus(null);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/docs/sync`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Synchronisation impossible.");
      const data = (await res.json()) as { count?: number; docIds?: string[] };
      const count = data.count ?? 0;
      const docIds = Array.isArray(data.docIds) ? data.docIds : [];
      setProjectDocsOverride((prev) => ({
        ...prev,
        [selectedProject.id]: docIds,
      }));
      setSyncStatus(`${String(count)} doc${count > 1 ? "s" : ""} synchronisee${count > 1 ? "s" : ""}.`);
      router.refresh();
    } catch (err) {
      setSyncStatus(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setSyncingDocs(false);
    }
  }, [router, selectedProject]);

  const toggleFavorite = useCallback(
    async (docId: string) => {
      if (scope === "project" && !selectedProject) return;
      const nextIsFavorite = !favoriteIds.has(docId);
      setFavoriteMap((prev) => {
        const next = new Set(prev[favoritesKey] ?? []);
        if (nextIsFavorite) {
          next.add(docId);
        } else {
          next.delete(docId);
        }
        return { ...prev, [favoritesKey]: Array.from(next) };
      });
      try {
        const res = await fetch("/api/docs/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            docId,
            scope: scope === "project" ? "project" : "global",
            projectId: scope === "project" ? selectedProject?.id ?? null : null,
            action: nextIsFavorite ? "add" : "remove",
          }),
        });
        if (!res.ok) {
          throw new Error("Impossible de mettre a jour les favoris.");
        }
      } catch (err) {
        setFavoriteMap((prev) => {
          const next = new Set(prev[favoritesKey] ?? []);
          if (nextIsFavorite) {
            next.delete(docId);
          } else {
            next.add(docId);
          }
          return { ...prev, [favoritesKey]: Array.from(next) };
        });
        setError(err instanceof Error ? err.message : "Erreur inconnue.");
      }
    },
    [favoriteIds, favoritesKey, scope, selectedProject],
  );

  const handleCopyDocId = useCallback((docId: string) => {
    void navigator.clipboard.writeText(docId);
    setCopiedDocId(docId);
    if (copyResetRef.current) {
      clearTimeout(copyResetRef.current);
    }
    copyResetRef.current = setTimeout(() => {
      setCopiedDocId(null);
    }, 1200);
  }, []);

  useEffect(() => {
    return () => {
      if (copyResetRef.current) {
        clearTimeout(copyResetRef.current);
      }
    };
  }, []);

  const isRelevantDoc = useCallback(
    (doc: DocMeta) => {
      if (!selectedProject) return true;

      if (projectDocIds.size > 0) {
        return projectDocIds.has(doc.id);
      }

      if (doc.categoryKey === "04-Modules") {
        if (doc.moduleId) return relevantModules.has(doc.moduleId);
        return selectedProject.modules.length > 0
          ? doc.id.endsWith("modules.md")
          : false;
      }

      if (INTERNAL_DOC_CATEGORIES.has(doc.categoryKey)) return false;

      if (STACK_DOC_CATEGORIES.has(doc.categoryKey)) {
        return Boolean(selectedProject.techStack);
      }

      if (CORE_DOC_CATEGORIES.has(doc.categoryKey)) return true;

      return true;
    },
    [projectDocIds, relevantModules, selectedProject],
  );

  const filteredDocs = useMemo(() => {
    if (scope === "project" && !showAllDocs && projectDocIds.size === 0) {
      return [];
    }
    const term = search.trim().toLowerCase();
    return docs.filter((doc) => {
      if (category !== "all" && doc.categoryKey !== category) return false;
      if (term) {
        const haystack = `${doc.title} ${doc.id}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (favoritesOnly && !favoriteIds.has(doc.id)) return false;
      if (scope === "project" && !showAllDocs) {
        if (!isRelevantDoc(doc)) return false;
      }
      return true;
    });
  }, [
    category,
    docs,
    favoritesOnly,
    favoriteIds,
    isRelevantDoc,
    projectDocIds,
    scope,
    search,
    showAllDocs,
  ]);

  const groupedDocs = useMemo(() => {
    const map = new Map<string, DocMeta[]>();
    for (const doc of filteredDocs) {
      const existing = map.get(doc.categoryKey) ?? [];
      existing.push(doc);
      map.set(doc.categoryKey, existing);
    }
    const orderedKeys = [
      ...CATEGORY_ORDER,
      ...Array.from(map.keys()).filter((key) => !CATEGORY_ORDER.includes(key)),
    ];
    return orderedKeys.flatMap((key) => {
      const docsForKey = map.get(key) ?? [];
      if (docsForKey.length === 0) return [];
      const label = docsForKey[0]?.category ?? key;
      return [{ key, label, docs: docsForKey }];
    });
  }, [filteredDocs]);

  useEffect(() => {
    if (scope !== "project" || showAllDocs) return;
    if (isDirty) return;
    if (filteredDocs.length === 0) {
      if (selectedDoc) setSelectedDoc(null);
      return;
    }
    if (!selectedDoc || !filteredDocs.some((doc) => doc.id === selectedDoc.id)) {
      void loadDocContent(filteredDocs[0]);
    }
  }, [filteredDocs, isDirty, loadDocContent, scope, selectedDoc, showAllDocs]);

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    docs.forEach((doc) => {
      if (!unique.has(doc.categoryKey)) {
        unique.set(doc.categoryKey, doc.category);
      }
    });
    const orderedKeys = [
      ...CATEGORY_ORDER.filter((key) => unique.has(key)),
      ...Array.from(unique.keys()).filter((key) => !CATEGORY_ORDER.includes(key)),
    ];
    return orderedKeys.map((key) => [key, unique.get(key) ?? key]);
  }, [docs]);

  return (
    <TooltipProvider>
      <div className="isolate grid gap-6 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
        <Card className="relative z-20 flex h-180 min-w-0 flex-col border-border/60 bg-card/40 p-4 shadow-sm pointer-events-auto">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="size-4 text-primary" />
              Documentation
            </div>
            <Badge variant="outline" className="text-xs">
              {docs.length} docs
            </Badge>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={scope === "global" ? "default" : "outline"}
              onClick={() => handleScopeChange("global")}
            >
              Global
            </Button>
            <Button
              size="sm"
              variant={scope === "project" ? "default" : "outline"}
              onClick={() => handleScopeChange("project")}
            >
              Projet
            </Button>
            <Button
              size="sm"
              variant={favoritesOnly ? "default" : "outline"}
              onClick={() => setFavoritesOnly((prev) => !prev)}
              disabled={!hasFavorites && !favoritesOnly}
            >
              <Star className="size-3" />
              Favoris
            </Button>
            {scope === "project" && (
              <>
                <Button
                  size="sm"
                  variant={!showAllDocs ? "default" : "outline"}
                  onClick={() => setShowAllDocs(false)}
                >
                  Recommandés
                </Button>
                <Button
                  size="sm"
                  variant={showAllDocs ? "default" : "outline"}
                  onClick={() => setShowAllDocs(true)}
                  disabled={!hasProjectDocs}
                >
                  Tout
                </Button>
              </>
            )}
          </div>

          {scope === "project" && (
            <div className="space-y-2">
              <Select
                {...(selectedProjectId ? { value: selectedProjectId } : {})}
                onValueChange={setSelectedProjectId}
                disabled={projects.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <span className="flex items-center gap-2">
                        <span>{project.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {project.type}
                        </Badge>
                        {project.techStack ? (
                          <Badge variant="secondary" className="text-xs">
                            {project.techStack}
                          </Badge>
                        ) : null}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProject ? (
                <div className="text-xs text-muted-foreground">
                  Modules actifs:{" "}
                  {selectedProject.modules.length > 0
                    ? selectedProject.modules.length
                    : "aucun"}
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleSyncDocs}
                  disabled={!selectedProject || syncingDocs}
                >
                  {syncingDocs ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <RefreshCcw className="size-3" />
                  )}
                  Synchroniser docs
                </Button>
                {selectedProject && projectDocIds.size === 0 ? (
                  <span className="text-amber-300">
                    Docs projet non synchronisées. Lancez la synchronisation.
                  </span>
                ) : null}
                {syncStatus ? (
                  <span className="text-muted-foreground">{syncStatus}</span>
                ) : null}
              </div>
            </div>
          )}

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto pr-2">
          {loadingList ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Chargement...
            </div>
          ) : groupedDocs.length === 0 ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              {scope === "project" && !showAllDocs && !hasProjectDocs ? (
                <>
                  <div>
                    Aucun document projet disponible. Synchronisez pour générer la
                    sélection.
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSyncDocs}
                    disabled={!selectedProject || syncingDocs}
                  >
                    {syncingDocs ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="size-4" />
                    )}
                    Synchroniser docs
                  </Button>
                </>
              ) : (
                <div>Aucun document ne correspond aux filtres.</div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {groupedDocs.map((group) => (
                <div key={group.key} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                    <span className="h-px flex-1 bg-border/60" />
                    <span>{group.label}</span>
                    <span className="h-px flex-1 bg-border/60" />
                  </div>
                  <div className="space-y-2">
                    {group.docs.map((doc) => {
                      const isActive = selectedDoc?.id === doc.id;
                      const isRelevant = isRelevantDoc(doc);
                      const isFavorite = favoriteIds.has(doc.id);
                      const actionVisibility = isFavorite
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100";
                      return (
                        <div
                          key={doc.id}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isActive}
                          onClick={() => handleSelectDoc(doc)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              void handleSelectDoc(doc);
                            }
                          }}
                          className={`group w-full rounded-lg border px-3 py-2 text-left text-sm transition cursor-pointer ${
                            isActive
                              ? "border-primary/60 bg-primary/10 shadow-sm"
                              : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{doc.title}</span>
                              {!isRelevant && scope === "project" && showAllDocs ? (
                                <Badge variant="outline" className="text-[10px]">
                                  Hors projet
                                </Badge>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon-xs"
                                    variant="ghost"
                                    className={`transition-opacity ${actionVisibility}`}
                                    aria-pressed={isFavorite}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      toggleFavorite(doc.id);
                                    }}
                                  >
                                    <Star
                                      className={`size-3 ${
                                        isFavorite
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon-xs"
                                    variant="ghost"
                                    className={`transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100`}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleCopyDocId(doc.id);
                                    }}
                                  >
                                    <Copy className="size-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {copiedDocId === doc.id ? "Copie" : "Copier l'ID"}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${CATEGORY_STYLES[doc.categoryKey] ?? ""}`}
                            >
                              {doc.category}
                            </Badge>
                            {doc.moduleId ? (
                              <Badge variant="secondary" className="text-[10px]">
                                {doc.moduleId.replace("module-", "")}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="relative z-0 flex h-180 min-w-0 flex-col overflow-hidden border-border/60 bg-card/40 p-5 shadow-sm pointer-events-auto">
        {selectedDoc ? (
          <div className="flex h-full flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{selectedDoc.title}</h2>
                  {isDirty ? (
                    <Badge variant="outline" className="text-[10px]">
                      Modifié
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {selectedDoc.id} · maj {formatDate(selectedDoc.updatedAt)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-pressed={favoriteIds.has(selectedDoc.id)}
                      onClick={() => toggleFavorite(selectedDoc.id)}
                    >
                      <Star
                        className={`size-4 ${
                          favoriteIds.has(selectedDoc.id)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {favoriteIds.has(selectedDoc.id)
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleCopyDocId(selectedDoc.id)}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copiedDocId === selectedDoc.id ? "Copie" : "Copier l'ID"}
                  </TooltipContent>
                </Tooltip>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loadingDoc}
                >
                  <RefreshCcw className="size-4" />
                  Rafraîchir
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Sauvegarder
                </Button>
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            ) : null}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex min-h-0 flex-1"
            >
              <TabsList className="w-fit">
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
                <TabsTrigger value="edit">
                  <FilePenLine className="size-4" />
                  Édition
                </TabsTrigger>
                <TabsTrigger value="info">
                  <Layers className="size-4" />
                  Infos
                </TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="mt-4 min-h-0 overflow-hidden">
                {loadingDoc ? (
                  <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Chargement...
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto pr-2">
                    <MarkdownPreview content={content} />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="edit" className="mt-4 min-h-0 overflow-hidden">
                <Textarea
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value);
                    setIsDirty(true);
                  }}
                  className="h-120 font-mono text-xs"
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  Astuce: utilisez le mode Aperçu pour vérifier la mise en forme.
                </div>
              </TabsContent>
              <TabsContent value="info" className="mt-4 space-y-3">
                <div className="text-sm font-medium">Meta</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge
                    variant="outline"
                    className={CATEGORY_STYLES[selectedDoc.categoryKey] ?? ""}
                  >
                    {selectedDoc.category}
                  </Badge>
                  {selectedDoc.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                  Documentation locale. Les changements sont écrits directement
                  dans le dossier Docs.
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <EmptyState
            title="Sélectionnez un document"
            description="Choisissez un document dans la colonne de gauche pour commencer l'édition."
          />
        )}
      </Card>
      </div>
    </TooltipProvider>
  );
}
