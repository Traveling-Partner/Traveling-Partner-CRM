"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { marketingContentRows } from "@/mock-data/role-workspaces";

export default function MarketingCalendarPage() {
  const scheduled = marketingContentRows.filter((c) => c.status === "SCHEDULED" || c.status === "PENDING");

  return (
    <AppShell title="Content calendar">
      <PageContainer>
        <SectionCard title="Content calendar" description="Upcoming and pending marketing items.">
          <div className="space-y-2">
            {scheduled.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category} · {item.status}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{item.updatedAt}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
