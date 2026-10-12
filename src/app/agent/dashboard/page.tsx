"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  BadgeCheck,
  BadgeDollarSign,
  Handshake,
  ShieldCheck,
  UserPlus,
  Users
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { AnalyticsTooltip } from "@/components/dashboard/AnalyticsTooltip";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SparkBars, Sparkline } from "@/components/dashboard/Sparkline";
import { TrendArea } from "@/components/dashboard/TrendArea";
import {
  axisTick,
  BAR_TOP_RADIUS,
  CHART,
  chartMargin,
  gridProps
} from "@/components/dashboard/chart-theme";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSalesAgentOverviewQuery } from "@/hooks/queries/use-sales-agent";

function money(value: number | null) {
  if (value == null) return "Not available";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(value);
}

function count(value: number | null) {
  return value == null ? "Not available" : value;
}

const AWAITING_BACKEND = "Awaiting backend";

function PendingTag() {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
      {AWAITING_BACKEND}
    </span>
  );
}

function StatTile({
  label,
  value,
  tag
}: {
  label: string;
  value: string | number;
  tag?: string;
}) {
  return (
    <div className="rounded-2xl bg-muted/40 px-4 py-3 dark:bg-white/5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        {tag ? (
          <span className="rounded-full border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold leading-none text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            {tag}
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-heading text-xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

function SignupTrend({
  data
}: {
  data: Array<{ day: string; drivers: number; partners: number }>;
}) {
  const driverTotal = data.reduce((sum, row) => sum + row.drivers, 0);
  const partnerTotal = data.reduce((sum, row) => sum + row.partners, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-4 px-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: CHART.requested }} />
          Drivers {driverTotal.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: CHART.sage }} />
          Partners {partnerTotal.toLocaleString()}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              tick={axisTick}
              minTickGap={28}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={axisTick}
              width={32}
              allowDecimals={false}
            />
            <Tooltip
              content={<AnalyticsTooltip />}
              cursor={{ stroke: CHART.grid, strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Line
              type="monotone"
              dataKey="drivers"
              name="Drivers"
              stroke={CHART.requested}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: CHART.requested, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: CHART.requested, stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="partners"
              name="Partners"
              stroke={CHART.sage}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: CHART.sage, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: CHART.sage, stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function VerificationBars({
  data
}: {
  data: Array<{ day: string; count: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={chartMargin}>
        <CartesianGrid {...gridProps} />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          tick={axisTick}
          minTickGap={28}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          tick={axisTick}
          width={32}
          allowDecimals={false}
        />
        <Tooltip
          content={<AnalyticsTooltip />}
          cursor={{ fill: "rgba(148,163,184,0.12)" }}
        />
        <Bar
          dataKey="count"
          name="Verifications"
          fill={CHART.requested}
          radius={BAR_TOP_RADIUS}
          maxBarSize={18}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function AgentDashboardPage() {
  const { data, isLoading, error } = useSalesAgentOverviewQuery();
  const [chartTab, setChartTab] = useState("signups");
  const loading = isLoading && !data;
  const failed = Boolean(error);
  const unsupported = new Set(data?.unsupportedMetrics ?? []);
  const pendingPaid = unsupported.has("paidVerificationCount");
  const pendingUnverified = unsupported.has("unverifiedPaymentTotal");
  const pendingOther = unsupported.has("otherPaymentTotal");

  const signupDays = data?.signupDays ?? [];
  const signupGraph = data?.signupGraph ?? [];
  const verificationGraph = (data?.verificationGraph ?? []).map((point) => ({
    day: point.label,
    count: point.value
  }));
  const paymentGraph = (data?.paymentGraph ?? []).map((point) => ({
    day: point.label,
    count: point.value
  }));

  const partnerSpark = useMemo(
    () => signupDays.map((row) => ({ day: row.day, count: row.partners })),
    [signupDays]
  );
  const driverSpark = useMemo(
    () => signupDays.map((row) => ({ day: row.day, count: row.drivers })),
    [signupDays]
  );

  const chartPending =
    (chartTab === "signups" && signupGraph.length === 0 && signupDays.length === 0) ||
    (chartTab === "verifications" && verificationGraph.length === 0) ||
    (chartTab === "payments" && paymentGraph.length === 0);

  return (
    <AppShell title="Agent Dashboard">
      <PageContainer>
        {error ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            label="Partners registered"
            value={failed ? "Not available" : count(data?.referredPartnerCount ?? null)}
            hint="Referred by you"
            icon={Handshake}
            loading={loading}
            chart={failed ? undefined : <Sparkline data={partnerSpark} />}
          />
          <MetricCard
            label="Drivers registered"
            value={failed ? "Not available" : count(data?.referredDriverCount ?? null)}
            hint="Referred by you"
            icon={Users}
            loading={loading}
            chart={failed ? undefined : <Sparkline data={driverSpark} />}
          />
          <MetricCard
            label="Verified drivers"
            value={failed ? "Not available" : count(data?.verifiedDriverCount ?? null)}
            hint="Verified status"
            icon={UserPlus}
            loading={loading}
            chart={
              failed ? undefined : <SparkBars values={verificationGraph.map((row) => row.count)} />
            }
          />
          <MetricCard
            label="Total payments"
            value={failed ? "Not available" : money(data?.totalCommissionAmount ?? null)}
            hint="All commissions"
            tone="brand"
            icon={BadgeDollarSign}
            loading={loading}
            chart={
              failed ? undefined : (
                <Sparkline data={paymentGraph} variant="onBrand" />
              )
            }
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="glass-panel rounded-[2rem] px-6 py-5 sm:px-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading text-lg font-semibold tracking-tight">Verifications</h3>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <StatTile
                label="AI"
                value={failed ? "Not available" : count(data?.aiVerifiedCount ?? null)}
              />
              <StatTile
                label="System"
                value={failed ? "Not available" : count(data?.systemVerifiedCount ?? null)}
              />
              <StatTile
                label="Paid"
                value={
                  failed
                    ? "Not available"
                    : pendingPaid
                      ? "—"
                      : count(data?.paidVerificationCount ?? null)
                }
                tag={failed ? undefined : pendingPaid ? AWAITING_BACKEND : undefined}
              />
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] px-6 py-5 sm:px-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading text-lg font-semibold tracking-tight">Payments</h3>
              <BadgeCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatTile
                label="Pending"
                value={failed ? "Not available" : money(data?.pendingCommissionTotal ?? null)}
              />
              <StatTile
                label="Released"
                value={failed ? "Not available" : money(data?.releasedCommissionTotal ?? null)}
              />
              <StatTile
                label="Unverified"
                value={
                  failed
                    ? "Not available"
                    : pendingUnverified
                      ? "—"
                      : money(data?.unverifiedPaymentTotal ?? null)
                }
                tag={failed ? undefined : pendingUnverified ? AWAITING_BACKEND : undefined}
              />
              <StatTile
                label="Other"
                value={
                  failed
                    ? "Not available"
                    : pendingOther
                      ? "—"
                      : money(data?.otherPaymentTotal ?? null)
                }
                tag={failed ? undefined : pendingOther ? AWAITING_BACKEND : undefined}
              />
            </div>
          </section>
        </div>

        <Tabs value={chartTab} onValueChange={setChartTab}>
          <ChartCard
            title="Activity"
            description={
              chartTab === "signups"
                ? data?.totalDriverSignups != null || data?.totalPartnerSignups != null
                  ? `Drivers ${data.totalDriverSignups ?? 0} · Partners ${data.totalPartnerSignups ?? 0}`
                  : "Driver and partner signups referred by you"
                : chartTab === "verifications"
                  ? "Daily verification counts"
                  : "Daily commission amounts"
            }
            badge={!loading && !failed && chartPending ? <PendingTag /> : undefined}
            action={
              <TabsList className="h-9">
                <TabsTrigger value="signups" className="px-2.5 text-xs sm:px-3.5 sm:text-sm">
                  Registrations
                </TabsTrigger>
                <TabsTrigger value="verifications" className="px-2.5 text-xs sm:px-3.5 sm:text-sm">
                  Verifications
                </TabsTrigger>
                <TabsTrigger value="payments" className="px-2.5 text-xs sm:px-3.5 sm:text-sm">
                  Payments
                </TabsTrigger>
              </TabsList>
            }
            loading={loading}
            unavailable={failed}
            empty={false}
            heightClass="h-64 sm:h-80"
          >
            {chartTab === "signups" ? (
              signupDays.length > 0 ? (
                <SignupTrend data={signupDays} />
              ) : (
                <TrendArea
                  data={signupGraph.map((point) => ({ day: point.label, count: point.value }))}
                  xKey="day"
                  yKey="count"
                  name="Signups"
                />
              )
            ) : null}
            {chartTab === "verifications" ? (
              <VerificationBars data={verificationGraph} />
            ) : null}
            {chartTab === "payments" ? (
              <TrendArea data={paymentGraph} xKey="day" yKey="count" name="Payments" />
            ) : null}
          </ChartCard>
        </Tabs>
      </PageContainer>
    </AppShell>
  );
}
