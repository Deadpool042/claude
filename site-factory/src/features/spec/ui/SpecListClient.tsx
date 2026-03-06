"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { SpecFileInfo } from "../logic/spec-types";
import { SpecCatalogCard } from "./catalog/SpecCatalogCard";

export function SpecListClient() {
  const [files, setFiles] = useState<SpecFileInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/spec");
      const data = (await res.json()) as { files?: SpecFileInfo[] };
      setFiles(data.files ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const groupedFiles = useMemo(() => {
    const filesByDomain = files.reduce<Record<string, SpecFileInfo[]>>((acc, file) => {
      const group = acc[file.domain] ?? [];
      group.push(file);
      acc[file.domain] = group;
      return acc;
    }, {});

    return Object.entries(filesByDomain).sort(([left], [right]) =>
      left.localeCompare(right, "fr"),
    );
  }, [files]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-xl border bg-muted/30" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {files.length} fichiers de specification dans {groupedFiles.length} domaines
          </p>
          <p className="text-xs text-muted-foreground/70">
            Chaque carte expose le role de la spec et propose directement le passage en lecture ou en edition.
          </p>
        </div>
        <button
          onClick={loadFiles}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Rafraichir
        </button>
      </div>

      {groupedFiles.map(([domain, entries]) => (
        <section key={domain} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">{domain}</h2>
            <Badge variant="outline" className="text-[10px]">
              {entries.length} {entries.length === 1 ? "spec" : "specs"}
            </Badge>
            <div className="flex-1 border-t border-border/40" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {entries.map((file) => (
              <SpecCatalogCard key={file.name} file={file} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
