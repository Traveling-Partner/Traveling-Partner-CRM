"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Download, Eye, FileText } from "lucide-react";
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
import { useAppSelector } from "@/store/hooks";
import { fetcher } from "@/lib/fetcher";

type DriverStatus = "PENDING" | "APPROVED" | "RESTRICTED";

interface DriverDetailResponse {
  id: number;
  email: string | null;
  username: string | null;
  mobileNumber: string | null;
  status: string;
  platform: string | null;
  roles: string[];
  otp: string | null;
  token: string | null;
  referralCode: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  basicInformation?: {
    userId: number;
    firstName: string | null;
    lastName: string | null;
    gender: string | null;
    whatsApp: string | null;
    email: string | null;
    cnicNumber: string | null;
    cnicFront: string | null;
    cnicBack: string | null;
    profilePicture: string | null;
    referralCode: string | null;
    acceptTerm: boolean | null;
    city: string | null;
    filterDeleted: boolean | null;
  } | null;
  license?: {
    userId: number;
    licenseNo: string | null;
    licenseFront: string | null;
    licenseBack: string | null;
    licenseVerified: boolean | null;
    filterVerified: boolean | null;
  } | null;
  vehicle?: {
    id: number;
    modelNumberId: number | null;
    modelNumberName?: string | null;
    colorId: number | null;
    colorName?: string | null;
    registrationNo: string | null;
    registrationFront: string | null;
    registrationBack: string | null;
    outdoorImages: string | null;
    indoorImages: string | null;
    ac: boolean | null;
    petsAllowed: boolean | null;
    smokingAllowed: boolean | null;
    vehicleVerified: boolean | null;
    brandId: number | null;
    userId: number;
  } | null;
}

interface DriverDocument {
  id: string;
  type: string;
  fileName: string;
  frontUrl: string;
  backUrl: string;
  status: string;
}

interface DriverDocumentsResponse {
  cnicStatus?: string | null;
  licenseStatus?: string | null;
  vehicleStatus?: string | null;
  vehicleDocStatus?: string | null;
  registrationStatus?: string | null;
}

