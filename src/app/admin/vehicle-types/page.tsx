"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { useAppSelector } from "@/store/hooks";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

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
  vehicleTypeId: number | null;
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
  vehicleTypeId: number | null;
  modelNumberId: number | null;
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
  modelNumberId: number | null;
  colorId: number | null;
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
  | { tab: "vehicleTypes"; id: number | string }
  | { tab: "vehicleModels"; id: number | string }
  | { tab: "vehicleColors"; id: number | string }
  | { tab: "vehicleBrands"; id: number | string }
  | null;

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING", "APPROVED"] as const;

const vehicleTypeSchema = z.object({
  name: z.string().trim().min(1, "Vehicle type name is required."),
  status: z.enum(STATUS_OPTIONS),
  image: z.string().trim().min(1, "Image is required.")
});

const modelSchema = z.object({
  name: z.string().trim().min(1, "Model name is required."),
  vehicleTypeId: z.coerce.number().min(1, "Vehicle type is required."),
  status: z.enum(STATUS_OPTIONS),
  image: z.string().trim().min(1, "Image is required.")
});

const colorSchema = z.object({
  name: z.string().trim().min(1, "Color name is required."),
  vehicleTypeId: z.coerce.number().min(1, "Vehicle type is required."),
  modelNumberId: z.coerce.number().min(1, "Model number is required."),
  status: z.enum(STATUS_OPTIONS),
  image: z.string().trim().min(1, "Image is required.")
});

const brandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required."),
  vehicleTypeId: z.coerce.number().min(1, "Vehicle type is required."),
  modelNumberId: z.coerce.number().min(1, "Model number is required."),
  colorId: z.coerce.number().min(1, "Color is required."),
  status: z.enum(STATUS_OPTIONS),
  image: z.string().trim().min(1, "Image is required.")
});

type VehicleTypeForm = z.infer<typeof vehicleTypeSchema>;
type ModelForm = z.infer<typeof modelSchema>;
type ColorForm = z.infer<typeof colorSchema>;
type BrandForm = z.infer<typeof brandSchema>;

const VEHICLE_TYPE_PAGE_SIZE = 6;

const MODEL_PAGE_SIZE = 6;

const COLOR_PAGE_SIZE = 6;

const BRAND_PAGE_SIZE = 6;

