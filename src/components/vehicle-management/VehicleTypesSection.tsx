"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAuthToken } from "@/hooks/api/use-auth-token";
import { useVehicleTypesQuery } from "@/hooks/queries";
import { createVehicleType, deleteVehicleType, updateVehicleType } from "@/services/vehicle";
import type { VehicleEntity } from "@/services/vehicle";
import { FormField } from "@/components/common/FormField";
import { EntityModal } from "@/components/vehicle-management/EntityModal";
import { ImageUploadField } from "@/components/vehicle-management/ImageUploadField";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { VehicleDeleteDialog } from "@/components/vehicle-management/VehicleDeleteDialog";
import { VehiclePageSizeSelect } from "@/components/vehicle-management/VehiclePageSizeSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  DEFAULT_VEHICLE_PAGE_SIZE,
  STATUS_OPTIONS,
  vehicleTypeSchema,
  type VehicleTypeForm
} from "@/app/admin/vehicle-management/_vehicle-form-shared";

export function VehicleTypesSection() {
  const { success, error } = useToast();
  const token = useAuthToken();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_VEHICLE_PAGE_SIZE);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const typesQuery = useVehicleTypesQuery(page, pageSize, search);
  const vehicleTypes = (typesQuery.data?.content ?? []) as VehicleEntity[];
  const totalPages = typesQuery.data?.totalPages ?? 1;
  const loading = typesQuery.isLoading || typesQuery.isFetching;

  const form = useForm<VehicleTypeForm>({
    resolver: zodResolver(vehicleTypeSchema),
    defaultValues: { name: "", status: "PENDING", image: "" }
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["vehicle", "types"] });
  };

  const openAdd = () => {
    setEditingId(null);
    form.reset({ name: "", status: "PENDING", image: "" });
    setShowModal(true);
  };

  const openEdit = (type: VehicleEntity) => {
    setEditingId(type.id);
    form.reset({
      name: type.name,
      status: (type.status as VehicleTypeForm["status"]) ?? "PENDING",
      image: type.image ?? ""
    });
    setShowModal(true);
  };

  const submit = async (values: VehicleTypeForm) => {
    if (!token) return;
    setSubmitting(true);
    try {
      const payload = { name: values.name, status: values.status, image: values.image };
      if (editingId) {
        await updateVehicleType(editingId, payload, { token });
        success("Vehicle type updated successfully.");
      } else {
        await createVehicleType(payload, { token });
        success("Vehicle type created successfully.");
      }
      setShowModal(false);
      await invalidate();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save vehicle type.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !token) return;
    setDeleting(true);
    try {
      await deleteVehicleType(deleteId, { token });
      success("Vehicle type deleted successfully.");
      setDeleteId(null);
      await invalidate();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to delete item.");
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 border-b border-border/50 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Vehicle Types</CardTitle>
            <p className="text-xs text-muted-foreground sm:text-sm">
              All ride categories with operational defaults.
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle Type
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search vehicle type..."
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: pageSize }).map((_, index) => (
                <div key={`type-skeleton-${index}`} className="rounded-xl border border-border/70 p-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : vehicleTypes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 px-4 py-12 text-center text-sm text-muted-foreground">
              No vehicle types found.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {vehicleTypes.map((type) => (
                <div
                  key={type.id}
                  className="group overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="aspect-video w-full overflow-hidden bg-muted/20">
                    {type.image ? (
                      <img src={type.image} alt={type.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-heading font-semibold">{type.name}</p>
                      <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium">
                        {type.status ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(type)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(type.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <VehiclePageSizeSelect
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
            <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </CardContent>
      </Card>

      <EntityModal
        open={showModal}
        onOpenChange={setShowModal}
        title={editingId ? "Edit Vehicle Type" : "Add Vehicle Type"}
        description="Enter the vehicle type details."
        submitLabel={
          submitting
            ? editingId
              ? "Updating…"
              : "Creating…"
            : editingId
              ? "Update Vehicle Type"
              : "Create Vehicle Type"
        }
        isSubmitting={submitting}
        onCancel={() => setShowModal(false)}
        onSubmit={() => void form.handleSubmit(submit)()}
      >
        <FormField label="Vehicle Name" required error={form.formState.errors.name}>
          <Input placeholder="e.g., Sedan" {...form.register("name")} />
        </FormField>
        <FormField label="Status" required error={form.formState.errors.status}>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Image" required error={form.formState.errors.image}>
          <ImageUploadField
            id="type-image-upload"
            value={form.watch("image")}
            onChange={(url) => form.setValue("image", url, { shouldValidate: true })}
            token={token}
          />
        </FormField>
      </EntityModal>

      <VehicleDeleteDialog
        open={Boolean(deleteId)}
        deleting={deleting}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
