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
import { StatusBadge } from "@/components/ui/status-badge";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { useAppSelector } from "@/store/hooks";
import { fetcher } from "@/lib/fetcher";

interface PartnerRow {
  id: number;
  name: string | null;
  email: string | null;
  mobileNumber: string | null;
  status: string;
  city: string | null;
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
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [partnerRows, setPartnerRows] = useState<PartnerRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [cities, setCities] = useState<string[]>([]);

  // Load city options from backend
  useEffect(() => {
    let cancelled = false;
    const loadCities = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/users/partners?page=0&size=500&status=&city=&search=`;
        const res = await fetcher<PartnersResponse>(url, { token });
        if (cancelled) return;
        const unique = Array.from(
          new Set(
            res.content
              .map((p) => p.city)
              .filter((c): c is string => Boolean(c))
          )
        ).sort();
        setCities(unique);
      } catch {
        // ignore city load error
      }
    };
    void loadCities();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Fetch partners from backend with filters + pagination
  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter === "all" ? "" : statusFilter;
      const cityParam = cityFilter === "all" ? "" : cityFilter;
      const searchParam = search.trim();

      const url = `${process.env.NEXT_PUBLIC_API_URL}/users/partners?page=${page}&size=${pageSize}&status=${encodeURIComponent(
        statusParam
      )}&city=${encodeURIComponent(cityParam)}&search=${encodeURIComponent(searchParam)}`;

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
  }, [page, pageSize, statusFilter, cityFilter, search, token]);

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
        return (
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.city || "—"}
            </p>
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
        <span className="text-xs text-muted-foreground">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "—"}
        </span>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/partners/${row.original.id}`)}
          >
            View
          </Button>
        </div>
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
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search partners…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              className="max-w-xs"
            />
            <div className="flex flex-wrap items-center gap-2">
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

              <Select
                value={cityFilter}
                onValueChange={(value) => {
                  setCityFilter(value);
                  setPage(0);
                }}
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
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(0);
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
            <div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>
          ) : (
            <DataTable columns={columns} data={partnerRows} />
          )}

          <div className="mt-3 text-xs text-muted-foreground">
            <span>
              Showing{" "}
              <span className="font-medium">
                {totalElements ? page * pageSize + 1 : 0}
              </span>{" "}
              –{" "}
              <span className="font-medium">
                {Math.min((page + 1) * pageSize, totalElements)}
              </span>{" "}
              of <span className="font-medium">{totalElements}</span> partners
            </span>
          </div>

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

