"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useAppSelector } from "@/store/hooks";
import { fetcher } from "@/lib/fetcher";

interface AgentRow {
  id: number;
  name: string | null;
  email: string | null;
  mobileNumber: string | null;
  cnicNumber?: string | null;
  status: string;
}

interface AgentsResponse {
  content: AgentRow[];
  totalPages: number;
  totalElements: number;
}

const DEFAULT_PAGE_SIZE = 6;

export default function AdminAgentsPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [agentRows, setAgentRows] = useState<AgentRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter === "all" ? "" : statusFilter;
      const searchParam = search.trim();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/users/sale-agents?page=${page}&size=${pageSize}&search=${encodeURIComponent(searchParam)}&status=${encodeURIComponent(statusParam)}`;

      const res = await fetcher<AgentsResponse>(url, { token });
      setAgentRows(res.content ?? []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch {
      setAgentRows([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, token]);

  useEffect(() => {
    void fetchAgents();
  }, [fetchAgents]);

  const columns: ColumnDef<AgentRow>[] = [
    {
      accessorKey: "name",
      header: "Agent",
      cell: ({ row }) => {
        const name = row.original.name || "—";
        const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-violet-200 text-[11px] font-bold text-violet-700 dark:from-violet-800 dark:to-violet-900 dark:text-violet-300">
              {initials || "?"}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{name}</p>
              <p className="text-[11px] text-muted-foreground">{row.original.email || "—"}</p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "mobileNumber",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-[13px] text-muted-foreground">{row.original.mobileNumber || "—"}</span>
      )
    },
    {
      accessorKey: "cnicNumber",
      header: "CNIC",
      cell: ({ row }) => (
        <span className="text-[13px] text-muted-foreground tabular-nums">{row.original.cnicNumber || "—"}</span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => router.push(`/admin/agents/${row.original.id}`)}
        >
          View →
        </Button>
      )
    }
  ];

  return (
    <AppShell title="Sales Agents">
      <PageContainer>
        <SectionCard
          title="Agent management"
          description="Manage sales agents."
          headerAction={
            <Button onClick={() => router.push("/admin/agents/create")}>
              Create agent
            </Button>
          }
        >
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
            <DataTable columns={columns} data={agentRows} />
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
