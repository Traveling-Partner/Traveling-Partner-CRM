"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { drivers } from "@/mock-data/drivers";
import { rides } from "@/mock-data/rides";
import type { Driver } from "@/types/domain";
import { useToast } from "@/components/ui/toast";

type DriverStatus = Driver["status"];
const driverDocumentImages = [
  "https://cdn.pixabay.com/photo/2016/11/29/03/53/adult-1867743_1280.jpg",
  "https://cdn.pixabay.com/photo/2016/03/27/21/16/polaroid-1284455_1280.jpg",
  "https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_1280.jpg"
];

export default function AdminDriverDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success } = useToast();

  const [loading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    DriverStatus | null
  >(null);

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
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {["Driver license", "Vehicle registration", "ID document"].map(
                (label, index) => (
                  <div
                    key={label}
                    className="space-y-1.5 rounded-lg border border-border/70 bg-muted/30 p-3 text-center"
                  >
                    <div className="h-20 overflow-hidden rounded-md border border-border/60">
                      <img
                        src={driverDocumentImages[index] ?? driverDocumentImages[0]}
                        alt={label}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-medium">{label}</p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      Tap to preview in the Documents queue screen.
                    </p>
                  </div>
                )
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Vehicle"
            description="Mock vehicle information associated with this driver."
          >
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
      </PageContainer>
    </AppShell>
  );
}

