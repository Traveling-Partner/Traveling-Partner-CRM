"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { ListPaginationFooter } from "@/components/common/ListPaginationFooter";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useSalesAgentCommissionsQuery } from "@/hooks/queries/use-sales-agent";
import { showPhone } from "@/lib/format-ids";
import { DEFAULT_PAGE_SIZE } from "@/lib/page-size";
import type { SalesAgentCommission } from "@/services/sales-agent";

function money(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

export default function AgentCommissionsPage() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { data, isLoading, error } = useSalesAgentCommissionsQuery({
    page,
    pageSize,
    filter
  });

  const rows = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const loading = isLoading && !data;

  const columns: ColumnDef<SalesAgentCommission>[] = useMemo(
    () => [
      {
        accessorKey: "referredUserName",
        header: "User",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{row.original.referredUserName || "—"}</p>
            <p className="text-xs text-muted-foreground">
              {showPhone(row.original.referredUserMobileNumber)}
            </p>
          </div>
        )
      },
      {
        accessorKey: "referredUserRole",
        header: "Type",
        cell: ({ row }) => row.original.referredUserRole || "—"
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-heading font-semibold">{money(row.original.amount)}</span>
        )
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) =>
          row.original.status ? <StatusBadge status={row.original.status} /> : "—"
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        )
      }
    ],
    []
  );

  return (
    <AppShell title="My Commissions">
      <PageContainer>
        <SectionCard
          title="Commission history"
          description="Payments for users you referred. Filter uses pending, released, or all."
        >
          <div className="flex flex-wrap items-center gap-2 pb-4">
            <Select
              value={filter}
              onValueChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="released">Released</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}

          {loading ? (
            <div className="space-y-2 py-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : error ? (
            <EmptyState title="Could not load commissions" description={error.message} />
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              getRowId={(row) => String(row.id)}
              emptyTitle="No commissions yet"
              emptyDescription="Payments for your referred users will appear here."
            />
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
