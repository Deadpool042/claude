"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Eye, Loader2 } from "lucide-react";

interface QuoteActionsProps {
  projectId: string;
  projectName: string;
}

export function QuoteActions({ projectId, projectName }: QuoteActionsProps) {
  const [loading, setLoading] = useState<"pdf" | "preview" | null>(null);

  const downloadPdf = useCallback(async () => {
    setLoading("pdf");
    try {
      const res = await fetch(`/api/quotes/${projectId}`);
      if (!res.ok) throw new Error("Échec de l'export du devis");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("x-filename") ??
        `devis-${projectName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Impossible d'exporter le devis. Vérifiez la console.");
    } finally {
      setLoading(null);
    }
  }, [projectId, projectName]);

  const previewPdf = useCallback(async () => {
    setLoading("preview");
    try {
      const res = await fetch(`/api/quotes/${projectId}`);
      if (!res.ok) throw new Error("Échec de l'export du devis");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Impossible de prévisualiser le devis.");
    } finally {
      setLoading(null);
    }
  }, [projectId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileDown className="h-5 w-5" />
          Devis
        </CardTitle>
        <CardDescription>
          Exportez le devis PDF final avec les détails du projet, les modules
          sélectionnés et vos coordonnées.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button
          onClick={downloadPdf}
          disabled={loading !== null}
          className="gap-2"
        >
          {loading === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          Télécharger PDF
        </Button>
        <Button
          variant="outline"
          onClick={previewPdf}
          disabled={loading !== null}
          className="gap-2"
        >
          {loading === "preview" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          Prévisualiser
        </Button>
      </CardContent>
    </Card>
  );
}
