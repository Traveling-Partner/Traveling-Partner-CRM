"use client";

import { BadgeDollarSign, Users, TrendingUp, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ActivityList,
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            tone="brand"
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

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Revenue analytics"
            description="Monthly revenue performance"
            className="lg:col-span-2"
          >
            <SimpleBarChart data={salesMonthlySeries} valueKey="revenue" />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
                <p className="text-muted-foreground">Conversion</p>
                <p className="font-heading font-semibold">{salesManagerKpis.conversionRate}%</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
                <p className="text-muted-foreground">Sales (Jul)</p>
                <p className="font-heading font-semibold">{salesMonthlySeries.at(-1)?.sales}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
                <p className="text-muted-foreground">Growth</p>
                <p className="font-heading font-semibold text-emerald-600">+8.2%</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Recent activities" description="Sales ops timeline">
            <ActivityList items={salesManagerActivities} />
          </SectionCard>
        </div>

        <SectionCard
          title="Top performing agents"
          description="Leaders by sales this month"
          className="mt-4"
        >
          <DataTable columns={agentColumns} data={topPerformingAgents} />
        </SectionCard>

        <SectionCard
          title="Commission overview"
          description="Paid vs pending snapshot"
          className="mt-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="mt-1 text-xl font-heading font-semibold text-amber-600">
                {formatCurrency(salesManagerKpis.pendingCommissions)}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="mt-1 text-xl font-heading font-semibold text-emerald-600">
                {formatCurrency(salesManagerKpis.commissionPaid)}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Total tracked</p>
              <p className="mt-1 text-xl font-heading font-semibold">
                {formatCurrency(
                  salesManagerKpis.pendingCommissions + salesManagerKpis.commissionPaid
                )}
              </p>
            </div>
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
