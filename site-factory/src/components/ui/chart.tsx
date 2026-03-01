"use client";

import * as React from "react";
import { Legend, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart(): ChartContextValue {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("Chart components must be used within <ChartContainer />");
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { config: ChartConfig }
>(({ config, className, children, style, ...props }, ref) => {
  const colorVars: Record<string, string> = {};
  for (const [key, item] of Object.entries(config)) {
    if (item.color) colorVars[`--color-${key}`] = item.color;
  }

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn("flex h-[350px] w-full flex-col", className)}
        style={{ ...(colorVars as React.CSSProperties), ...style }}
        {...props}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = Tooltip;
const ChartLegend = Legend;

type ChartTooltipPayload = {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string | number;
  className?: string;
  hideLabel?: boolean;
  indicator?: "dot" | "line" | "dashed";
};

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(({ active, payload, label, className, hideLabel, indicator = "dot" }, ref) => {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl",
        className,
      )}
    >
      {!hideLabel && label ? (
        <div className="mb-1 text-[11px] font-medium text-muted-foreground">{label}</div>
      ) : null}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const key = (item.dataKey ?? item.name ?? index).toString();
          const itemConfig = config[key];
          const color = itemConfig?.color ?? item.color ?? "currentColor";
          return (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-muted-foreground">
                {indicator ? (
                  <span
                    className={cn(
                      "inline-block",
                      indicator === "dot" && "size-2 rounded-full",
                      indicator === "line" && "h-2 w-0.5 rounded-full",
                      indicator === "dashed" && "h-0.5 w-3",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ) : null}
                <span>{itemConfig?.label ?? item.name ?? key}</span>
              </span>
              <span className="tabular-nums">{String(item.value ?? "")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

type ChartLegendPayload = {
  dataKey?: string | number;
  value?: string | number;
  color?: string;
};

type ChartLegendContentProps = {
  payload?: ChartLegendPayload[];
  className?: string;
  hideIcon?: boolean;
};

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(({ payload, className, hideIcon }, ref) => {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div ref={ref} className={cn("flex flex-wrap gap-3 text-xs", className)}>
      {payload.map((item, index) => {
        const key = (item.dataKey ?? item.value ?? index).toString();
        const itemConfig = config[key];
        const color = itemConfig?.color ?? (item.color as string | undefined);
        const Icon = itemConfig?.icon;
        return (
          <div key={key} className="flex items-center gap-2">
            {!hideIcon ? (
              Icon ? (
                <Icon className="size-3" />
              ) : (
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )
            ) : null}
            <span>{itemConfig?.label ?? item.value ?? key}</span>
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegendContent";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};
