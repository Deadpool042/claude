import { Badge } from "@/components/ui/badge";

export type SummaryStatus = "ok" | "todo" | "ko";
export type SummaryItem = {
  id: string;
  label: string;
  status: SummaryStatus;
};

function statusLabel(status: SummaryStatus): string {
  if (status === "ok") return "OK";
  if (status === "ko") return "KO";
  return "A faire";
}

function statusClass(status: SummaryStatus): string {
  if (status === "ok") return "border-emerald-500/30 text-emerald-600";
  if (status === "ko") return "border-rose-500/30 text-rose-600";
  return "border-muted-foreground/30 text-muted-foreground";
}

export function SummaryBadge({ item }: { item: SummaryItem }) {
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusClass(item.status)}`}>
      {item.label}: {statusLabel(item.status)}
    </Badge>
  );
}