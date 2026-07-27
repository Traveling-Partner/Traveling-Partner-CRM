"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type AppRole } from "@/lib/roles";
import { managerUsers } from "@/mock-data/role-workspaces";

export default function ManagerUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useMemo(
    () => managerUsers.find((row) => row.id === params.id),
    [params.id]
  );

  if (!user) {
    return (
      <AppShell title="User detail">
        <PageContainer>
          <EmptyState
            title="User not found"
            description="This user is not in the demo catalog."
            actionLabel="Back to users"
            onActionClick={() => router.push("/manager/users")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title={`User • ${user.name}`}>
      <PageContainer>
        <SectionCard title="User details" description="Profile, role, and activity summary.">
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="font-medium">{ROLE_LABELS[user.role as AppRole] ?? user.role}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={user.status} />
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Last active</p>
              <p className="font-medium">{user.lastActive}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.push("/manager/users")}>
              Back to users
            </Button>
          </div>
        </SectionCard>
        <SectionCard title="Activity history" description="Recent actions for this user." className="mt-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Signed in · {user.lastActive}</li>
            <li>Profile viewed by manager</li>
            <li>Status last changed · {user.status}</li>
          </ul>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
