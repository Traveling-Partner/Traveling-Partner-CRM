"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { rides } from "@/mock-data/rides";
import type { Ride } from "@/types/domain";

const PAGE_SIZE = 10;
const cities = Array.from(new Set(rides.map((r) => r.city)));

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);

function statusBadgeVariant(
  s: Ride["status"]
): "success" | "warning" | "danger" {
  if (s === "COMPLETED") return "success";
  if (s === "IN_PROGRESS") return "warning";
  return "danger";
}

export default function AdminRidesPage() {
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      rides.filter((r) => cityFilter === "all" || r.city === cityFilter),
    [cityFilter]
  );
  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const total = filtered.length;
  const completed = filtered.filter((r) => r.status === "COMPLETED").length;
  const cancelled = filtered.filter((r) => r.status === "CANCELLED").length;
  const inProgress = filtered.filter((r) => r.status === "IN_PROGRESS").length;
  const totalFare = filtered
    .filter((r) => r.status === "COMPLETED")
    .reduce((a, r) => a + r.fare, 0);

  const columns: ColumnDef<Ride>[] = [
    {
      accessorKey: "bookingReference",
      header: "Booking",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">
          {row.original.bookingReference}
        </span>
      )
    },
    {
      accessorKey: "city",
      header: "City"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant(row.original.status)}>
          {row.original.status.replace("_", " ")}
        </Badge>
      )
    },
    {
      accessorKey: "distanceKm",
      header: "Distance",
      cell: ({ row }) => `${row.original.distanceKm} km`
    },
    {
      accessorKey: "fare",
      header: "Fare",
      cell: ({ row }) => currency(row.original.fare)
    },
    {
      accessorKey: "startedAt",
      header: "Started",
      cell: ({ row }) =>
        new Date(row.original.startedAt).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
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
  ];

  return (
    <AppShell title="Rides">
      <PageContainer>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 bg-gradient-to-b from-card to-muted/30 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total rides
              </p>
              <p className="text-2xl font-heading font-semibold">{total}</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 bg-gradient-to-b from-card to-muted/30 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Completed
              </p>
              <p className="text-2xl font-heading font-semibold">{completed}</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 bg-gradient-to-b from-card to-muted/30 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Cancelled
              </p>
              <p className="text-2xl font-heading font-semibold">{cancelled}</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 bg-gradient-to-b from-card to-muted/30 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Revenue (filtered)
              </p>
              <p className="text-2xl font-heading font-semibold">
                {currency(totalFare)}
              </p>
              <p className="text-[0.65rem] text-muted-foreground">
                {inProgress} in progress
              </p>
            </CardContent>
          </Card>
        </div>
        <SectionCard
          title="Ride list"
          description="Open any row for full trip detail, route map, and settlement."
          className="mt-4"
        >
          <div className="pb-4">
            <Select
              value={cityFilter}
              onValueChange={(v) => {
                setCityFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={paginated} />
          <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing{" "}
              <span className="font-medium text-foreground">
                {paginated.length ? page * PAGE_SIZE + 1 : 0}
              </span>
              {" – "}
              <span className="font-medium text-foreground">
                {page * PAGE_SIZE + paginated.length}
              </span>{" "}
              of <span className="font-medium text-foreground">{filtered.length}</span>
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
              <span className="px-2">
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
      </PageContainer>
    </AppShell>
  );
}
