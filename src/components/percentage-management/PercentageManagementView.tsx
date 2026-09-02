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
import { ActiveInactiveStatusField } from "@/components/common/ActiveInactiveStatusField";
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
  PercentageManagementItem,
  PercentageManagementStatus
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

/**
 * Data controller consumed by the view. Provided by either
 * usePercentageManagementMock (mock pages) or a real API hook (e.g. useTaxManagement).
 */
export interface PercentageManagementController {
  items: PercentageManagementItem[];
  totalItems: number;
  isLoading: boolean;
  search: string;
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  handleSearchChange: (value: string) => void;
  handlePageSizeChange: (value: number) => void;
  createItem: (values: PercentageManagementFormValues) => unknown;
  updateItem: (id: string, values: PercentageManagementFormValues) => unknown;
  deleteItem: (id: string) => unknown;
}

export interface PercentageManagementViewProps {
  pageTitle: string;
  sectionTitle: string;
  sectionDescription: string;
  entityLabel: string;
  searchPlaceholder: string;
  /** Seed data for the built-in mock controller (ignored when `controller` is set). */
  initialData?: PercentageManagementItem[];
  /** Real data source; when omitted the view falls back to local mock state. */
  controller?: PercentageManagementController;
}

const EMPTY_ITEMS: PercentageManagementItem[] = [];

export function PercentageManagementView({
  pageTitle,
  sectionTitle,
  sectionDescription,
  entityLabel,
  searchPlaceholder,
  initialData,
  controller
}: PercentageManagementViewProps) {
  const { success, error: showError } = useToast();
  // Hook must run unconditionally; its result is ignored when a real controller is provided.
  const mockController = usePercentageManagementMock({
    initialData: initialData ?? EMPTY_ITEMS
  });
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
  } = controller ?? mockController;

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PercentageManagementItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PercentageManagementItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

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

    const payload: PercentageManagementFormValues = {
      name: values.name,
      percentage: values.percentage,
      status: values.status
    };

    try {
      if (editingItem) {
        await updateItem(editingItem.id, payload);
        success(`${entityLabel} updated successfully.`);
      } else {
        await createItem(payload);
        success(`${entityLabel} created successfully.`);
      }
      setShowModal(false);
    } catch (e) {
      showError(
        e instanceof Error ? e.message : `Failed to save ${entityLabel.toLowerCase()}.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    item: PercentageManagementItem,
    status: PercentageManagementStatus
  ) => {
    if (item.status === status || statusUpdatingId || isSubmitting) return;

    setStatusUpdatingId(item.id);
    try {
      await updateItem(item.id, {
        name: item.name,
        percentage: item.percentage,
        status
      });
      success(
        status === "ACTIVE"
          ? `${entityLabel} activated successfully.`
          : `${entityLabel} deactivated successfully.`
      );
    } catch (e) {
      showError(
        e instanceof Error ? e.message : `Failed to update ${entityLabel.toLowerCase()} status.`
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      await deleteItem(deleteTarget.id);
      success(`${entityLabel} deleted successfully.`);
      setDeleteTarget(null);
    } catch (e) {
      showError(
        e instanceof Error ? e.message : `Failed to delete ${entityLabel.toLowerCase()}.`
      );
    } finally {
      setIsSubmitting(false);
    }
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
                  className: "w-[280px]",
                  render: (item: PercentageManagementItem) => {
                    const statusBusy = statusUpdatingId === item.id;
                    return (
                      <div className="flex items-center gap-1">
                        <div
                          className="inline-flex rounded-md border border-border/60 bg-muted/20 p-0.5"
                          role="radiogroup"
                          aria-label={`${item.name} status`}
                        >
                          <Button
                            type="button"
                            size="sm"
                            variant={item.status === "ACTIVE" ? "default" : "ghost"}
                            className="h-7 px-2.5 text-xs"
                            disabled={isSubmitting || Boolean(statusUpdatingId)}
                            onClick={() => void handleStatusChange(item, "ACTIVE")}
                            role="radio"
                            aria-checked={item.status === "ACTIVE"}
                          >
                            {statusBusy && item.status !== "ACTIVE" ? "…" : "Active"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={item.status === "INACTIVE" ? "default" : "ghost"}
                            className="h-7 px-2.5 text-xs"
                            disabled={isSubmitting || Boolean(statusUpdatingId)}
                            onClick={() => void handleStatusChange(item, "INACTIVE")}
                            role="radio"
                            aria-checked={item.status === "INACTIVE"}
                          >
                            {statusBusy && item.status !== "INACTIVE" ? "…" : "Inactive"}
                          </Button>
                        </div>
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
                    );
                  }
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
              <ActiveInactiveStatusField value={field.value} onChange={field.onChange} />
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
