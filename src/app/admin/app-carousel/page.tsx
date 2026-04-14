"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Edit, Eye, Plus, Power, PowerOff } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EntityModal } from "@/components/vehicle-management/EntityModal";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { ImageUploadField } from "@/components/vehicle-management/ImageUploadField";
import { useToast } from "@/components/ui/toast";
import {
  appCarouselSlides,
  type AppCarouselSlide,
  type CarouselStatus
} from "@/mock-data/app-carousel";

const PAGE_SIZE = 8;

const slideSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().min(1, "Description is required."),
  imageUrl: z
    .string()
    .trim()
    .min(1, "Image is required.")
    .refine(
      (value) => value.startsWith("data:image/") || /^https?:\/\//.test(value),
      "Please provide a valid image URL or upload an image."
    ),
  status: z.enum(["DRAFT", "PUBLISHED", "INACTIVE"])
});

type SlideFormValues = z.infer<typeof slideSchema>;

const getStatusVariant = (status: CarouselStatus): "secondary" | "success" | "warning" => {
  if (status === "PUBLISHED") return "success";
  if (status === "INACTIVE") return "warning";
  return "secondary";
};

export default function AdminAppCarouselPage() {
  const { success } = useToast();
  const [slides, setSlides] = useState<AppCarouselSlide[]>(appCarouselSlides);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewSlide, setPreviewSlide] = useState<AppCarouselSlide | null>(null);

  const form = useForm<SlideFormValues>({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      status: "DRAFT"
    }
  });

  const filtered = useMemo(
    () =>
      slides.filter((slide) => {
        const normalizedSearch = search.toLowerCase().trim();
        const matchesSearch =
          slide.title.toLowerCase().includes(normalizedSearch) ||
          slide.description.toLowerCase().includes(normalizedSearch);
        const matchesStatus = statusFilter === "all" || slide.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [slides, search, statusFilter]
  );

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(totalPages - 1, 0)));
  }, [totalPages]);

  const openCreate = () => {
    setEditingId(null);
    form.reset({
      title: "",
      description: "",
      imageUrl: "",
      status: "DRAFT"
    });
    setModalOpen(true);
  };

  const openEdit = (slide: AppCarouselSlide) => {
    setEditingId(slide.id);
    form.reset({
      title: slide.title,
      description: slide.description,
      imageUrl: slide.imageUrl,
      status: slide.status
    });
    setModalOpen(true);
  };

  const onSubmit = (values: SlideFormValues) => {
    if (editingId) {
      setSlides((prev) =>
        prev.map((slide) =>
          slide.id === editingId
            ? { ...slide, ...values, updatedAt: new Date().toISOString() }
            : slide
        )
      );
      success("Carousel slide updated.");
    } else {
      setSlides((prev) => [
        {
          id: `${Date.now()}-${Math.floor(Math.random() * 99999)}`,
          ...values,
          updatedAt: new Date().toISOString()
        },
        ...prev
      ]);
      success("Carousel slide created.");
    }
    setModalOpen(false);
  };

  const toggleStatus = (slide: AppCarouselSlide) => {
    const nextStatus: CarouselStatus = slide.status === "PUBLISHED" ? "INACTIVE" : "PUBLISHED";
    setSlides((prev) =>
      prev.map((item) =>
        item.id === slide.id ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() } : item
      )
    );
    success(
      nextStatus === "PUBLISHED"
        ? `"${slide.title}" published. It will be shown in app carousel.`
        : `"${slide.title}" deactivated. It will not be shown in app carousel.`
    );
  };

  const columns: ColumnDef<AppCarouselSlide>[] = [
    {
      accessorKey: "imageUrl",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.imageUrl}
          alt={row.original.title}
          className="h-14 w-24 rounded-md border border-border/70 object-cover"
        />
      )
    },
    {
      accessorKey: "title",
      header: "Title & Description",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="font-medium">{row.original.title}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{row.original.description}</p>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)}>{row.original.status}</Badge>
      )
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString()
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewSlide(row.original)}>
            <Eye className="mr-1 h-3.5 w-3.5" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={() => openEdit(row.original)}>
            <Edit className="mr-1 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant={row.original.status === "PUBLISHED" ? "destructive" : "default"}
            size="sm"
            onClick={() => toggleStatus(row.original)}
          >
            {row.original.status === "PUBLISHED" ? (
              <>
                <PowerOff className="mr-1 h-3.5 w-3.5" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="mr-1 h-3.5 w-3.5" />
                Publish
              </>
            )}
          </Button>
        </div>
      )
    }
  ];

  return (
    <AppShell title="App Carousel">
      <PageContainer>
        <SectionCard
          title="App home screen carousel"
          description="Manage home carousel slides. Published records are live in app, inactive records are hidden."
          headerAction={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add slide
            </Button>
          }
        >
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search by title or description..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              className="max-w-xs"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={paginated}
            emptyTitle="No carousel slides"
            emptyDescription="Create a new slide to display on the app home screen."
          />

          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            <span>
              Showing {paginated.length ? page * PAGE_SIZE + 1 : 0} – {page * PAGE_SIZE + paginated.length} of{" "}
              {filtered.length}
            </span>
            <PaginationControls
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(nextPage) => setPage(Math.max(0, nextPage - 1))}
            />
          </div>
        </SectionCard>

        <EntityModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingId ? "Edit carousel slide" : "Add carousel slide"}
          description="Add image, short text and publication status for app home carousel."
          submitLabel={editingId ? "Update slide" : "Create slide"}
          onCancel={() => setModalOpen(false)}
          onSubmit={() => void form.handleSubmit(onSubmit)()}
        >
          <FormField label="Title" required error={form.formState.errors.title}>
            <Input placeholder="e.g. Weekend Airport Promo" {...form.register("title")} />
          </FormField>
          <FormField label="Description" required error={form.formState.errors.description}>
            <Input
              placeholder="e.g. Up to 20% off for airport rides this weekend."
              {...form.register("description")}
            />
          </FormField>
          <FormField label="Status" required error={form.formState.errors.status}>
            <Select
              value={form.watch("status")}
              onValueChange={(value) => form.setValue("status", value as CarouselStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Image URL" required error={form.formState.errors.imageUrl}>
            <Input
              placeholder="Paste image URL from CRM asset source"
              {...form.register("imageUrl")}
            />
          </FormField>
          <FormField label="Image upload (optional override)">
            <ImageUploadField
              id="carousel-image-upload"
              value={form.watch("imageUrl")}
              onChange={(value) => form.setValue("imageUrl", value, { shouldValidate: true })}
            />
          </FormField>
        </EntityModal>

        <Dialog open={Boolean(previewSlide)} onOpenChange={(open) => !open && setPreviewSlide(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{previewSlide?.title ?? "Slide preview"}</DialogTitle>
            </DialogHeader>
            {previewSlide ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{previewSlide.description}</p>
                <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/20 p-2">
                  <img
                    src={previewSlide.imageUrl}
                    alt={previewSlide.title}
                    className="h-[60vh] w-full rounded-lg object-cover"
                  />
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </PageContainer>
    </AppShell>
  );
}
