"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboardQuery } from "@/hooks/queries/use-admin-dashboard-query";
import { useAgentsListQuery } from "@/hooks/queries/use-agents-list-query";
import {
  buildAgentPerformanceRow,
  getAgentCommissions
} from "@/lib/agent-onboarding";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { TrendArea } from "@/components/dashboard/TrendArea";
import { RadialRings, Lollipop, Butterfly, DonutMix } from "@/components/dashboard/viz";
import {
  RideFunnel,
  OutcomeTrend,
  FareTrend,
  CityDemand,
  DocumentsPending
} from "@/components/dashboard/ops-charts";
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
    data: agentsData,
    isLoading: agentsLoading,
    isFetching: agentsFetching
  } = useAgentsListQuery({
    page: 0,
    pageSize: 100,
    status: "all",
    name: "",
    mobileNumber: "",
    city: "",
    gender: "all"
  });
  const {
    counts,
    driverStatusCounts,
    ridesTrend,
    rideStatusBreakdown,
    recentActivity,
    rideFunnel,
    outcomeTrend,
    ridesByCity,
    fareTrend,
    documentsPending,
    opsApi
  } = data;

  const statusRows = useMemo(
    () => [
      { label: "Active", value: driverStatusCounts.active, color: "#fdb813" },
      { label: "Approved", value: driverStatusCounts.approved, color: "#64748b" },
      { label: "Inactive", value: driverStatusCounts.inactive, color: "#94a3b8" },
      { label: "Blocked", value: driverStatusCounts.blocked, color: "#cbd5e1" },
      { label: "Pending", value: driverStatusCounts.pending, color: "#fce001" }
    ],
    [driverStatusCounts]
  );
  const driverStatusTotal = statusRows.reduce((sum, row) => sum + row.value, 0);
  const rideChartData = useMemo(
    () =>
      rideStatusBreakdown.map((row, idx) => ({
        label: prettyStatus(row.status),
        value: row.count,
        color: ["#64748b", "#fdb813", "#fce001", "#94a3b8", "#cbd5e1"][idx]
      })),
    [rideStatusBreakdown]
  );
  const isAgentPerfLoading = agentsLoading || agentsFetching;
  const agentRows = useMemo(
    () => (agentsData?.content ?? []).map(buildAgentPerformanceRow),
    [agentsData?.content]
  );
  const registeredByAgents = useMemo(
    () => ({
      drivers: agentRows.reduce((sum, row) => sum + row.driverCount, 0),
      partners: agentRows.reduce((sum, row) => sum + row.passengerCount, 0)
    }),
    [agentRows]
  );
  const topAgentRegistrations = useMemo(
    () =>
      [...agentRows]
        .map((row) => ({
          name: row.name?.trim() || `Agent ${row.id}`,
          drivers: row.driverCount,
          partners: row.passengerCount
        }))
        .sort((a, b) => b.drivers + b.partners - (a.drivers + a.partners))
        .slice(0, 6),
    [agentRows]
  );
  const commissionTotals = useMemo(() => {
    let pending = 0;
    let total = 0;
    let released = 0;
    for (const row of agentRows) {
      total += row.totalCommission;
      released += row.paidAmount;
      const commissions = getAgentCommissions(row.id);
      pending += commissions
        .filter((item) => item.status === "PENDING")
        .reduce((sum, item) => sum + item.amount, 0);
    }
    const remaining = Math.max(total - released, 0);
    return { pending, released, remaining, total };
  }, [agentRows]);
  const commissionRows = useMemo(
    () => [
      { label: "Pending", value: commissionTotals.pending, color: "#fdb813" },
      { label: "Released", value: commissionTotals.released, color: "#64748b" },
      { label: "Remaining", value: commissionTotals.remaining, color: "#94a3b8" }
    ],
    [commissionTotals]
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
  const waitingBadge = (
    <span className="rounded-full bg-slate-900/6 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground dark:bg-white/10">
      Waiting on API
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
            loading={isLoading || isAgentPerfLoading}
            sparkline={
              agentRows.length > 0
                ? agentRows.slice(0, 12).map((row) => ({ count: row.passengerCount }))
                : [{ count: counts.totalPartners }]
            }
          />
          <MetricCard
            label="Total agents"
            value={counts.totalSalesAgents}
            icon={UserCircle2}
            loading={isLoading || isAgentPerfLoading}
            bars={
              agentRows.length > 0
                ? agentRows.slice(0, 12).map((row) => row.driverCount + row.passengerCount)
                : [counts.totalSalesAgents]
            }
          />
        </div>

        <ChartCard
          title="Ride funnel"
          description="Requested through completed"
          loading={isLoading}
          empty={!isLoading && !funnelHasData}
          heightClass="h-auto"
          badge={opsApi.rideFunnel || funnelHasData ? undefined : waitingBadge}
        >
          <RideFunnel data={rideFunnel} />
        </ChartCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Completed vs canceled"
            description="Daily outcomes, last 14 days"
            loading={isLoading}
            empty={!isLoading && outcomeTrend.length === 0}
            heightClass="h-56 sm:h-72"
            badge={opsApi.outcomeTrend ? undefined : waitingBadge}
          >
            <OutcomeTrend data={outcomeTrend} />
          </ChartCard>
          <ChartCard
            title="Documents pending"
            description="CNIC, license and vehicle review"
            loading={isLoading}
            empty={!isLoading && documentsTotal === 0}
            heightClass="h-auto"
            badge={opsApi.documentsPending ? undefined : waitingBadge}
          >
            <DocumentsPending data={documentsPending} />
          </ChartCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Fare trend"
            description="Gross fare, last 14 days"
            loading={isLoading}
            empty={!isLoading && fareTrend.length === 0}
            heightClass="h-56 sm:h-72"
            badge={opsApi.fareTrend ? undefined : waitingBadge}
          >
            <FareTrend data={fareTrend} />
          </ChartCard>
          <ChartCard
            title="Rides by city"
            description="Demand ranked by volume"
            loading={isLoading}
            empty={!isLoading && ridesByCity.length === 0}
            heightClass="h-auto"
            badge={opsApi.ridesByCity ? undefined : waitingBadge}
          >
            <CityDemand data={ridesByCity} />
          </ChartCard>
        </div>

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

        <ChartCard title="Drivers" description="Status mix" heightClass="h-auto" loading={false}>
          {isLoading ? (
            <Skeleton className="h-52 w-full rounded-3xl" />
          ) : (
            <RadialRings
              items={statusRows}
              centerLabel="Drivers"
              centerValue={driverStatusTotal}
            />
          )}
        </ChartCard>

        <ChartCard title="Rides by status" description="Ranked by volume" heightClass="h-auto" loading={isLoading}>
          <Lollipop items={rideChartData} />
        </ChartCard>

        <ChartCard
          title="Top agents"
          description="Drivers vs partners"
          heightClass="h-auto"
          loading={false}
        >
          <div className="mb-6 grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-[#fce001] to-[#fdb813] px-4 py-4 text-slate-900">
              <p className="text-sm text-slate-900/70">New drivers</p>
              {isAgentPerfLoading ? (
                <Skeleton className="mt-2 h-7 w-16" />
              ) : (
                <p className="mt-1 font-heading text-2xl font-semibold tabular-nums">
                  {registeredByAgents.drivers.toLocaleString()}
                </p>
              )}
            </div>
            <div className="rounded-[1.5rem] bg-slate-900 px-4 py-4 text-white dark:bg-slate-800">
              <p className="text-sm text-white/70">New partners</p>
              {isAgentPerfLoading ? (
                <Skeleton className="mt-2 h-7 w-16" />
              ) : (
                <p className="mt-1 font-heading text-2xl font-semibold tabular-nums">
                  {registeredByAgents.partners.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          {isAgentPerfLoading ? (
            <Skeleton className="h-48 w-full rounded-3xl" />
          ) : topAgentRegistrations.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-3xl bg-[#f3f4f6] text-sm text-muted-foreground dark:bg-white/5">
              No agent registrations yet
            </div>
          ) : (
            <Butterfly items={topAgentRegistrations} />
          )}
        </ChartCard>

        <ChartCard
          title="Commission"
          description="Pending, released and remaining"
          badge={<BadgeDollarSign className="h-4 w-4 text-[#fdb813]" />}
          heightClass="h-auto"
          loading={isAgentPerfLoading}
        >
          <DonutMix
            items={commissionRows}
            centerLabel="Total"
            centerValue={commissionTotals.total}
          />
        </ChartCard>

        <ChartCard title="Recent activity" description="Latest audit events" heightClass="h-auto" loading={isLoading}>
          {recentActivity.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-3xl bg-[#f3f4f6] text-sm text-muted-foreground dark:bg-white/5">
              No recent activity found.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute bottom-3 left-[7px] top-3 w-px bg-border/40" />
              {recentActivity.map((log) => (
                <div key={log.id} className="group relative flex gap-4 py-2.5">
                  <div className="relative z-10 mt-1.5 flex h-[15px] w-[15px] shrink-0 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/30 transition-colors group-hover:bg-[#fdb813]" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{log.description?.trim() || "—"}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        {log.userType ? (
                          <span className="rounded bg-muted/60 px-1.5 py-0.5 font-medium">{log.userType}</span>
                        ) : null}
                        {log.mobileNumber ? <span>{log.mobileNumber}</span> : null}
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/60">
                      {format(parseISO(log.createdAt), "MMM d, HH:mm")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </PageContainer>
    </AppShell>
  );
}
