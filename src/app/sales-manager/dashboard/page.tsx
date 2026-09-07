"use client";

import { BadgeDollarSign, Users, TrendingUp, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ActivityList,
  MiniMetric,
  RoleKpiCard,
  SimpleBarChart
} from "@/components/role-workspace/RoleDashboardWidgets";
import {
  formatCurrency,
  salesManagerActivities,
  salesManagerKpis,
  salesMonthlySeries,
  topPerformingAgents
} from "@/mock-data/role-workspaces";
import type { ColumnDef } from "@tanstack/react-table";

type AgentRow = (typeof topPerformingAgents)[number];

const agentColumns: ColumnDef<AgentRow>[] = [
  { accessorKey: "name", header: "Agent" },
  {
    accessorKey: "sales",
    header: "Sales",
    cell: ({ row }) => formatCurrency(row.original.sales)
  },
  {
    accessorKey: "commission",
    header: "Commission",
    cell: ({ row }) => formatCurrency(row.original.commission)
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />
  }
];

export default function SalesManagerDashboardPage() {
  return (
    <AppShell title="Sales Manager Dashboard" wideContent>
      <PageContainer>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RoleKpiCard
            label="Total sales"
            value={formatCurrency(salesManagerKpis.totalSales)}
            hint="YTD bookings value"
            tone="brand"
            icon={TrendingUp}
          />
          <RoleKpiCard
            label="Monthly revenue"
            value={formatCurrency(salesManagerKpis.monthlyRevenue)}
            hint="Current month"
            icon={Wallet}
          />
          <RoleKpiCard
            label="Active sales agents"
            value={salesManagerKpis.activeAgents}
            hint="Currently active"
            icon={Users}
          />
          <RoleKpiCard
            label="Pending commissions"
            value={formatCurrency(salesManagerKpis.pendingCommissions)}
            hint={`Paid ${formatCurrency(salesManagerKpis.commissionPaid)}`}
            tone="warning"
            icon={BadgeDollarSign}
          />
        </div>

        <SectionCard
          title="Revenue analytics"
          description="Monthly revenue performance"
        >
          <SimpleBarChart data={salesMonthlySeries} valueKey="revenue" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniMetric label="Conversion" value={`${salesManagerKpis.conversionRate}%`} />
            <MiniMetric label="Sales (Jul)" value={salesMonthlySeries.at(-1)?.sales ?? "—"} />
            <MiniMetric
              label="Growth"
              value="+8.2%"
              accent="text-emerald-600 dark:text-emerald-400"
            />
          </div>
        </SectionCard>

        <SectionCard title="Recent activities" description="Sales ops timeline">
          <ActivityList items={salesManagerActivities} />
        </SectionCard>

        <SectionCard
          title="Top performing agents"
          description="Leaders by sales this month"
        >
          <DataTable columns={agentColumns} data={topPerformingAgents} />
        </SectionCard>

        <SectionCard
          title="Commission overview"
          description="Paid vs pending snapshot"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric
              label="Pending"
              value={formatCurrency(salesManagerKpis.pendingCommissions)}
              accent="text-amber-600 dark:text-amber-400"
            />
            <MiniMetric
              label="Paid"
              value={formatCurrency(salesManagerKpis.commissionPaid)}
              accent="text-emerald-600 dark:text-emerald-400"
            />
            <MiniMetric
              label="Total tracked"
              value={formatCurrency(
                salesManagerKpis.pendingCommissions + salesManagerKpis.commissionPaid
              )}
            />
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
