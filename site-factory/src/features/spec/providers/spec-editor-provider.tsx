"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { JsonValue } from "@/features/spec/logic/spec-types";
import {
  formatSpecValidationIssues,
  validateSpecContent,
  type SpecValidationIssue,
  type SpecValidationContext,
} from "@/features/spec/logic/spec-validation";
import {
  featuresSpecSchema,
  modulesSpecSchema,
} from "@/lib/referential/spec/schema";

// ── Types ──

type SaveState = "idle" | "saving" | "saved" | "error";

interface SpecEditorStats {
  keys: number;
  lines: number;
}

interface SpecEditorContextValue {
  specFile: string;
  raw: string;
  parsed: JsonValue | null;
  loading: boolean;
  saveState: SaveState;
  jsonError: string | null;
  validationError: string | null;
  hasValidationErrors: boolean;
  errorMsg: string;
  stats: SpecEditorStats;
  isDirty: boolean;
  loadFile: () => Promise<void>;
  handleRawChange: (value: string) => void;
  handleTreeChange: (newValue: JsonValue) => void;
  handleSave: () => Promise<void>;
  handleFormat: () => void;
  handleCopy: () => Promise<void>;
}

// ── Context ──

const SpecEditorContext = createContext<SpecEditorContextValue | null>(null);

export function useSpecEditor(): SpecEditorContextValue {
  const ctx = useContext(SpecEditorContext);
  if (!ctx) throw new Error("useSpecEditor must be used within SpecEditorProvider");
  return ctx;
}

// ── Helpers ──

function countKeys(o: unknown): number {
  if (Array.isArray(o)) return o.reduce((acc: number, v) => acc + countKeys(v), 0);
  if (o && typeof o === "object") {
    return Object.keys(o).reduce(
      (acc, k) => acc + 1 + countKeys((o as Record<string, unknown>)[k]),
      0,
    );
  }
  return 0;
}

function computeStats(text: string): SpecEditorStats {
  try {
    const obj = JSON.parse(text);
    return { keys: countKeys(obj), lines: text.split("\n").length };
  } catch {
    return { keys: 0, lines: text.split("\n").length };
  }
}

// ── Provider ──

export function SpecEditorProvider({
  specFile,
  children,
}: {
  specFile: string;
  children: ReactNode;
}) {
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<JsonValue | null>(null);
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [stats, setStats] = useState<SpecEditorStats>({ keys: 0, lines: 0 });
  const [validationIssues, setValidationIssues] = useState<SpecValidationIssue[]>([]);

  const isDirty = raw !== original;
  const hasValidationErrors = validationIssues.length > 0;
  const validationError = hasValidationErrors
    ? formatSpecValidationIssues(validationIssues)
    : null;

  const validationIssuesRef = useRef<SpecValidationIssue[]>([]);

  const validationContextRef = useRef<SpecValidationContext>({});

  const runValidation = useCallback(
    (obj: JsonValue) => {
      const context = validationContextRef.current;
      const result = validateSpecContent(specFile, obj, context);
      setValidationIssues(result.issues);
      validationIssuesRef.current = result.issues;
    },
    [specFile],
  );

  const parsedRef = useRef<JsonValue | null>(null);
  parsedRef.current = parsed;

  useEffect(() => {
    let active = true;
    const loadContext = async () => {
      if (specFile !== "features.json" && specFile !== "modules.json") {
        validationContextRef.current = {};
        if (parsedRef.current) runValidation(parsedRef.current);
        return;
      }

      const context: SpecValidationContext = {};
      try {
        const [featuresRes, modulesRes] = await Promise.all([
          fetch("/api/spec/features.json"),
          fetch("/api/spec/modules.json"),
        ]);

        if (featuresRes.ok) {
          const data = (await featuresRes.json()) as { content?: unknown };
          const parsedFeatures = featuresSpecSchema.safeParse(data.content);
          if (parsedFeatures.success) context.features = parsedFeatures.data;
        }
        if (modulesRes.ok) {
          const data = (await modulesRes.json()) as { content?: unknown };
          const parsedModules = modulesSpecSchema.safeParse(data.content);
          if (parsedModules.success) context.modules = parsedModules.data;
        }
      } catch {
        // best-effort: validation will fallback to base schema
      }

      if (!active) return;
      validationContextRef.current = context;
      if (parsedRef.current) runValidation(parsedRef.current);
    };

    loadContext();
    return () => {
      active = false;
    };
  }, [specFile, runValidation]);

  const loadFile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/spec/${encodeURIComponent(specFile)}`);
      if (!res.ok) throw new Error("Erreur chargement");
      const data = await res.json();
      const formatted = JSON.stringify(data.content, null, 2);
      setRaw(formatted);
      setParsed(data.content as JsonValue);
      setOriginal(formatted);
      setStats(computeStats(formatted));
      setJsonError(null);
      runValidation(data.content as JsonValue);
    } catch {
      setErrorMsg("Impossible de charger le fichier");
    } finally {
      setLoading(false);
    }
  }, [specFile, runValidation]);

  useEffect(() => {
    loadFile();
  }, [loadFile]);

  const handleRawChange = useCallback((value: string) => {
    setRaw(value);
    setStats(computeStats(value));
    setSaveState("idle");
    try {
      const obj = JSON.parse(value);
      setParsed(obj as JsonValue);
      setJsonError(null);
      runValidation(obj as JsonValue);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "JSON invalide");
      setValidationIssues([]);
      validationIssuesRef.current = [];
    }
  }, [runValidation]);

  const handleTreeChange = useCallback((newValue: JsonValue) => {
    const formatted = JSON.stringify(newValue, null, 2);
    setRaw(formatted);
    setParsed(newValue);
    setStats(computeStats(formatted));
    setJsonError(null);
    runValidation(newValue);
    setSaveState("idle");
  }, [runValidation]);

  const handleFormat = useCallback(() => {
    try {
      const obj = JSON.parse(raw);
      const formatted = JSON.stringify(obj, null, 2);
      setRaw(formatted);
      setJsonError(null);
    } catch {
      // can't format invalid JSON
    }
  }, [raw]);

  const handleSave = useCallback(async () => {
    if (jsonError || validationIssuesRef.current.length > 0) return;
    setSaveState("saving");
    setErrorMsg("");
    try {
      const obj = JSON.parse(raw);
      const res = await fetch(`/api/spec/${encodeURIComponent(specFile)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: obj }),
      });
      const data = await res.json();
      if (!res.ok) {
        const details = Array.isArray(data.details) ? data.details : null;
        const message = details
          ? formatSpecValidationIssues(details)
          : data.error ?? "Erreur sauvegarde";
        throw new Error(message);
      }
      if (data.saved && data.synced) {
        setSaveState("saved");
        setOriginal(raw);
        setTimeout(() => setSaveState("idle"), 2000);
      } else if (data.warning) {
        setSaveState("saved");
        setOriginal(raw);
        setErrorMsg(data.warning);
      }
    } catch (err) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }, [jsonError, raw, specFile]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(raw);
  }, [raw]);

  // Global ⌘S handler
  const rawRef = useRef(raw);
  const originalRef = useRef(original);
  const jsonErrorRef = useRef(jsonError);
  rawRef.current = raw;
  originalRef.current = original;
  jsonErrorRef.current = jsonError;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (
          rawRef.current !== originalRef.current &&
          !jsonErrorRef.current &&
          validationIssuesRef.current.length === 0
        ) {
          handleSave();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const value: SpecEditorContextValue = {
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
  };

  return (
    <SpecEditorContext.Provider value={value}>
      {children}
    </SpecEditorContext.Provider>
  );
}
