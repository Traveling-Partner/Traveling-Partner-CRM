"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SafetyKpiCards } from "@/components/safety-center/SafetyKpiCards";
import {
  getSafetyOverviewStats,
  sosIncidentsSeed
} from "@/mock-data/safety-center";
import type { SosIncident } from "@/types/safety-center";

export default function AdminSafetyOverviewPage() {
  const router = useRouter();
  const [incidents] = useState(sosIncidentsSeed);

  const stats = useMemo(() => getSafetyOverviewStats(incidents), [incidents]);
  const live = useMemo(
    () =>
      incidents.filter((i) => i.status === "ACTIVE" || i.status === "ACKNOWLEDGED"),
    [incidents]
  );

  const columns: ColumnDef<SosIncident>[] = [
    { accessorKey: "code", header: "SOS ID" },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => <StatusBadge status={row.original.severity} />
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    { accessorKey: "city", header: "City" },
    {
      accessorKey: "trigger",
      header: "Trigger",
      cell: ({ row }) => row.original.trigger.replace(/_/g, " ")
    },
    {
      id: "rider",
      header: "Rider",
      cell: ({ row }) => row.original.trip.riderName
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
          Open
        </Button>
      )
    }
  ];

  return (
    <AppShell title="Safety Center" wideContent>
      <PageContainer>
        <SafetyKpiCards {...stats} />

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/admin/safety/incidents">All SOS incidents</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/safety/services">Emergency services</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/safety/settings">Safety settings</Link>
          </Button>
        </div>

        <SectionCard
          className="mt-4"
          title="Live SOS"
          description="Active and acknowledged emergencies (mock data)."
        >
          <DataTable columns={columns} data={live} />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
