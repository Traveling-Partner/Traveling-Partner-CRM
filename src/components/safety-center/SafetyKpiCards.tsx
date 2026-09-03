"use client";

import { AlertTriangle, CheckCircle2, Radio, Siren } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";

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
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Active SOS"
        value={activeCount}
        hint="Needs attention"
        tone="danger"
        icon={Siren}
      />
      <MetricCard
        label="Critical"
        value={criticalCount}
        hint="Highest severity"
        tone="warning"
        icon={AlertTriangle}
      />
      <MetricCard
        label="Resolved today"
        value={resolvedToday}
        hint="Closed in last 24h window"
        tone="success"
        icon={CheckCircle2}
      />
      <MetricCard
        label="Total tracked"
        value={total}
        hint="Mock seed set"
        icon={Radio}
      />
    </div>
  );
}
