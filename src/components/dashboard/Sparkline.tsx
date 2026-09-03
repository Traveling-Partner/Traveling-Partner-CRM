"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
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
  const id = useId().replace(/:/g, "");
  const stroke = variant === "onBrand" ? "#111827" : "#fdb813";
  const fillId = `spark-${id}`;
  const points = data.filter((row) => Number(row[dataKey] ?? 0) >= 0);

  if (points.length === 0) return null;

  const chartData =
    points.length === 1 ? [points[0], points[0]] : points;

  return (
    <div className={cn("h-9 w-full min-w-[4.5rem]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 3, right: 2, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
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
    <div className={cn("flex h-9 w-full min-w-[4.5rem] items-end gap-0.5", className)}>
      {values.map((value, index) => (
        <div
          key={index}
          className={cn("min-h-[3px] flex-1 rounded-[2px]", barClass)}
          style={{ height: `${Math.max((value / max) * 100, 8)}%` }}
        />
      ))}
    </div>
  );
}
