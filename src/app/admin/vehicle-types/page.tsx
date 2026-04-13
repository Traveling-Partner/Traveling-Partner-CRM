"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { FormField } from "@/components/common/FormField";
import { VehicleTypeCard } from "@/components/vehicle-management/VehicleTypeCard";
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
import { Switch } from "@/components/ui/switch";
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

const ITEMS_PER_PAGE = 6;
type TabValue = "vehicleTypes" | "vehicleModels" | "vehicleColors" | "vehicleBrands";

interface VehicleType {
  id: string;
  name: string;
  image: string;
  passengerCapacity: number;
  luggageCapacity: number;
  baseFare: number;
  serviceLevel: "Economy" | "Premium" | "XL";
  energyType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  hasAc: boolean;
  createdAt: string;
}

interface VehicleModel {
  id: string;
  name: string;
  createdAt: string;
}

interface VehicleColor {
  id: string;
  name: string;
  hex: string;
  createdAt: string;
}

interface VehicleBrand {
  id: string;
  vehicleTypeId: string;
  name: string;
  image: string;
  createdAt: string;
}

type DeleteTarget =
  | { tab: "vehicleTypes"; id: string }
  | { tab: "vehicleModels"; id: string }
  | { tab: "vehicleColors"; id: string }
  | { tab: "vehicleBrands"; id: string }
  | null;

const vehicleTypeSchema = z.object({
  name: z.string().trim().min(1, "Vehicle type name is required."),
  image: z.string().trim().url("Please provide a valid image URL or upload an image."),
  passengerCapacity: z.coerce.number().min(1, "Passenger capacity is required."),
  luggageCapacity: z.coerce.number().min(0, "Luggage capacity cannot be negative."),
  baseFare: z.coerce.number().min(1, "Base fare is required."),
  serviceLevel: z.enum(["Economy", "Premium", "XL"]),
  energyType: z.enum(["Petrol", "Diesel", "Hybrid", "Electric"]),
  hasAc: z.boolean()
});

const modelSchema = z.object({
  name: z.string().trim().min(1, "Model year is required.")
});

