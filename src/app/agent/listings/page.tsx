"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuthStore } from "@/store/auth.store";
import { drivers } from "@/mock-data/drivers";
import { partners } from "@/mock-data/partners";
import type { Driver } from "@/types/domain";
import type { Partner } from "@/types/domain";

export default function AgentListingsPage() {
  const user = useAuthStore((s) => s.user);
  const agentId = user?.id ?? "";

  const myDrivers = useMemo(
    () => drivers.filter((d) => d.createdByAgentId === agentId),
    [agentId]
  );
  const myPartners = useMemo(
    () => partners.filter((p) => p.createdByAgentId === agentId),
    [agentId]
  );

  const driverColumns: ColumnDef<Driver>[] = [
    {
      accessorKey: "name",
      header: "Driver",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.phone}
          </p>
        </div>
      )
    },
    { accessorKey: "city", header: "City" },
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
    }
  ];

  const partnerColumns: ColumnDef<Partner>[] = [
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
    }
  ];

  if (!user) return null;

  return (
    <AppShell title="My Listings">
      <PageContainer>
        <SectionCard
          title="My listings"
          description="Drivers and partners you have onboarded. Only your records are shown."
        >
          <Tabs defaultValue="drivers" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="drivers">
                My Drivers ({myDrivers.length})
              </TabsTrigger>
              <TabsTrigger value="partners">
                My Partners ({myPartners.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="drivers" className="mt-0">
              <DataTable
                columns={driverColumns}
                data={myDrivers}
                emptyTitle="No drivers yet"
                emptyDescription="Drivers you onboard will appear here."
              />
            </TabsContent>
            <TabsContent value="partners" className="mt-0">
              <DataTable
                columns={partnerColumns}
                data={myPartners}
                emptyTitle="No partners yet"
                emptyDescription="Partners you onboard will appear here."
              />
            </TabsContent>
          </Tabs>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
