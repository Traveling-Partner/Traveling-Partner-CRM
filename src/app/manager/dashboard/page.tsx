"use client";

import { Briefcase, TrendingUp, Users, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import {
  ActivityList,
  MiniMetric,
  RoleKpiCard,
  SimpleBarChart
} from "@/components/role-workspace/RoleDashboardWidgets";
import {
  formatCurrency,
  managerActivities,
  managerKpis,
  salesMonthlySeries
} from "@/mock-data/role-workspaces";

export default function ManagerDashboardPage() {
  return (
    <AppShell title="Manager Dashboard" wideContent>
      <PageContainer>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RoleKpiCard
            label="Revenue"
            value={formatCurrency(managerKpis.revenue)}
            tone="brand"
            icon={Wallet}
          />
          <RoleKpiCard label="Users" value={managerKpis.users} icon={Users} />
          <RoleKpiCard label="Projects" value={managerKpis.projects} icon={Briefcase} />
          <RoleKpiCard
            label="Sales"
            value={formatCurrency(managerKpis.sales)}
            tone="success"
            icon={TrendingUp}
          />
        </div>

        <SectionCard title="Business summary" description="Operational KPIs">
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <MiniMetric label="Active drivers" value={managerKpis.activeDrivers} />
            <MiniMetric label="Active partners" value={managerKpis.activePartners} />
          </div>
          <SimpleBarChart data={salesMonthlySeries} valueKey="revenue" />
        </SectionCard>

        <SectionCard title="Recent activity" description="Management actions">
          <ActivityList items={managerActivities} />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
