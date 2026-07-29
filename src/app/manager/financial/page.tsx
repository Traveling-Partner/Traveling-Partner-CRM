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
import { RoleKpiCard } from "@/components/role-workspace/RoleDashboardWidgets";
import { formatCurrency, smFinancialRows } from "@/mock-data/role-workspaces";
import { Search } from "lucide-react";

type Row = (typeof smFinancialRows)[number];

export default function ManagerFinancialPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(
    () =>
      smFinancialRows.filter((row) => {
        const q = search.trim().toLowerCase();
        const matchSearch =
          !q ||
          row.party.toLowerCase().includes(q) ||
          row.type.toLowerCase().includes(q);
        const matchStatus = status === "all" || row.status === status;
        return matchSearch && matchStatus;
      }),
    [search, status]
  );

  const columns: ColumnDef<Row>[] = [
    { accessorKey: "type", header: "Type" },
    { accessorKey: "party", header: "Party" },
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
    { accessorKey: "date", header: "Date" }
  ];

  return (
    <AppShell title="Financial Management" wideContent>
      <PageContainer>
        <div className="grid gap-4 md:grid-cols-3">
          <RoleKpiCard label="Revenue" value={formatCurrency(2140000)} tone="brand" />
          <RoleKpiCard label="Payments" value={formatCurrency(91200)} tone="success" />
          <RoleKpiCard label="Open items" value="5" tone="warning" />
        </div>
        <SectionCard
          title="Financial records"
          description="Revenue, transactions, invoices, payments, and reports."
          className="mt-4"
          headerAction={
            <Button variant="outline" size="sm">
              Export
            </Button>
          }
        >
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search…"
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
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={rows} />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
