"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { AuditLogsSection } from "@/components/audit-logs/AuditLogsSection";

export default function AdminAuditLogsPage() {
  return (
    <AppShell title="Audit Logs">
      <PageContainer>
        <AuditLogsSection />
      </PageContainer>
    </AppShell>
  );
}
