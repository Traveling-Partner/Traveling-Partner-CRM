"use client";

import { AlertTriangle, CheckCircle2, Radio, Siren } from "lucide-react";
import { cn } from "@/lib/utils";

type Kpi = {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "default" | "danger" | "success" | "warning";
  icon: typeof Siren;
};

const toneClass: Record<NonNullable<Kpi["tone"]>, string> = {
  default: "border-border/60 bg-card",
  danger: "border-red-200 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/30",
  success: "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/30",
  warning: "border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30"
};

export function SafetyKpiCards({
  activeCount,
  criticalCount,
  resolvedToday,
  total
}: {
  activeCount: number;
  criticalCount: number;
  resolvedToday: number;
  total: number;
}) {
  const items: Kpi[] = [
    { label: "Active SOS", value: activeCount, hint: "Needs attention", tone: "danger", icon: Siren },
    { label: "Critical", value: criticalCount, hint: "Highest severity", tone: "warning", icon: AlertTriangle },
    { label: "Resolved today", value: resolvedToday, hint: "Closed in last 24h window", tone: "success", icon: CheckCircle2 },
    { label: "Total tracked", value: total, hint: "Mock seed set", tone: "default", icon: Radio }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md",
            toneClass[item.tone ?? "default"]
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-heading font-semibold tabular-nums">{item.value}</p>
              {item.hint && <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>}
            </div>
            <item.icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
}
