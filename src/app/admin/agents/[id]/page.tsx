"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { agents } from "@/mock-data/agents";
import { drivers } from "@/mock-data/drivers";
import { partners } from "@/mock-data/partners";
import { commissions } from "@/mock-data/commissions";

export default function AdminAgentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const agent = useMemo(
    () => agents.find((a) => a.id === params.id),
    [params.id]
  );

  const myDrivers = useMemo(
    () => drivers.filter((d) => d.createdByAgentId === params.id),
    [params.id]
  );
  const myPartners = useMemo(
    () => partners.filter((p) => p.createdByAgentId === params.id),
    [params.id]
  );
  const myCommissions = useMemo(
    () =>
      commissions
        .filter((c) => c.agentId === params.id)
        .sort(
          (a, b) =>
            new Date(b.month).getTime() - new Date(a.month).getTime()
        )
        .slice(0, 6)
        .reverse()
        .map((c) => ({
          month: new Date(c.month + "-01").toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit"
          }),
          amount: c.amount
        })),
    [params.id]
  );

  if (!agent) {
    return (
      <AppShell title="Agent detail">
        <PageContainer>
          <EmptyState
            title="Agent not found"
            description="This agent id does not exist in the mock dataset."
            actionLabel="Back to agents"
            onActionClick={() => router.push("/admin/agents")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Agent • ${agent.name}`}>
      <PageContainer>
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/agents" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to agents
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Agent profile"
            description="Contact and status"
            className="lg:col-span-2"
          >
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                <p className="mt-0.5 font-heading font-medium">{agent.name}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="mt-0.5 font-heading font-medium">{agent.email}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                <p className="mt-0.5 font-heading font-medium">{agent.phone}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                <div className="mt-0.5">
                  <StatusBadge status={agent.status} />
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Commission rate</p>
                <p className="mt-0.5 font-heading font-medium">{agent.commissionRate}%</p>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Performance" description="Onboarded counts">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Drivers onboarded</span>
                <span className="font-heading font-semibold">{myDrivers.length}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Partners onboarded</span>
                <span className="font-heading font-semibold">{myPartners.length}</span>
              </div>
            </div>
          </SectionCard>
        </div>
        <SectionCard
          title="Commission trend"
          description="Last 6 months"
          className="mt-4"
        >
          <div className="h-64">
            {myCommissions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={myCommissions}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="month" tickMargin={8} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#fdb813" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No commission data" description="Commission records will appear here." />
            )}
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
