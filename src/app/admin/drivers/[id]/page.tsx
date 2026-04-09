"use client";

import { useMemo, useState } from "react";
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
import { drivers } from "@/mock-data/drivers";
import { rides } from "@/mock-data/rides";
import type { Driver } from "@/types/domain";
import { useToast } from "@/components/ui/toast";

type DriverStatus = Driver["status"];
const driverDocumentImages = [
  "/mock-images/driver-license.svg",
  "/mock-images/vehicle-registration.svg",
  "/mock-images/id-document.svg"
];

const driverDocuments = [
  {
    id: "driver-license",
    type: "DRIVER_LICENSE",
    fileName: "driver-license.jpg",
    fileUrl: driverDocumentImages[0],
    uploadedAt: "2026-03-10T10:00:00.000Z",
    status: "VERIFIED"
  },
  {
    id: "vehicle-registration",
    type: "VEHICLE_REGISTRATION",
    fileName: "vehicle-registration.jpg",
    fileUrl: driverDocumentImages[1],
    uploadedAt: "2026-03-11T10:00:00.000Z",
    status: "VERIFIED"
  },
  {
    id: "id-document",
    type: "ID_DOCUMENT",
    fileName: "id-document.jpg",
    fileUrl: driverDocumentImages[2],
    uploadedAt: "2026-03-12T10:00:00.000Z",
    status: "PENDING"
  }
] as const;

