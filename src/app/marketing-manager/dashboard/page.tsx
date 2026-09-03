"use client";

import { CalendarDays, Eye, FileText, Megaphone } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import {
  ActivityList,
  MiniMetric,
  RoleKpiCard
} from "@/components/role-workspace/RoleDashboardWidgets";
import {
  marketingActivities,
  marketingContentRows,
  marketingKpis
} from "@/mock-data/role-workspaces";

export default function MarketingManagerDashboardPage() {
  const published = marketingContentRows.filter((c) => c.status === "PUBLISHED").length;
  const pending = marketingContentRows.filter((c) => c.status === "PENDING").length;
  const scheduled = marketingContentRows.filter((c) => c.status === "SCHEDULED").length;

  return (
    <AppShell title="Marketing Manager Dashboard" wideContent>
      <PageContainer>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RoleKpiCard label="Campaigns" value={marketingKpis.campaigns} tone="brand" icon={Megaphone} />
          <RoleKpiCard label="Published content" value={published || marketingKpis.published} icon={FileText} />
          <RoleKpiCard label="Pending review" value={pending || marketingKpis.pending} tone="warning" icon={Eye} />
          <RoleKpiCard label="Scheduled" value={scheduled || marketingKpis.scheduled} icon={CalendarDays} />
        </div>

        <SectionCard title="Performance metrics" description="Engagement and reach">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric label="Engagement rate" value={`${marketingKpis.engagementRate}%`} />
            <MiniMetric label="Reach" value={marketingKpis.reach.toLocaleString()} />
            <MiniMetric label="Social posts (30d)" value={86} />
          </div>
          <div className="mt-4 rounded-[1.5rem] bg-[#f3f4f6] px-4 py-3.5 text-sm text-muted-foreground dark:bg-white/5">
            Content calendar snapshot: {scheduled} items scheduled this week · {pending} awaiting approval ·{" "}
            {published} live.
          </div>
        </SectionCard>

        <SectionCard title="Recent activities" description="Marketing ops">
          <ActivityList items={marketingActivities} />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