export default function VehicleTypesPage() {
  const { success, error } = useToast();

  const token = useAppSelector((state) => state.auth.token);
  const [tab, setTab] = useState<TabValue>("vehicleTypes");

  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [typeTotalPages, setTypeTotalPages] = useState(1);
  const [typeLoading, setTypeLoading] = useState(false);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [modelTotalPages, setModelTotalPages] = useState(1);
  const [modelLoading, setModelLoading] = useState(false);
  const [vehicleColors, setVehicleColors] = useState<VehicleColor[]>([]);
  const [colorTotalPages, setColorTotalPages] = useState(1);
  const [colorLoading, setColorLoading] = useState(false);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [brandTotalPages, setBrandTotalPages] = useState(1);
  const [brandLoading, setBrandLoading] = useState(false);

  const [typeSearch, setTypeSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [colorSearch, setColorSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  const [typePage, setTypePage] = useState(1);
  const [modelPage, setModelPage] = useState(1);
  const [colorPage, setColorPage] = useState(1);
  const [brandPage, setBrandPage] = useState(1);

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
    defaultValues: { name: "", vehicleTypeId: 0, status: "PENDING", image: "" }
  });

  const colorForm = useForm<ColorForm>({
    resolver: zodResolver(colorSchema),
    defaultValues: { name: "", vehicleTypeId: 0, modelNumberId: 0, status: "PENDING", image: "" }
  });

  const brandForm = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", vehicleTypeId: 0, modelNumberId: 0, colorId: 0, status: "PENDING", image: "" }
  });

  const fetchVehicleTypes = async (page: number, search: string) => {
    setTypeLoading(true);
    try {
      const apiPage = page - 1;
      const res = await fetcher<VehicleTypesApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/vehicleTypes/getAll?page=${apiPage}&size=${VEHICLE_TYPE_PAGE_SIZE}&search=${encodeURIComponent(search)}`,
        { token }
      );
      setVehicleTypes(res.data.content);
      setTypeTotalPages(Math.max(1, res.data.totalPages));
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to load vehicle types.");
    } finally {
      setTypeLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVehicleTypes(typePage, typeSearch);
    }
  }, [token, typePage, typeSearch]);

  const fetchVehicleModels = async (page: number, search: string) => {
    setModelLoading(true);
    try {
      const apiPage = page - 1;
      const res = await fetcher<VehicleModelsApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/modelNumbers/getAll?page=${apiPage}&size=${MODEL_PAGE_SIZE}&search=${encodeURIComponent(search)}`,
        { token }
      );
      setVehicleModels(res.data.content);
      setModelTotalPages(Math.max(1, res.data.totalPages));
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to load vehicle models.");
    } finally {
      setModelLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVehicleModels(modelPage, modelSearch);
    }
  }, [token, modelPage, modelSearch]);

  const fetchVehicleColors = async (page: number, search: string) => {
    setColorLoading(true);
    try {
      const apiPage = page - 1;
      const res = await fetcher<VehicleColorsApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/colors/getAll?page=${apiPage}&size=${COLOR_PAGE_SIZE}&search=${encodeURIComponent(search)}`,
        { token }
      );
      setVehicleColors(res.data.content);
      setColorTotalPages(Math.max(1, res.data.totalPages));
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to load vehicle colors.");
    } finally {
      setColorLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVehicleColors(colorPage, colorSearch);
    }
  }, [token, colorPage, colorSearch]);

  const fetchVehicleBrands = async (page: number, search: string) => {
    setBrandLoading(true);
    try {
      const apiPage = page - 1;
      const res = await fetcher<VehicleBrandsApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/getAll?page=${apiPage}&size=${BRAND_PAGE_SIZE}&search=${encodeURIComponent(search)}`,
        { token }
      );
      setVehicleBrands(res.data.content);
      setBrandTotalPages(Math.max(1, res.data.totalPages));
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to load vehicle brands.");
    } finally {
      setBrandLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVehicleBrands(brandPage, brandSearch);
    }
  }, [token, brandPage, brandSearch]);

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
    modelForm.reset({ name: "", vehicleTypeId: 0, status: "PENDING", image: "" });
    setShowModelModal(true);
  };

  const openEditModel = (model: VehicleModel) => {
    setEditingModelId(model.id);
    modelForm.reset({ name: model.name, vehicleTypeId: Number(model.vehicleTypeId) || 0, status: (model.status as ModelForm["status"]) ?? "PENDING", image: model.image ?? "" });
    setShowModelModal(true);
  };

  const openAddColor = () => {
    setEditingColorId(null);
    colorForm.reset({ name: "", vehicleTypeId: 0, modelNumberId: 0, status: "PENDING", image: "" });
    setShowColorModal(true);
  };

  const openEditColor = (color: VehicleColor) => {
    setEditingColorId(color.id);
    colorForm.reset({
      name: color.name,
      vehicleTypeId: color.vehicleTypeId ?? 0,
      modelNumberId: color.modelNumberId ?? 0,
      status: (color.status as ColorForm["status"]) ?? "PENDING",
      image: color.image ?? ""
    });
    setShowColorModal(true);
  };

  const openAddBrand = () => {
    setEditingBrandId(null);
    brandForm.reset({ name: "", vehicleTypeId: 0, modelNumberId: 0, colorId: 0, status: "PENDING", image: "" });
    setShowBrandModal(true);
  };

  const openEditBrand = (brand: VehicleBrand) => {
    setEditingBrandId(brand.id);
    brandForm.reset({
      name: brand.name,
      vehicleTypeId: brand.vehicleTypeId ?? 0,
      modelNumberId: brand.modelNumberId ?? 0,
      colorId: brand.colorId ?? 0,
      status: (brand.status as BrandForm["status"]) ?? "PENDING",
      image: brand.image ?? ""
    });
    setShowBrandModal(true);
  };

  const [typeSubmitting, setTypeSubmitting] = useState(false);

  const submitType = async (values: VehicleTypeForm) => {
    setTypeSubmitting(true);
    try {
      const typePayload = { name: values.name, status: values.status, image: values.image };
      if (editingTypeId) {
        await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/vehicleTypes/update/${editingTypeId}`,
          { method: "PUT", token, body: JSON.stringify(typePayload) }
        );
        success("Vehicle type updated successfully.");
      } else {
        await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/vehicleTypes/create`,
          { method: "POST", token, body: JSON.stringify(typePayload) }
        );
        success("Vehicle type created successfully.");
      }
      setShowTypeModal(false);
      await fetchVehicleTypes(typePage, typeSearch);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save vehicle type.");
    } finally {
      setTypeSubmitting(false);
    }
  };

  const [modelSubmitting, setModelSubmitting] = useState(false);

  const submitModel = async (values: ModelForm) => {
    setModelSubmitting(true);
    try {
      const payload = { name: values.name, vehicleTypeId: values.vehicleTypeId, status: values.status, image: values.image };
      if (editingModelId) {
        await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/modelNumbers/update/${editingModelId}`,
          { method: "PUT", token, body: JSON.stringify(payload) }
        );
        success("Vehicle model updated successfully.");
      } else {
        await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/modelNumbers/create`,
          { method: "POST", token, body: JSON.stringify(payload) }
        );
        success("Vehicle model created successfully.");
      }
      setShowModelModal(false);
      await fetchVehicleModels(modelPage, modelSearch);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save vehicle model.");
    } finally {
      setModelSubmitting(false);
    }
  };

  const [colorSubmitting, setColorSubmitting] = useState(false);

  const submitColor = async (values: ColorForm) => {
    setColorSubmitting(true);
    try {
      const payload = { name: values.name, vehicleTypeId: values.vehicleTypeId, modelNumberId: values.modelNumberId, status: values.status, image: values.image };
      if (editingColorId) {
        await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/colors/update/${editingColorId}`,
          { method: "PUT", token, body: JSON.stringify(payload) }
        );
        success("Vehicle color updated successfully.");
      } else {
        await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/colors/create`,
          { method: "POST", token, body: JSON.stringify(payload) }
        );
        success("Vehicle color created successfully.");
      }
      setShowColorModal(false);
      await fetchVehicleColors(colorPage, colorSearch);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save vehicle color.");
    } finally {
      setColorSubmitting(false);
    }
  };

  const [brandSubmitting, setBrandSubmitting] = useState(false);

  const submitBrand = async (values: BrandForm) => {
    setBrandSubmitting(true);
    try {
      const payload = {
        name: values.name,
        vehicleTypeId: values.vehicleTypeId,
        modelNumberId: values.modelNumberId,
        colorId: values.colorId,
        status: values.status,
        image: values.image
      };
      if (editingBrandId) {
        await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/brands/update/${editingBrandId}`,
          { method: "PUT", token, body: JSON.stringify(payload) }
        );
        success("Vehicle brand updated successfully.");
      } else {
        await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/brands/create`,
          { method: "POST", token, body: JSON.stringify(payload) }
        );
        success("Vehicle brand created successfully.");
      }
      setShowBrandModal(false);
      await fetchVehicleBrands(brandPage, brandSearch);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save vehicle brand.");
    } finally {
      setBrandSubmitting(false);
    }
  };

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.tab === "vehicleTypes") {
      setDeleting(true);
      try {
        await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/vehicleTypes/delete/${deleteTarget.id}`,
          { method: "DELETE", token }
        );
        success("Vehicle type deleted successfully.");
        setDeleteTarget(null);
        await fetchVehicleTypes(typePage, typeSearch);
      } catch (err) {
        error(err instanceof Error ? err.message : "Failed to delete vehicle type.");
        setDeleteTarget(null);
      } finally {
        setDeleting(false);
      }
      return;
    }

    if (deleteTarget.tab === "vehicleModels") {
      setDeleting(true);
      try {
        await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/modelNumbers/delete/${deleteTarget.id}`,
          { method: "DELETE", token }
        );
        success("Vehicle model deleted successfully.");
        setDeleteTarget(null);
        await fetchVehicleModels(modelPage, modelSearch);
      } catch (err) {
        error(err instanceof Error ? err.message : "Failed to delete vehicle model.");
        setDeleteTarget(null);
      } finally {
        setDeleting(false);
      }
      return;
    }

    if (deleteTarget.tab === "vehicleColors") {
      setDeleting(true);
      try {
        await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/colors/delete/${deleteTarget.id}`,
          { method: "DELETE", token }
        );
        success("Vehicle color deleted successfully.");
        setDeleteTarget(null);
        await fetchVehicleColors(colorPage, colorSearch);
      } catch (err) {
        error(err instanceof Error ? err.message : "Failed to delete vehicle color.");
        setDeleteTarget(null);
      } finally {
        setDeleting(false);
      }
      return;
    }
    if (deleteTarget.tab === "vehicleBrands") {
      setDeleting(true);
      try {
        await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/brands/delete/${deleteTarget.id}`,
          { method: "DELETE", token }
        );
        success("Vehicle brand deleted successfully.");
        setDeleteTarget(null);
        await fetchVehicleBrands(brandPage, brandSearch);
      } catch (err) {
        error(err instanceof Error ? err.message : "Failed to delete vehicle brand.");
        setDeleteTarget(null);
      } finally {
        setDeleting(false);
      }
      return;
    }
    setDeleteTarget(null);
  };

  return (
    <AppShell title="Vehicle types">
      <PageContainer className="gap-5">
        <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-background to-muted/30 p-6 shadow-sm">
          <h1 className="text-2xl font-heading font-semibold md:text-3xl">Vehicle Management</h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Manage all vehicles used in the ride-hailing ecosystem.
          </p>
        </div>

        <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-border/60 bg-muted/50 p-1">
            <TabsTrigger value="vehicleTypes">Vehicle Types</TabsTrigger>
            <TabsTrigger value="vehicleModels">Vehicle Models</TabsTrigger>
            <TabsTrigger value="vehicleColors">Vehicle Colors</TabsTrigger>
            <TabsTrigger value="vehicleBrands">Vehicle Brands</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicleTypes">
            <Card className="rounded-xl border-border/80 shadow-md">
              <CardHeader className="flex flex-col gap-3 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-heading">Vehicle Types</CardTitle>
                  <p className="text-sm text-muted-foreground">All ride categories with operational defaults.</p>
                </div>
                <Button onClick={openAddType}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle Type
                </Button>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
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

                {typeLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: VEHICLE_TYPE_PAGE_SIZE }).map((_, index) => (
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
                            <Button size="icon" variant="ghost" onClick={() => openEditType(type)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setDeleteTarget({ tab: "vehicleTypes", id: type.id })}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <PaginationControls currentPage={typePage} totalPages={typeTotalPages} onPageChange={setTypePage} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicleModels">
            <Card className="rounded-xl border-border/80 shadow-md">
              <CardHeader className="flex flex-col gap-3 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-heading">Vehicle Models</CardTitle>
                  <p className="text-sm text-muted-foreground">Model years for marketplace availability.</p>
                </div>
                <Button onClick={openAddModel}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Model
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
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
                      key: "vehicleType",
                      header: "Vehicle Type",
                      render: (item: VehicleModel) => {
                        const typeName = vehicleTypes.find((t) => Number(t.id) === Number(item.vehicleTypeId))?.name;
                        return <span className="text-xs text-muted-foreground">{typeName ?? "—"}</span>;
                      }
                    },
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
                          <Button size="icon" variant="ghost" onClick={() => openEditModel(item)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteTarget({ tab: "vehicleModels", id: item.id })}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      )
                    }
                  ]}
                />
                <PaginationControls currentPage={modelPage} totalPages={modelTotalPages} onPageChange={setModelPage} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicleColors">
            <Card className="rounded-xl border-border/80 shadow-md">
              <CardHeader className="flex flex-col gap-3 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-heading">Vehicle Colors</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage vehicle colors mapped to types and models.</p>
                </div>
                <Button onClick={openAddColor}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Color
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="relative max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={colorSearch}
                    onChange={(event) => { setColorSearch(event.target.value); setColorPage(1); }}
                    placeholder="Search color..."
                    className="pl-9"
                  />
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
                      key: "vehicleType",
                      header: "Vehicle Type",
                      render: (item: VehicleColor) => {
                        const typeName = vehicleTypes.find((t) => Number(t.id) === Number(item.vehicleTypeId))?.name;
                        return <span className="text-xs text-muted-foreground">{typeName ?? "—"}</span>;
                      }
                    },
                    {
                      key: "modelNumber",
                      header: "Model Number",
                      render: (item: VehicleColor) => {
                        const modelName = vehicleModels.find((m) => Number(m.id) === Number(item.modelNumberId))?.name;
                        return <span className="text-xs text-muted-foreground">{modelName ?? "—"}</span>;
                      }
                    },
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
                          <Button size="icon" variant="ghost" onClick={() => openEditColor(item)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteTarget({ tab: "vehicleColors", id: item.id })}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      )
                    }
                  ]}
                />
                <PaginationControls currentPage={colorPage} totalPages={colorTotalPages} onPageChange={setColorPage} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicleBrands">
            <Card className="rounded-xl border-border/80 shadow-md">
              <CardHeader className="flex flex-col gap-3 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-heading">Vehicle Brands</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage vehicle brands mapped to types, models, and colors.</p>
                </div>
                <Button onClick={openAddBrand}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Brand
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="relative max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={brandSearch}
                    onChange={(event) => { setBrandSearch(event.target.value); setBrandPage(1); }}
                    placeholder="Search brand..."
                    className="pl-9"
                  />
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
                      key: "modelNumber",
                      header: "Model Number",
                      render: (item: VehicleBrand) => {
                        const modelName = vehicleModels.find((m) => Number(m.id) === Number(item.modelNumberId))?.name;
                        return <span className="text-xs text-muted-foreground">{modelName ?? "—"}</span>;
                      }
                    },
                    {
                      key: "color",
                      header: "Color",
                      render: (item: VehicleBrand) => {
                        const colorName = vehicleColors.find((c) => Number(c.id) === Number(item.colorId))?.name;
                        return <span className="text-xs text-muted-foreground">{colorName ?? "—"}</span>;
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
                          <Button size="icon" variant="ghost" onClick={() => openEditBrand(item)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteTarget({ tab: "vehicleBrands", id: item.id })}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      )
                    }
                  ]}
                />
                <PaginationControls currentPage={brandPage} totalPages={brandTotalPages} onPageChange={setBrandPage} />
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
        <FormField label="Vehicle Type" required error={modelForm.formState.errors.vehicleTypeId}>
          <Controller
            name="vehicleTypeId"
            control={modelForm.control}
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
        <FormField label="Vehicle Type" required error={colorForm.formState.errors.vehicleTypeId}>
          <Controller
            name="vehicleTypeId"
            control={colorForm.control}
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
        <FormField label="Model Number" required error={colorForm.formState.errors.modelNumberId}>
          <Controller
            name="modelNumberId"
            control={colorForm.control}
            render={({ field }) => (
              <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select model number" /></SelectTrigger>
                <SelectContent>
                  {vehicleModels.map((model) => (
                    <SelectItem key={model.id} value={String(model.id)}>{model.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
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
        description="Map a brand to a vehicle type, model, and color."
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
        <FormField label="Model Number" required error={brandForm.formState.errors.modelNumberId}>
          <Controller
            name="modelNumberId"
            control={brandForm.control}
            render={({ field }) => (
              <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select model number" /></SelectTrigger>
                <SelectContent>
                  {vehicleModels.map((model) => (
                    <SelectItem key={model.id} value={String(model.id)}>{model.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Color" required error={brandForm.formState.errors.colorId}>
          <Controller
            name="colorId"
            control={brandForm.control}
            render={({ field }) => (
              <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
                <SelectContent>
                  {vehicleColors.map((color) => (
                    <SelectItem key={color.id} value={String(color.id)}>{color.name}</SelectItem>
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

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Do you want to delete this record?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
