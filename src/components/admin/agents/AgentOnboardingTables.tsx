"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { extractNumericEntityId } from "@/lib/agent-onboarding";
import type { Driver, Partner } from "@/types/domain";

export const agentDriverColumns: ColumnDef<Driver>[] = [
  {
    accessorKey: "name",
    header: "Driver name",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.phone}</p>
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
    header: "Onboarded",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground tabular-nums">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    )
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
        <Link href={`/admin/drivers/${extractNumericEntityId(row.original.id)}`}>
          <ExternalLink className="h-3.5 w-3.5" />
          View driver
        </Link>
      </Button>
    )
  }
];

export const agentPassengerColumns: ColumnDef<Partner>[] = [
  {
    accessorKey: "name",
    header: "Passenger name",
    cell: ({ row }) => <p className="text-sm font-medium">{row.original.name}</p>
  },
  { accessorKey: "city", header: "City" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />
  },
  {
    accessorKey: "createdAt",
    header: "Onboarded",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground tabular-nums">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    )
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
        <Link href={`/admin/partners/${extractNumericEntityId(row.original.id)}`}>
          <ExternalLink className="h-3.5 w-3.5" />
          View passenger
        </Link>
      </Button>
    )
  }
];

export function AgentDriversTable({ drivers }: { drivers: Driver[] }) {
  return (
    <DataTable
      columns={agentDriverColumns}
      data={drivers}
      emptyTitle="No drivers onboarded"
      emptyDescription="Drivers added by this agent will appear here."
    />
  );
}

export function AgentPassengersTable({ passengers }: { passengers: Partner[] }) {
  return (
    <DataTable
      columns={agentPassengerColumns}
      data={passengers}
      emptyTitle="No passengers onboarded"
      emptyDescription="Passengers added by this agent will appear here."
    />
  );
}
