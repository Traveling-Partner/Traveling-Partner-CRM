"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { sosIncidentsSeed } from "@/mock-data/safety-center";
import type { SosIncident, SosIncidentStatus } from "@/types/safety-center";

const PAGE_SIZE = 10;

export default function AdminSafetyIncidentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [city, setCity] = useState<string>("all");
  const [page, setPage] = useState(1);

  const cities = useMemo(
    () => Array.from(new Set(sosIncidentsSeed.map((i) => i.city))).sort(),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sosIncidentsSeed.filter((i) => {
      const matchQ =
        !q ||
        i.code.toLowerCase().includes(q) ||
        i.trip.riderName.toLowerCase().includes(q) ||
        i.trip.driverName.toLowerCase().includes(q);
      const matchStatus = status === "all" || i.status === (status as SosIncidentStatus);
      const matchCity = city === "all" || i.city === city;
      return matchQ && matchStatus && matchCity;
    });
  }, [search, status, city]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const rows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const columns: ColumnDef<SosIncident>[] = [
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
    { accessorKey: "city", header: "City" },
    {
      accessorKey: "trigger",
      header: "Trigger",
      cell: ({ row }) => row.original.trigger.replace(/_/g, " ")
    },
    {
      id: "trip",
      header: "Trip",
      cell: ({ row }) => row.original.trip.rideId
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
    <AppShell title="SOS Incidents" wideContent>
      <PageContainer>
        <SectionCard
          title="SOS incidents"
          description="Filter and open emergency cases. Mock data only — no API calls."
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <Input
              placeholder="Search SOS ID, rider, driver..."
              className="max-w-xs"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
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
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="FALSE_ALARM">False alarm</SelectItem>
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
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DataTable columns={columns} data={rows} />

          <div className="mt-4">
            <PaginationControls
              currentPage={pageSafe}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
