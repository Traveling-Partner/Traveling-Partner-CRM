"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAuthToken } from "@/hooks/api/use-auth-token";
import {
  useVehicleTypesQuery,
  useVehicleModelsQuery,
  useVehicleColorsQuery,
  useVehicleBrandsQuery
} from "@/hooks/queries";
import {
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
  createVehicleModel,
  updateVehicleModel,
  deleteVehicleModel,
  createVehicleColor,
  updateVehicleColor,
  deleteVehicleColor,
  createVehicleBrand,
  updateVehicleBrand,
  deleteVehicleBrand
} from "@/services/vehicle";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { FormField } from "@/components/common/FormField";
import { EntityModal } from "@/components/vehicle-management/EntityModal";
import { ImageUploadField } from "@/components/vehicle-management/ImageUploadField";
import { ManagementTable } from "@/components/vehicle-management/ManagementTable";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { VehicleDeleteDialog } from "@/components/vehicle-management/VehicleDeleteDialog";

type TabValue = "vehicleTypes" | "vehicleModels" | "vehicleColors" | "vehicleBrands";

interface VehicleType {
  id: number | string;
  name: string;
  status: string | null;
  image: string | null;
}

interface VehicleTypesApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    content: VehicleType[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
  };
}

interface VehicleModel {
  id: number | string;
  name: string;
  status: string | null;
  image: string | null;
}

interface VehicleModelsApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    content: VehicleModel[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
  };
}

interface VehicleColor {
  id: number | string;
  name: string;
  status: string | null;
  image: string | null;
}

interface VehicleColorsApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    content: VehicleColor[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
  };
}

interface VehicleBrand {
  id: number | string;
  name: string;
  vehicleTypeId: number | null;
  status: string | null;
  image: string | null;
}

interface VehicleBrandsApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    content: VehicleBrand[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
  };
}

type DeleteTarget =
  | { tab: "vehicleTypes"; id: number | string; name: string }
  | { tab: "vehicleModels"; id: number | string; name: string }
  | { tab: "vehicleColors"; id: number | string; name: string }
  | { tab: "vehicleBrands"; id: number | string; name: string }
  | null;

function deleteEntityLabel(tab: NonNullable<DeleteTarget>["tab"]): string {
  switch (tab) {
    case "vehicleTypes":
      return "vehicle type";
    case "vehicleModels":
      return "vehicle model";
    case "vehicleColors":
      return "vehicle color";
    case "vehicleBrands":
      return "vehicle brand";
    default:
      return "record";
  }
}

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING", "APPROVED"] as const;

const vehicleTypeSchema = z.object({
  name: z.string().trim().min(1, "Vehicle type name is required."),
  status: z.enum(STATUS_OPTIONS),
  image: z.string().trim().min(1, "Image is required.")
});

const modelSchema = z.object({
  name: z.string().trim().min(1, "Model name is required."),
  status: z.enum(STATUS_OPTIONS),
  image: z.string().trim().min(1, "Image is required.")
});

const colorSchema = z.object({
  name: z.string().trim().min(1, "Color name is required."),
  status: z.enum(STATUS_OPTIONS),
  image: z.string().trim().min(1, "Image is required.")
});

const brandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required."),
  vehicleTypeId: z.coerce.number().min(1, "Vehicle type is required."),
  status: z.enum(STATUS_OPTIONS),
  image: z.string().trim().min(1, "Image is required.")
});

type VehicleTypeForm = z.infer<typeof vehicleTypeSchema>;
type ModelForm = z.infer<typeof modelSchema>;
type ColorForm = z.infer<typeof colorSchema>;
type BrandForm = z.infer<typeof brandSchema>;

const DEFAULT_PAGE_SIZE = 6;

