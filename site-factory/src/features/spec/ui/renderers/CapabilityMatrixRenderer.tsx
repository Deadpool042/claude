"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  TooltipProvider,
} from "@/shared/components/ui/tooltip";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { Tip } from "@/shared/components/Tip";
import { FieldSelect, type SelectOption } from "@/shared/components/FieldSelect";
import type { JsonValue, SpecRendererProps, MatrixRow, MatrixEntry } from "../../logic/spec-types";
import {
  CMS_IDS,
  CMS_SHORT,
  CLASSIFICATIONS,
  CLASS_COLORS,
  CLASS_SHORT,
} from "../../logic/spec-constants";
import { LABELS } from "../../logic/spec-labels";

const CLASSIFICATION_OPTIONS: SelectOption[] = CLASSIFICATIONS.map((c) => ({
  value: c,
  label: c,
  render: () => (
    <>
      <Badge variant="outline" className={cn("text-[10px] mr-1", CLASS_COLORS[c])}>
        {CLASS_SHORT[c]}
      </Badge>
      {c}
    </>
  ),
}));

const CLASS_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", label: LABELS.matrix.allClassifications },
  ...CLASSIFICATION_OPTIONS,
];

// ── Cell sub-component ──

function MatrixCell({
  row,
  onClassChange,
}: {
  row: MatrixRow;
  onClassChange: (cls: MatrixRow["classification"]) => void;
}) {
  return (
    <Tip
      content={
        row.recommendedModuleId
          ? `Module : ${row.recommendedModuleId}`
          : row.recommendedPluginIds?.length
            ? `Plugins : ${row.recommendedPluginIds.join(", ")}`
            : `Classification pour ${CMS_SHORT[row.cmsId] ?? row.cmsId}`
      }
    >
      <div>
        <FieldSelect
          value={row.classification}
          onChange={(value) => onClassChange(value as MatrixRow["classification"])}
          options={CLASSIFICATION_OPTIONS}
          size="sm"
          triggerClassName={cn(
            "w-full border-0 text-[10px] font-medium justify-center px-1",
            CLASS_COLORS[row.classification] ?? "bg-muted",
          )}
        />
      </div>
    </Tip>
  );
}

// ── Main renderer ──

export function CapabilityMatrixRenderer({
  value,
  onChange,
}: SpecRendererProps) {
  const [filter, setFilter] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [cmsTab, setCmsTab] = useState<string>("all");

  const root = value as Record<string, JsonValue>;
  const matrix = (root.matrix ?? []) as unknown as MatrixEntry[];

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const c of CLASSIFICATIONS) counts[c] = 0;
    for (const entry of matrix) {
      for (const row of entry.rows) {
        counts[row.classification] = (counts[row.classification] ?? 0) + 1;
        total++;
      }
    }
    return { counts, total };
  }, [matrix]);

  const countByCms = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cmsId of CMS_IDS) counts[cmsId] = 0;
    for (const entry of matrix) {
      for (const row of entry.rows) {
        counts[row.cmsId] = (counts[row.cmsId] ?? 0) + 1;
      }
    }
    return counts;
  }, [matrix]);

  const filtered = useMemo(() => {
    let items = matrix;
    if (filter) {
      const f = filter.toLowerCase();
      items = items.filter((e) => e.featureId.toLowerCase().includes(f));
    }
    if (classFilter !== "all") {
      items = items.filter((e) =>
        e.rows.some((r) => r.classification === classFilter),
      );
    }
    if (cmsTab !== "all") {
      items = items.filter((e) =>
        e.rows.some((r) => r.cmsId === cmsTab),
      );
    }
    return items;
  }, [matrix, filter, classFilter, cmsTab]);

  const updateCell = (
    entryIdx: number,
    rowIdx: number,
    cls: MatrixRow["classification"],
  ) => {
    const newMatrix = [...matrix];
    const entry = { ...newMatrix[entryIdx] };
    const rows = [...entry.rows];
    rows[rowIdx] = { ...rows[rowIdx], classification: cls };
    entry.rows = rows;
    newMatrix[entryIdx] = entry;
    onChange({ ...root, matrix: newMatrix as unknown as JsonValue });
  };

  const visibleCms = cmsTab === "all" ? CMS_IDS : [cmsTab];

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <Tabs value={cmsTab} onValueChange={setCmsTab}>
          <TabsList className="h-8 w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="text-xs h-7 px-3">
              {LABELS.all}
              <Badge variant="outline" className="ml-1.5 text-[9px] h-4 px-1">
                {matrix.length}
              </Badge>
            </TabsTrigger>
            {CMS_IDS.map((cmsId) => (
              <TabsTrigger key={cmsId} value={cmsId} className="text-xs h-7 px-3">
                {CMS_SHORT[cmsId]}
                <Badge variant="outline" className="ml-1.5 text-[9px] h-4 px-1">
                  {countByCms[cmsId]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-muted-foreground/40" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={LABELS.matrix.filterPlaceholder}
              className="h-7 pl-8 text-xs"
            />
          </div>
          <FieldSelect
            value={classFilter}
            onChange={setClassFilter}
            options={CLASS_FILTER_OPTIONS}
            size="sm"
            triggerClassName="w-36"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-md bg-muted/30 text-[11px]">
          <span className="text-muted-foreground font-medium">
            {cmsTab === "all" ? LABELS.plugins.total : CMS_SHORT[cmsTab]} :
          </span>
          {CLASSIFICATIONS.map((c) => {
            const count = stats.counts[c] ?? 0;
            if (count === 0) return null;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <Tip key={c} content={`${count} cellules ${CLASS_SHORT[c]} (${pct}%)`}>
                <Badge
                  variant="outline"
                  className={cn("text-[9px] cursor-default", CLASS_COLORS[c])}
                >
                  {CLASS_SHORT[c]} {count}
                  <span className="text-muted-foreground/50 ml-0.5">({pct}%)</span>
                </Badge>
              </Tip>
            );
          })}
        </div>

        <div className="rounded-xl border border-border/60 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="border-border/40 bg-muted/30">
                <TableHead className="text-muted-foreground w-48 px-3 py-2 h-auto">
                  Feature
                </TableHead>
                {visibleCms.map((cms) => (
                  <TableHead
                    key={cms}
                    className="text-muted-foreground text-center w-24 px-1.5 py-2 h-auto"
                  >
                    {CMS_SHORT[cms]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => {
                const realIdx = matrix.indexOf(entry);
                return (
                  <TableRow
                    key={entry.featureId}
                    className="border-border/20"
                  >
                    <TableCell className="px-3 py-1.5">
                      <Tip content={`ID: ${entry.featureId}`}>
                        <span className="font-medium text-foreground/80 cursor-default">
                          {entry.featureId.replace("feature.", "")}
                        </span>
                      </Tip>
                    </TableCell>
                    {visibleCms.map((cmsId) => {
                      const rowIdx = entry.rows.findIndex(
                        (r) => r.cmsId === cmsId,
                      );
                      const row = entry.rows[rowIdx];
                      return (
                        <TableCell key={cmsId} className="px-1 py-1">
                          {row ? (
                            <MatrixCell
                              row={row}
                              onClassChange={(cls) =>
                                updateCell(realIdx, rowIdx, cls)
                              }
                            />
                          ) : (
                            <span className="text-muted-foreground/30 text-center block">
                              —
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filtered.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground/50">
            {LABELS.matrix.noFeature}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground/50">
          {LABELS.matrix.footer(matrix.length, CMS_IDS.length)} • {LABELS.matrix.footerHint}
        </p>
      </div>
    </TooltipProvider>
  );
}
