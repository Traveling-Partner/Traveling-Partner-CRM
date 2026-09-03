"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { AuditLogsSection } from "@/components/audit-logs/AuditLogsSection";

export default function AdminAuditLogsPage() {
  return (
    <AppShell title="Audit Logs">
      <PageContainer>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading audit logs…</p>}>
          <AuditLogsSection />
        </Suspense>
      </PageContainer>
    </AppShell>
  );
}
