"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import TPLoader from "@/components/TPLoader";
import {
  useDeletePortalUserMutation,
  usePortalUserDetailQuery
} from "@/hooks/queries/use-portal-users";
import { formatPortalRole, primaryRole } from "@/services/portal-users";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function AdminEmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { data: employee, isLoading, isError } = usePortalUserDetailQuery(params.id);
  const deleteMutation = useDeletePortalUserMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const onDelete = async () => {
    try {
      await deleteMutation.mutateAsync(params.id);
      success("Employee deleted.");
      router.push("/admin/agents");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete employee.");
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Employee detail">
        <PageContainer>
          <div className="flex items-center justify-center py-20">
            <TPLoader variant="inline" size={120} label="Loading…" />
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  if (isError || !employee) {
    return (
      <AppShell title="Employee detail">
        <PageContainer>
          <EmptyState
            title="Employee not found"
            description="This employee could not be loaded."
            actionLabel="Back to employees"
            onActionClick={() => router.push("/admin/agents")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  const role = primaryRole(employee);

  return (
    <AppShell title={`Employee • ${employee.name || "—"}`}>
      <PageContainer>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/agents" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to employees
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button size="sm" asChild>
              <Link href={`/admin/agents/${params.id}/edit`} className="gap-1.5">
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <SectionCard title="Employee details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" value={employee.name || "—"} />
            <Field label="Role" value={role ? formatPortalRole(role) : "—"} />
            <Field label="Email" value={employee.email || "—"} />
            <Field label="Phone" value={employee.mobileNumber || "—"} />
            <Field label="City" value={employee.city || "—"} />
            <Field label="Gender" value={employee.gender || "—"} />
            <Field label="CNIC" value={employee.cnicNumber || "—"} />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={employee.status ?? "PENDING"} />
              </div>
            </div>
          </div>
          {(employee.cnicFront || employee.cnicBack) && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {employee.cnicFront ? (
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    CNIC front
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={employee.cnicFront}
                    alt="CNIC front"
                    className="h-40 w-full rounded-lg border border-border object-cover"
                  />
                </div>
              ) : null}
              {employee.cnicBack ? (
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    CNIC back
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={employee.cnicBack}
                    alt="CNIC back"
                    className="h-40 w-full rounded-lg border border-border object-cover"
                  />
                </div>
              ) : null}
            </div>
          )}
        </SectionCard>

        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete employee?"
          description="This cannot be undone."
          confirmLabel={deleteMutation.isPending ? "Deleting…" : "Delete"}
          destructive
          onConfirm={() => {
            if (!deleteMutation.isPending) void onDelete();
          }}
        />
      </PageContainer>
    </AppShell>
  );
}
