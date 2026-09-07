"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { useRidesListQuery } from "@/hooks/queries/use-rides-list-query";
import { RIDE_STATUSES, type RideRow } from "@/services/rides";

const DEFAULT_PAGE_SIZE = 10;

const currency = (n: number | null) => {
  if (n === null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(n);
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function AdminRidesPage() {
  const [search, setSearch] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const resetPage = () => setPage(0);

  const { data, isLoading, isFetching, error } = useRidesListQuery({
    page,
    pageSize,
    status: statusFilter,
    city: cityFilter,
    search,
    bookingReference
  });

  const rides = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.totalElements ?? 0;
  const loading = isLoading || isFetching;

  const columns: ColumnDef<RideRow>[] = useMemo(
    () => [
      {
        accessorKey: "bookingReference",
        header: "Booking",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium">
            {row.original.bookingReference || "—"}
          </span>
        )
      },
      {
        accessorKey: "city",
        header: "City",
        cell: ({ row }) => row.original.city || "—"
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />
      },
      {
        accessorKey: "distanceKm",
        header: "Distance",
        cell: ({ row }) =>
          row.original.distanceKm == null ? "—" : `${row.original.distanceKm} km`
      },
      {
        accessorKey: "fare",
        header: "Fare",
        cell: ({ row }) => currency(row.original.fare)
      },
      {
        accessorKey: "startedAt",
        header: "Started",
        cell: ({ row }) => formatDateTime(row.original.startedAt)
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/admin/rides/${row.original.id}`}>View detail</Link>
          </Button>
        )
      }
    ],
    []
  );

  return (
    <AppShell title="Rides">
      <PageContainer>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 bg-gradient-to-b from-card to-muted/30 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total rides
              </p>
              {loading && !data ? (
                <Skeleton className="mt-1 h-8 w-16" />
              ) : (
                <p className="text-2xl font-heading font-semibold">{total}</p>
              )}
            </CardContent>
          </Card>
        </div>
        <SectionCard
          title="Ride list"
          description="Open any row for full trip detail, route map, and settlement."
          className="mt-4"
        >
          {error ? (
            <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
          <div className="grid gap-2.5 pb-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder="Search address, name, phone"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
                className="pl-9"
              />
            </div>
            <Input
              placeholder="Booking ref (TP-000036)"
              value={bookingReference}
              onChange={(e) => {
                setBookingReference(e.target.value);
                resetPage();
              }}
            />
            <Input
              placeholder="City"
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                resetPage();
              }}
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                resetPage();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {RIDE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <div className="space-y-2 py-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : rides.length === 0 ? (
            <EmptyState
              title="No rides found"
              description="Try changing filters to see more trips."
            />
          ) : (
            <DataTable columns={columns} data={rides} getRowId={(row) => String(row.id)} />
          )}
          <div className="mt-2 flex flex-col gap-3 rounded-lg bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <PaginationControls
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage - 1)}
            />
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
