import { Area, AreaChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export function SparklineChart({
  values,
  color,
  className,
}: {
  values: Array<number | null>;
  color: string;
  className?: string;
}) {
  const series = values ?? [];
  const numeric = series.filter((value): value is number => typeof value === "number");
  if (series.length < 2 || numeric.length === 0) {
    return <div className={cn("h-6 w-full rounded bg-muted/30", className)} />;
  }

  const data = series.map((value, idx) => ({
    idx,
    value,
  }));
  const config = {
    value: { label: "value", color },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className={cn("h-6 w-full", className)}>
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 2, bottom: 2 }}>
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          fill="var(--color-value)"
          fillOpacity={0.2}
          strokeWidth={2}
          isAnimationActive={false}
          connectNulls
        />
      </AreaChart>
    </ChartContainer>
  );
}