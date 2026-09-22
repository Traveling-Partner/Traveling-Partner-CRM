"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { SafetyKpiCards } from "@/components/safety-center/SafetyKpiCards";
import {
  useSosIncidentsQuery,
  useSosOverviewQuery
} from "@/hooks/queries/use-sos-incidents";
import type { SosIncidentRow } from "@/services/sos-incidents";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/page-size";

const ALL = "all";

const STATUS_OPTIONS = [
  { value: ALL, label: "All SOS incidents" },
  { value: "ACTIVE", label: "Active" },
  { value: "ACKNOWLEDGED", label: "Acknowledged" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "FALSE_ALARM", label: "False alarm" }
];

export default function AdminSafetyOverviewPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [city, setCity] = useState(ALL);
  const [userId, setUserId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const overviewQuery = useSosOverviewQuery();
  const listQuery = useSosIncidentsQuery({
    page,
    pageSize,
    search,
    status: status === ALL ? "" : status,
    city: city === ALL ? "" : city,
    userId
  });

  const stats = overviewQuery.data?.stats;
  const rows = listQuery.data?.content ?? [];
  const cities = listQuery.data?.cities ?? [];
  const totalItems = listQuery.data?.totalElements ?? rows.length;
  const totalPages = Math.max(1, listQuery.data?.totalPages ?? 1);

  // Clamp page if the result set shrinks after a filter change
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const columns: ColumnDef<SosIncidentRow>[] = [
    { accessorKey: "code", header: "SOS ID" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => <StatusBadge status={row.original.severity} />
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => row.original.city ?? "—"
    },
    {
      accessorKey: "trigger",
      header: "Trigger",
      cell: ({ row }) => row.original.trigger?.replace(/_/g, " ") ?? "—"
    },
    {
      id: "rider",
      header: "Rider",
      cell: ({ row }) => row.original.trip?.riderName ?? "—"
    },
    {
      id: "driver",
      header: "Driver",
      cell: ({ row }) => row.original.trip?.driverName ?? "—"
    },
    {
      accessorKey: "reportedAt",
      header: "Reported",
      cell: ({ row }) => new Date(row.original.reportedAt).toLocaleString()
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(`/admin/safety/incidents/${row.original.id}`)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <AppShell title="Safety Center" wideContent>
      <PageContainer>
        {overviewQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <SafetyKpiCards
            activeCount={stats?.activeCount ?? 0}
            criticalCount={stats?.criticalCount ?? 0}
            resolvedToday={stats?.resolvedToday ?? 0}
            total={stats?.total ?? 0}
          />
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/safety/services">Emergency services</Link>
          </Button>
        </div>

        <SectionCard
          className="mt-4"
          title="SOS incidents"
          description="Rides where a rider or driver actually pressed SOS in the app."
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SOS ID, user name..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Input
              placeholder="User ID"
              inputMode="numeric"
              className="w-[130px]"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value.replace(/\D/g, ""));
                setPage(1);
              }}
            />
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={city}
              onValueChange={(v) => {
                setCity(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {listQuery.isError ? (
            <div className="space-y-3">
              <p className="text-sm text-destructive">
                {listQuery.error?.message ?? "Failed to load SOS incidents."}
              </p>
              <Button type="button" variant="outline" onClick={() => listQuery.refetch()}>
                Retry
              </Button>
            </div>
          ) : listQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              getRowId={(row) => String(row.id)}
              emptyTitle="No SOS incidents found"
              emptyDescription="Only rides where the SOS button was pressed appear here."
            />
          )}

          {!listQuery.isLoading && !listQuery.isError && rows.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} / page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>
                  Showing {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, totalItems)} of {totalItems}
                </span>
              </div>
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