const colorSchema = z.object({
  name: z.string().trim().min(1, "Color name is required."),
  hex: z.string().regex(/^#([A-Fa-f0-9]{6})$/, "Use a valid HEX color.")
});

const brandSchema = z.object({
  vehicleTypeId: z.string().min(1, "Vehicle type is required."),
  name: z.string().trim().min(1, "Brand name is required."),
  image: z.string().trim().url("Please provide a valid image URL or upload an image.")
});

type VehicleTypeForm = z.infer<typeof vehicleTypeSchema>;
type ModelForm = z.infer<typeof modelSchema>;
type ColorForm = z.infer<typeof colorSchema>;
type BrandForm = z.infer<typeof brandSchema>;

const createId = () => `${Date.now()}-${Math.floor(Math.random() * 999999)}`;
const now = () => new Date().toISOString();

const initialVehicleTypes: VehicleType[] = [
  {
    id: "type-car",
    name: "Car",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    passengerCapacity: 4,
    luggageCapacity: 2,
    baseFare: 8,
    serviceLevel: "Economy",
    energyType: "Petrol",
    hasAc: true,
    createdAt: "2026-04-01T09:00:00.000Z"
  },
  {
    id: "type-suv",
    name: "SUV",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    passengerCapacity: 6,
    luggageCapacity: 4,
    baseFare: 12,
    serviceLevel: "Premium",
    energyType: "Hybrid",
    hasAc: true,
    createdAt: "2026-04-01T09:01:00.000Z"
  },
  {
    id: "type-van",
    name: "Van",
    image: "https://images.unsplash.com/photo-1609520505218-7426a9d1c71d?auto=format&fit=crop&w=1200&q=80",
    passengerCapacity: 8,
    luggageCapacity: 6,
    baseFare: 14,
    serviceLevel: "XL",
    energyType: "Diesel",
    hasAc: true,
    createdAt: "2026-04-01T09:02:00.000Z"
  },
  {
    id: "type-motorcycle",
    name: "Motorcycle",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    passengerCapacity: 1,
    luggageCapacity: 0,
    baseFare: 4,
    serviceLevel: "Economy",
    energyType: "Petrol",
    hasAc: false,
    createdAt: "2026-04-01T09:03:00.000Z"
  },
  {
    id: "type-ev-bike",
    name: "Electric Bike (EV Bike)",
    image: "https://images.unsplash.com/photo-1595433562696-77c52f5c4f07?auto=format&fit=crop&w=1200&q=80",
    passengerCapacity: 1,
    luggageCapacity: 0,
    baseFare: 3,
    serviceLevel: "Economy",
    energyType: "Electric",
    hasAc: false,
    createdAt: "2026-04-01T09:04:00.000Z"
  },
  {
    id: "type-truck",
    name: "Truck",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80",
    passengerCapacity: 2,
    luggageCapacity: 20,
    baseFare: 18,
    serviceLevel: "XL",
    energyType: "Diesel",
    hasAc: true,
    createdAt: "2026-04-01T09:05:00.000Z"
  },
  {
    id: "type-rickshaw",
    name: "Rickshaw",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
    passengerCapacity: 3,
    luggageCapacity: 1,
    baseFare: 5,
    serviceLevel: "Economy",
    energyType: "Petrol",
    hasAc: false,
    createdAt: "2026-04-01T09:06:00.000Z"
  },
  {
    id: "type-tuktuk",
    name: "Auto Rickshaw (Tuk Tuk)",
    image: "https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?auto=format&fit=crop&w=1200&q=80",
    passengerCapacity: 3,
    luggageCapacity: 1,
    baseFare: 5,
    serviceLevel: "Economy",
    energyType: "Petrol",
    hasAc: false,
    createdAt: "2026-04-01T09:07:00.000Z"
  },
  {
    id: "type-bus",
    name: "Bus",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
    passengerCapacity: 28,
    luggageCapacity: 12,
    baseFare: 25,
    serviceLevel: "XL",
    energyType: "Diesel",
    hasAc: true,
    createdAt: "2026-04-01T09:08:00.000Z"
  },
  {
    id: "type-minivan",
    name: "Mini Van / Hiace",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
    passengerCapacity: 11,
    luggageCapacity: 8,
    baseFare: 17,
    serviceLevel: "XL",
    energyType: "Diesel",
    hasAc: true,
    createdAt: "2026-04-01T09:09:00.000Z"
  }
];

const initialVehicleModels: VehicleModel[] = Array.from({ length: 16 }, (_, index) => {
  const year = String(2010 + index);
  return {
    id: `model-${year}`,
    name: year,
    createdAt: `2026-04-${String((index % 8) + 2).padStart(2, "0")}T10:00:00.000Z`
  };
});

const initialVehicleColors: VehicleColor[] = [
  { id: "color-red", name: "Red", hex: "#EF4444", createdAt: "2026-04-03T10:00:00.000Z" },
  { id: "color-blue", name: "Blue", hex: "#3B82F6", createdAt: "2026-04-03T10:01:00.000Z" },
  { id: "color-black", name: "Black", hex: "#111827", createdAt: "2026-04-03T10:02:00.000Z" },
  { id: "color-white", name: "White", hex: "#FFFFFF", createdAt: "2026-04-03T10:03:00.000Z" },
  { id: "color-silver", name: "Silver", hex: "#94A3B8", createdAt: "2026-04-03T10:04:00.000Z" },
  { id: "color-gray", name: "Gray", hex: "#6B7280", createdAt: "2026-04-03T10:05:00.000Z" },
  { id: "color-yellow", name: "Yellow", hex: "#EAB308", createdAt: "2026-04-03T10:06:00.000Z" },
  { id: "color-green", name: "Green", hex: "#22C55E", createdAt: "2026-04-03T10:07:00.000Z" }
];

const initialVehicleBrands: VehicleBrand[] = [
  { id: "brand-cultus", vehicleTypeId: "type-car", name: "Suzuki Cultus", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:00:00.000Z" },
  { id: "brand-city", vehicleTypeId: "type-car", name: "Honda City", image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:01:00.000Z" },
  { id: "brand-corolla", vehicleTypeId: "type-car", name: "Toyota Corolla", image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:02:00.000Z" },
  { id: "brand-aqua", vehicleTypeId: "type-car", name: "Toyota Aqua", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:03:00.000Z" },
  { id: "brand-civic", vehicleTypeId: "type-car", name: "Honda Civic", image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:04:00.000Z" },
  { id: "brand-ybr", vehicleTypeId: "type-motorcycle", name: "Yamaha YBR", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:05:00.000Z" },
  { id: "brand-cg125", vehicleTypeId: "type-motorcycle", name: "Honda CG125", image: "https://images.unsplash.com/photo-1515777315835-281b94c9589b?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:06:00.000Z" },
  { id: "brand-hino", vehicleTypeId: "type-truck", name: "Hino Truck", image: "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:07:00.000Z" },
  { id: "brand-mazda-truck", vehicleTypeId: "type-truck", name: "Mazda Truck", image: "https://images.unsplash.com/photo-1594484208280-efa00f96fc21?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:08:00.000Z" },
  { id: "brand-bajaj", vehicleTypeId: "type-rickshaw", name: "Bajaj Rickshaw", image: "https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:09:00.000Z" },
  { id: "brand-qingqi", vehicleTypeId: "type-rickshaw", name: "Qingqi Rickshaw", image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:10:00.000Z" },
  { id: "brand-prado", vehicleTypeId: "type-suv", name: "Toyota Prado", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:11:00.000Z" },
  { id: "brand-sportage", vehicleTypeId: "type-suv", name: "Kia Sportage", image: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:12:00.000Z" },
  { id: "brand-hiace", vehicleTypeId: "type-van", name: "Toyota Hiace", image: "https://images.unsplash.com/photo-1609520505218-7426a9d1c71d?auto=format&fit=crop&w=1000&q=80", createdAt: "2026-04-04T09:13:00.000Z" }
];

function paginateRows<T>(rows: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  return { rows: rows.slice(start, start + ITEMS_PER_PAGE), safePage, totalPages };
}

export default function VehicleTypesPage() {
  const { success, error } = useToast();

  const [tab, setTab] = useState<TabValue>("vehicleTypes");
  const [isLoading, setIsLoading] = useState(true);

  const [vehicleTypes, setVehicleTypes] = useState(initialVehicleTypes);
  const [vehicleModels, setVehicleModels] = useState(initialVehicleModels);
  const [vehicleColors, setVehicleColors] = useState(initialVehicleColors);
  const [vehicleBrands, setVehicleBrands] = useState(initialVehicleBrands);

  const [typeSearch, setTypeSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [colorSearch, setColorSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [brandTypeFilter, setBrandTypeFilter] = useState("all");

  const [typePage, setTypePage] = useState(1);
  const [modelPage, setModelPage] = useState(1);
  const [colorPage, setColorPage] = useState(1);
  const [brandPage, setBrandPage] = useState(1);

  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const typeForm = useForm<VehicleTypeForm>({
    resolver: zodResolver(vehicleTypeSchema),
    defaultValues: {
      name: "",
      image: "",
      passengerCapacity: 4,
      luggageCapacity: 1,
      baseFare: 8,
      serviceLevel: "Economy",
      energyType: "Petrol",
      hasAc: true
    }
  });

  const modelForm = useForm<ModelForm>({
    resolver: zodResolver(modelSchema),
    defaultValues: { name: "2026" }
  });

  const colorForm = useForm<ColorForm>({
    resolver: zodResolver(colorSchema),
    defaultValues: { name: "", hex: "#3B82F6" }
  });

  const brandForm = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: { vehicleTypeId: "", name: "", image: "" }
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredTypes = useMemo(
    () => vehicleTypes.filter((item) => item.name.toLowerCase().includes(typeSearch.toLowerCase().trim())),
    [vehicleTypes, typeSearch]
  );

  const filteredModels = useMemo(
    () => vehicleModels.filter((item) => item.name.toLowerCase().includes(modelSearch.toLowerCase().trim())),
    [vehicleModels, modelSearch]
  );

  const filteredColors = useMemo(
    () =>
      vehicleColors.filter(
        (item) =>
          item.name.toLowerCase().includes(colorSearch.toLowerCase().trim()) ||
          item.hex.toLowerCase().includes(colorSearch.toLowerCase().trim())
      ),
    [vehicleColors, colorSearch]
  );

  const filteredBrands = useMemo(
    () =>
      vehicleBrands.filter((item) => {
        const byName = item.name.toLowerCase().includes(brandSearch.toLowerCase().trim());
        const byType = brandTypeFilter === "all" || item.vehicleTypeId === brandTypeFilter;
        return byName && byType;
      }),
    [vehicleBrands, brandSearch, brandTypeFilter]
  );

  const typeResult = paginateRows(filteredTypes, typePage);
  const modelResult = paginateRows(filteredModels, modelPage);
  const colorResult = paginateRows(filteredColors, colorPage);
  const brandResult = paginateRows(filteredBrands, brandPage);

  useEffect(() => setTypePage(1), [typeSearch]);
  useEffect(() => setModelPage(1), [modelSearch]);
  useEffect(() => setColorPage(1), [colorSearch]);
  useEffect(() => setBrandPage(1), [brandSearch, brandTypeFilter]);

  useEffect(() => setTypePage(typeResult.safePage), [typeResult.safePage]);
  useEffect(() => setModelPage(modelResult.safePage), [modelResult.safePage]);
  useEffect(() => setColorPage(colorResult.safePage), [colorResult.safePage]);
  useEffect(() => setBrandPage(brandResult.safePage), [brandResult.safePage]);

  const getTypeName = (id: string) => vehicleTypes.find((item) => item.id === id)?.name ?? "Unknown";

  const openAddType = () => {
    setEditingTypeId(null);
    typeForm.reset({
      name: "",
      image: "",
      passengerCapacity: 4,
      luggageCapacity: 1,
      baseFare: 8,
      serviceLevel: "Economy",
      energyType: "Petrol",
      hasAc: true
    });
    setShowTypeModal(true);
  };

  const openEditType = (type: VehicleType) => {
    setEditingTypeId(type.id);
    typeForm.reset({
      name: type.name,
      image: type.image,
      passengerCapacity: type.passengerCapacity,
      luggageCapacity: type.luggageCapacity,
      baseFare: type.baseFare,
      serviceLevel: type.serviceLevel,
      energyType: type.energyType,
      hasAc: type.hasAc
    });
    setShowTypeModal(true);
  };

  const openAddModel = () => {
    setEditingModelId(null);
    modelForm.reset({ name: "2026" });
    setShowModelModal(true);
  };

  const openEditModel = (model: VehicleModel) => {
    setEditingModelId(model.id);
    modelForm.reset({ name: model.name });
    setShowModelModal(true);
  };

  const openAddColor = () => {
    setEditingColorId(null);
    colorForm.reset({ name: "", hex: "#3B82F6" });
    setShowColorModal(true);
  };

  const openEditColor = (color: VehicleColor) => {
    setEditingColorId(color.id);
    colorForm.reset({ name: color.name, hex: color.hex });
    setShowColorModal(true);
  };

  const openAddBrand = () => {
    setEditingBrandId(null);
    brandForm.reset({ vehicleTypeId: "", name: "", image: "" });
    setShowBrandModal(true);
  };

  const openEditBrand = (brand: VehicleBrand) => {
    setEditingBrandId(brand.id);
    brandForm.reset({
      vehicleTypeId: brand.vehicleTypeId,
      name: brand.name,
      image: brand.image
    });
    setShowBrandModal(true);
  };

  const submitType = (values: VehicleTypeForm) => {
    if (editingTypeId) {
      setVehicleTypes((prev) => prev.map((item) => (item.id === editingTypeId ? { ...item, ...values } : item)));
      success("Vehicle type updated.");
    } else {
      setVehicleTypes((prev) => [{ id: createId(), createdAt: now(), ...values }, ...prev]);
      success("Vehicle type added and listed.");
    }
    setShowTypeModal(false);
  };

  const submitModel = (values: ModelForm) => {
    if (editingModelId) {
      setVehicleModels((prev) => prev.map((item) => (item.id === editingModelId ? { ...item, ...values } : item)));
      success("Vehicle model updated.");
    } else {
      setVehicleModels((prev) => [{ id: createId(), createdAt: now(), ...values }, ...prev]);
      success("Vehicle model added and listed.");
    }
    setShowModelModal(false);
  };

  const submitColor = (values: ColorForm) => {
    if (editingColorId) {
      setVehicleColors((prev) => prev.map((item) => (item.id === editingColorId ? { ...item, ...values } : item)));
      success("Vehicle color updated.");
    } else {
      setVehicleColors((prev) => [{ id: createId(), createdAt: now(), ...values }, ...prev]);
      success("Vehicle color added and listed.");
    }
    setShowColorModal(false);
  };

  const submitBrand = (values: BrandForm) => {
    if (!vehicleTypes.some((item) => item.id === values.vehicleTypeId)) {
      error("Please choose a valid vehicle type.");
      return;
    }

    if (editingBrandId) {
      setVehicleBrands((prev) => prev.map((item) => (item.id === editingBrandId ? { ...item, ...values } : item)));
      success("Vehicle brand updated.");
    } else {
      setVehicleBrands((prev) => [{ id: createId(), createdAt: now(), ...values }, ...prev]);
      success("Vehicle brand added and listed.");
    }
    setShowBrandModal(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.tab === "vehicleTypes") {
      setVehicleTypes((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setVehicleBrands((prev) => prev.filter((item) => item.vehicleTypeId !== deleteTarget.id));
      success("Vehicle type removed. Related brands were also removed.");
    }
    if (deleteTarget.tab === "vehicleModels") {
      setVehicleModels((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      success("Vehicle model removed.");
    }
    if (deleteTarget.tab === "vehicleColors") {
      setVehicleColors((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      success("Vehicle color removed.");
    }
    if (deleteTarget.tab === "vehicleBrands") {
      setVehicleBrands((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      success("Vehicle brand removed.");
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
                    onChange={(event) => setTypeSearch(event.target.value)}
                    placeholder="Search vehicle type..."
                    className="pl-9"
                  />
                </div>

                {isLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={`type-skeleton-${index}`} className="space-y-3 rounded-xl border border-border/70 p-3">
                        <Skeleton className="h-40 w-full rounded-lg" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                ) : typeResult.rows.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/80 px-4 py-12 text-center text-sm text-muted-foreground">
                    No vehicle types found.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {typeResult.rows.map((type) => (
                      <VehicleTypeCard
                        key={type.id}
                        name={type.name}
                        image={type.image}
                        passengerCapacity={type.passengerCapacity}
                        luggageCapacity={type.luggageCapacity}
                        serviceLevel={type.serviceLevel}
                        energyType={type.energyType}
                        onEdit={() => openEditType(type)}
                        onDelete={() => setDeleteTarget({ tab: "vehicleTypes", id: type.id })}
                      />
                    ))}
                  </div>
                )}
                <PaginationControls currentPage={typePage} totalPages={typeResult.totalPages} onPageChange={setTypePage} />
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
                  <Input value={modelSearch} onChange={(event) => setModelSearch(event.target.value)} placeholder="Search model year..." className="pl-9" />
                </div>
                <ManagementTable
                  isLoading={isLoading}
                  rows={modelResult.rows}
                  emptyLabel="No models found."
                  columns={[
                    { key: "name", header: "Name", render: (item: VehicleModel) => <span className="font-medium">{item.name}</span> },
                    { key: "createdAt", header: "Created At", render: (item: VehicleModel) => format(new Date(item.createdAt), "MMM d, yyyy") },
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
                <PaginationControls currentPage={modelPage} totalPages={modelResult.totalPages} onPageChange={setModelPage} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicleColors">
            <Card className="rounded-xl border-border/80 shadow-md">
              <CardHeader className="flex flex-col gap-3 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-heading">Vehicle Colors</CardTitle>
                  <p className="text-sm text-muted-foreground">Maintain standardized color palette and HEX values.</p>
                </div>
                <Button onClick={openAddColor}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Color
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="relative max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={colorSearch} onChange={(event) => setColorSearch(event.target.value)} placeholder="Search by color or HEX..." className="pl-9" />
                </div>
                <ManagementTable
                  isLoading={isLoading}
                  rows={colorResult.rows}
                  emptyLabel="No colors found."
                  columns={[
                    {
                      key: "color",
                      header: "Color",
                      render: (item: VehicleColor) => (
                        <div className="flex items-center gap-3">
                          <span className="h-5 w-5 rounded-full border border-border/70" style={{ backgroundColor: item.hex }} />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      )
                    },
                    { key: "hex", header: "HEX", render: (item: VehicleColor) => <span className="font-mono text-xs">{item.hex}</span> },
                    { key: "createdAt", header: "Created At", render: (item: VehicleColor) => format(new Date(item.createdAt), "MMM d, yyyy") },
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
                <PaginationControls currentPage={colorPage} totalPages={colorResult.totalPages} onPageChange={setColorPage} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicleBrands">
            <Card className="rounded-xl border-border/80 shadow-md">
              <CardHeader className="flex flex-col gap-3 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-heading">Vehicle Brands</CardTitle>
                  <p className="text-sm text-muted-foreground">Type-mapped production brand catalog.</p>
                </div>
                <Button onClick={openAddBrand}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Brand
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input value={brandSearch} onChange={(event) => setBrandSearch(event.target.value)} placeholder="Search by brand..." className="pl-9" />
                  </div>
                  <Select value={brandTypeFilter} onValueChange={setBrandTypeFilter}>
                    <SelectTrigger><SelectValue placeholder="Filter by type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All vehicle types</SelectItem>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ManagementTable
                  isLoading={isLoading}
                  rows={brandResult.rows}
                  emptyLabel="No brands found."
                  columns={[
                    {
                      key: "image",
                      header: "Image",
                      className: "w-[110px]",
                      render: (item: VehicleBrand) => (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-20 rounded-md border border-border/70 object-cover"
                          onError={(event) => {
                            event.currentTarget.src = "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1200";
                          }}
                        />
                      )
                    },
                    { key: "name", header: "Brand Name", render: (item: VehicleBrand) => <span className="font-medium">{item.name}</span> },
                    { key: "type", header: "Vehicle Type", render: (item: VehicleBrand) => getTypeName(item.vehicleTypeId) },
                    { key: "createdAt", header: "Created At", render: (item: VehicleBrand) => format(new Date(item.createdAt), "MMM d, yyyy") },
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
                <PaginationControls currentPage={brandPage} totalPages={brandResult.totalPages} onPageChange={setBrandPage} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContainer>

      <EntityModal
        open={showTypeModal}
        onOpenChange={setShowTypeModal}
        title={editingTypeId ? "Edit Vehicle Type" : "Add Vehicle Type"}
        description="Capture all important operational fields for production-ready vehicle onboarding."
        submitLabel={editingTypeId ? "Update Vehicle Type" : "Create Vehicle Type"}
        onCancel={() => setShowTypeModal(false)}
        onSubmit={() => void typeForm.handleSubmit(submitType)()}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Vehicle Name" required error={typeForm.formState.errors.name}>
            <Input placeholder="e.g., Sedan" {...typeForm.register("name")} />
          </FormField>
          <FormField label="Base Fare ($)" required error={typeForm.formState.errors.baseFare}>
            <Input type="number" min={1} step="0.1" {...typeForm.register("baseFare")} />
          </FormField>
          <FormField label="Passenger Capacity" required error={typeForm.formState.errors.passengerCapacity}>
            <Input type="number" min={1} {...typeForm.register("passengerCapacity")} />
          </FormField>
          <FormField label="Luggage Capacity" required error={typeForm.formState.errors.luggageCapacity}>
            <Input type="number" min={0} {...typeForm.register("luggageCapacity")} />
          </FormField>
          <FormField label="Service Level" required error={typeForm.formState.errors.serviceLevel}>
            <Controller
              name="serviceLevel"
              control={typeForm.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select service level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Economy">Economy</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Energy Type" required error={typeForm.formState.errors.energyType}>
            <Controller
              name="energyType"
              control={typeForm.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select energy type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>

        <FormField label="Image URL" required error={typeForm.formState.errors.image}>
          <Input placeholder="Paste Unsplash/Pexels/Pixabay image URL..." {...typeForm.register("image")} />
        </FormField>
        <FormField label="Image Upload (optional override)">
          <ImageUploadField
            id="vehicle-type-upload"
            value={typeForm.watch("image")}
            onChange={(value) => typeForm.setValue("image", value, { shouldValidate: true })}
          />
        </FormField>

        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
          <p className="text-sm font-medium">Air Conditioning Available</p>
          <Controller
            name="hasAc"
            control={typeForm.control}
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
          />
        </div>
      </EntityModal>

      <EntityModal
        open={showModelModal}
        onOpenChange={setShowModelModal}
        title={editingModelId ? "Edit Vehicle Model" : "Add Vehicle Model"}
        description="Add or update model year entries."
        submitLabel={editingModelId ? "Update Model" : "Create Model"}
        onCancel={() => setShowModelModal(false)}
        onSubmit={() => void modelForm.handleSubmit(submitModel)()}
      >
        <FormField label="Model Year" required error={modelForm.formState.errors.name}>
          <Input placeholder="e.g., 2025" {...modelForm.register("name")} />
        </FormField>
      </EntityModal>

      <EntityModal
        open={showColorModal}
        onOpenChange={setShowColorModal}
        title={editingColorId ? "Edit Vehicle Color" : "Add Vehicle Color"}
        description="Set both the display name and HEX value."
        submitLabel={editingColorId ? "Update Color" : "Create Color"}
        onCancel={() => setShowColorModal(false)}
        onSubmit={() => void colorForm.handleSubmit(submitColor)()}
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <FormField label="Color Name" required error={colorForm.formState.errors.name}>
            <Input placeholder="e.g., Midnight Black" {...colorForm.register("name")} />
          </FormField>
          <FormField label="HEX" required error={colorForm.formState.errors.hex}>
            <Input type="color" className="h-10 w-16 p-1" {...colorForm.register("hex")} />
          </FormField>
        </div>
        <FormField label="HEX Value" required error={colorForm.formState.errors.hex}>
          <Input placeholder="#000000" {...colorForm.register("hex")} />
        </FormField>
      </EntityModal>

      <EntityModal
        open={showBrandModal}
        onOpenChange={setShowBrandModal}
        title={editingBrandId ? "Edit Vehicle Brand" : "Add Vehicle Brand"}
        description="Map brand to a vehicle type and image."
        submitLabel={editingBrandId ? "Update Brand" : "Create Brand"}
        onCancel={() => setShowBrandModal(false)}
        onSubmit={() => void brandForm.handleSubmit(submitBrand)()}
      >
        <FormField label="Vehicle Type" required error={brandForm.formState.errors.vehicleTypeId}>
          <Controller
            control={brandForm.control}
            name="vehicleTypeId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Brand Name" required error={brandForm.formState.errors.name}>
          <Input placeholder="e.g., Toyota Corolla" {...brandForm.register("name")} />
        </FormField>
        <FormField label="Image URL" required error={brandForm.formState.errors.image}>
          <Input placeholder="Paste Unsplash/Pexels/Pixabay URL..." {...brandForm.register("image")} />
        </FormField>
        <FormField label="Image Upload (optional override)">
          <ImageUploadField
            id="vehicle-brand-upload"
            value={brandForm.watch("image")}
            onChange={(value) => brandForm.setValue("image", value, { shouldValidate: true })}
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
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
