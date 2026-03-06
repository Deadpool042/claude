import type { RecommendationWhyItem } from "../../logic/wizard-flow";

interface RecommendationWhyPanelProps {
  items: RecommendationWhyItem[];
}

export function RecommendationWhyPanel({ items }: RecommendationWhyPanelProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="rounded-lg border p-4">
          <div className="space-y-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.sourceLabel}
              </p>
              <p className="text-sm font-medium">{item.sourceValue}</p>
            </div>
            <div className="rounded-md border border-dashed bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.consequenceLabel}
              </p>
              <p className="text-sm font-medium">{item.consequenceValue}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{item.detail}</p>
        </article>
      ))}
    </div>
  );
}
