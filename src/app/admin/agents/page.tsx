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
import { StatusBadge } from "@/components/ui/status-badge";
import { agents } from "@/mock-data/agents";
import { drivers } from "@/mock-data/drivers";
import { partners } from "@/mock-data/partners";
import type { Agent } from "@/types/domain";

const PAGE_SIZE = 10;

export default function AdminAgentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const columns: ColumnDef<Agent>[] = [
    {
      accessorKey: "name",
      header: "Agent",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      )
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-xs">{row.original.phone}</span>
      )
    },
    {
      accessorKey: "commissionRate",
      header: "Commission %",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.commissionRate}%</span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      id: "metrics",
      header: "Onboarded",
      cell: ({ row }) => {
        const driversCount = drivers.filter(
          (d) => d.createdByAgentId === row.original.id
        ).length;
        const partnersCount = partners.filter(
          (p) => p.createdByAgentId === row.original.id
        ).length;
        return (
          <span className="text-xs text-muted-foreground">
            {driversCount} drivers, {partnersCount} partners
          </span>
        );
      }
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/agents/${row.original.id}`)}
          >
            View
          </Button>
        </div>
      )
    }
  ];

  return (
    <AppShell title="Sales Agents">
      <PageContainer>
        <SectionCard
          title="Agent management"
          description="Manage sales agents and view performance metrics."
          headerAction={
            <Button onClick={() => router.push("/admin/agents/create")}>
              Create agent
            </Button>
          }
        >
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="max-w-xs"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="RESTRICTED">Restricted</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
          <DataTable columns={columns} data={paginated} />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {paginated.length ? page * PAGE_SIZE + 1 : 0} –{" "}
              {page * PAGE_SIZE + paginated.length} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
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