export default function AdminDriverDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success } = useToast();

  const [loading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    DriverStatus | null
  >(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>(
    driverDocuments[0].id
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>(driverDocuments[0].fileUrl);

  const driver = useMemo(
    () => drivers.find((d) => d.id === params.id),
    [params.id]
  );

  const driverRides = useMemo(
    () => rides.filter((r) => r.driverId === params.id),
    [params.id]
  );

  if (!driver) {
    return (
      <AppShell title="Driver detail">
        <PageContainer>
          <EmptyState
            title="Driver not found"
            description="This driver id does not exist in the mock dataset."
            actionLabel="Back to drivers"
            onActionClick={() => router.push("/admin/drivers")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  const completedRides = driverRides.filter(
    (r) => r.status === "COMPLETED"
  );
  const totalFare = completedRides.reduce((acc, r) => acc + r.fare, 0);
  const totalCommission = completedRides.reduce(
    (acc, r) => acc + r.commissionAmount,
    0
  );

  const handleStatusChange = (status: DriverStatus) => {
    setPendingAction(status);
    setDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (!pendingAction) return;
    success(`Driver would be marked as ${pendingAction.toLowerCase()} (mock).`);
    setDialogOpen(false);
  };

  const selectedDocument =
    driverDocuments.find((doc) => doc.id === selectedDocumentId) ??
    driverDocuments[0];
  const selectedIsPdf =
    selectedDocument.fileName.toLowerCase().endsWith(".pdf") ||
    selectedDocument.fileUrl.toLowerCase().includes(".pdf");
  const fallbackImage = "/mock-images/document-fallback.svg";

  return (
    <AppShell title={`Driver • ${driver.name}`}>
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
                  <p className="mt-0.5 font-heading font-medium">{driver.name}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                  <p className="mt-0.5 font-heading font-medium">{driver.phone}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">City</p>
                  <p className="mt-0.5 font-heading font-medium">{driver.city}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={driver.status} />
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
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("APPROVED")}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("RESTRICTED")}
                >
                  Restrict
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusChange("SUSPENDED")}
                >
                  Suspend
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Documents"
            description="Mock preview of the driver's identity and vehicle documents."
            className="lg:col-span-3"
          >
            <div className="grid gap-3 text-xs lg:grid-cols-[360px,1fr]">
              <div className="space-y-2">
                {driverDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setSelectedDocumentId(doc.id);
                      setPreviewSrc(doc.fileUrl);
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      selectedDocument.id === doc.id
                        ? "border-primary/60 bg-primary/10 shadow-sm"
                        : "border-border/60 bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="h-12 w-16 overflow-hidden rounded-md border border-border/60 bg-muted/30">
                        <img
                          src={doc.fileUrl}
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
                        <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
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
                      {selectedDocument.fileName}
                    </p>
                    <p className="text-[0.68rem] text-muted-foreground">
                      {selectedDocument.type.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={selectedDocument.fileUrl}
                      onClick={(e) => {
                        e.preventDefault();
                        setPreviewOpen(true);
                      }}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </a>
                    <a
                      href={selectedDocument.fileUrl}
                      download
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </a>
                  </div>
                </div>
                <div className="h-[360px] bg-muted/20 p-2">
                  {selectedIsPdf ? (
                    <iframe
                      src={selectedDocument.fileUrl}
                      title={selectedDocument.fileName}
                      className="h-full w-full rounded-md border border-border/60 bg-background"
                    />
                  ) : (
                    <img
                      src={previewSrc}
                      alt={selectedDocument.fileName}
                      className="h-full w-full rounded-md bg-background object-cover"
                      onError={() => {
                        setPreviewSrc(fallbackImage);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Vehicle"
            description="Mock vehicle information associated with this driver."
            className="lg:col-span-3"
          >
            <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
              <div className="overflow-hidden rounded-lg border border-border/60">
                <img
                  src="/mock-images/vehicle-profile.svg"
                  alt="Vehicle profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Make / Model</span>
                  <span className="font-medium">
                    Toyota Camry {driver.id.slice(-1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plate</span>
                  <span className="font-medium">
                    TP-{driver.id.slice(-3).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Color</span>
                  <span className="font-medium">White</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Ride performance"
            description="Aggregated performance across all rides completed by this driver."
            className="lg:col-span-2"
          >
            {driverRides.length === 0 ? (
              <EmptyState
                title="No rides yet"
                description="Once this driver starts accepting trips, their ride metrics will show up here."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Completed rides
                  </p>
                  <p className="text-xl font-heading font-semibold">
                    {completedRides.length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Gross earnings (mock)
                  </p>
                  <p className="text-xl font-heading font-semibold">
                    $
                    {Math.round(totalFare)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Platform commission
                  </p>
                  <p className="text-xl font-heading font-semibold">
                    $
                    {Math.round(totalCommission)}
                  </p>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Status timeline"
            description="Historical status changes for this driver."
          >
            <ol className="space-y-3 text-xs">
              {driver.statusHistory.map((entry) => (
                <li key={entry.changedAt} className="flex gap-2">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="font-medium">
                      {entry.status} •{" "}
                      {new Date(entry.changedAt).toLocaleDateString()}
                    </p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      by user {entry.changedByUserId}
                    </p>
                  </div>
                </li>
              ))}
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
              ? `This will mark the driver as ${pendingAction.toLowerCase()} in a real environment. This demo does not persist data.`
              : undefined
          }
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          destructive={pendingAction === "SUSPENDED"}
        />
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedDocument.fileName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  {selectedDocument.type.replaceAll("_", " ")} • Uploaded{" "}
                  {new Date(selectedDocument.uploadedAt).toLocaleDateString()}
                </p>
                <a
                  href={selectedDocument.fileUrl}
                  download
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[0.68rem] font-medium hover:bg-muted/50"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </div>
              <div className="h-[65vh] overflow-hidden rounded-lg border border-border/70 bg-muted/20 p-2">
                {selectedIsPdf ? (
                  <iframe
                    src={selectedDocument.fileUrl}
                    title={selectedDocument.fileName}
                    className="h-full w-full rounded-md border border-border/60 bg-background"
                  />
                ) : (
                  <img
                    src={previewSrc}
                    alt={selectedDocument.fileName}
                    className="h-full w-full rounded-md bg-background object-cover"
                    onError={() => {
                      setPreviewSrc(fallbackImage);
                    }}
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </AppShell>
  );
}

