"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Pencil, Users, UserCircle, BadgeDollarSign } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { useApiMutation } from "@/hooks/api";
import {
  AgentDriversTable,
  AgentPassengersTable
} from "@/components/admin/agents/AgentOnboardingTables";
import { useAgentDetailQuery } from "@/hooks/queries/use-agent-detail-query";
import { queryKeys } from "@/lib/api/query-keys";
import { updateUserStatus } from "@/services/users";
import {
  formatAgentCurrency,
  formatAgentDate,
  getAgentDrivers,
  getAgentJoiningDate,
  getAgentLastPaymentDate,
  getAgentPartners,
  getAgentPaymentSummary
} from "@/lib/agent-onboarding";
import type { Commission } from "@/types/domain";

export default function AdminAgentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: agent, isLoading, isError } = useAgentDetailQuery(params.id);
  const loading = isLoading;
  const { success, error: showError } = useToast();
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);
  const agentStatus = optimisticStatus ?? agent?.status;
  const isBlocked = String(agentStatus || "").toUpperCase() === "BLOCKED";
  const nextStatus = isBlocked ? "ACTIVE" : "BLOCKED";

  const statusMutation = useApiMutation<void, { userId: number; status: string }>({
    mutationFn: ({ token, variables }) =>
      updateUserStatus(variables.userId, variables.status, { token }),
    invalidateKeys: [queryKeys.users.agentDetail(params.id), queryKeys.users.all],
    onSuccess: (_data, variables) => {
      setOptimisticStatus(variables.status);
      success(variables.status === "BLOCKED" ? "Agent blocked." : "Agent unblocked.");
      setStatusConfirmOpen(false);
    },
    onError: (err) => showError(err.message)
  });
  const fallbackCnicImage = "/mock-images/id-document.svg";

  const agentDrivers = useMemo(() => getAgentDrivers(params.id), [params.id]);
  const agentPassengers = useMemo(() => getAgentPartners(params.id), [params.id]);
  const paymentSummary = useMemo(() => getAgentPaymentSummary(params.id), [params.id]);
  const lastPaymentDate = useMemo(() => getAgentLastPaymentDate(params.id), [params.id]);
  const joiningDate = useMemo(
    () => getAgentJoiningDate(params.id, agent?.createdAt),
    [params.id, agent?.createdAt]
  );

  const commissionColumns: ColumnDef<Commission>[] = [
    {
      accessorKey: "month",
      header: "Month",
      cell: ({ row }) =>
        new Date(row.original.month + "-01").toLocaleDateString("en-US", {
          month: "long",
          year: "numeric"
        })
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-heading font-semibold">
          {formatAgentCurrency(row.original.amount)}
        </span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status === "PAID" ? "APPROVED" : "PENDING"} />
      )
    },
    {
      accessorKey: "createdAt",
      header: "Recorded",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  if (!loading && (isError || !agent)) {
    return (
      <AppShell title="Agent detail">
        <PageContainer>
          <EmptyState
            title="Agent not found"
            description="This agent could not be loaded from backend."
            actionLabel="Back to agents"
            onActionClick={() => router.push("/admin/agents")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Agent • ${agent?.name || "—"}`} wideContent>
      <PageContainer>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/agent-performance" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to performance
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button size="sm" asChild>
              <Link href={`/admin/agents/${params.id}/edit`} className="gap-1.5">
                <Pencil className="h-4 w-4" />
                Edit agent
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm">
            <CardContent className="flex items-start gap-3 pt-4">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Drivers added
                </p>
                <p className="text-2xl font-heading font-semibold">{agentDrivers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardContent className="flex items-start gap-3 pt-4">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                <UserCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Passengers added
                </p>
                <p className="text-2xl font-heading font-semibold">{agentPassengers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardContent className="flex items-start gap-3 pt-4">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Paid to agent
                </p>
                <p className="text-2xl font-heading font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatAgentCurrency(paymentSummary.paid)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardContent className="flex items-start gap-3 pt-4">
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Remaining balance
                </p>
                <p className="text-2xl font-heading font-semibold text-amber-600 dark:text-amber-400">
                  {formatAgentCurrency(paymentSummary.remaining)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Agent profile"
            description="Contact and status"
            className="lg:col-span-2"
          >
            {loading ? (
              <Skeleton className="h-32 w-full rounded-lg" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                  <p className="mt-0.5 font-heading font-medium">{agent?.name || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                  <p className="mt-0.5 font-heading font-medium">{agent?.email || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                  <p className="mt-0.5 font-heading font-medium">{agent?.mobileNumber || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Agent ID</p>
                  <p className="mt-0.5 font-heading font-medium tabular-nums">{params.id}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Joining date</p>
                  <p className="mt-0.5 font-heading font-medium">{formatAgentDate(joiningDate)}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last payment</p>
                  <p className="mt-0.5 font-heading font-medium">{formatAgentDate(lastPaymentDate)}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={agentStatus || "PENDING"} />
                  </div>
                </div>
              </div>
            )}
            {!loading && agent ? (
              <div className="mt-4 flex justify-end">
                <Button
                  variant={isBlocked ? "default" : "destructive"}
                  disabled={statusMutation.isPending}
                  onClick={() => setStatusConfirmOpen(true)}
                >
                  {isBlocked ? "Unblock" : "Block"}
                </Button>
              </div>
            ) : null}
          </SectionCard>
          <SectionCard title="Payment summary" description="Commission totals">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Total earned</span>
                <span className="font-heading font-semibold">
                  {formatAgentCurrency(paymentSummary.total)}
                </span>
              </div>
              <div className="flex justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-heading font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatAgentCurrency(paymentSummary.paid)}
                </span>
              </div>
              <div className="flex justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-heading font-semibold text-amber-600 dark:text-amber-400">
                  {formatAgentCurrency(paymentSummary.remaining)}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Onboarded users"
          description="Complete list of drivers and passengers added by this agent."
          className="mt-4"
        >
          <Tabs defaultValue="drivers">
            <TabsList className="mb-4">
              <TabsTrigger value="drivers">Drivers ({agentDrivers.length})</TabsTrigger>
              <TabsTrigger value="passengers">Passengers ({agentPassengers.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="drivers">
              <AgentDriversTable drivers={agentDrivers} />
            </TabsContent>
            <TabsContent value="passengers">
              <AgentPassengersTable passengers={agentPassengers} />
            </TabsContent>
          </Tabs>
        </SectionCard>

        <SectionCard
          title="Payment history"
          description="Commission payments recorded for this agent."
          className="mt-4"
        >
          {paymentSummary.commissions.length === 0 ? (
            <EmptyState
              title="No payments recorded"
              description="Commission payouts for this agent will appear here."
            />
          ) : (
            <DataTable columns={commissionColumns} data={paymentSummary.commissions} />
          )}
        </SectionCard>

        <SectionCard
          title="CNIC documents"
          description="Front and back CNIC images from agent profile."
          className="mt-4"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                CNIC Front
              </p>
              <div className="h-56 overflow-hidden rounded-md border border-border/60 bg-background">
                <img
                  src={agent?.cnicFront || fallbackCnicImage}
                  alt="CNIC Front"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackCnicImage;
                  }}
                />
              </div>
              <p className="mt-2 truncate text-xs text-muted-foreground">
                {agent?.cnicFront || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                CNIC Back
              </p>
              <div className="h-56 overflow-hidden rounded-md border border-border/60 bg-background">
                <img
                  src={agent?.cnicBack || fallbackCnicImage}
                  alt="CNIC Back"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackCnicImage;
                  }}
                />
              </div>
              <p className="mt-2 truncate text-xs text-muted-foreground">
                {agent?.cnicBack || "—"}
              </p>
            </div>
          </div>
        </SectionCard>
        <ConfirmDialog
          open={statusConfirmOpen}
          onOpenChange={setStatusConfirmOpen}
          onConfirm={() => {
            if (!agent) return;
            statusMutation.mutate({ userId: agent.id, status: nextStatus });
          }}
          title={isBlocked ? "Unblock agent?" : "Block agent?"}
          description={
            agent
              ? isBlocked
                ? `Unblock "${agent.name || "this agent"}"?`
                : `Block "${agent.name || "this agent"}"? They will not be able to use the app.`
              : undefined
          }
          confirmLabel={statusMutation.isPending ? "Updating..." : isBlocked ? "Unblock" : "Block"}
          destructive={!isBlocked}
        />
      </PageContainer>
    </AppShell>
  );
}
