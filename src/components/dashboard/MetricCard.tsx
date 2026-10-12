"use client";

import type { ComponentType, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RevealScope } from "@/components/dashboard/RevealScope";
import { cn } from "@/lib/utils";

type MetricTone = "brand" | "neutral" | "success" | "warning" | "info" | "danger";

const toneWrap: Record<MetricTone, string> = {
  brand: "bg-gradient-to-br from-[#fce001] to-[#fdb813] text-slate-900",
  neutral: "glass-panel text-foreground",
  success: "glass-panel text-foreground",
  warning: "glass-panel text-foreground",
  info: "glass-panel text-foreground",
  danger: "glass-panel text-foreground"
};

export function MetricCard({
  label,
  value,
  hint,
  delta,
  chart,
  tone = "neutral",
  icon: Icon,
  loading,
  footer,
  tag
}: {
  label: string;
  value: string | number;
  hint?: string;
  delta?: { label: string; up?: boolean } | null;
  chart?: ReactNode;
  tone?: MetricTone;
  icon?: ComponentType<{ className?: string }>;
  loading?: boolean;
  footer?: ReactNode;
  tag?: string;
}) {
  const display = typeof value === "number" ? value.toLocaleString() : value;
  const muted = tone === "brand" ? "text-slate-900" : "text-muted-foreground";

  return (
    <div className={cn("rounded-2xl px-4 py-3.5 sm:px-4 sm:py-4", toneWrap[tone])}>
      <div className="flex items-center justify-between gap-2">
        <p className={cn("text-xs sm:text-sm", muted)}>{label}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          {tag ? (
            <span className="rounded-full border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold leading-none text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              {tag}
            </span>
          ) : null}
          {Icon ? <Icon className={cn("h-3.5 w-3.5 shrink-0", muted)} /> : null}
        </div>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {loading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
              {display}
            </p>
          )}
          {delta ? (
            <p
              className={cn(
                "mt-0.5 text-xs font-medium",
                tone === "brand"
                  ? "text-slate-900"
                  : delta.up
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-500"
              )}
            >
              {delta.label}
            </p>
          ) : hint ? (
            <p className={cn("mt-0.5 text-xs", muted)}>{hint}</p>
          ) : null}
        </div>
        {chart ? (
          <RevealScope className="mb-0.5 w-[42%] max-w-[7.5rem] shrink-0">{chart}</RevealScope>
        ) : null}
      </div>
      {footer}
    </div>
  );
}