export default function VehicleTypesPage() {
  const { success, error } = useToast();

  const token = useAuthToken();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabValue>("vehicleTypes");

  const [typeSearch, setTypeSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [colorSearch, setColorSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  const [typePage, setTypePage] = useState(1);
  const [modelPage, setModelPage] = useState(1);
  const [colorPage, setColorPage] = useState(1);
  const [brandPage, setBrandPage] = useState(1);
  const [typePageSize, setTypePageSize] = useState(DEFAULT_PAGE_SIZE);
  const [modelPageSize, setModelPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [colorPageSize, setColorPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [brandPageSize, setBrandPageSize] = useState(DEFAULT_PAGE_SIZE);

  const typesQuery = useVehicleTypesQuery(typePage, typePageSize, typeSearch);
  const modelsQuery = useVehicleModelsQuery(modelPage, modelPageSize, modelSearch);
  const colorsQuery = useVehicleColorsQuery(colorPage, colorPageSize, colorSearch);
  const brandsQuery = useVehicleBrandsQuery(brandPage, brandPageSize, brandSearch);

  const vehicleTypes = (typesQuery.data?.content ?? []) as VehicleType[];
  const typeTotalPages = typesQuery.data?.totalPages ?? 1;
  const typeLoading = typesQuery.isLoading || typesQuery.isFetching;

  const vehicleModels = (modelsQuery.data?.content ?? []) as VehicleModel[];
  const modelTotalPages = modelsQuery.data?.totalPages ?? 1;
  const modelLoading = modelsQuery.isLoading || modelsQuery.isFetching;

  const vehicleColors = (colorsQuery.data?.content ?? []) as VehicleColor[];
  const colorTotalPages = colorsQuery.data?.totalPages ?? 1;
  const colorLoading = colorsQuery.isLoading || colorsQuery.isFetching;

  const vehicleBrands = (brandsQuery.data?.content ?? []) as VehicleBrand[];
  const brandTotalPages = brandsQuery.data?.totalPages ?? 1;
  const brandLoading = brandsQuery.isLoading || brandsQuery.isFetching;

  const [editingTypeId, setEditingTypeId] = useState<number | string | null>(null);
  const [editingModelId, setEditingModelId] = useState<number | string | null>(null);
  const [editingColorId, setEditingColorId] = useState<number | string | null>(null);
  const [editingBrandId, setEditingBrandId] = useState<number | string | null>(null);

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const typeForm = useForm<VehicleTypeForm>({
    resolver: zodResolver(vehicleTypeSchema),
    defaultValues: { name: "", status: "PENDING", image: "" }
  });

  const modelForm = useForm<ModelForm>({
    resolver: zodResolver(modelSchema),
    defaultValues: { name: "", status: "PENDING", image: "" }
  });

  const colorForm = useForm<ColorForm>({
    resolver: zodResolver(colorSchema),
    defaultValues: { name: "", status: "PENDING", image: "" }
  });

  const brandForm = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", vehicleTypeId: 0, status: "PENDING", image: "" }
  });

  const invalidateVehicleTab = async (tabKey: "types" | "models" | "colors" | "brands") => {
    await queryClient.invalidateQueries({ queryKey: ["vehicle", tabKey] });
  };

  const openAddType = () => {
    setEditingTypeId(null);
    typeForm.reset({ name: "", status: "PENDING", image: "" });
    setShowTypeModal(true);
  };

  const openEditType = (type: VehicleType) => {
    setEditingTypeId(type.id);
    typeForm.reset({ name: type.name, status: (type.status as VehicleTypeForm["status"]) ?? "PENDING", image: type.image ?? "" });
    setShowTypeModal(true);
  };

  const openAddModel = () => {
    setEditingModelId(null);
    modelForm.reset({ name: "", status: "PENDING", image: "" });
    setShowModelModal(true);
  };

  const openEditModel = (model: VehicleModel) => {
    setEditingModelId(model.id);
    modelForm.reset({
      name: model.name,
      status: (model.status as ModelForm["status"]) ?? "PENDING",
      image: model.image ?? ""
    });
    setShowModelModal(true);
  };

  const openAddColor = () => {
    setEditingColorId(null);
    colorForm.reset({ name: "", status: "PENDING", image: "" });
    setShowColorModal(true);
  };

  const openEditColor = (color: VehicleColor) => {
    setEditingColorId(color.id);
    colorForm.reset({
      name: color.name,
      status: (color.status as ColorForm["status"]) ?? "PENDING",
      image: color.image ?? ""
    });
    setShowColorModal(true);
  };

  const openAddBrand = () => {
    setEditingBrandId(null);
    brandForm.reset({ name: "", vehicleTypeId: 0, status: "PENDING", image: "" });
    setShowBrandModal(true);
  };

  const openEditBrand = (brand: VehicleBrand) => {
    setEditingBrandId(brand.id);
    brandForm.reset({
      name: brand.name,
      vehicleTypeId: brand.vehicleTypeId ?? 0,
      status: (brand.status as BrandForm["status"]) ?? "PENDING",
      image: brand.image ?? ""
    });
    setShowBrandModal(true);
  };

  const [typeSubmitting, setTypeSubmitting] = useState(false);

  const submitType = async (values: VehicleTypeForm) => {
    if (!token) return;
    setTypeSubmitting(true);
    try {
      const typePayload = { name: values.name, status: values.status, image: values.image };
      if (editingTypeId) {
        await updateVehicleType(editingTypeId, typePayload, { token });
        success("Vehicle type updated successfully.");
      } else {
        await createVehicleType(typePayload, { token });
        success("Vehicle type created successfully.");
      }
      setShowTypeModal(false);
      await invalidateVehicleTab("types");
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save vehicle type.");
    } finally {
      setTypeSubmitting(false);
    }
  };

  const [modelSubmitting, setModelSubmitting] = useState(false);

  const submitModel = async (values: ModelForm) => {
    if (!token) return;
    setModelSubmitting(true);
    try {
      const payload = { name: values.name, status: values.status, image: values.image };
      if (editingModelId) {
        await updateVehicleModel(editingModelId, payload, { token });
        success("Vehicle model updated successfully.");
      } else {
        await createVehicleModel(payload, { token });
        success("Vehicle model created successfully.");
      }
      setShowModelModal(false);
      await invalidateVehicleTab("models");
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save vehicle model.");
    } finally {
      setModelSubmitting(false);
    }
  };

  const [colorSubmitting, setColorSubmitting] = useState(false);

  const submitColor = async (values: ColorForm) => {
    if (!token) return;
    setColorSubmitting(true);
    try {
      const payload = { name: values.name, status: values.status, image: values.image };
      if (editingColorId) {
        await updateVehicleColor(editingColorId, payload, { token });
        success("Vehicle color updated successfully.");
      } else {
        await createVehicleColor(payload, { token });
        success("Vehicle color created successfully.");
      }
      setShowColorModal(false);
      await invalidateVehicleTab("colors");
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save vehicle color.");
    } finally {
      setColorSubmitting(false);
    }
  };

  const [brandSubmitting, setBrandSubmitting] = useState(false);

  const submitBrand = async (values: BrandForm) => {
    if (!token) return;
    setBrandSubmitting(true);
    try {
      const payload = {
        name: values.name,
        vehicleTypeId: values.vehicleTypeId,
        status: values.status,
        image: values.image
      };
      if (editingBrandId) {
        await updateVehicleBrand(editingBrandId, payload, { token });
        success("Vehicle brand updated successfully.");
      } else {
        await createVehicleBrand(payload, { token });
        success("Vehicle brand created successfully.");
      }
      setShowBrandModal(false);
      await invalidateVehicleTab("brands");
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save vehicle brand.");
    } finally {
      setBrandSubmitting(false);
    }
  };

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;

    setDeleting(true);
    try {
      if (deleteTarget.tab === "vehicleTypes") {
        await deleteVehicleType(deleteTarget.id, { token });
        success("Vehicle type deleted successfully.");
        await invalidateVehicleTab("types");
      } else if (deleteTarget.tab === "vehicleModels") {
        await deleteVehicleModel(deleteTarget.id, { token });
        success("Vehicle model deleted successfully.");
        await invalidateVehicleTab("models");
      } else if (deleteTarget.tab === "vehicleColors") {
        await deleteVehicleColor(deleteTarget.id, { token });
        success("Vehicle color deleted successfully.");
        await invalidateVehicleTab("colors");
      } else if (deleteTarget.tab === "vehicleBrands") {
        await deleteVehicleBrand(deleteTarget.id, { token });
        success("Vehicle brand deleted successfully.");
        await invalidateVehicleTab("brands");
      }
      setDeleteTarget(null);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to delete item.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell title="Vehicle types">
      <PageContainer>
        <div className="px-1">
          <h1 className="text-lg font-heading font-bold text-foreground sm:text-xl">Vehicle Management</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage all vehicles used in the ride-hailing ecosystem.
          </p>
        </div>

        <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
          {/* <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-border/60 bg-muted/50 p-1">
            <TabsTrigger value="vehicleTypes">Vehicle Types</TabsTrigger>
            <TabsTrigger value="vehicleModels">Vehicle Models</TabsTrigger>
            <TabsTrigger value="vehicleColors">Vehicle Colors</TabsTrigger>
            <TabsTrigger value="vehicleBrands">Vehicle Brands</TabsTrigger>
          </TabsList> */}

          <TabsContent value="vehicleTypes">
            <Card>
              <CardHeader className="flex flex-col gap-3 border-b border-border/50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Vehicle Types</CardTitle>
                  <p className="text-xs text-muted-foreground sm:text-sm">All ride categories with operational defaults.</p>
                </div>
                <Button onClick={openAddType}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle Type
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={typeSearch}
                      onChange={(event) => {
                        setTypeSearch(event.target.value);
                        setTypePage(1);
                      }}
                      placeholder="Search vehicle type..."
                      className="pl-9"
                    />
                  </div>
                </div>

                {typeLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: typePageSize }).map((_, index) => (
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
                        className="group rounded-xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md overflow-hidden"
                      >
                        <div className="aspect-video w-full overflow-hidden bg-muted/20">
                          {type.image ? (
                            <img src={type.image} alt={type.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No image</div>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-heading font-semibold">{type.name}</p>
                            <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium">{type.status ?? "—"}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Edit ${type.name}`}
                              onClick={() => openEditType(type)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Delete ${type.name}`}
                              onClick={() =>
                                setDeleteTarget({ tab: "vehicleTypes", id: type.id, name: type.name })
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Select
                    value={String(typePageSize)}
                    onValueChange={(value) => {
                      setTypePageSize(Number(value));
                      setTypePage(1);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 / page</SelectItem>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                  </Select>
                  <PaginationControls currentPage={typePage} totalPages={typeTotalPages} onPageChange={setTypePage} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicleModels">
            <Card>
              <CardHeader className="flex flex-col gap-3 border-b border-border/50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Vehicle Models</CardTitle>
                  <p className="text-xs text-muted-foreground sm:text-sm">Model years for marketplace availability.</p>
                </div>
                <Button onClick={openAddModel}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Model
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={modelSearch}
                      onChange={(event) => {
                        setModelSearch(event.target.value);
                        setModelPage(1);
                      }}
                      placeholder="Search model..."
                      className="pl-9"
                    />
                  </div>
                </div>
                <ManagementTable
                  isLoading={modelLoading}
                  rows={vehicleModels}
                  emptyLabel="No models found."
                  columns={[
                    {
                      key: "image",
                      header: "Image",
                      className: "w-[80px]",
                      render: (item: VehicleModel) => item.image ? <img src={item.image} alt={item.name} className="h-10 w-16 rounded object-contain" /> : <span className="text-xs text-muted-foreground">—</span>
                    },
                    { key: "name", header: "Name", render: (item: VehicleModel) => <span className="font-medium">{item.name}</span> },
                    {
                      key: "status",
                      header: "Status",
                      render: (item: VehicleModel) => <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium">{item.status ?? "—"}</span>
                    },
                    {
                      key: "actions",
                      header: "Actions",
                      className: "w-[140px]",
                      render: (item: VehicleModel) => (
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Edit ${item.name}`}
                            onClick={() => openEditModel(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Delete ${item.name}`}
                            onClick={() =>
                              setDeleteTarget({ tab: "vehicleModels", id: item.id, name: item.name })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )
                    }
                  ]}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Select
                    value={String(modelPageSize)}
                    onValueChange={(value) => {
                      setModelPageSize(Number(value));
                      setModelPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 / page</SelectItem>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                  </Select>
                  <PaginationControls currentPage={modelPage} totalPages={modelTotalPages} onPageChange={setModelPage} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicleColors">
            <Card>
              <CardHeader className="flex flex-col gap-3 border-b border-border/50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Vehicle Colors</CardTitle>
                  <p className="text-xs text-muted-foreground sm:text-sm">Manage vehicle colors mapped to types and models.</p>
                </div>
                <Button onClick={openAddColor}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Color
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={colorSearch}
                      onChange={(event) => { setColorSearch(event.target.value); setColorPage(1); }}
                      placeholder="Search color..."
                      className="pl-9"
                    />
                  </div>
                </div>
                <ManagementTable
                  isLoading={colorLoading}
                  rows={vehicleColors}
                  emptyLabel="No colors found."
                  columns={[
                    {
                      key: "image",
                      header: "Image",
                      className: "w-[80px]",
                      render: (item: VehicleColor) => item.image ? <img src={item.image} alt={item.name} className="h-10 w-16 rounded object-contain" /> : <span className="text-xs text-muted-foreground">—</span>
                    },
                    { key: "name", header: "Name", render: (item: VehicleColor) => <span className="font-medium">{item.name}</span> },
                    {
                      key: "status",
                      header: "Status",
                      render: (item: VehicleColor) => <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium">{item.status ?? "—"}</span>
                    },
                    {
                      key: "actions",
                      header: "Actions",
                      className: "w-[140px]",
                      render: (item: VehicleColor) => (
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Edit ${item.name}`}
                            onClick={() => openEditColor(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Delete ${item.name}`}
                            onClick={() =>
                              setDeleteTarget({ tab: "vehicleColors", id: item.id, name: item.name })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )
                    }
                  ]}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Select
                    value={String(colorPageSize)}
                    onValueChange={(value) => {
                      setColorPageSize(Number(value));
                      setColorPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 / page</SelectItem>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                  </Select>
                  <PaginationControls currentPage={colorPage} totalPages={colorTotalPages} onPageChange={setColorPage} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicleBrands">
            <Card>
              <CardHeader className="flex flex-col gap-3 border-b border-border/50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Vehicle Brands</CardTitle>
                  <p className="text-xs text-muted-foreground sm:text-sm">Manage vehicle brands mapped to vehicle types.</p>
                </div>
                <Button onClick={openAddBrand}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Brand
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={brandSearch}
                      onChange={(event) => { setBrandSearch(event.target.value); setBrandPage(1); }}
                      placeholder="Search brand..."
                      className="pl-9"
                    />
                  </div>
                </div>
                <ManagementTable
                  isLoading={brandLoading}
                  rows={vehicleBrands}
                  emptyLabel="No brands found."
                  columns={[
                    {
                      key: "image",
                      header: "Image",
                      className: "w-[80px]",
                      render: (item: VehicleBrand) => item.image ? <img src={item.image} alt={item.name} className="h-10 w-16 rounded object-contain" /> : <span className="text-xs text-muted-foreground">—</span>
                    },
                    { key: "name", header: "Brand Name", render: (item: VehicleBrand) => <span className="font-medium">{item.name}</span> },
                    {
                      key: "vehicleType",
                      header: "Vehicle Type",
                      render: (item: VehicleBrand) => {
                        const typeName = vehicleTypes.find((t) => Number(t.id) === Number(item.vehicleTypeId))?.name;
                        return <span className="text-xs text-muted-foreground">{typeName ?? "—"}</span>;
                      }
                    },
                    {
                      key: "status",
                      header: "Status",
                      render: (item: VehicleBrand) => <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium">{item.status ?? "—"}</span>
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
                            onClick={() => openEditBrand(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Delete ${item.name}`}
                            onClick={() =>
                              setDeleteTarget({ tab: "vehicleBrands", id: item.id, name: item.name })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )
                    }
                  ]}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Select
                    value={String(brandPageSize)}
                    onValueChange={(value) => {
                      setBrandPageSize(Number(value));
                      setBrandPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 / page</SelectItem>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                  </Select>
                  <PaginationControls currentPage={brandPage} totalPages={brandTotalPages} onPageChange={setBrandPage} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContainer>

      <EntityModal
        open={showTypeModal}
        onOpenChange={setShowTypeModal}
        title={editingTypeId ? "Edit Vehicle Type" : "Add Vehicle Type"}
        description="Enter the vehicle type details."
        submitLabel={typeSubmitting ? (editingTypeId ? "Updating…" : "Creating…") : editingTypeId ? "Update Vehicle Type" : "Create Vehicle Type"}
        isSubmitting={typeSubmitting}
        onCancel={() => setShowTypeModal(false)}
        onSubmit={() => void typeForm.handleSubmit(submitType)()}
      >
        <FormField label="Vehicle Name" required error={typeForm.formState.errors.name}>
          <Input placeholder="e.g., Sedan" {...typeForm.register("name")} />
        </FormField>
        <FormField label="Status" required error={typeForm.formState.errors.status}>
          <Controller
            name="status"
            control={typeForm.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Image" required error={typeForm.formState.errors.image}>
          <ImageUploadField
            id="type-image-upload"
            value={typeForm.watch("image")}
            onChange={(url) => typeForm.setValue("image", url, { shouldValidate: true })}
            token={token}
          />
        </FormField>
      </EntityModal>

      <EntityModal
        open={showModelModal}
        onOpenChange={setShowModelModal}
        title={editingModelId ? "Edit Vehicle Model" : "Add Vehicle Model"}
        description="Add or update model entries."
        submitLabel={modelSubmitting ? (editingModelId ? "Updating…" : "Creating…") : editingModelId ? "Update Model" : "Create Model"}
        isSubmitting={modelSubmitting}
        onCancel={() => setShowModelModal(false)}
        onSubmit={() => void modelForm.handleSubmit(submitModel)()}
      >
        <FormField label="Model Name" required error={modelForm.formState.errors.name}>
          <Input placeholder="e.g., Corolla 2022" {...modelForm.register("name")} />
        </FormField>
        <FormField label="Status" required error={modelForm.formState.errors.status}>
          <Controller
            name="status"
            control={modelForm.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Image" required error={modelForm.formState.errors.image}>
          <ImageUploadField
            id="model-image-upload"
            value={modelForm.watch("image")}
            onChange={(url) => modelForm.setValue("image", url, { shouldValidate: true })}
            token={token}
          />
        </FormField>
      </EntityModal>

      <EntityModal
        open={showColorModal}
        onOpenChange={setShowColorModal}
        title={editingColorId ? "Edit Vehicle Color" : "Add Vehicle Color"}
        description="Map a color to a vehicle type and model."
        submitLabel={colorSubmitting ? (editingColorId ? "Updating…" : "Creating…") : editingColorId ? "Update Color" : "Create Color"}
        isSubmitting={colorSubmitting}
        onCancel={() => setShowColorModal(false)}
        onSubmit={() => void colorForm.handleSubmit(submitColor)()}
      >
        <FormField label="Color Name" required error={colorForm.formState.errors.name}>
          <Input placeholder="e.g., White" {...colorForm.register("name")} />
        </FormField>
        <FormField label="Status" required error={colorForm.formState.errors.status}>
          <Controller
            name="status"
            control={colorForm.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Image" required error={colorForm.formState.errors.image}>
          <ImageUploadField
            id="color-image-upload"
            value={colorForm.watch("image")}
            onChange={(url) => colorForm.setValue("image", url, { shouldValidate: true })}
            token={token}
          />
        </FormField>
      </EntityModal>

      <EntityModal
        open={showBrandModal}
        onOpenChange={setShowBrandModal}
        title={editingBrandId ? "Edit Vehicle Brand" : "Add Vehicle Brand"}
        description="Map a brand to a vehicle type."
        submitLabel={brandSubmitting ? (editingBrandId ? "Updating…" : "Creating…") : editingBrandId ? "Update Brand" : "Create Brand"}
        isSubmitting={brandSubmitting}
        onCancel={() => setShowBrandModal(false)}
        onSubmit={() => void brandForm.handleSubmit(submitBrand)()}
      >
        <FormField label="Brand Name" required error={brandForm.formState.errors.name}>
          <Input placeholder="e.g., Toyota" {...brandForm.register("name")} />
        </FormField>
        <FormField label="Vehicle Type" required error={brandForm.formState.errors.vehicleTypeId}>
          <Controller
            name="vehicleTypeId"
            control={brandForm.control}
            render={({ field }) => (
              <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Status" required error={brandForm.formState.errors.status}>
          <Controller
            name="status"
            control={brandForm.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Image" required error={brandForm.formState.errors.image}>
          <ImageUploadField
            id="brand-image-upload"
            value={brandForm.watch("image")}
            onChange={(url) => brandForm.setValue("image", url, { shouldValidate: true })}
            token={token}
          />
        </FormField>
      </EntityModal>

      <VehicleDeleteDialog
        open={Boolean(deleteTarget)}
        deleting={deleting}
        recordName={deleteTarget?.name}
        entityLabel={deleteTarget ? deleteEntityLabel(deleteTarget.tab) : "record"}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AppShell>
  );
}
