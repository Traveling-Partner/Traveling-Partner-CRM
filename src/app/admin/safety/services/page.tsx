"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Phone, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { SosServiceFormDialog } from "@/components/safety-center/SosServiceFormDialog";
import {
  useCreateSosMutation,
  useDeleteSosMutation,
  useSosDirectoryQuery,
  useUpdateSosMutation
} from "@/hooks/queries/use-sos-directory";
import type { SosApiRecord, SosUpsertPayload } from "@/services/sos";

export default function AdminSafetyServicesPage() {
  const { success, error: showError, toast } = useToast();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SosApiRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SosApiRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const listQuery = useSosDirectoryQuery({ page, pageSize, search });
  const createMutation = useCreateSosMutation();
  const updateMutation = useUpdateSosMutation();
  const deleteMutation = useDeleteSosMutation();

  const rows = listQuery.data?.content ?? [];
  const totalItems = listQuery.data?.totalElements ?? rows.length;
  const totalPages = Math.max(1, listQuery.data?.totalPages ?? 1);

  // Clamp page if data shrinks (e.g. last record on last page deleted)
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSave = async (payload: SosUpsertPayload, id?: number) => {
    try {
      if (id != null) {
        await updateMutation.mutateAsync({ id, payload });
        success("SOS service updated successfully.");
      } else {
        await createMutation.mutateAsync(payload);
        setPage(1);
        success("SOS service created successfully.");
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to save SOS service.");
      throw e;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      success("SOS service deleted successfully.");
      setDeleteTarget(null);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to delete SOS service.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<SosApiRecord>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>
    },
    {
      accessorKey: "number",
      header: "Number",
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">{row.original.number}</span>
      )
    },
    { accessorKey: "state", header: "State" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
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
            onClick={() => toast(`Call ${row.original.name}: ${row.original.number}`)}
          >
            <Phone className="mr-1 h-3.5 w-3.5" />
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
            onClick={() => setDeleteTarget(row.original)}
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
          title="SOS services directory"
          description="Emergency helpline numbers by state — police, ambulance, fire, roadside."
          headerAction={
            <Button
              type="button"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add service
            </Button>
          }
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, number, state..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {listQuery.isLoading ? (
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
              emptyTitle="No SOS services found"
              emptyDescription={
                search.trim()
                  ? "Try adjusting your search terms."
                  : "Get started by adding your first SOS service."
              }
            />
          )}

          {!listQuery.isLoading && rows.length > 0 && (
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
                    <SelectItem value="5">5 / page</SelectItem>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
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

        <SosServiceFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          onSave={handleSave}
        />

        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete SOS service?"
          description={
            deleteTarget
              ? `This will permanently remove "${deleteTarget.name}" (${deleteTarget.number}). This action cannot be undone.`
              : undefined
          }
          confirmLabel={isDeleting ? "Deleting…" : "Delete"}
          cancelLabel="Cancel"
          destructive
          onConfirm={handleDelete}
        />
      </PageContainer>
    </AppShell>
  );
}
