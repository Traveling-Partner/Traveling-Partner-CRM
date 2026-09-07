"use client";

import { useMemo, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboardQuery } from "@/hooks/queries/use-admin-dashboard-query";
import { AuditLogsSection } from "@/components/audit-logs/AuditLogsSection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { TrendArea } from "@/components/dashboard/TrendArea";
import {
  RideFunnel,
  OutcomeTrend,
  FareTrend,
  CityDemand,
  DocumentsPending,
  DriverStatusMix,
  RideStatusBoard,
  CommissionBoard,
  TopAgentsBoard
} from "@/components/dashboard/ops-charts";
import {
  DRIVER_STATUS_COLORS,
  RIDE_STATUS_COLORS
} from "@/components/dashboard/chart-theme";
import {
  Users,
  Briefcase,
  UserCircle2,
  Car,
  TrendingUp,
  BadgeDollarSign
} from "lucide-react";

function prettyStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function periodDelta(values: number[]) {
  if (values.length < 4) return null;
  const mid = Math.floor(values.length / 2);
  const previous = values.slice(0, mid).reduce((sum, n) => sum + n, 0);
  const current = values.slice(mid).reduce((sum, n) => sum + n, 0);
  if (previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.abs(pct) >= 10 ? Math.round(pct) : Math.round(pct * 10) / 10;
  const up = pct >= 0;
  return {
    up,
    label: `${up ? "↑" : "↓"} ${Math.abs(rounded)}% vs prior period`
  };
}

export default function AdminDashboardPage() {
  const { data, loading: isLoading, error } = useAdminDashboardQuery();
  const {
    counts,
    driverStatusCounts,
    ridesTrend,
    rideStatusBreakdown,
    rideFunnel,
    outcomeTrend,
    ridesByCity,
    fareTrend,
    documentsPending,
    commission,
    topAgents,
    opsDemo
  } = data;

  const statusRows = useMemo(
    () => [
      { label: "Active", value: driverStatusCounts.active, color: DRIVER_STATUS_COLORS[0] },
      { label: "Approved", value: driverStatusCounts.approved, color: DRIVER_STATUS_COLORS[1] },
      { label: "Inactive", value: driverStatusCounts.inactive, color: DRIVER_STATUS_COLORS[2] },
      { label: "Blocked", value: driverStatusCounts.blocked, color: DRIVER_STATUS_COLORS[3] },
      { label: "Pending", value: driverStatusCounts.pending, color: DRIVER_STATUS_COLORS[4] }
    ],
    [driverStatusCounts]
  );
  const driverStatusTotal = statusRows.reduce((sum, row) => sum + row.value, 0);
  const rideChartData = useMemo(
    () =>
      rideStatusBreakdown.map((row, idx) => ({
        label: prettyStatus(row.status),
        value: row.count,
        color: RIDE_STATUS_COLORS[idx]
      })),
    [rideStatusBreakdown]
  );
  const ridesTrendTotal = ridesTrend.reduce((sum, point) => sum + point.count, 0);
  const ridesDelta = useMemo(
    () => periodDelta(ridesTrend.map((point) => point.count)),
    [ridesTrend]
  );
  const funnelHasData =
    rideFunnel.stages.some((stage) => stage.count > 0) || rideFunnel.canceled > 0;
  const documentsTotal =
    documentsPending.driverCnic +
    documentsPending.driverLicense +
    documentsPending.vehicle +
    documentsPending.partnerCnic;
  const demoBadge = (
    <span className="rounded-full bg-slate-900/6 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground dark:bg-white/10">
      Demo data
    </span>
  );

  return (
    <AppShell title="Admin Dashboard">
      <PageContainer>
        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            label="Total rides"
            value={counts.totalRidePlans}
            icon={Car}
            tone="brand"
            loading={isLoading}
            delta={ridesDelta}
            sparkline={ridesTrend.map((point) => ({ day: point.day, count: point.count }))}
          />
          <MetricCard
            label="Total drivers"
            value={counts.totalDrivers}
            icon={Users}
            loading={isLoading}
            bars={statusRows.map((row) => row.value)}
          />
          <MetricCard
            label="Total partners"
            value={counts.totalPartners}
            icon={Briefcase}
            loading={isLoading}
            sparkline={[{ count: counts.totalPartners }]}
          />
          <MetricCard
            label="Total agents"
            value={counts.totalSalesAgents}
            icon={UserCircle2}
            loading={isLoading}
            bars={[counts.totalSalesAgents]}
          />
        </div>

        <ChartCard
          title="Ride funnel"
          description="Requested through completed"
          loading={isLoading}
          empty={!isLoading && !funnelHasData}
          heightClass="h-auto"
          badge={opsDemo.rideFunnel ? demoBadge : undefined}
        >
          <RideFunnel data={rideFunnel} />
        </ChartCard>

        <ChartCard
          title="Completed vs canceled"
          description="Daily outcomes, last 14 days"
          loading={isLoading}
          empty={!isLoading && outcomeTrend.length === 0}
          heightClass="h-56 sm:h-72"
          badge={opsDemo.outcomeTrend ? demoBadge : undefined}
        >
          <OutcomeTrend data={outcomeTrend} />
        </ChartCard>
        <ChartCard
          title="Documents pending"
          description="CNIC, license and vehicle review"
          loading={isLoading}
          empty={!isLoading && documentsTotal === 0}
          heightClass="h-auto"
          badge={opsDemo.documentsPending ? demoBadge : undefined}
        >
          <DocumentsPending data={documentsPending} />
        </ChartCard>
        <ChartCard
          title="Fare trend"
          description="Gross fare, last 14 days"
          loading={isLoading}
          empty={!isLoading && fareTrend.length === 0}
          heightClass="h-auto"
          badge={opsDemo.fareTrend ? demoBadge : undefined}
        >
          <FareTrend data={fareTrend} />
        </ChartCard>
        <ChartCard
          title="Rides by city"
          description="Demand ranked by volume"
          loading={isLoading}
          empty={!isLoading && ridesByCity.length === 0}
          heightClass="h-auto"
          badge={opsDemo.ridesByCity ? demoBadge : undefined}
        >
          <CityDemand data={ridesByCity} />
        </ChartCard>

        <ChartCard
          title="Rides"
          description="Daily volume, last 14 days"
          badge={
            <span className="inline-flex items-center gap-2">
              <span className="font-heading text-sm font-semibold tabular-nums">
                {isLoading ? "—" : ridesTrendTotal.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#fce001] to-[#fdb813] px-2.5 py-1 text-[11px] font-semibold text-slate-900">
                <TrendingUp className="h-3 w-3" />
                14 days
              </span>
            </span>
          }
          loading={isLoading}
          empty={!isLoading && ridesTrend.length === 0}
          heightClass="h-56 sm:h-72"
        >
          <TrendArea
            data={ridesTrend.map((point) => ({ day: point.day, count: point.count }))}
            xKey="day"
            yKey="count"
            name="Rides"
          />
        </ChartCard>

        <ChartCard
          title="Drivers"
          description="Status mix"
          heightClass="h-auto"
          loading={isLoading}
          empty={!isLoading && driverStatusTotal === 0}
        >
          <DriverStatusMix items={statusRows} />
        </ChartCard>

        <ChartCard
          title="Rides by status"
          description="Requested through completed"
          heightClass="h-auto"
          loading={isLoading}
          empty={!isLoading && rideChartData.every((row) => row.value === 0)}
        >
          <RideStatusBoard items={rideChartData} />
        </ChartCard>

        <ChartCard
          title="Top agents"
          description="Drivers vs partners onboarded"
          heightClass="h-auto"
          loading={isLoading}
          empty={!isLoading && topAgents.length === 0}
          badge={opsDemo.topAgents ? demoBadge : undefined}
        >
          <TopAgentsBoard data={topAgents} />
        </ChartCard>

        <ChartCard
          title="Commission"
          description="Pending, released and remaining"
          heightClass="h-auto"
          loading={isLoading}
          badge={opsDemo.commission ? demoBadge : <BadgeDollarSign className="h-4 w-4 text-[#fdb813]" />}
        >
          <CommissionBoard data={commission} />
        </ChartCard>

        <Suspense fallback={<Skeleton className="h-64 w-full rounded-[1.75rem]" />}>
          <AuditLogsSection variant="dashboard" />
        </Suspense>
      </PageContainer>
    </AppShell>
  );
}
