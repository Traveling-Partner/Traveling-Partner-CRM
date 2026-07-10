"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Download, Eye, FileText, UserCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useApiMutation } from "@/hooks/api";
import { useDriverDetailQuery } from "@/hooks/queries/use-driver-detail-query";
import { queryKeys } from "@/lib/api/query-keys";
import { updateUserStatus } from "@/services/users";

type DriverStatus = "PENDING" | "APPROVED" | "ACTIVE" | "REJECTED" | "BLOCKED" | "RESTRICTED";

interface DriverDocument {
  id: string;
  type: string;
  fileName: string;
  frontUrl: string;
  backUrl: string;
  status: string;
}

const fallbackImage = "/mock-images/document-fallback.svg";
const fallbackByType: Record<string, string> = {
  DRIVER_LICENSE: "/mock-images/driver-license.svg",
  VEHICLE_REGISTRATION: "/mock-images/vehicle-registration.svg",
  ID_DOCUMENT: "/mock-images/id-document.svg"
};

function prettyDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

const statusPayloadMap: Record<DriverStatus, "PENDING" | "APPROVED" | "ACTIVE" | "RESTRICTED" | "BLOCKED" | "REJECTED"> = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  ACTIVE: "ACTIVE",
  RESTRICTED: "RESTRICTED",
  BLOCKED: "BLOCKED",
  REJECTED: "REJECTED"
};

