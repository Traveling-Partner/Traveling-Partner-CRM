"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Phone, Siren } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  LocationMapPlaceholder,
  type SosMapPoint
} from "@/components/safety-center/LocationMapPlaceholder";
import {
  SosCaseNotesPanel,
  type SosCaseNoteInput
} from "@/components/safety-center/SosCaseNotesPanel";
import {
  useAddSosCaseNoteMutation,
  useSosIncidentDetailQuery,
  useUpdateSosIncidentStatusMutation
} from "@/hooks/queries/use-sos-incidents";
import type { SosIncidentStatusAction } from "@/services/sos-incidents";

function formatEnum(value: string | null | undefined): string {
  if (!value) return "—";
  return value.replace(/_/g, " ");
}

function formatDateTime(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function AdminSafetyIncidentDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const { success, error: showError } = useToast();

  const [comment, setComment] = useState("");

  const detailQuery = useSosIncidentDetailQuery(id || undefined);
  const statusMutation = useUpdateSosIncidentStatusMutation(id);
  const noteMutation = useAddSosCaseNoteMutation(id);

  const incident = detailQuery.data ?? null;
  const trip = incident?.trip ?? null;
  const isClosed = Boolean(incident?.resolution);

  const routePoints = useMemo<SosMapPoint[]>(() => {
    if (!incident) return [];
    const points: SosMapPoint[] = [];

    if (trip) {
      points.push({
        kind: "START",
        label: "Ride start · pickup",
        address: trip.pickup,
        lat: trip.pickupLatitude,
        lng: trip.pickupLongitude,
        caption: trip.startedAt ? `Started ${formatDateTime(trip.startedAt)}` : null
      });
    }

    if (incident.location) {
      points.push({
        kind: "SOS",
        label: "SOS triggered here",
        address: incident.location.label,
        lat: incident.location.lat,
        lng: incident.location.lng,
        caption: incident.location.updatedAt
          ? `Captured ${formatDateTime(incident.location.updatedAt)}`
          : null
      });
    }

    if (trip) {
      points.push({
        kind: "END",
        label: "Ride end · dropoff",
        address: trip.dropoff,
        lat: trip.dropoffLatitude,
        lng: trip.dropoffLongitude
      });
    }

    return points;
  }, [incident, trip]);

  const runStatusUpdate = async (
    status: SosIncidentStatusAction,
    successMessage: string
  ) => {
    try {
      await statusMutation.mutateAsync({
        status,
        comment: status === "ACKNOWLEDGED" ? undefined : comment
      });
      setComment("");
      success(successMessage);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to update SOS status.");
    }
  };

  const handleNoteSubmit = async (input: SosCaseNoteInput) => {
    await noteMutation.mutateAsync(input);
    success("Note added");
  };

  if (detailQuery.isLoading) {
    return (
      <AppShell title="SOS detail" wideContent>
        <PageContainer>
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-4 lg:grid-cols-3">
              <Skeleton className="h-64 w-full lg:col-span-2" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-52 w-full" />
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  if (detailQuery.isError || !incident) {
    return (
      <AppShell title="SOS detail">
        <PageContainer>
          <EmptyState
            title="Incident not available"
            description={
              detailQuery.error?.message ?? "This SOS incident could not be loaded."
            }
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/safety">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to incidents
              </Link>
            </Button>
            <Button type="button" variant="outline" onClick={() => detailQuery.refetch()}>
              Retry
            </Button>
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  const isUpdatingStatus = statusMutation.isPending;

  return (
    <AppShell title={`SOS · ${incident.code}`} wideContent>
      <PageContainer>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/safety">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={incident.status} />
            <StatusBadge status={incident.severity} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard
            className="lg:col-span-2"
            title="Ride route & SOS location"
            description="Pickup to dropoff, with the point where SOS was triggered."
          >
            {routePoints.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ride or location data is linked to this incident.
              </p>
            ) : (
              <LocationMapPlaceholder points={routePoints} />
            )}
          </SectionCard>

          <SectionCard
            title="Case actions"
            description={isClosed ? "This case is closed." : "Move this case forward."}
          >
            {isClosed && incident.resolution ? (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Outcome</dt>
                  <dd className="mt-1">
                    <StatusBadge status={incident.resolution.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Comment</dt>
                  <dd className="font-medium">
                    {incident.resolution.comment || "No comment recorded."}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Closed by</dt>
                  <dd className="font-medium">
                    {incident.resolution.resolvedBy?.name ?? "—"}
                    <span className="block text-xs text-muted-foreground">
                      {formatDateTime(incident.resolution.resolvedAt)}
                    </span>
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  disabled={incident.status !== "ACTIVE" || isUpdatingStatus}
                  onClick={() => runStatusUpdate("ACKNOWLEDGED", "SOS acknowledged")}
                >
                  Acknowledge
                </Button>
                <Textarea
                  placeholder="Resolution comment (saved with resolve / false alarm)"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isUpdatingStatus}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdatingStatus}
                  onClick={() => runStatusUpdate("RESOLVED", "SOS marked resolved")}
                >
                  Resolve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdatingStatus}
                  onClick={() => runStatusUpdate("FALSE_ALARM", "Marked as false alarm")}
                >
                  False alarm
                </Button>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Current trip"
            description={incident.ridePlanId ? `Ride #${incident.ridePlanId}` : undefined}
          >
            {trip ? (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Rider</dt>
                  <dd className="font-medium">
                    {trip.riderName ?? "—"}
                    <span className="block text-xs text-muted-foreground">
                      {trip.riderPhone ?? "No phone"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Driver</dt>
                  <dd className="font-medium">
                    {trip.driverName ?? "—"}
                    <span className="block text-xs text-muted-foreground">
                      {trip.driverPhone ?? "No phone"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Vehicle</dt>
                  <dd className="font-medium">{trip.vehiclePlate ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Trip status</dt>
                  <dd>{trip.status ? <StatusBadge status={trip.status} /> : "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Route</dt>
                  <dd className="font-medium">
                    {trip.pickup ?? "—"} → {trip.dropoff ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Started</dt>
                  <dd className="font-medium">{formatDateTime(trip.startedAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Fare estimate</dt>
                  <dd className="font-medium">
                    {trip.fareEstimate == null ? "—" : `PKR ${trip.fareEstimate}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Trigger</dt>
                  <dd className="font-medium">{formatEnum(incident.trigger)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Reported</dt>
                  <dd className="font-medium">{formatDateTime(incident.reportedAt)}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No ride linked to this incident.</p>
            )}
          </SectionCard>

          <SectionCard title="Timeline" description="Event log for this SOS">
            {incident.timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events recorded yet.</p>
            ) : (
              <ol className="space-y-3">
                {incident.timeline
                  .slice()
                  .reverse()
                  .map((evt, index) => (
                    <li
                      key={`${evt.at}-${index}`}
                      className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                    >
                      <p className="font-medium">{evt.label}</p>
                      {evt.note && (
                        <p className="text-xs text-muted-foreground">{evt.note}</p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDateTime(evt.at)}
                      </p>
                    </li>
                  ))}
              </ol>
            )}
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Emergency actions pressed"
            description="In-app actions the user triggered during this SOS"
          >
            {incident.emergencyActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No emergency action was pressed.
              </p>
            ) : (
              <ul className="space-y-2">
                {incident.emergencyActions.map((action) => (
                  <li
                    key={`${action.action}-${action.triggeredAt}`}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                  >
                    <Siren className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                    <div className="min-w-0">
                      <p className="font-medium">{formatEnum(action.action)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDateTime(action.triggeredAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {incident.emergencyContacts.length > 0 && (
            <SectionCard
              title="Emergency contacts"
              description="Shared by the app when SOS was triggered"
            >
              <ul className="space-y-2">
                {incident.emergencyContacts.map((c) => (
                  <li
                    key={`${c.name}-${c.phone}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[formatEnum(c.relation), formatEnum(c.userRole), c.phone]
                          .filter((part) => part && part !== "—")
                          .join(" · ")}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <a href={`tel:${c.phone}`}>Call</a>
                    </Button>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          <SectionCard
            title="Nearby services"
            description={incident.city ? `City: ${incident.city}` : "Emergency helplines"}
          >
            {incident.nearbyServices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No emergency services matched this location.
              </p>
            ) : (
              <ul className="space-y-2">
                {incident.nearbyServices.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[s.state, s.number].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <a href={`tel:${s.number}`}>
                        <Phone className="mr-1 h-3.5 w-3.5" />
                        Call
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <SectionCard
          className="mt-4"
          title="Case notes"
          description="Rider · Partner · Safety Desk — add comments with images, screenshots, or docs"
        >
          {incident.notes && (
            <p className="mb-4 rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              System summary: {incident.notes}
            </p>
          )}
          <SosCaseNotesPanel
            notes={incident.caseNotes}
            disabled={isClosed}
            disabledHint="This case is closed, so new notes can no longer be added."
            authors={{
              RIDER: trip?.riderName ?? undefined,
              PARTNER: trip?.driverName ?? undefined,
              SAFETY_DESK: "Safety Desk"
            }}
            onSubmit={handleNoteSubmit}
          />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
