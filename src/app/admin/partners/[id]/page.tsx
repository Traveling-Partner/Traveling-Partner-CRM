"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { partners } from "@/mock-data/partners";
import { drivers } from "@/mock-data/drivers";
import { rides } from "@/mock-data/rides";

export default function AdminPartnerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const partner = useMemo(
    () => partners.find((p) => p.id === params.id),
    [params.id]
  );

  if (!partner) {
    return (
      <AppShell title="Partner detail">
        <PageContainer>
          <EmptyState
            title="Partner not found"
            description="This partner id does not exist in the mock dataset."
            actionLabel="Back to partners"
            onActionClick={() => router.push("/admin/partners")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  const partnerDrivers = drivers.filter(
    (d) => d.city === partner.city
  );

  const partnerRides = rides.filter((r) => r.partnerId === partner.id);
  const completedRides = partnerRides.filter(
    (r) => r.status === "COMPLETED"
  );
  const totalFare = completedRides.reduce((acc, r) => acc + r.fare, 0);

  return (
    <AppShell title={`Partner • ${partner.name}`}>
      <PageContainer>
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/partners" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to partners
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Partner profile"
            description="Core details for this fleet partner"
            className="lg:col-span-2"
          >
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                <p className="mt-0.5 font-heading font-medium">{partner.name}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">City</p>
                <p className="mt-0.5 font-heading font-medium">{partner.city}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                <div className="mt-0.5">
                  <StatusBadge status={partner.status} />
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created at</p>
                <p className="mt-0.5 font-heading font-medium">
                  {new Date(partner.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Network snapshot"
            description="High level metrics for this partner across your marketplace."
          >
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Drivers (same city)</span>
                <span className="font-heading font-semibold">{partnerDrivers.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Completed rides</span>
                <span className="font-heading font-semibold">{completedRides.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">Gross fares (mock)</span>
                <span className="font-heading font-semibold">${Math.round(totalFare)}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Status history"
            description="How this partner has moved through your onboarding workflow."
          >
            <ol className="space-y-3 text-xs">
              {partner.statusHistory.map((entry) => (
                <li key={entry.changedAt} className="flex gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <div className="min-w-0">
                    <p className="font-heading font-medium">
                      {entry.status} • {new Date(entry.changedAt).toLocaleDateString()}
                    </p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      by user {entry.changedByUserId}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard
            title="Recent rides"
            description="Sample of trips associated with this partner."
          >
            {partnerRides.length === 0 ? (
              <EmptyState
                title="No rides yet"
                description="Once this partner starts operating, their trips will appear here."
              />
            ) : (
              <div className="space-y-2 text-xs">
                {partnerRides.slice(0, 6).map((ride) => (
                  <div
                    key={ride.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        {ride.city} • {ride.status}
                      </p>
                      <p className="text-[0.7rem] text-muted-foreground">
                        {new Date(ride.startedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-[0.7rem] font-semibold">
                      ${Math.round(ride.fare)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </PageContainer>
    </AppShell>
  );
}

