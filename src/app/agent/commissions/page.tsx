"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuthStore } from "@/store/auth.store";
import { commissions } from "@/mock-data/commissions";
import type { Commission } from "@/types/domain";
import { ListPaginationFooter } from "@/components/common/ListPaginationFooter";
import { DEFAULT_PAGE_SIZE } from "@/lib/page-size";

type CommissionRow = Commission & { statusLabel: "PENDING" | "PAID" };

const monthOptions = (() => {
  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  return months;
})();

export default function AgentCommissionsPage() {
  const user = useAuthStore((s) => s.user);
  const agentId = user?.id ?? "";

  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const myCommissions = useMemo(
    () =>
      commissions
        .filter((c) => c.agentId === agentId)
        .map((c) => ({ ...c, statusLabel: c.status })),
    [agentId]
  );

  const filtered = useMemo(() => {
    return myCommissions.filter((c) => {
      const matchesMonth =
        monthFilter === "all" || c.month === monthFilter;
      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter;
      return matchesMonth && matchesStatus;
    });
  }, [myCommissions, monthFilter, statusFilter]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const columns: ColumnDef<CommissionRow>[] = [
    {
      accessorKey: "month",
      header: "Month",
      cell: ({ row }) => (
        <span className="font-medium">
          {new Date(row.original.month + "-01").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
          })}
        </span>
      )
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-heading font-semibold">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
          }).format(row.original.amount)}
        </span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={
            row.original.status === "PAID" ? "APPROVED" : "PENDING"
          }
        />
      )
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  if (!user) return null;

  return (
    <AppShell title="My Commissions">
      <PageContainer>
        <SectionCard
          title="Commission history"
          description="View your commission payouts. Data is filtered to your account only."
        >
          {myCommissions.length === 0 ? (
            <EmptyState
              title="No commissions yet"
              description="Once you onboard drivers and partners, your commission records will appear here."
            />
          ) : (
            <>
              <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={monthFilter}
                    onValueChange={(v) => {
                      setMonthFilter(v);
                      setPage(0);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All months</SelectItem>
                      {monthOptions.map((m) => (
                        <SelectItem key={m} value={m}>
                          {new Date(m + "-01").toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric"
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => {
                      setStatusFilter(v);
                      setPage(0);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DataTable
                columns={columns}
                data={paginated}
                emptyTitle="No matching commissions"
                emptyDescription="Try changing the month or status filter."
              />

              <ListPaginationFooter
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(0);
                }}
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
              />
            </>
          )}
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
