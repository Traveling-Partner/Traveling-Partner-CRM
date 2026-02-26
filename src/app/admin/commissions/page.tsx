"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { commissions } from "@/mock-data/commissions";
import { agents } from "@/mock-data/agents";
import type { Commission } from "@/types/domain";

const PAGE_SIZE = 10;
const monthOptions = (() => {
  const m: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    m.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return m;
})();

type Row = Commission & { agentName: string };

export default function AdminCommissionsPage() {
  const { success } = useToast();
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const rows: Row[] = useMemo(
    () =>
      commissions.map((c) => ({
        ...c,
        agentName: agents.find((a) => a.id === c.agentId)?.name ?? "Unknown"
      })),
    []
  );

  const filtered = useMemo(
    () =>
      rows.filter((c) => {
        const matchMonth = monthFilter === "all" || c.month === monthFilter;
        const matchStatus = statusFilter === "all" || c.status === statusFilter;
        return matchMonth && matchStatus;
      }),
    [rows, monthFilter, statusFilter]
  );

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const columns: ColumnDef<Row>[] = [
    { accessorKey: "agentName", header: "Agent" },
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
      cell: ({ row }) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
          row.original.amount
        )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status === "PAID" ? "APPROVED" : "PENDING"} />
      )
    }
  ];

  const handleExport = () => {
    success("CSV export started (mock).");
  };

  return (
    <AppShell title="Commissions">
      <PageContainer>
        <SectionCard
          title="Commission management"
          description="View and manage agent commissions. Export is mock."
          headerAction={
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export CSV
            </Button>
          }
        >
          <div className="flex flex-wrap gap-2 pb-4">
            <Select value={monthFilter} onValueChange={(v) => { setMonthFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {monthOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {new Date(m + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={paginated} />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {paginated.length ? page * PAGE_SIZE + 1 : 0} – {page * PAGE_SIZE + paginated.length} of{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                Previous
              </Button>
              <span>Page {page + 1} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
