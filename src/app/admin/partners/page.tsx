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
import { partners } from "@/mock-data/partners";
import type { Partner } from "@/types/domain";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface PartnerRow extends Partner {}

const PAGE_SIZE = 10;

export default function AdminPartnersPage() {
  const router = useRouter();
  const { success } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [partnerRows, setPartnerRows] = useState<PartnerRow[]>(partners);
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

  const handleStatusConfirm = useCallback(() => {
    const snap = confirmSnapshotRef.current;
    if (!snap) return;
    const nextStatus = snap.type === "ACTIVE" ? "APPROVED" : "SUSPENDED";
    setPartnerRows((current) =>
      current.map((partner) =>
        partner.id === snap.partner.id
          ? { ...partner, status: nextStatus }
          : partner
      )
    );
    if (snap.type === "ACTIVE") {
      success(`Partner "${snap.partner.name}" marked active.`);
    } else {
      success(`Partner "${snap.partner.name}" marked inactive.`);
    }
    confirmSnapshotRef.current = null;
    setConfirmPartner(null);
    setConfirmType(null);
  }, [success]);

  const cities = useMemo(
    () => Array.from(new Set(partnerRows.map((p) => p.city))),
    [partnerRows]
  );

  const filtered = useMemo(() => {
    return partnerRows.filter((partner) => {
      const matchesSearch = partner.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || partner.status === statusFilter;
      const matchesCity =
        cityFilter === "all" || partner.city === cityFilter;
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [partnerRows, search, statusFilter, cityFilter]);

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page + 1 > totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const columns: ColumnDef<PartnerRow>[] = useMemo(
    () => [
    {
      accessorKey: "name",
      header: "Partner",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.city}
          </p>
        </div>
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
          {new Date(row.original.createdAt).toLocaleDateString()}
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
          {row.original.status === "APPROVED" ? (
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="RESTRICTED">Restricted</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
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

          <DataTable columns={columns} data={paginated} />

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing{" "}
              <span className="font-medium">
                {paginated.length ? page * PAGE_SIZE + 1 : 0}
              </span>{" "}
              –{" "}
              <span className="font-medium">
                {page * PAGE_SIZE + paginated.length}
              </span>{" "}
              of <span className="font-medium">{filtered.length}</span>{" "}
              partners
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
              <span>
                Page {page + 1} of {totalPages}
              </span>
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

