"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { rides } from "@/mock-data/rides";

const PAGE_SIZE = 10;
const cities = Array.from(new Set(rides.map((r) => r.city)));

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

  const total = filtered.length;
  const completed = filtered.filter((r) => r.status === "COMPLETED").length;
  const cancelled = filtered.filter((r) => r.status === "CANCELLED").length;
  const inProgress = filtered.filter((r) => r.status === "IN_PROGRESS").length;
  const totalFare = filtered.filter((r) => r.status === "COMPLETED").reduce((a, r) => a + r.fare, 0);

  const columns: ColumnDef<(typeof rides)[0]>[] = [
    { accessorKey: "id", header: "Ride ID", cell: ({ row }) => row.original.id.slice(0, 12) + "…" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "status", header: "Status" },
    {
      accessorKey: "fare",
      header: "Fare",
      cell: ({ row }) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(row.original.fare)
    },
    {
      accessorKey: "startedAt",
      header: "Started",
      cell: ({ row }) => new Date(row.original.startedAt).toLocaleString()
    }
  ];

  return (
    <AppShell title="Rides">
      <PageContainer>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card">
            <CardContent className="pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total rides</p>
              <p className="text-2xl font-heading font-semibold">{total}</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Completed</p>
              <p className="text-2xl font-heading font-semibold">{completed}</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-heading font-semibold">{cancelled}</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Revenue (filtered)</p>
              <p className="text-2xl font-heading font-semibold">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                  totalFare
                )}
              </p>
            </CardContent>
          </Card>
        </div>
        <SectionCard title="Ride list" description="Read-only ride records. Filter by city." className="mt-4">
          <div className="pb-4">
            <Select value={cityFilter} onValueChange={(v) => { setCityFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={paginated} />
          <div className="mt-3 text-xs text-muted-foreground">
            Showing {paginated.length ? page * PAGE_SIZE + 1 : 0} – {page * PAGE_SIZE + paginated.length} of {filtered.length}
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
