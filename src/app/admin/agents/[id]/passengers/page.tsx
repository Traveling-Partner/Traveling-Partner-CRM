"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentPassengersTable } from "@/components/admin/agents/AgentOnboardingTables";
import { useAgentDetailQuery } from "@/hooks/queries/use-agent-detail-query";
import { getAgentPartners } from "@/lib/agent-onboarding";

export default function AdminAgentPassengersPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: agent, isLoading, isError } = useAgentDetailQuery(params.id);
  const agentPassengers = useMemo(() => getAgentPartners(params.id), [params.id]);

  if (!isLoading && (isError || !agent)) {
    return (
      <AppShell title="Agent passengers">
        <PageContainer>
          <EmptyState
            title="Agent not found"
            description="This agent could not be loaded."
            actionLabel="Back to performance"
            onActionClick={() => router.push("/admin/agent-performance")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Passengers • ${agent?.name || "—"}`} wideContent>
      <PageContainer>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/agent-performance" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to overview
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/agents/${params.id}`}>View performance</Link>
          </Button>
        </div>

        <SectionCard
          title="Passengers onboarded"
          description={`Complete list of passengers added by ${agent?.name || "this agent"}.`}
        >
          {isLoading ? (
            <div className="space-y-2 py-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <AgentPassengersTable passengers={agentPassengers} />
          )}
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
