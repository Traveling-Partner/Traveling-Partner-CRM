"use client";

import type { ComponentType } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { BarList } from "@/components/dashboard/BarList";
import { cn } from "@/lib/utils";

type KpiTone = "brand" | "neutral" | "success" | "warning";

export function RoleKpiCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: KpiTone;
  icon?: ComponentType<{ className?: string }>;
}) {
  return <MetricCard label={label} value={value} hint={hint} tone={tone} icon={icon} />;
}

export function ActivityList({
  items
}: {
  items: Array<{ id: string; action: string; at: string }>;
}) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-white/5">
      {items.map((item) => (
        <div key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <span className="mb-1.5 mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-gradient-to-br from-[#fce001] to-[#fdb813]" />
            <span className="text-sm text-foreground">{item.action}</span>
          </div>
          <span className="shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
            {new Date(item.at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SimpleBarChart({
  data,
  valueKey = "revenue"
}: {
  data: Array<Record<string, string | number>>;
  valueKey?: string;
}) {
  return (
    <BarList
      sort={false}
      items={data.map((row) => ({
        label: String(row.month ?? row.label ?? ""),
        value: Number(row[valueKey] ?? 0)
      }))}
      formatValue={(value) => value.toLocaleString()}
    />
  );
}

export function MiniMetric({
  label,
  value,
  accent
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-[#f3f4f6] px-4 py-4 text-center dark:bg-white/5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-1.5 font-heading text-xl font-semibold tabular-nums sm:text-2xl", accent)}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
