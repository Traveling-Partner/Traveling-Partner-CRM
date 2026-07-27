"use client";

import { Briefcase, TrendingUp, Users, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import {
  ActivityList,
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <SectionCard title="Business summary" description="Operational KPIs" className="lg:col-span-2">
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Active drivers</p>
                <p className="mt-1 text-2xl font-heading font-semibold">{managerKpis.activeDrivers}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Active partners</p>
                <p className="mt-1 text-2xl font-heading font-semibold">{managerKpis.activePartners}</p>
              </div>
            </div>
            <SimpleBarChart data={salesMonthlySeries} valueKey="revenue" />
          </SectionCard>

          <SectionCard title="Recent activity" description="Management actions">
            <ActivityList items={managerActivities} />
          </SectionCard>
        </div>
      </PageContainer>
    </AppShell>
  );
}
