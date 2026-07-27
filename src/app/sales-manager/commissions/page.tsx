"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, smCommissionRows } from "@/mock-data/role-workspaces";
import { Search } from "lucide-react";

type CommissionStatus = "PENDING" | "APPROVED" | "REJECTED";
type Row = (typeof smCommissionRows)[number] & { status: CommissionStatus };

export default function SalesManagerCommissionsPage() {
  const { success } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState<Row[]>(() => [...smCommissionRows]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const q = search.trim().toLowerCase();
        const matchSearch = !q || row.agent.toLowerCase().includes(q);
        const matchStatus = status === "all" || row.status === status;
        return matchSearch && matchStatus;
      }),
    [rows, search, status]
  );

  const updateStatus = (id: string, next: CommissionStatus) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: next } : row)));
    success(`Commission ${next.toLowerCase()}.`);
  };

  const columns: ColumnDef<Row>[] = [
    { accessorKey: "agent", header: "Agent" },
    {
      accessorKey: "month",
      header: "Month",
      cell: ({ row }) =>
        new Date(`${row.original.month}-01`).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric"
        })
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.amount)
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            disabled={row.original.status === "APPROVED"}
            onClick={() => updateStatus(row.original.id, "APPROVED")}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            disabled={row.original.status === "REJECTED"}
            onClick={() => updateStatus(row.original.id, "REJECTED")}
          >
            Reject
          </Button>
        </div>
      )
    }
  ];

  const pendingTotal = rows
    .filter((r) => r.status === "PENDING")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <AppShell title="Commission Management" wideContent>
      <PageContainer>
        <SectionCard
          title="Commission queue"
          description="Approve or reject agent commissions. History, analytics, and monthly summaries included."
          headerAction={
            <Button variant="outline" size="sm" onClick={() => success("CSV export started (UI).")}>
              Export
            </Button>
          }
        >
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground">Pending total</p>
              <p className="font-heading font-semibold text-amber-600">{formatCurrency(pendingTotal)}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground">Approved count</p>
              <p className="font-heading font-semibold">
                {rows.filter((r) => r.status === "APPROVED").length}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground">Rejected count</p>
              <p className="font-heading font-semibold">
                {rows.filter((r) => r.status === "REJECTED").length}
              </p>
            </div>
          </div>

          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search agent…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable columns={columns} data={filtered} />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