interface ApiEnvelope<T> {
  data?: T;
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

function normalizeDocumentStatus(value: unknown): string {
  if (typeof value !== "string") return "PENDING";
  const normalized = value.trim().toUpperCase();
  if (!normalized) return "PENDING";
  if (normalized === "REJECT") return "REJECTED";
  if (normalized === "VERIFIED") return "APPROVED";
  return normalized;
}

function pickVehicleStatus(payload: Record<string, unknown>): unknown {
  const keys = [
    "vehicleDocStatus",
    "vehicleStatus",
    "registrationStatus",
    "vehicleRegistrationStatus",
    "registrationDocumentsStatus"
  ] as const;
  for (const key of keys) {
    const value = payload[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return null;
}

const statusPayloadMap: Record<DriverStatus, "ACTIVE" | "INACTIVE" | "BLOCKED"> = {
  APPROVED: "ACTIVE",
  RESTRICTED: "INACTIVE",
  PENDING: "INACTIVE"
};

export default function AdminDriverDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error } = useToast();
  const token = useAppSelector((state) => state.auth.token);

  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState<DriverDetailResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<DriverStatus | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("driver-license");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>(fallbackImage);
  const [docStatuses, setDocStatuses] = useState<{
    cnic: string;
    license: string;
    vehicle: string;
  }>({
    cnic: "PENDING",
    license: "PENDING",
    vehicle: "PENDING"
  });

  useEffect(() => {
    let active = true;
    const loadDriver = async () => {
      setLoading(true);
      try {
        const driverUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/drivers/${params.id}`;
        const docUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/documents/${params.id}`;
        const [response, documentsResponse] = await Promise.all([
          fetcher<DriverDetailResponse>(driverUrl, { token }),
          fetcher<DriverDocumentsResponse | ApiEnvelope<DriverDocumentsResponse>>(docUrl, { token })
        ]);
        const documentsPayload =
          documentsResponse &&
          typeof documentsResponse === "object" &&
          "data" in documentsResponse &&
          documentsResponse.data
            ? documentsResponse.data
            : (documentsResponse as DriverDocumentsResponse);
        const vehicleStatusRaw = pickVehicleStatus(
          documentsPayload as unknown as Record<string, unknown>
        );
        if (active) {
          setDriver(response);
          setDocStatuses({
            cnic: normalizeDocumentStatus(documentsPayload?.cnicStatus),
            license: normalizeDocumentStatus(documentsPayload?.licenseStatus),
            vehicle: normalizeDocumentStatus(vehicleStatusRaw)
          });
        }
      } catch {
        if (active) {
          setDriver(null);
          setDocStatuses({
            cnic: "PENDING",
            license: "PENDING",
            vehicle: "PENDING"
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDriver();

    return () => {
      active = false;
    };
  }, [params.id, token]);

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

  useEffect(() => {
    if (documents.length > 0 && !documents.some((doc) => doc.id === selectedDocumentId)) {
      setSelectedDocumentId(documents[0].id);
    }
  }, [documents, selectedDocumentId]);

  const selectedDocument = documents.find((doc) => doc.id === selectedDocumentId) ?? documents[0];
  const displayName = driver?.username || driver?.basicInformation?.firstName || "Driver";
  const currentStatus = String(driver?.status || "").trim().toUpperCase();
  const showApproveAction = currentStatus === "INACTIVE";
  const showRestrictAction = currentStatus === "ACTIVE";

  if (!loading && !driver) {
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

    const updateStatus = async () => {
      setUpdatingStatus(true);
      try {
        const payloadStatus = statusPayloadMap[pendingAction];
        const url = `${process.env.NEXT_PUBLIC_API_URL}/users/status/${driver.id}`;
        await fetcher(url, {
          method: "PUT",
          token,
          body: JSON.stringify({ status: payloadStatus })
        });

        setDriver((prev) => (prev ? { ...prev, status: payloadStatus } : prev));
        success(`Driver status updated to ${payloadStatus}.`);
        setDialogOpen(false);
      } catch (err) {
        error(err instanceof Error ? err.message : "Failed to update driver status.");
      } finally {
        setUpdatingStatus(false);
      }
    };

    void updateStatus();
  };

  return (
    <AppShell title={`Driver • ${displayName}`}>
      <PageContainer>
        <div className="mb-4 flex items-center gap-3">
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Full name</p>
                  <p className="mt-0.5 font-heading font-medium">{driver?.username || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                  <p className="mt-0.5 font-heading font-medium">{driver?.mobileNumber || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">City</p>
                  <p className="mt-0.5 font-heading font-medium">{driver?.basicInformation?.city || "—"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={driver?.status || "PENDING"} />
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Approval controls">
            <div className="space-y-3 text-sm">
              <p className="text-xs text-muted-foreground">
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
                    Approve
                  </Button>
                ) : null}
                {showRestrictAction ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={updatingStatus}
                    onClick={() => handleStatusChange("RESTRICTED")}
                  >
                    Restrict
                  </Button>
                ) : null}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
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
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      selectedDocument?.id === doc.id
                        ? "border-primary/60 bg-primary/10 shadow-sm"
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
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>
                        <a
                          href={selectedDocument?.frontUrl || fallbackImage}
                          download
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
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
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>
                        <a
                          href={selectedDocument?.backUrl || fallbackImage}
                          download
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
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
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-medium">
                    {driver?.vehicle?.modelNumberName?.trim() ||
                      driver?.vehicle?.modelNumberId ||
                      "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Color</span>
                  <span className="font-medium">
                    {driver?.vehicle?.colorName?.trim() ||
                      driver?.vehicle?.colorId ||
                      "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plate</span>
                  <span className="font-medium">{driver?.vehicle?.registrationNo || "—"}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
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
                <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-medium">
                    {driver?.status || "—"} • {prettyDate(driver?.updatedAt)}
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
          destructive={pendingAction === "RESTRICTED"}
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

