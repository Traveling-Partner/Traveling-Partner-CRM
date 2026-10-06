"use client";

import { useState } from "react";
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
import { ListPaginationFooter } from "@/components/common/ListPaginationFooter";
import { Search, Filter } from "lucide-react";
import { useAgentsListQuery } from "@/hooks/queries/use-agents-list-query";
import { formatAgentDate } from "@/lib/agent-onboarding";
import { showPhone } from "@/lib/format-ids";
import { DEFAULT_PAGE_SIZE } from "@/lib/page-size";
import type { AgentRow } from "@/services/users";

export default function AdminAgentPerformancePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isFetching, error } = useAgentsListQuery({
    page,
    pageSize,
    status: statusFilter,
    name: search,
    mobileNumber: "",
    city: "",
    gender: "all"
  });

  const agentRows: AgentRow[] = data?.content ?? [];

  const totalPages = data?.totalPages ?? 1;
  const loading = isLoading || isFetching;

  const columns: ColumnDef<AgentRow>[] = [
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
          {showPhone(row.original.mobileNumber)}
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
      accessorKey: "createdAt",
      header: "Joining date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {formatAgentDate(row.original.createdAt)}
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
          description="Agents from the directory, with the contact details and status returned by the API."
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
                  setPage(1);
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
                  setPage(1);
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
              <DataTable
                columns={columns}
                data={agentRows}
                error={error?.message}
                getRowId={(row) => String(row.id)}
              />
            </div>
          )}
          <ListPaginationFooter
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
