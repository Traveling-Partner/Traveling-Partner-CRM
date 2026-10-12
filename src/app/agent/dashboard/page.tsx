"use client";

import {
  BadgeCheck,
  BadgeDollarSign,
  CircleDollarSign,
  CreditCard,
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

const AWAITING_BACKEND = "Awaiting backend";

function PendingTag() {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
      {AWAITING_BACKEND}
    </span>
  );
}

export default function AgentDashboardPage() {
  const { data, isLoading, error } = useSalesAgentOverviewQuery();
  const loading = isLoading && !data;
  const failed = Boolean(error);
  const unsupported = new Set(data?.unsupportedMetrics ?? []);
  const pendingPaid = unsupported.has("paidVerificationCount");
  const pendingUnverified = unsupported.has("unverifiedPaymentTotal");
  const pendingOther = unsupported.has("otherPaymentTotal");

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
          <MetricCard
            label="Paid verifications"
            value={
              failed
                ? "Not available"
                : pendingPaid
                  ? "—"
                  : count(data?.paidVerificationCount ?? null)
            }
            hint="Paid verification count"
            icon={CreditCard}
            loading={loading}
            tag={failed ? undefined : pendingPaid ? AWAITING_BACKEND : undefined}
          />
          <MetricCard
            label="Unverified payments"
            value={
              failed
                ? "Not available"
                : pendingUnverified
                  ? "—"
                  : money(data?.unverifiedPaymentTotal ?? null)
            }
            hint="Not yet verified"
            icon={Wallet}
            loading={loading}
            tag={failed ? undefined : pendingUnverified ? AWAITING_BACKEND : undefined}
          />
          <MetricCard
            label="Other payments"
            value={
              failed
                ? "Not available"
                : pendingOther
                  ? "—"
                  : money(data?.otherPaymentTotal ?? null)
            }
            hint="Other commission totals"
            icon={CircleDollarSign}
            loading={loading}
            tag={failed ? undefined : pendingOther ? AWAITING_BACKEND : undefined}
          />
        </div>

        <ChartCard
          title="Registrations"
          description={
            data?.totalDriverSignups != null || data?.totalPartnerSignups != null
              ? `Drivers ${data.totalDriverSignups ?? 0} · Partners ${data.totalPartnerSignups ?? 0}`
              : "Driver and partner signups referred by you"
          }
          badge={
            !loading && !failed && (data?.signupGraph.length ?? 0) === 0 ? (
              <PendingTag />
            ) : undefined
          }
          loading={loading}
          unavailable={failed}
          empty={false}
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

        <ChartCard
          title="Verifications"
          description="Daily verification counts"
          badge={
            !loading && !failed && (data?.verificationGraph.length ?? 0) === 0 ? (
              <PendingTag />
            ) : undefined
          }
          loading={loading}
          unavailable={failed}
          empty={false}
          heightClass="h-56 sm:h-72"
        >
          <TrendArea
            data={(data?.verificationGraph ?? []).map((point) => ({
              day: point.label,
              count: point.value
            }))}
            xKey="day"
            yKey="count"
            name="Verifications"
          />
        </ChartCard>

        <ChartCard
          title="Payments"
          description="Daily commission amounts"
          badge={
            !loading && !failed && (data?.paymentGraph.length ?? 0) === 0 ? (
              <PendingTag />
            ) : undefined
          }
          loading={loading}
          unavailable={failed}
          empty={false}
          heightClass="h-56 sm:h-72"
        >
          <TrendArea
            data={(data?.paymentGraph ?? []).map((point) => ({
              day: point.label,
              count: point.value
            }))}
            xKey="day"
            yKey="count"
            name="Payments"
          />
        </ChartCard>
      </PageContainer>
    </AppShell>
  );
}
