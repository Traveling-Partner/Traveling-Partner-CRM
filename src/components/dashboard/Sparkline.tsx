"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { CHART } from "@/components/dashboard/chart-theme";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";

export function Sparkline({
  data,
  dataKey = "count",
  variant = "default",
  className
}: {
  data: Array<Record<string, string | number>>;
  dataKey?: string;
  variant?: "default" | "onBrand";
  className?: string;
}) {
  const mounted = useHasMounted();
  const id = useId().replace(/:/g, "");
  const stroke = variant === "onBrand" ? "#111827" : CHART.brand;
  const fillId = `spark-${id}`;
  const points = data.filter((row) => Number(row[dataKey] ?? 0) >= 0);
  const nums = points.map((row) => Number(row[dataKey] ?? 0));
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (!mounted || points.length < 3 || max - min === 0) {
    return <div className={cn("h-9 w-full min-w-[4.5rem]", className)} />;
  }

  return (
    <div className={cn("h-9 w-full min-w-[4.5rem]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 3, right: 2, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={variant === "onBrand" ? 0.2 : 0.28} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${fillId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SparkBars({
  values,
  variant = "default",
  className
}: {
  values: number[];
  variant?: "default" | "onBrand";
  className?: string;
}) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const barClass =
    variant === "onBrand" ? "bg-slate-900/80" : "bg-gradient-to-t from-[#fdb813] to-[#fce001]";

  return (
    <div className={cn("flex h-9 w-full min-w-[4.5rem] items-end gap-1", className)}>
      {values.map((value, index) => (
        <div
          key={index}
          className={cn("min-h-[4px] flex-1 rounded-[3px]", barClass)}
          style={{ height: `${Math.max((value / max) * 100, 12)}%` }}
        />
      ))}
    </div>
  );
}

/** Horizontal ranked bars — distinct from vertical SparkBars. */
export function SparkRows({
  values,
  className
}: {
  values: number[];
  className?: string;
}) {
  const rows = values.filter((value) => value >= 0).slice(0, 4);
  const max = Math.max(...rows, 1);
  if (rows.length === 0) return null;

  return (
    <div className={cn("flex h-9 w-full min-w-[4.5rem] flex-col justify-center gap-1", className)}>
      {rows.map((value, index) => (
        <div key={index} className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#fce001] to-[#fdb813]"
            style={{ width: `${Math.max((value / max) * 100, 10)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

/** Compact heatmap tiles — distinct from lines and bars. */
export function SparkHeat({
  values,
  className
}: {
  values: number[];
  className?: string;
}) {
  const cells = values.filter((value) => value >= 0).slice(0, 6);
  const max = Math.max(...cells, 1);
  if (cells.length === 0) return null;

  return (
    <div className={cn("grid h-9 w-full min-w-[4.5rem] grid-cols-3 grid-rows-2 gap-1", className)}>
      {cells.map((value, index) => {
        const t = max > 0 ? value / max : 0;
        return (
          <div
            key={index}
            className="rounded-[5px] bg-slate-100 dark:bg-white/10"
            title={String(value)}
          >
            <div
              className="h-full w-full rounded-[5px]"
              style={{
                background: `linear-gradient(180deg, ${CHART.brandFrom}, ${CHART.brandTo})`,
                opacity: 0.22 + t * 0.78
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
