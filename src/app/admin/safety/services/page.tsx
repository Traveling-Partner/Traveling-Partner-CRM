"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { EmergencyServiceFormDialog } from "@/components/safety-center/EmergencyServiceFormDialog";
import { emergencyServicesSeed } from "@/mock-data/safety-center";
import type { EmergencyService, EmergencyServiceType } from "@/types/safety-center";

export default function AdminSafetyServicesPage() {
  const { success, toast } = useToast();
  const [services, setServices] = useState(emergencyServicesSeed);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EmergencyService | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.phone.includes(q);
      const matchType = type === "all" || s.type === (type as EmergencyServiceType);
      return matchQ && matchType;
    });
  }, [services, search, type]);

  const columns: ColumnDef<EmergencyService>[] = [
    { accessorKey: "name", header: "Service" },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => row.original.type
    },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "city", header: "City" },
    {
      accessorKey: "available24h",
      header: "24h",
      cell: ({ row }) =>
        row.original.available24h ? (
          <StatusBadge status="ACTIVE" />
        ) : (
          <StatusBadge status="INACTIVE" />
        )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => toast(`Mock call: ${row.original.phone}`)}
          >
            Call
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setEditing(row.original);
              setDialogOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDeleteId(row.original.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <AppShell title="Emergency Services" wideContent>
      <PageContainer>
        <SectionCard
          title="Emergency services directory"
          description="Police, ambulance, fire, roadside — mock directory."
          headerAction={
            <Button
              type="button"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              Add service
            </Button>
          }
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <Input
              placeholder="Search name, city, phone..."
              className="max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="POLICE">Police</SelectItem>
                <SelectItem value="AMBULANCE">Ambulance</SelectItem>
                <SelectItem value="FIRE">Fire</SelectItem>
                <SelectItem value="ROADSIDE">Roadside</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={filtered} />
        </SectionCard>

        <EmergencyServiceFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          onSave={(value) => {
            if (value.id) {
              setServices((prev) =>
                prev.map((s) => (s.id === value.id ? { ...s, ...value, id: value.id } : s))
              );
              success("Service updated");
            } else {
              setServices((prev) => [
                {
                  id: `es-${Date.now()}`,
                  name: value.name,
                  type: value.type,
                  phone: value.phone,
                  city: value.city,
                  available24h: value.available24h,
                  notes: value.notes
                },
                ...prev
              ]);
              success("Service added");
            }
          }}
        />

        <ConfirmDialog
          open={Boolean(deleteId)}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Delete service?"
          description="Removes from local mock directory only."
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            setServices((prev) => prev.filter((s) => s.id !== deleteId));
            setDeleteId(null);
            success("Service deleted");
          }}
        />
      </PageContainer>
    </AppShell>
  );
}
