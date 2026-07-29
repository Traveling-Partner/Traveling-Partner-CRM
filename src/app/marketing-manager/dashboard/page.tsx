"use client";

import { CalendarDays, Eye, FileText, Megaphone } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import {
  ActivityList,
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RoleKpiCard label="Campaigns" value={marketingKpis.campaigns} tone="brand" icon={Megaphone} />
          <RoleKpiCard label="Published content" value={published || marketingKpis.published} icon={FileText} />
          <RoleKpiCard label="Pending review" value={pending || marketingKpis.pending} tone="warning" icon={Eye} />
          <RoleKpiCard label="Scheduled" value={scheduled || marketingKpis.scheduled} icon={CalendarDays} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <SectionCard title="Performance metrics" description="Engagement and reach" className="lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Engagement rate</p>
                <p className="mt-1 text-2xl font-heading font-semibold">{marketingKpis.engagementRate}%</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Reach</p>
                <p className="mt-1 text-2xl font-heading font-semibold">
                  {marketingKpis.reach.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Social posts (30d)</p>
                <p className="mt-1 text-2xl font-heading font-semibold">86</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-border/70 bg-muted/10 p-4 text-sm text-muted-foreground">
              Content calendar snapshot: {scheduled} items scheduled this week · {pending} awaiting approval ·{" "}
              {published} live.
            </div>
          </SectionCard>

          <SectionCard title="Recent activities" description="Marketing ops">
            <ActivityList items={marketingActivities} />
          </SectionCard>
        </div>
      </PageContainer>
    </AppShell>
  );
}
