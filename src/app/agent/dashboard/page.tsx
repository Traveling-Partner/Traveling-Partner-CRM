"use client";

import { useMemo } from "react";
import { BadgeDollarSign, UserPlus, Handshake, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { RoleKpiCard } from "@/components/role-workspace/RoleDashboardWidgets";
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
  const pendingCommission = useMemo(
    () =>
      myCommissions
        .filter((c) => c.status === "PENDING")
        .reduce((acc, c) => acc + c.amount, 0),
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
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <RoleKpiCard
            label="My Commission"
            value={currency(totalCommission)}
            hint={`${myCommissions.length} pay periods`}
            tone="brand"
            icon={BadgeDollarSign}
          />
          <RoleKpiCard
            label="Drivers Onboarded"
            value={myDrivers.length}
            hint="Created by you"
            icon={UserPlus}
          />
          <RoleKpiCard
            label="Partners Onboarded"
            value={myPartners.length}
            hint="Created by you"
            icon={Handshake}
          />
          <RoleKpiCard
            label="Pending Commission"
            value={currency(pendingCommission)}
            hint="Awaiting payout"
            tone="warning"
            icon={Wallet}
          />
        </div>

        <SectionCard
          title="Recent activity"
          description="Your recent actions in the portal."
        >
          {recentActivity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Your onboarding and approval actions will appear here."
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{log.action}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {log.entityType} • {log.entityId}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
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
