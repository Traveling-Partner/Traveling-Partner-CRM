"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
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

const PAGE_SIZE = 6;

interface PartnersResponse {
  content: PartnerRow[];
  totalPages: number;
  totalElements: number;
}

export default function AdminPartnersPage() {
  const router = useRouter();
  const { success } = useToast();
  const token = useAppSelector((state) => state.auth.token);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [partnerRows, setPartnerRows] = useState<PartnerRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPartner, setConfirmPartner] = useState<PartnerRow | null>(
    null
  );
  const [confirmType, setConfirmType] = useState<"ACTIVE" | "INACTIVE" | null>(
    null
  );
  const confirmSnapshotRef = useRef<{
    partner: PartnerRow;
    type: "ACTIVE" | "INACTIVE";
  } | null>(null);

  const [cities, setCities] = useState<string[]>([]);
  const fetchPartnersRef = useRef<() => Promise<void>>(async () => {});

  const openActiveConfirm = useCallback((partner: PartnerRow) => {
    confirmSnapshotRef.current = { partner, type: "ACTIVE" };
    setConfirmPartner(partner);
    setConfirmType("ACTIVE");
    setConfirmOpen(true);
  }, []);

  const openInactiveConfirm = useCallback((partner: PartnerRow) => {
    confirmSnapshotRef.current = { partner, type: "INACTIVE" };
    setConfirmPartner(partner);
    setConfirmType("INACTIVE");
    setConfirmOpen(true);
  }, []);

  const handleStatusConfirm = useCallback(async () => {
    const snap = confirmSnapshotRef.current;
    if (!snap) return;
    const nextStatus = snap.type === "ACTIVE" ? "ACTIVE" : "INACTIVE";
    try {
      await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL}/users/status/${snap.partner.id}`,
        {
          method: "PUT",
          token,
          body: JSON.stringify({ status: nextStatus })
        }
      );
      success(
        snap.type === "ACTIVE" ? "Partner marked active." : "Partner marked inactive."
      );
      // Re-fetch list so backend-persisted status is reflected
      await fetchPartnersRef.current();
    } catch {
      // Keep the UI consistent if API fails
      success("Failed to update partner status."); // fallback toast
    }
    confirmSnapshotRef.current = null;
    setConfirmPartner(null);
    setConfirmType(null);
  }, [success, token]);

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

      const url = `${process.env.NEXT_PUBLIC_API_URL}/users/partners?page=${page}&size=${PAGE_SIZE}&status=${encodeURIComponent(
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
  }, [page, statusFilter, cityFilter, search, token]);

  useEffect(() => {
    fetchPartnersRef.current = fetchPartners;
  }, [fetchPartners]);

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
          {row.original.status === "ACTIVE" || row.original.status === "APPROVED" ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => openInactiveConfirm(row.original)}
            >
              Inactive
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => openActiveConfirm(row.original)}
            >
              Active
            </Button>
          )}
        </div>
      )
    }
    ],
    [router, openActiveConfirm, openInactiveConfirm]
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
                {totalElements ? page * PAGE_SIZE + 1 : 0}
              </span>{" "}
              –{" "}
              <span className="font-medium">
                {Math.min((page + 1) * PAGE_SIZE, totalElements)}
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

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={(open) => {
            setConfirmOpen(open);
            if (!open) {
              confirmSnapshotRef.current = null;
              setConfirmPartner(null);
              setConfirmType(null);
            }
          }}
          onConfirm={handleStatusConfirm}
          title={
            confirmType === "ACTIVE"
              ? "Activate partner?"
              : "Set partner inactive?"
          }
          description={
            confirmPartner
              ? confirmType === "ACTIVE"
                ? `Mark "${confirmPartner.name}" as active? This will immediately update the list.`
                : `Mark "${confirmPartner.name}" as inactive? This will immediately update the list.`
              : undefined
          }
          confirmLabel={confirmType === "ACTIVE" ? "Activate" : "Set inactive"}
          cancelLabel="Cancel"
          destructive={confirmType === "INACTIVE"}
        />
      </PageContainer>
    </AppShell>
  );
}

