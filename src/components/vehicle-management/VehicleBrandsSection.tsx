"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAuthToken } from "@/hooks/api/use-auth-token";
import { useVehicleBrandsQuery, useVehicleTypeOptionsQuery } from "@/hooks/queries";
import { createVehicleBrand, deleteVehicleBrand, updateVehicleBrand } from "@/services/vehicle";
import type { VehicleBrand, VehicleEntity } from "@/services/vehicle";
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
  brandSchema,
  type BrandForm
} from "@/app/admin/vehicle-management/_vehicle-form-shared";

export function VehicleBrandsSection() {
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

  const brandsQuery = useVehicleBrandsQuery(page, pageSize, search);
  const typesQuery = useVehicleTypeOptionsQuery();

  const vehicleBrands = (brandsQuery.data?.content ?? []) as VehicleBrand[];
  const vehicleTypes = (typesQuery.data ?? []) as VehicleEntity[];
  const totalPages = brandsQuery.data?.totalPages ?? 1;
  const loading = brandsQuery.isLoading || brandsQuery.isFetching;

  const form = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", vehicleTypeId: 0, status: "PENDING", image: "" }
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["vehicle", "brands"] });
  };

  const openAdd = () => {
    setEditingId(null);
    form.reset({ name: "", vehicleTypeId: 0, status: "PENDING", image: "" });
    setShowModal(true);
  };

  const openEdit = (brand: VehicleBrand) => {
    setEditingId(brand.id);
    form.reset({
      name: brand.name,
      vehicleTypeId: brand.vehicleTypeId ?? 0,
      status: (brand.status as BrandForm["status"]) ?? "PENDING",
      image: brand.image ?? ""
    });
    setShowModal(true);
  };

  const submit = async (values: BrandForm) => {
    if (!token) return;
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        vehicleTypeId: values.vehicleTypeId,
        status: values.status,
        image: values.image
      };
      if (editingId) {
        await updateVehicleBrand(editingId, payload, { token });
        success("Vehicle brand updated successfully.");
      } else {
        await createVehicleBrand(payload, { token });
        success("Vehicle brand created successfully.");
      }
      setShowModal(false);
      await invalidate();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save vehicle brand.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      await deleteVehicleBrand(deleteTarget.id, { token });
      success("Vehicle brand deleted successfully.");
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
            <CardTitle>Vehicle Brands</CardTitle>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Manage vehicle brands mapped to vehicle types.
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
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
                placeholder="Search brand..."
                className="pl-9"
              />
            </div>
          </div>
          <ManagementTable
            isLoading={loading}
            rows={vehicleBrands}
            emptyLabel="No brands found."
            columns={[
              {
                key: "image",
                header: "Image",
                className: "w-[80px]",
                render: (item: VehicleBrand) =>
                  item.image ? (
                    <img src={item.image} alt={item.name} className="h-10 w-16 rounded object-contain" />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )
              },
              {
                key: "name",
                header: "Brand Name",
                render: (item: VehicleBrand) => <span className="font-medium">{item.name}</span>
              },
              {
                key: "vehicleType",
                header: "Vehicle Type",
                render: (item: VehicleBrand) => {
                  const typeName = vehicleTypes.find(
                    (type) => Number(type.id) === Number(item.vehicleTypeId)
                  )?.name;
                  return <span className="text-xs text-muted-foreground">{typeName ?? "—"}</span>;
                }
              },
              {
                key: "status",
                header: "Status",
                render: (item: VehicleBrand) => (
                  <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium">
                    {item.status ?? "—"}
                  </span>
                )
              },
              {
                key: "actions",
                header: "Actions",
                className: "w-[140px]",
                render: (item: VehicleBrand) => (
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
        title={editingId ? "Edit Vehicle Brand" : "Add Vehicle Brand"}
        description="Map a brand to a vehicle type."
        submitLabel={
          submitting
            ? editingId
              ? "Updating…"
              : "Creating…"
            : editingId
              ? "Update Brand"
              : "Create Brand"
        }
        isSubmitting={submitting}
        onCancel={() => setShowModal(false)}
        onSubmit={() => void form.handleSubmit(submit)()}
      >
        <FormField label="Brand Name" required error={form.formState.errors.name}>
          <Input placeholder="e.g., Toyota" {...form.register("name")} />
        </FormField>
        <FormField label="Vehicle Type" required error={form.formState.errors.vehicleTypeId}>
          <Controller
            name="vehicleTypeId"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
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
            id="brand-image-upload"
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
        entityLabel="vehicle brand"
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
