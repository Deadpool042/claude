import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";

export function MappingRow({
  entryKey,
  entryValue,
  onUpdate,
  onDelete,
}: {
  entryKey: string;
  entryValue: string;
  onUpdate: (newValue: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/20 transition-colors">
      <Badge variant="outline" className="text-[10px] shrink-0 min-w-35 justify-center font-mono">
        {entryKey}
      </Badge>
      <span className="text-muted-foreground/50 text-xs">→</span>
      <Input
        value={entryValue}
        onChange={(e) => onUpdate(e.target.value)}
        className="h-7 text-xs font-mono flex-1"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground/50 hover:text-destructive shrink-0"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
