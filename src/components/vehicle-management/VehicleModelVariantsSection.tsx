"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAuthToken } from "@/hooks/api/use-auth-token";
import {
  useVehicleBrandsQuery,
  useVehicleColorsQuery,
  useVehicleModelsQuery,
  useVehicleTypesQuery
} from "@/hooks/queries";
import { createVehicleColor, deleteVehicleColor, updateVehicleColor } from "@/services/vehicle";
import type { VehicleBrand, VehicleEntity, VehicleModel, VehicleModelVariant } from "@/services/vehicle";
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
  variantSchema,
  type VariantForm
} from "@/app/admin/vehicle-management/_vehicle-form-shared";

export function VehicleModelVariantsSection() {
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

  const variantsQuery = useVehicleColorsQuery(page, pageSize, search);
  const typesQuery = useVehicleTypesQuery(1, 100, "");
  const brandsQuery = useVehicleBrandsQuery(1, 100, "");
  const modelsQuery = useVehicleModelsQuery(1, 100, "");

  const vehicleModelVariants = (variantsQuery.data?.content ?? []) as VehicleModelVariant[];
  const vehicleTypes = (typesQuery.data?.content ?? []) as VehicleEntity[];
  const vehicleBrands = (brandsQuery.data?.content ?? []) as VehicleBrand[];
  const vehicleModels = (modelsQuery.data?.content ?? []) as VehicleModel[];
  const totalPages = variantsQuery.data?.totalPages ?? 1;
  const loading = variantsQuery.isLoading || variantsQuery.isFetching;

  const form = useForm<VariantForm>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      name: "",
      vehicleTypeId: 0,
      brandId: 0,
      modelYearId: 0,
      mileage: 0,
      status: "PENDING",
      image: ""
    }
  });

  const selectedTypeId = form.watch("vehicleTypeId");
  const selectedBrandId = form.watch("brandId");
  const brandsForType = vehicleBrands.filter(
    (brand) => Number(brand.vehicleTypeId) === Number(selectedTypeId)
  );
  const modelsForBrand = vehicleModels.filter(
    (model) =>
      Number(model.vehicleTypeId) === Number(selectedTypeId) &&
      Number(model.brandId) === Number(selectedBrandId)
  );

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["vehicle", "colors"] });
  };

  const openAdd = () => {
    setEditingId(null);
    form.reset({
      name: "",
      vehicleTypeId: 0,
      brandId: 0,
      modelYearId: 0,
      mileage: 0,
      status: "PENDING",
      image: ""
    });
    setShowModal(true);
  };

  const openEdit = (variant: VehicleModelVariant) => {
    setEditingId(variant.id);
    form.reset({
      name: variant.name,
      vehicleTypeId: variant.vehicleTypeId ?? 0,
      brandId: variant.brandId ?? 0,
      modelYearId: variant?.modelYearId ?? 0,
      mileage: variant.mileage ?? 0,
      status: (variant.status as VariantForm["status"]) ?? "PENDING",
      image: variant.image ?? ""
    });
    setShowModal(true);
  };

  const submit = async (values: VariantForm) => {
    if (!token) return;
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        vehicleTypeId: values.vehicleTypeId,
        brandId: values.brandId,
        modelYearId: values.modelYearId,
        mileage: values.mileage,
        status: values.status,
        image: values.image
      };
      if (editingId) {
        await updateVehicleColor(editingId, payload, { token });
        success("Vehicle model variant updated successfully.");
      } else {
        await createVehicleColor(payload, { token });
        success("Vehicle model variant created successfully.");
      }
      setShowModal(false);
      await invalidate();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save vehicle model variant.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      await deleteVehicleColor(deleteTarget.id, { token });
      success("Vehicle model variant deleted successfully.");
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
            <CardTitle>Vehicle Model Variants</CardTitle>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Manage vehicle model variants mapped to models.
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Model Variant
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
                placeholder="Search model variant..."
                className="pl-9"
              />
            </div>
          </div>
          <ManagementTable
            isLoading={loading}
            rows={vehicleModelVariants}
            emptyLabel="No model variants found."
            columns={[
              {
                key: "image",
                header: "Image",
                className: "w-[80px]",
                render: (item: VehicleModelVariant) =>
                  item.image ? (
                    <img src={item.image} alt={item.name} className="h-10 w-16 rounded object-contain" />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )
              },
              {
                key: "name",
                header: "Variant",
                render: (item: VehicleModelVariant) => <span className="font-medium">{item.name}</span>
              },
              {
                key: "vehicleType",
                header: "Vehicle Type",
                render: (item: VehicleModelVariant) => {
                  const typeName = vehicleTypes.find(
                    (type) => Number(type.id) === Number(item.vehicleTypeId)
                  )?.name;
                  return <span className="text-xs text-muted-foreground">{typeName ?? "—"}</span>;
                }
              },
              {
                key: "brand",
                header: "Brand",
                render: (item: VehicleModelVariant) => {
                  const brandName = vehicleBrands.find(
                    (brand) => Number(brand.id) === Number(item.brandId)
                  )?.name;
                  return <span className="text-xs text-muted-foreground">{brandName ?? "—"}</span>;
                }
              },
              {
                key: "model",
                header: "Model",
                render: (item: VehicleModelVariant) => {
                  const modelName = vehicleModels.find(
                    (model) => Number(model.id) === Number(item.modelYearId)
                  )?.name;
                  return <span className="text-xs text-muted-foreground">{modelName ?? "—"}</span>;
                }
              },
              {
                key: "mileage",
                header: "Mileage",
                render: (item: VehicleModelVariant) => (
                  <span className="text-xs text-muted-foreground">
                    {item.mileage != null ? item.mileage : "—"}
                  </span>
                )
              },
              {
                key: "status",
                header: "Status",
                render: (item: VehicleModelVariant) => (
                  <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium">
                    {item.status ?? "—"}
                  </span>
                )
              },
              {
                key: "actions",
                header: "Actions",
                className: "w-[140px]",
                render: (item: VehicleModelVariant) => (
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
        title={editingId ? "Edit Vehicle Model Variant" : "Add Vehicle Model Variant"}
        description="Map a variant to a vehicle type, brand, and model."
        submitLabel={
          submitting
            ? editingId
              ? "Updating…"
              : "Creating…"
            : editingId
              ? "Update Variant"
              : "Create Variant"
        }
        isSubmitting={submitting}
        onCancel={() => setShowModal(false)}
        onSubmit={() => void form.handleSubmit(submit)()}
      >
        <FormField label="Vehicle Type" required error={form.formState.errors.vehicleTypeId}>
          <Controller
            name="vehicleTypeId"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => {
                  field.onChange(Number(value));
                  form.setValue("brandId", 0);
                  form.setValue("modelYearId", 0);
                }}
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
        <FormField label="Vehicle Brand" required error={form.formState.errors.brandId}>
          <Controller
            name="brandId"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => {
                  field.onChange(Number(value));
                  form.setValue("modelYearId", 0);
                }}
                disabled={!selectedTypeId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={selectedTypeId ? "Select vehicle brand" : "Select vehicle type first"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {brandsForType.map((brand) => (
                    <SelectItem key={brand.id} value={String(brand.id)}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Vehicle Model" required error={form.formState.errors.modelYearId}>
          <Controller
            name="modelYearId"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={!selectedBrandId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={selectedBrandId ? "Select vehicle model" : "Select vehicle brand first"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {modelsForBrand.map((model) => (
                    <SelectItem key={model.id} value={String(model.id)}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Model Variant" required error={form.formState.errors.name}>
          <Input placeholder="e.g., GLI 1.8" {...form.register("name")} />
        </FormField>
        <FormField label="Mileage" required error={form.formState.errors.mileage}>
          <Input
            type="number"
            min={0}
            step={1}
            placeholder="e.g., 15000"
            {...form.register("mileage", { valueAsNumber: true })}
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
            id="variant-image-upload"
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
        entityLabel="vehicle model variant"
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
