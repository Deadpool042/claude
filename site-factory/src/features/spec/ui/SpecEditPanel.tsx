"use client";

import { useRef, useState } from "react";
import { FileCode2, LayoutList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type { JsonValue } from "../logic/spec-types";
import { SpecFormEditor } from "./SpecFormEditor";

interface SpecEditPanelProps {
  specFile: string;
  raw: string;
  parsed: JsonValue | null;
  jsonError: string | null;
  onRawChange: (value: string) => void;
  onTreeChange: (value: JsonValue) => void;
}

export function SpecEditPanel({
  specFile,
  raw,
  parsed,
  jsonError,
  onRawChange,
  onTreeChange,
}: SpecEditPanelProps) {
  const [activeTab, setActiveTab] = useState("form");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTabChange = (tab: string) => {
    if (tab === "raw" && parsed !== null && !jsonError) {
      onRawChange(JSON.stringify(parsed, null, 2));
    }
    if (tab === "form" && !jsonError) {
      try {
        const nextValue = JSON.parse(raw) as JsonValue;
        onTreeChange(nextValue);
      } catch {
        // Conserver la dernière structure valide.
      }
    }
    setActiveTab(tab);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") return;

    event.preventDefault();
    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = `${textarea.value.substring(0, start)}  ${textarea.value.substring(end)}`;
    onRawChange(nextValue);

    requestAnimationFrame(() => {
      textarea.selectionStart = start + 2;
      textarea.selectionEnd = start + 2;
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/50 bg-muted/15 px-4 py-3 text-sm text-muted-foreground">
        L’édition visuelle couvre les cas les plus lisibles. Bascule sur le JSON pour les
        structures avancées ou les cas non pris en charge par les renderers.
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center gap-3 mb-3">
          <TabsList>
            <TabsTrigger value="form" className="gap-1.5">
              <LayoutList className="h-3.5 w-3.5" />
              Édition visuelle
            </TabsTrigger>
            <TabsTrigger value="raw" className="gap-1.5">
              <FileCode2 className="h-3.5 w-3.5" />
              JSON
            </TabsTrigger>
          </TabsList>
          <span className="text-[10px] text-muted-foreground/50">{specFile}</span>
        </div>

        <TabsContent value="form">
          {parsed !== null ? (
            <SpecFormEditor value={parsed} onChange={onTreeChange} specFile={specFile} />
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground/70">
              Aucune structure JSON valide disponible pour l’édition visuelle.
            </div>
          )}
        </TabsContent>

        <TabsContent value="raw">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {specFile}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <textarea
                ref={textareaRef}
                value={raw}
                onChange={(event) => onRawChange(event.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="block min-h-150 w-full resize-y rounded-b-xl border-0 bg-muted/30 p-4 font-mono text-xs leading-relaxed text-foreground focus:outline-none focus:ring-0"
                style={{ tabSize: 2 }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
