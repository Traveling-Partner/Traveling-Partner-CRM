"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { FormField } from "@/components/common/FormField";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { EntityModal } from "@/components/vehicle-management/EntityModal";
import { ManagementTable } from "@/components/vehicle-management/ManagementTable";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { usePercentageManagementMock } from "@/hooks/percentage-management/usePercentageManagementMock";
import type {
  PercentageManagementFormValues,
  PercentageManagementItem
} from "@/types/percentage-management";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"] as const;

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  percentage: z.coerce
    .number({ invalid_type_error: "Percentage must be a number." })
    .min(0, "Percentage must be at least 0.")
    .max(100, "Percentage cannot exceed 100."),
  status: z.enum(STATUS_OPTIONS)
});

type FormValues = z.infer<typeof formSchema>;

export interface PercentageManagementViewProps {
  pageTitle: string;
  sectionTitle: string;
  sectionDescription: string;
  entityLabel: string;
  searchPlaceholder: string;
  initialData: PercentageManagementItem[];
}

export function PercentageManagementView({
  pageTitle,
  sectionTitle,
  sectionDescription,
  entityLabel,
  searchPlaceholder,
  initialData
}: PercentageManagementViewProps) {
  const { success } = useToast();
  const {
    items,
    totalItems,
    isLoading,
    search,
    page,
    pageSize,
    totalPages,
    setPage,
    handleSearchChange,
    handlePageSizeChange,
    createItem,
    updateItem,
    deleteItem
  } = usePercentageManagementMock({ initialData });

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PercentageManagementItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PercentageManagementItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", percentage: 0, status: "ACTIVE" }
  });

  const openCreateModal = () => {
    setEditingItem(null);
    form.reset({ name: "", percentage: 0, status: "ACTIVE" });
    setShowModal(true);
  };

  const openEditModal = (item: PercentageManagementItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      percentage: item.percentage,
      status: item.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 300));

    const payload: PercentageManagementFormValues = {
      name: values.name,
      percentage: values.percentage,
      status: values.status
    };

    if (editingItem) {
      updateItem(editingItem.id, payload);
      success(`${entityLabel} updated successfully.`);
    } else {
      createItem(payload);
      success(`${entityLabel} created successfully.`);
    }

    setShowModal(false);
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    deleteItem(deleteTarget.id);
    success(`${entityLabel} deleted successfully.`);
    setDeleteTarget(null);
    setIsSubmitting(false);
  };

  const showEmptyState = !isLoading && totalItems === 0;

  return (
    <AppShell title={pageTitle}>
      <PageContainer>
        <SectionCard
          title={sectionTitle}
          description={sectionDescription}
          headerAction={
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          }
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          </div>

          {showEmptyState ? (
            <EmptyState
              title={`No ${entityLabel.toLowerCase()} records found`}
              description={
                search.trim()
                  ? "Try adjusting your search terms."
                  : `Get started by adding your first ${entityLabel.toLowerCase()} record.`
              }
              actionLabel={search.trim() ? undefined : "Add New"}
              onActionClick={search.trim() ? undefined : openCreateModal}
            />
          ) : (
            <ManagementTable
              isLoading={isLoading}
              rows={items}
              emptyLabel={`No ${entityLabel.toLowerCase()} records found.`}
              columns={[
                {
                  key: "name",
                  header: "Name",
                  render: (item: PercentageManagementItem) => (
                    <span className="font-medium">{item.name}</span>
                  )
                },
                {
                  key: "percentage",
                  header: "Percentage",
                  render: (item: PercentageManagementItem) => (
                    <span className="tabular-nums">{item.percentage}%</span>
                  )
                },
                {
                  key: "status",
                  header: "Status",
                  render: (item: PercentageManagementItem) => (
                    <StatusBadge status={item.status} />
                  )
                },
                {
                  key: "actions",
                  header: "Actions",
                  className: "w-[120px]",
                  render: (item: PercentageManagementItem) => (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditModal(item)}
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )
                }
              ]}
            />
          )}

          {!showEmptyState && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
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
      </PageContainer>

      <EntityModal
        open={showModal}
        onOpenChange={setShowModal}
        title={editingItem ? `Edit ${entityLabel}` : `Add ${entityLabel}`}
        description={`Enter the ${entityLabel.toLowerCase()} details below.`}
        submitLabel={
          isSubmitting
            ? editingItem
              ? "Updating…"
              : "Creating…"
            : editingItem
              ? `Update ${entityLabel}`
              : `Create ${entityLabel}`
        }
        isSubmitting={isSubmitting}
        onCancel={() => setShowModal(false)}
        onSubmit={() => void form.handleSubmit(handleSubmit)()}
      >
        <FormField label="Name" required error={form.formState.errors.name}>
          <Input placeholder={`e.g., Standard ${entityLabel}`} {...form.register("name")} />
        </FormField>
        <FormField label="Percentage" required error={form.formState.errors.percentage}>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.01}
            placeholder="e.g., 15"
            {...form.register("percentage")}
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
      </EntityModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${entityLabel}?`}
        description={
          deleteTarget
            ? `This will permanently remove "${deleteTarget.name}". This action cannot be undone.`
            : undefined
        }
        confirmLabel={isSubmitting ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        destructive
        onConfirm={handleDelete}
      />
    </AppShell>
  );
}
