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
import { DonutMix } from "@/components/dashboard/viz";
import { Sparkline, SparkBars, SparkRows, SparkHeat } from "@/components/dashboard/Sparkline";
import {
  RideFunnel,
  OutcomeTrend,
  FareTrend,
  CityDemand,
  DocumentsPending,
  RideStatusBoard,
  CommissionBoard,
  TopAgentsBoard
} from "@/components/dashboard/ops-charts";
import {
  CHART,
  DRIVER_STATUS_COLORS
} from "@/components/dashboard/chart-theme";
import {
  Users,
  Briefcase,
  UserCircle2,
  Car,
  TrendingUp,
  BadgeDollarSign
} from "lucide-react";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useAppSelector } from "@/store/hooks";
import { normalizeRole } from "@/lib/rbac";
import { ROLES } from "@/lib/roles";

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
  const mounted = useHasMounted();
  const isAdmin =
    normalizeRole(useAppSelector((state) => state.auth.user?.role)) === ROLES.ADMIN;
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
  const rideChartData = useMemo(() => {
    const colors: Record<string, string> = {
      REQUESTED: CHART.requested,
      ACCEPTED: CHART.accepted,
      STARTED: CHART.started,
      CANCELED: CHART.canceled,
      COMPLETED: CHART.completed
    };
    return rideStatusBreakdown.map((row) => ({
      label: prettyStatus(row.status),
      value: row.count,
      color: colors[row.status] ?? CHART.brand
    }));
  }, [rideStatusBreakdown]);
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
  const fareTrendTotal = fareTrend.reduce((sum, point) => sum + point.amount, 0);
  const fareTotalLabel = new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(fareTrendTotal);
  const failed = Boolean(error);
  const widgetUnavailable = (missing: boolean) => failed || missing;

  return (
    <AppShell title="Admin Dashboard">
      {!mounted ? (
        <div className="min-h-[40vh]" />
      ) : (
      <PageContainer>
        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            label="Total rides"
            value={failed ? "Not available" : counts.totalRidePlans}
            icon={Car}
            tone="brand"
            loading={isLoading}
            delta={failed ? null : ridesDelta}
            chart={
              failed ? undefined : (
                <Sparkline
                  data={ridesTrend.map((point) => ({ day: point.day, count: point.count }))}
                  variant="onBrand"
                />
              )
            }
          />
          <MetricCard
            label="Total drivers"
            value={failed ? "Not available" : counts.totalDrivers}
            icon={Users}
            loading={isLoading}
            chart={failed ? undefined : <SparkBars values={statusRows.map((row) => row.value)} />}
          />
          <MetricCard
            label="Total partners"
            value={failed ? "Not available" : counts.totalPartners}
            icon={Briefcase}
            loading={isLoading}
            chart={
              failed ? undefined : (
                <SparkRows values={topAgents.agents.map((agent) => agent.partners)} />
              )
            }
          />
          <MetricCard
            label="Total agents"
            value={failed ? "Not available" : counts.totalSalesAgents}
            icon={UserCircle2}
            loading={isLoading}
            chart={
              failed ? undefined : (
                <SparkHeat
                  values={topAgents.agents.map((agent) => agent.drivers + agent.partners)}
                />
              )
            }
          />
        </div>

        {/* Rides trend + status breakdown + distribution */}
        <ChartCard
          title="Rides trend"
          description="Daily ride volume over the last 14 days"
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              14 days
            </span>
          }
          loading={isLoading}
          unavailable={failed}
          empty={!isLoading && !failed && ridesTrend.length === 0}
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
          title="Ride status breakdown"
          description="Requested, Accepted, Started, Cancelled & Completed"
          heightClass="h-56 sm:h-64"
          loading={isLoading}
          unavailable={failed}
          empty={!isLoading && !failed && rideChartData.every((row) => row.value === 0)}
        >
          <RideStatusBoard items={rideChartData} />
        </ChartCard>

        <ChartCard
          title="Distribution"
          description="Proportional ride breakdown"
          heightClass="h-auto min-h-[16rem] sm:min-h-[18rem]"
          loading={isLoading}
          unavailable={failed}
        >
          <DonutMix
            emptyCenter
            items={rideChartData.map((row) => ({
              label: row.label.toUpperCase(),
              value: row.value,
              color: row.color
            }))}
          />
        </ChartCard>

        <ChartCard
          title="Ride funnel"
          description="Requested through completed"
          loading={isLoading}
          unavailable={widgetUnavailable(opsDemo.rideFunnel)}
          empty={!isLoading && !widgetUnavailable(opsDemo.rideFunnel) && !funnelHasData}
          heightClass="h-auto"
        >
          <RideFunnel data={rideFunnel} />
        </ChartCard>

        <ChartCard
          title="Completed vs canceled"
          description="Daily outcomes, last 14 days"
          loading={isLoading}
          unavailable={widgetUnavailable(opsDemo.outcomeTrend)}
          empty={!isLoading && !widgetUnavailable(opsDemo.outcomeTrend) && outcomeTrend.length === 0}
          heightClass="h-56 sm:h-72"
        >
          <OutcomeTrend data={outcomeTrend} />
        </ChartCard>
        <ChartCard
          title="Documents pending"
          description="CNIC, license and vehicle review"
          loading={isLoading}
          unavailable={widgetUnavailable(opsDemo.documentsPending)}
          empty={!isLoading && !widgetUnavailable(opsDemo.documentsPending) && documentsTotal === 0}
          heightClass="h-auto"
        >
          <DocumentsPending data={documentsPending} />
        </ChartCard>
        <ChartCard
          title="Fare trend"
          description="Gross fare, last 14 days"
          loading={isLoading}
          unavailable={widgetUnavailable(opsDemo.fareTrend)}
          empty={!isLoading && !widgetUnavailable(opsDemo.fareTrend) && fareTrend.length === 0}
          heightClass="h-auto"
          badge={
            <span className="inline-flex items-center gap-2">
              {widgetUnavailable(opsDemo.fareTrend) ? null : (
                <span className="font-heading text-sm font-semibold tabular-nums">
                  {isLoading ? "—" : fareTotalLabel}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-[#5c4308] px-2.5 py-1 text-xs font-semibold text-white">
                <TrendingUp className="h-3 w-3" />
                14 days
              </span>
            </span>
          }
        >
          <FareTrend data={fareTrend} />
        </ChartCard>
        <ChartCard
          title="Rides by city"
          description="Demand ranked by volume"
          loading={isLoading}
          unavailable={widgetUnavailable(opsDemo.ridesByCity)}
          empty={!isLoading && !widgetUnavailable(opsDemo.ridesByCity) && ridesByCity.length === 0}
          heightClass="h-auto"
        >
          <CityDemand data={ridesByCity} />
        </ChartCard>

        <ChartCard
          title="Drivers"
          description="Proportional status breakdown"
          heightClass="h-auto"
          loading={isLoading}
          unavailable={failed}
          empty={!isLoading && !failed && driverStatusTotal === 0}
        >
          <DonutMix
            items={statusRows}
            centerLabel="Drivers"
            centerValue={driverStatusTotal}
          />
        </ChartCard>

        <ChartCard
          title="Agent performance"
          description="New registered drivers and partners by agents"
          heightClass="h-auto"
          loading={isLoading}
          unavailable={widgetUnavailable(opsDemo.topAgents)}
          empty={!isLoading && !widgetUnavailable(opsDemo.topAgents) && topAgents.agents.length === 0}
        >
          <TopAgentsBoard
            data={topAgents.agents}
            totalDrivers={topAgents.totalDrivers}
            totalPartners={topAgents.totalPartners}
          />
        </ChartCard>

        <ChartCard
          title="Agent commission graph"
          description="Pending, released, remaining and total commission"
          heightClass="h-auto"
          loading={isLoading}
          unavailable={widgetUnavailable(opsDemo.commission)}
          badge={
            widgetUnavailable(opsDemo.commission) ? undefined : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-[#f5c518]">
                <BadgeDollarSign className="h-4 w-4" />
              </span>
            )
          }
        >
          <CommissionBoard data={commission} />
        </ChartCard>

        <ChartCard
          title="Commission mix"
          description="Share of pending, released and remaining"
          heightClass="h-auto"
          loading={isLoading}
          unavailable={widgetUnavailable(opsDemo.commission)}
        >
          <DonutMix
            items={[
              { label: "Pending", value: commission.pending, color: CHART.requested },
              { label: "Released", value: commission.released, color: CHART.accepted },
              { label: "Remaining", value: commission.remaining, color: CHART.completed }
            ]}
            centerLabel="Total"
            centerValue={
              commission.total > 0
                ? commission.total
                : commission.pending + commission.released + commission.remaining
            }
          />
        </ChartCard>

        {isAdmin ? (
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-[1.75rem]" />}>
            <AuditLogsSection variant="dashboard" />
          </Suspense>
        ) : null}
      </PageContainer>
      )}
    </AppShell>
  );
}
