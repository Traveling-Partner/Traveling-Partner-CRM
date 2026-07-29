"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

type KpiTone = "brand" | "neutral" | "success" | "warning";

const toneClass: Record<KpiTone, string> = {
  brand: "bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-md",
  neutral: "border-border/80 bg-card text-foreground shadow-sm",
  success: "border-emerald-200/60 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100",
  warning: "border-amber-200/60 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100"
};

export function RoleKpiCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon: Icon
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: KpiTone;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className={cn(toneClass[tone])}>
      <CardContent className="space-y-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
          {Icon ? <Icon className="h-4 w-4 opacity-70" /> : null}
        </div>
        <p className="text-2xl font-heading font-semibold tabular-nums">{value}</p>
        {hint ? <p className="text-[0.7rem] opacity-80">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function ActivityList({
  items
}: {
  items: Array<{ id: string; action: string; at: string }>;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs"
        >
          <p className="font-medium text-foreground">{item.action}</p>
          <span className="shrink-0 text-muted-foreground tabular-nums">
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
  const values = data.map((d) => Number(d[valueKey] ?? 0));
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((row, index) => {
        const value = Number(row[valueKey] ?? 0);
        const height = Math.max(8, Math.round((value / max) * 100));
        return (
          <div key={String(row.month ?? index)} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-[#fdb813] to-[#fce001]"
              style={{ height: `${height}%` }}
              title={String(value)}
            />
            <span className="text-[10px] text-muted-foreground">{String(row.month ?? "")}</span>
          </div>
        );
      })}
    </div>
  );
}
