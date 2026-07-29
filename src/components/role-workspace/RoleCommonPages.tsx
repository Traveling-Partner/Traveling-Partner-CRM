"use client";

import { useAuthStore } from "@/store/auth.store";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS } from "@/lib/roles";
import { toAppRole } from "@/lib/rbac";

export function RoleProfilePage({ title }: { title: string }) {
  const user = useAuthStore((s) => s.user);
  const role = toAppRole(user?.role);

  return (
    <AppShell title={title}>
      <PageContainer>
        <SectionCard title="Profile" description="Your account details from the signed-in session.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={user?.name || "—"} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email || "—"} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile</Label>
              <Input value={user?.mobileNumber || "—"} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input value={role ? ROLE_LABELS[role] : user?.role || "—"} readOnly />
            </div>
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}

export function RoleSettingsPage({ title }: { title: string }) {
  return (
    <AppShell title={title}>
      <PageContainer>
        <SectionCard
          title="Workspace settings"
          description="Notification and preference controls for this role workspace."
        >
          <div className="space-y-4 text-sm">
            <label className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              <span>Email digests</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              <span>Push notifications</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              <span>Weekly performance summary</span>
              <input type="checkbox" className="h-4 w-4" />
            </label>
            <Button type="button">Save preferences</Button>
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}

export function RoleNotificationsPage({ title }: { title: string }) {
  const items = [
    { id: "1", title: "System notice", body: "Your workspace preferences were updated.", at: "2h ago" },
    { id: "2", title: "Approval needed", body: "There are items waiting for your review.", at: "5h ago" },
    { id: "3", title: "Weekly digest", body: "Your weekly summary is ready.", at: "1d ago" }
  ];

  return (
    <AppShell title={title}>
      <PageContainer>
        <SectionCard title="Notifications" description="Recent alerts for your role.">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <span className="text-[11px] text-muted-foreground">{item.at}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
