"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { useAppSelector } from "@/store/hooks";
import { fetcher } from "@/lib/fetcher";

interface DriverRow {
  id: number;
  email: string | null;
  name: string | null;
  username: string | null;
  mobileNumber: string;
  status: string;
  city: string | null;
  createdAt: string | null;
}

interface DriversApiResponse {
  content: DriverRow[];
  totalPages: number;
  totalElements: number;
  number: number;
}

const DEFAULT_PAGE_SIZE = 6;

export default function AdminDriversPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(0);
      setDebouncedSearch(value);
    }, 400);
  };

  useEffect(() => {
    let cancelled = false;
    async function loadCities() {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/users/drivers?page=0&size=500`;
        const res = await fetcher<DriversApiResponse>(url, { token });
        if (!cancelled) {
          const unique = Array.from(
            new Set(res.content.map((d) => d.city).filter(Boolean) as string[])
          ).sort();
          setCities(unique);
        }
      } catch { /* ignore */ }
    }
    loadCities();
    return () => { cancelled = true; };
  }, [token]);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/users/drivers?page=${page}&size=${pageSize}`;
      if (statusFilter !== "all") url += `&status=${statusFilter}`;
      if (cityFilter !== "all") url += `&city=${encodeURIComponent(cityFilter)}`;
      if (debouncedSearch.trim()) url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;

      const res = await fetcher<DriversApiResponse>(url, { token });
      setDrivers(res.content);
      setTotalPages(res.totalPages || 1);
    } catch {
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, cityFilter, debouncedSearch, token]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const columns: ColumnDef<DriverRow>[] = [
    {
      accessorKey: "name",
      header: "Driver",
      cell: ({ row }) => {
        const d = row.original;
        const displayName = d.name || d.username || "—";
        return (
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{d.mobileNumber}</p>
          </div>
        );
      }
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.email || "—"}</span>
      )
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.city || "—"}</span>
      )
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
        <span className="text-xs text-muted-foreground">
          {row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : "—"}
        </span>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/drivers/${row.original.id}`)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <AppShell title="Drivers">
      <PageContainer>
        <SectionCard
          title="Driver directory"
          description="Search, filter, and review all drivers in your Traveling Partner network."
        >
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(v) => { setPage(0); setStatusFilter(v); }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={cityFilter}
                onValueChange={(v) => { setPage(0); setCityFilter(v); }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPage(0);
                  setPageSize(Number(v));
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 / page</SelectItem>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Loading…
            </div>
          ) : (
            <DataTable columns={columns} data={drivers} />
          )}

          <PaginationControls
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p - 1)}
          />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
