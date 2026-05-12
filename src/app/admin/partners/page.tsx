"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { Search, Filter } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { fetcher } from "@/lib/fetcher";

interface PartnerRow {
  id: number;
  name: string | null;
  email: string | null;
  mobileNumber: string | null;
  status: string;
  profilePicture?: string | null;
  createdAt?: string | null;
}

const DEFAULT_PAGE_SIZE = 6;

interface PartnersResponse {
  content: PartnerRow[];
  totalPages: number;
  totalElements: number;
}

export default function AdminPartnersPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [partnerRows, setPartnerRows] = useState<PartnerRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch partners from backend with filters + pagination
  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter === "all" ? "" : statusFilter;
      const searchParam = search.trim();

      const url = `${process.env.NEXT_PUBLIC_API_URL}/users/partners?page=${page}&size=${pageSize}&status=${encodeURIComponent(
        statusParam
      )}&city=&search=${encodeURIComponent(searchParam)}`;

      const res = await fetcher<PartnersResponse>(url, { token });
      setPartnerRows(res.content);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch {
      setPartnerRows([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, search, token]);

  useEffect(() => {
    void fetchPartners();
  }, [fetchPartners]);

  const columns: ColumnDef<PartnerRow>[] = useMemo(
    () => [
    {
      accessorKey: "name",
      header: "Partner",
      cell: ({ row }) => {
        const displayName = row.original.name || "—";
        const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-[11px] font-bold text-emerald-700 dark:from-emerald-800 dark:to-emerald-900 dark:text-emerald-300">
              {initials || "?"}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-[11px] text-muted-foreground">{row.original.mobileNumber || "—"}</p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "—"}
        </span>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => router.push(`/admin/partners/${row.original.id}`)}
        >
          View →
        </Button>
      )
    }
    ],
    [router]
  );

  return (
    <AppShell title="Partners">
      <PageContainer>
        <SectionCard
          title="Partner management"
          description="Manage fleet and corporate partners across your operating regions."
        >
          <div className="flex flex-col gap-2.5 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search partners…"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-32">
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
            <DataTable columns={columns} data={partnerRows} />
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