export default function AdminDriverDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error } = useToast();

  const { data, isLoading, isError } = useDriverDetailQuery(params.id);
  const driver = data?.driver ?? null;
  const docStatuses = data?.docStatuses ?? { cnic: "PENDING", license: "PENDING", vehicle: "PENDING" };
  const loading = isLoading;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<DriverStatus | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("driver-license");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>(fallbackImage);
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);

  const statusMutation = useApiMutation<void, { userId: number; status: string }>({
    mutationFn: ({ token, variables }) =>
      updateUserStatus(variables.userId, variables.status, { token }),
    invalidateKeys: [queryKeys.users.driverDetail(params.id)],
    onSuccess: (_data, variables) => {
      setOptimisticStatus(variables.status);
      success(`Driver status updated to ${variables.status}.`);
      setDialogOpen(false);
    },
    onError: (err) => {
      error(err.message);
    }
  });

  const updatingStatus = statusMutation.isPending;

  const documents = useMemo<DriverDocument[]>(() => {
    if (!driver) return [];

    return [
      {
        id: "driver-license",
        type: "DRIVER_LICENSE",
        fileName: "driver-license.jpg",
        frontUrl: driver.license?.licenseFront || fallbackByType.DRIVER_LICENSE,
        backUrl: driver.license?.licenseBack || fallbackByType.DRIVER_LICENSE,
        status: docStatuses.license
      },
      {
        id: "vehicle-registration",
        type: "VEHICLE_REGISTRATION",
        fileName: "vehicle-registration.jpg",
        frontUrl: driver.vehicle?.registrationFront || fallbackByType.VEHICLE_REGISTRATION,
        backUrl: driver.vehicle?.registrationBack || fallbackByType.VEHICLE_REGISTRATION,
        status: docStatuses.vehicle
      },
      {
        id: "id-document",
        type: "ID_DOCUMENT",
        fileName: "id-document.jpg",
        frontUrl: driver.basicInformation?.cnicFront || fallbackByType.ID_DOCUMENT,
        backUrl: driver.basicInformation?.cnicBack || fallbackByType.ID_DOCUMENT,
        status: docStatuses.cnic
      }
    ];
  }, [driver, docStatuses]);

  const selectedDocument = documents.find((doc) => doc.id === selectedDocumentId) ?? documents[0];
  const displayName = driver?.username || driver?.basicInformation?.firstName || "Driver";
  const profilePicture = driver?.basicInformation?.profilePicture?.trim() || null;
  const displayStatus = optimisticStatus ?? driver?.status ?? "PENDING";
  const currentStatus = String(displayStatus).trim().toUpperCase();
  const showApproveAction = currentStatus === "PENDING" || currentStatus === "REJECTED" || currentStatus === "BLOCKED" ;
  const showRestrictAction = currentStatus === "APPROVED" || currentStatus === "ACTIVE" || currentStatus === "RESTRICTED";

  useEffect(() => {
    setProfileImageError(false);
  }, [profilePicture]);

  useEffect(() => {
    if (documents.length > 0 && !documents.some((doc) => doc.id === selectedDocumentId)) {
      setSelectedDocumentId(documents[0].id);
    }
  }, [documents, selectedDocumentId]);

  if (!loading && (isError || !driver)) {
    return (
      <AppShell title="Driver detail">
        <PageContainer>
          <EmptyState
            title="Driver not found"
            description="Unable to load this driver from backend."
            actionLabel="Back to drivers"
            onActionClick={() => router.push("/admin/drivers")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  const handleStatusChange = (status: DriverStatus) => {
    setPendingAction(status);
    setDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (!pendingAction || !driver?.id) return;
    statusMutation.mutate({
      userId: driver.id,
      status: statusPayloadMap[pendingAction]
    });
  };
console.log(documents , "documents");
  return (
    <AppShell title={`Driver • ${displayName}`}>
      <PageContainer>
        <div className="mb-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/drivers" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to drivers
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Personal information"
            description="Contact and status for this driver"
            className="lg:col-span-2"
          >
            {loading ? (
              <Skeleton className="h-32 w-full rounded-lg" />
            ) : (
              <div className="grid gap-4 lg:grid-cols-[140px,1fr]">
                <div className="flex flex-col items-center gap-2 sm:items-start">
                  <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted/20">
                    {profilePicture && !profileImageError ? (
                      <img
                        src={profilePicture}
                        alt={`${displayName} profile`}
                        className="h-full w-full object-cover"
                        onError={() => setProfileImageError(true)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <UserCircle className="h-16 w-16" strokeWidth={1.25} />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Profile picture
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5 transition-colors hover:bg-muted/20">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Full name</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {[driver?.basicInformation?.firstName, driver?.basicInformation?.lastName]
                      .filter(Boolean)
                      .join(" ") || driver?.username || "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5 transition-colors hover:bg-muted/20">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Phone</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{driver?.mobileNumber || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5 transition-colors hover:bg-muted/20">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Gender</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{driver?.basicInformation?.gender || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5 transition-colors hover:bg-muted/20">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">WhatsApp</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{driver?.basicInformation?.whatsApp || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5 transition-colors hover:bg-muted/20">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Email</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {driver?.basicInformation?.email || driver?.email || "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5 transition-colors hover:bg-muted/20">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">City</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{driver?.basicInformation?.city || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5 transition-colors hover:bg-muted/20">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={displayStatus} />
                  </div>
                </div>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Approval controls">
            <div className="space-y-3 text-sm">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Simulate approval actions for this driver. Changes are not
                persisted and are safe to experiment with.
              </p>
              <div className="flex flex-wrap gap-2">
                {showApproveAction ? (
                  <Button
                    size="sm"
                    disabled={updatingStatus}
                    onClick={() => handleStatusChange("APPROVED")}
                  >
                    Approved
                  </Button>
                ) : null}
                {showRestrictAction ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={updatingStatus}
                    onClick={() => handleStatusChange("BLOCKED")}
                  >
                    Blocked
                  </Button>
                ) : null}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Documents"
            description="Driver identity and vehicle documents."
            className="lg:col-span-3"
          >
            <div className="grid gap-3 text-xs lg:grid-cols-[360px,1fr]">
              <div className="space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocumentId(doc.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${selectedDocument?.id === doc.id
                        ? "border-[#fdb813]/40 bg-[var(--brand-light-hover)] shadow-sm ring-1 ring-[#fdb813]/20"
                        : "border-border/60 bg-card hover:bg-muted/30"
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="h-12 w-16 overflow-hidden rounded-md border border-border/60 bg-muted/30">
                        <img
                          src={doc.frontUrl}
                          alt={doc.fileName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                      </div>
                      <div className="mt-0.5 rounded-md bg-muted p-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {doc.type.replaceAll("_", " ")}
                        </p>
                        <p className="truncate text-[0.7rem] text-muted-foreground">
                          {doc.fileName}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 mt-1">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[0.65rem] font-medium">
                        {doc.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
                <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {selectedDocument?.fileName || "document.jpg"}
                    </p>
                    <p className="text-[0.68rem] text-muted-foreground">
                      {(selectedDocument?.type || "DOCUMENT").replaceAll("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 p-3 md:grid-cols-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-[0.7rem] font-medium text-muted-foreground">Front</p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewSrc(selectedDocument?.frontUrl || fallbackImage);
                            setPreviewOpen(true);
                          }}
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-[var(--brand-light-hover)] transition-colors duration-150"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>
                        <a
                          href={selectedDocument?.frontUrl || fallbackImage}
                          download
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-[var(--brand-light-hover)] transition-colors duration-150"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </a>
                      </div>
                    </div>
                    <div className="h-[220px] overflow-hidden rounded-md border border-border/60 bg-muted/20 p-1">
                      <img
                        src={selectedDocument?.frontUrl || fallbackImage}
                        alt="Document front"
                        className="h-full w-full rounded-sm bg-background object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackImage;
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-[0.7rem] font-medium text-muted-foreground">Back</p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewSrc(selectedDocument?.backUrl || fallbackImage);
                            setPreviewOpen(true);
                          }}
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-[var(--brand-light-hover)] transition-colors duration-150"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>
                        <a
                          href={selectedDocument?.backUrl || fallbackImage}
                          download
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-[var(--brand-light-hover)] transition-colors duration-150"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </a>
                      </div>
                    </div>
                    <div className="h-[220px] overflow-hidden rounded-md border border-border/60 bg-muted/20 p-1">
                      <img
                        src={selectedDocument?.backUrl || fallbackImage}
                        alt="Document back"
                        className="h-full w-full rounded-sm bg-background object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackImage;
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Vehicle"
            description="Vehicle information associated with this driver."
            className="lg:col-span-3"
          >
            <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
              <div className="overflow-hidden rounded-lg border border-border/60">
                <img
                  src={driver?.vehicle?.outdoorImages || driver?.vehicle?.indoorImages || "/mock-images/vehicle-profile.svg"}
                  alt="Vehicle profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/mock-images/vehicle-profile.svg";
                  }}
                />
              </div>
              <div className="text-sm">
                <div className="flex items-center justify-between py-3 border-b border-border/40">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-medium">
                    {driver?.vehicle?.modelNumberName?.trim() ||
                      driver?.vehicle?.modelNumberId ||
                      "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/40">
                  <span className="text-muted-foreground">Color</span>
                  <span className="font-medium">
                    {driver?.vehicle?.colorName?.trim() ||
                      driver?.vehicle?.colorId ||
                      "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">Plate</span>
                  <span className="font-medium">{driver?.vehicle?.registrationNo || "—"}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Future feature: keep ride performance section for upcoming analytics work.
          <SectionCard
            title="Ride performance"
            description="Aggregated performance across all rides completed by this driver."
            className="lg:col-span-2"
          >
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Completed rides</p>
                <p className="text-xl font-heading font-semibold">—</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Gross earnings</p>
                <p className="text-xl font-heading font-semibold">—</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Platform commission</p>
                <p className="text-xl font-heading font-semibold">—</p>
              </div>
            </div>
          </SectionCard>
          */}

          <SectionCard
            title="Status timeline"
            description="Historical status changes for this driver."
          >
            <ol className="space-y-3 text-xs">
              <li className="flex gap-2">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-gradient-to-b from-[#fce001] to-[#fdb813]" />
                <div>
                  <p className="font-medium">
                    {displayStatus || "—"} • {prettyDate(driver?.updatedAt)}
                  </p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    by system
                  </p>
                </div>
              </li>
            </ol>
          </SectionCard>
        </div>

        <ConfirmDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={confirmStatusChange}
          title="Confirm status change"
          description={
            pendingAction
              ? `This will mark the driver as ${statusPayloadMap[pendingAction]}.`
              : undefined
          }
          confirmLabel={updatingStatus ? "Updating..." : "Confirm"}
          cancelLabel="Cancel"
          destructive={pendingAction === "BLOCKED"}
        />
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Document preview</DialogTitle>
            </DialogHeader>
            <div className="h-[65vh] overflow-hidden rounded-lg border border-border/70 bg-muted/20 p-2">
              <img
                src={previewSrc}
                alt="Document preview"
                className="h-full w-full rounded-md bg-background object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackImage;
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </AppShell>
  );
}

