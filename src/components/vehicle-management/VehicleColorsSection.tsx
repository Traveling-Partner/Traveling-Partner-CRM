"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAuthToken } from "@/hooks/api/use-auth-token";
import { useVehicleColorsQuery } from "@/hooks/queries";
import { createVehicleColor, deleteVehicleColor, updateVehicleColor } from "@/services/vehicle";
import type { VehicleEntity } from "@/services/vehicle";
import { FormField } from "@/components/common/FormField";
import { EntityModal } from "@/components/vehicle-management/EntityModal";
import { ImageUploadField } from "@/components/vehicle-management/ImageUploadField";
import { ManagementTable } from "@/components/vehicle-management/ManagementTable";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { VehicleDeleteDialog } from "@/components/vehicle-management/VehicleDeleteDialog";
import { VehiclePageSizeSelect } from "@/components/vehicle-management/VehiclePageSizeSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  colorSchema,
  type ColorForm
} from "@/app/admin/vehicle-management/_vehicle-form-shared";

export function VehicleColorsSection() {
  const { success, error } = useToast();
  const token = useAuthToken();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_VEHICLE_PAGE_SIZE);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const colorsQuery = useVehicleColorsQuery(page, pageSize, search);
  const vehicleColors = (colorsQuery.data?.content ?? []) as VehicleEntity[];
  const totalPages = colorsQuery.data?.totalPages ?? 1;
  const loading = colorsQuery.isLoading || colorsQuery.isFetching;

  const form = useForm<ColorForm>({
    resolver: zodResolver(colorSchema),
    defaultValues: { name: "", status: "PENDING", image: "" }
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["vehicle", "colors"] });
  };

  const openAdd = () => {
    setEditingId(null);
    form.reset({ name: "", status: "PENDING", image: "" });
    setShowModal(true);
  };

  const openEdit = (color: VehicleEntity) => {
    setEditingId(color.id);
    form.reset({
      name: color.name,
      status: (color.status as ColorForm["status"]) ?? "PENDING",
      image: color.image ?? ""
    });
    setShowModal(true);
  };

  const submit = async (values: ColorForm) => {
    if (!token) return;
    setSubmitting(true);
    try {
      const payload = { name: values.name, status: values.status, image: values.image };
      if (editingId) {
        await updateVehicleColor(editingId, payload, { token });
        success("Vehicle color updated successfully.");
      } else {
        await createVehicleColor(payload, { token });
        success("Vehicle color created successfully.");
      }
      setShowModal(false);
      await invalidate();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save vehicle color.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      await deleteVehicleColor(deleteTarget.id, { token });
      success("Vehicle color deleted successfully.");
      setDeleteTarget(null);
      await invalidate();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to delete item.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 border-b border-border/50 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Vehicle Colors</CardTitle>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Manage vehicle colors mapped to types and models.
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Color
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
                placeholder="Search color..."
                className="pl-9"
              />
            </div>
          </div>
          <ManagementTable
            isLoading={loading}
            rows={vehicleColors}
            emptyLabel="No colors found."
            columns={[
              {
                key: "image",
                header: "Image",
                className: "w-[80px]",
                render: (item: VehicleEntity) =>
                  item.image ? (
                    <img src={item.image} alt={item.name} className="h-10 w-16 rounded object-contain" />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )
              },
              {
                key: "name",
                header: "Name",
                render: (item: VehicleEntity) => <span className="font-medium">{item.name}</span>
              },
              {
                key: "status",
                header: "Status",
                render: (item: VehicleEntity) => (
                  <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium">
                    {item.status ?? "—"}
                  </span>
                )
              },
              {
                key: "actions",
                header: "Actions",
                className: "w-[140px]",
                render: (item: VehicleEntity) => (
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${item.name}`}
                      onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )
              }
            ]}
          />
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
        title={editingId ? "Edit Vehicle Color" : "Add Vehicle Color"}
        description="Map a color to a vehicle type and model."
        submitLabel={
          submitting
            ? editingId
              ? "Updating…"
              : "Creating…"
            : editingId
              ? "Update Color"
              : "Create Color"
        }
        isSubmitting={submitting}
        onCancel={() => setShowModal(false)}
        onSubmit={() => void form.handleSubmit(submit)()}
      >
        <FormField label="Color Name" required error={form.formState.errors.name}>
          <Input placeholder="e.g., White" {...form.register("name")} />
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
            id="color-image-upload"
            value={form.watch("image")}
            onChange={(url) => form.setValue("image", url, { shouldValidate: true })}
            token={token}
          />
        </FormField>
      </EntityModal>

      <VehicleDeleteDialog
        open={Boolean(deleteTarget)}
        deleting={deleting}
        recordName={deleteTarget?.name}
        entityLabel="vehicle color"
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
