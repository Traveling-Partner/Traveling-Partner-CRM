"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { RoleKpiCard, SimpleBarChart } from "@/components/role-workspace/RoleDashboardWidgets";
import { marketingKpis } from "@/mock-data/role-workspaces";

const series = [
  { month: "Feb", revenue: 42 },
  { month: "Mar", revenue: 55 },
  { month: "Apr", revenue: 61 },
  { month: "May", revenue: 58 },
  { month: "Jun", revenue: 72 },
  { month: "Jul", revenue: 86 }
];

export default function MarketingAnalyticsPage() {
  return (
    <AppShell title="Content analytics">
      <PageContainer>
        <div className="grid gap-4 md:grid-cols-3">
          <RoleKpiCard label="Engagement" value={`${marketingKpis.engagementRate}%`} tone="brand" />
          <RoleKpiCard label="Reach" value={marketingKpis.reach.toLocaleString()} />
          <RoleKpiCard label="Published" value={marketingKpis.published} />
        </div>
        <SectionCard title="Social activity" description="Posts over the last 6 months" className="mt-4">
          <SimpleBarChart data={series} valueKey="revenue" />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
