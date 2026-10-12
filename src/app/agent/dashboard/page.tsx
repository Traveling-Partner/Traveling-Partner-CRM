"use client";

import {
  BadgeCheck,
  BadgeDollarSign,
  Handshake,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TrendArea } from "@/components/dashboard/TrendArea";
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

export default function AgentDashboardPage() {
  const { data, isLoading, error } = useSalesAgentOverviewQuery();
  const loading = isLoading && !data;
  const failed = Boolean(error);

  return (
    <AppShell title="Agent Dashboard">
      <PageContainer>
        {error ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message}
          </p>
        ) : null}

        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Partners registered"
            value={failed ? "Not available" : count(data?.referredPartnerCount ?? null)}
            hint="Referred by you"
            icon={Handshake}
            loading={loading}
          />
          <MetricCard
            label="Drivers registered"
            value={failed ? "Not available" : count(data?.referredDriverCount ?? null)}
            hint="Referred by you"
            icon={Users}
            loading={loading}
          />
          <MetricCard
            label="Verified drivers"
            value={failed ? "Not available" : count(data?.verifiedDriverCount ?? null)}
            hint="Verified status"
            icon={UserPlus}
            loading={loading}
          />
          <MetricCard
            label="AI verifications"
            value={failed ? "Not available" : count(data?.aiVerifiedCount ?? null)}
            hint="AI verified"
            icon={BadgeCheck}
            loading={loading}
          />
          <MetricCard
            label="System verifications"
            value={failed ? "Not available" : count(data?.systemVerifiedCount ?? null)}
            hint="System verified"
            icon={ShieldCheck}
            loading={loading}
          />
          <MetricCard
            label="Pending payments"
            value={failed ? "Not available" : money(data?.pendingCommissionTotal ?? null)}
            hint="Awaiting release"
            tone="warning"
            icon={Wallet}
            loading={loading}
          />
          <MetricCard
            label="Released payments"
            value={failed ? "Not available" : money(data?.releasedCommissionTotal ?? null)}
            hint="Paid out"
            icon={BadgeDollarSign}
            loading={loading}
          />
          <MetricCard
            label="Total payments"
            value={failed ? "Not available" : money(data?.totalCommissionAmount ?? null)}
            hint="All commissions"
            tone="brand"
            icon={BadgeDollarSign}
            loading={loading}
          />
        </div>

        <ChartCard
          title="Registrations"
          description="Signups referred by you"
          loading={loading}
          unavailable={failed}
          empty={!loading && !failed && (data?.signupGraph.length ?? 0) === 0}
          heightClass="h-56 sm:h-72"
        >
          <TrendArea
            data={(data?.signupGraph ?? []).map((point) => ({
              day: point.label,
              count: point.value
            }))}
            xKey="day"
            yKey="count"
            name="Signups"
          />
        </ChartCard>
      </PageContainer>
    </AppShell>
  );
}
