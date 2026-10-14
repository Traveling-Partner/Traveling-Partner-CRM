"use client";

import { AlertTriangle, CheckCircle2, Radio, Siren } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";

function kpiValue(value: number | null) {
  return value == null ? "Not available" : value;
}

export function SafetyKpiCards({
  activeCount,
  criticalCount,
  resolvedToday,
  total
}: {
  activeCount: number | null;
  criticalCount: number | null;
  resolvedToday: number | null;
  total: number | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Active SOS"
        value={kpiValue(activeCount)}
        hint="Needs attention"
        tone="danger"
        icon={Siren}
      />
      <MetricCard
        label="Critical"
        value={kpiValue(criticalCount)}
        hint="Highest severity"
        tone="warning"
        icon={AlertTriangle}
      />
      <MetricCard
        label="Resolved today"
        value={kpiValue(resolvedToday)}
        hint="Closed in last 24h window"
        tone="success"
        icon={CheckCircle2}
      />
      <MetricCard
        label="Total tracked"
        value={kpiValue(total)}
        hint="All SOS incidents"
        icon={Radio}
      />
    </div>
  );
}
