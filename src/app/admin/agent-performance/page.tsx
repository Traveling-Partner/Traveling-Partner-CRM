"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { Search, Filter } from "lucide-react";
import { useAgentsListQuery } from "@/hooks/queries/use-agents-list-query";
import {
  buildAgentPerformanceRow,
  formatAgentCurrency,
  formatAgentDate,
  type AgentPerformanceRow
} from "@/lib/agent-onboarding";

const DEFAULT_PAGE_SIZE = 10;

export default function AdminAgentPerformancePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isFetching, error } = useAgentsListQuery({
    page,
    pageSize,
    status: statusFilter,
    search
  });

  const agentRows: AgentPerformanceRow[] = useMemo(
    () => (data?.content ?? []).map(buildAgentPerformanceRow),
    [data?.content]
  );

  const totalPages = data?.totalPages ?? 1;
  const loading = isLoading || isFetching;

  const columns: ColumnDef<AgentPerformanceRow>[] = [
    {
      accessorKey: "name",
      header: "Agent name",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.name || "—"}</span>
      )
    },
    {
      accessorKey: "id",
      header: "Agent ID",
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          {row.original.id}
        </span>
      )
    },
    {
      accessorKey: "mobileNumber",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-[13px] text-muted-foreground whitespace-nowrap">
          {row.original.mobileNumber || "—"}
        </span>
      )
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="max-w-[180px] truncate text-[13px] text-muted-foreground">
          {row.original.email || "—"}
        </span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      accessorKey: "driverCount",
      header: "Drivers",
      cell: ({ row }) => (
        <span className="font-heading font-semibold tabular-nums">{row.original.driverCount}</span>
      )
    },
    {
      accessorKey: "passengerCount",
      header: "Passengers",
      cell: ({ row }) => (
        <span className="font-heading font-semibold tabular-nums">{row.original.passengerCount}</span>
      )
    },
    {
      accessorKey: "totalCommission",
      header: "Total earned",
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums whitespace-nowrap">
          {formatAgentCurrency(row.original.totalCommission)}
        </span>
      )
    },
    {
      accessorKey: "paidAmount",
      header: "Total paid",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
          {formatAgentCurrency(row.original.paidAmount)}
        </span>
      )
    },
    {
      accessorKey: "remainingAmount",
      header: "Remaining",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400 tabular-nums whitespace-nowrap">
          {formatAgentCurrency(row.original.remainingAmount)}
        </span>
      )
    },
    {
      accessorKey: "lastPaymentDate",
      header: "Last payment",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {formatAgentDate(row.original.lastPaymentDate)}
        </span>
      )
    },
    {
      accessorKey: "joiningDate",
      header: "Joining date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {formatAgentDate(row.original.joiningDate)}
        </span>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px]"
          onClick={() => router.push(`/admin/agents/${row.original.id}`)}
        >
          View performance
        </Button>
      )
    }
  ];

  return (
    <AppShell title="Agent Performance" wideContent>
      <PageContainer>
        <SectionCard
          title="Agent performance overview"
          description="All agents with onboarding counts, commission totals, payment status, and quick access to detailed records."
        >
          {error ? (
            <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
          <div className="flex flex-col gap-2.5 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2 py-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable columns={columns} data={agentRows} getRowId={(row) => String(row.id)} />
            </div>
          )}
          <div className="mt-2 flex flex-col gap-3 rounded-lg bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Show</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-7 w-[4.5rem] border-border/40 bg-background text-xs shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>
            <PaginationControls
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
