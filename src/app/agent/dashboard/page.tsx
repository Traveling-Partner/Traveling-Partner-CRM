"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuthStore } from "@/store/auth.store";
import { drivers } from "@/mock-data/drivers";
import { partners } from "@/mock-data/partners";
import { commissions } from "@/mock-data/commissions";
import { auditLogs } from "@/mock-data/audit-logs";
import { format, parseISO } from "date-fns";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

export default function AgentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const agentId = user?.id ?? "";

  const myDrivers = useMemo(
    () => drivers.filter((d) => d.createdByAgentId === agentId),
    [agentId]
  );
  const myPartners = useMemo(
    () => partners.filter((p) => p.createdByAgentId === agentId),
    [agentId]
  );
  const myCommissions = useMemo(
    () => commissions.filter((c) => c.agentId === agentId),
    [agentId]
  );
  const totalCommission = useMemo(
    () => myCommissions.reduce((acc, c) => acc + c.amount, 0),
    [myCommissions]
  );
  const recentActivity = useMemo(
    () =>
      auditLogs
        .filter((log) => log.actorId === agentId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 8),
    [agentId]
  );

  if (!user) return null;

  return (
    <AppShell title="Agent Dashboard">
      <PageContainer>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-md">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide">
                My Commission
              </p>
              <p className="text-2xl font-heading font-semibold">
                {currency(totalCommission)}
              </p>
              <p className="text-[0.7rem] opacity-90">
                {myCommissions.length} pay periods
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-md">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide">
                Drivers Onboarded
              </p>
              <p className="text-2xl font-heading font-semibold">
                {myDrivers.length}
              </p>
              <p className="text-[0.7rem] opacity-90">
                Created by you
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-md">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide">
                Partners Onboarded
              </p>
              <p className="text-2xl font-heading font-semibold">
                {myPartners.length}
              </p>
              <p className="text-[0.7rem] opacity-90">
                Created by you
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/80 bg-card shadow-md">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pending Commission
              </p>
              <p className="text-xl font-heading font-semibold">
                {currency(
                  myCommissions
                    .filter((c) => c.status === "PENDING")
                    .reduce((acc, c) => acc + c.amount, 0)
                )}
              </p>
              <p className="text-[0.7rem] text-muted-foreground">
                Awaiting payout
              </p>
            </CardContent>
          </Card>
        </div>

        <SectionCard
          title="Recent activity"
          description="Your recent actions in the portal."
          className="mt-6"
        >
          {recentActivity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Your onboarding and approval actions will appear here."
            />
          ) : (
            <div className="space-y-3">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs transition-colors hover:bg-muted/60"
                >
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      {log.entityType} • {log.entityId}
                    </p>
                  </div>
                  <span className="text-[0.7rem] text-muted-foreground">
                    {format(parseISO(log.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
