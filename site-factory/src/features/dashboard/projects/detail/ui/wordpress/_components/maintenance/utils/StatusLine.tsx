import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StatusLine({
  label,
  ok,
  okLabel = "OK",
  failLabel = "Manquant",
}: {
  label: string;
  ok: boolean;
  okLabel?: string;
  failLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm flex-1">
      {ok ? (
        <CheckCircle2 className="size-4 text-emerald-500" />
      ) : (
        <XCircle className="size-4 text-rose-500" />
      )}
      <span className="flex-1">{label}</span>
      <Badge
        variant={ok ? "secondary" : "outline"}
        className="text-[10px] px-1 py-0"
      >
        {ok ? okLabel : failLabel}
      </Badge>
    </div>
  );
}