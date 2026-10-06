"use client";

import { Suspense, useMemo } from "react";
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
import { ListPaginationFooter } from "@/components/common/ListPaginationFooter";
import { MissingData } from "@/components/common/MissingData";
import { useRidesListQuery } from "@/hooks/queries/use-rides-list-query";
import { RIDE_STATUSES, RIDE_TYPES, type RideRow } from "@/services/rides";
import { DEFAULT_PAGE_SIZE } from "@/lib/page-size";
import { useUrlFilters } from "@/hooks/use-url-filters";

function currency(n: number | null) {
  if (n == null || Number.isNaN(n)) return <MissingData />;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(n);
}

function formatDateTime(value: string | null) {
  if (!value) return <MissingData />;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return <MissingData />;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function AdminRidesList() {
  const { values, setValues } = useUrlFilters({
    search: "",
    booking: "",
    city: "",
    status: "all",
    type: "all",
    date: "",
    page: "1",
    size: String(DEFAULT_PAGE_SIZE)
  });
  const search = values.search;
  const bookingReference = values.booking;
  const cityFilter = values.city;
  const statusFilter = values.status;
  const rideType = values.type;
  const startedAt = values.date;
  const page = Math.max(1, Number(values.page) || 1);
  const pageSize = Math.max(1, Number(values.size) || DEFAULT_PAGE_SIZE);

  const { data, isLoading, isFetching, error } = useRidesListQuery({
    page,
    pageSize,
    status: statusFilter,
    city: cityFilter,
    search,
    bookingReference,
    rideType,
    startedAt
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
        cell: ({ row }) =>
          row.original.bookingReference ? (
            <span className="whitespace-nowrap font-mono text-sm font-medium">{row.original.bookingReference}</span>
          ) : (
            <MissingData />
          )
      },
      {
        accessorKey: "city",
        header: "City",
        cell: ({ row }) => (row.original.city ? row.original.city : <MissingData />)
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) =>
          row.original.status ? <StatusBadge status={row.original.status} /> : <MissingData />
      },
      {
        accessorKey: "distanceKm",
        header: "Distance",
        cell: ({ row }) =>
          row.original.distanceKm == null ? <MissingData /> : `${row.original.distanceKm} km`
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
          description="Live data from GET /api/rides/portal/getAll. If a field is empty, the API did not send it (Missing data)."
          className="mt-4"
        >
          {error ? (
            <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
          <div className="grid gap-2.5 pb-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder="Search address, name, phone"
                value={search}
                onChange={(e) => setValues({ search: e.target.value, page: "1" })}
                className="pl-9"
              />
            </div>
            <Input
              placeholder="Booking ref (TP-000036)"
              value={bookingReference}
              onChange={(e) => setValues({ booking: e.target.value, page: "1" })}
            />
            <Input
              placeholder="City"
              value={cityFilter}
              onChange={(e) => setValues({ city: e.target.value, page: "1" })}
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => setValues({ status: value, page: "1" })}
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
            <Select
              value={rideType}
              onValueChange={(value) => setValues({ type: value, page: "1" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ride type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ride types</SelectItem>
                {RIDE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startedAt}
              onChange={(e) => setValues({ date: e.target.value, page: "1" })}
            />
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
          <ListPaginationFooter
            pageSize={pageSize}
            onPageSizeChange={(size) => setValues({ size: String(size), page: "1" })}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(next) => setValues({ page: String(next) })}
          />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}

export default function AdminRidesPage() {
  return (
    <Suspense fallback={null}>
      <AdminRidesList />
    </Suspense>
  );
}
