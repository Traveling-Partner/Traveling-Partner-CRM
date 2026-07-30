"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { LocationMapPlaceholder } from "@/components/safety-center/LocationMapPlaceholder";
import { SosCaseNotesPanel } from "@/components/safety-center/SosCaseNotesPanel";
import {
  emergencyContactsSeed,
  emergencyServicesSeed,
  sosIncidentsSeed
} from "@/mock-data/safety-center";
import type { SosCaseNote, SosIncident } from "@/types/safety-center";

export default function AdminSafetyIncidentDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const { toast, success } = useToast();

  const [incidents, setIncidents] = useState(sosIncidentsSeed);

  const incident = useMemo(
    () => incidents.find((i) => i.id === id) ?? null,
    [incidents, id]
  );

  const relatedContacts = useMemo(() => {
    if (!incident) return [];
    return emergencyContactsSeed.filter(
      (c) =>
        c.userName === incident.trip.riderName || c.userName === incident.trip.driverName
    );
  }, [incident]);

  const cityServices = useMemo(() => {
    if (!incident) return [];
    return emergencyServicesSeed.filter(
      (s) => s.city === incident.city || s.city === "Nationwide"
    );
  }, [incident]);

  const updateStatus = (status: SosIncident["status"], message: string) => {
    setIncidents((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const now = new Date().toISOString();
        return {
          ...i,
          status,
          acknowledgedAt:
            status === "ACKNOWLEDGED" || status === "RESOLVED" || status === "FALSE_ALARM"
              ? i.acknowledgedAt ?? now
              : i.acknowledgedAt,
          resolvedAt:
            status === "RESOLVED" || status === "FALSE_ALARM" ? now : i.resolvedAt,
          timeline: [
            ...i.timeline,
            {
              id: `evt-${Date.now()}`,
              at: now,
              label: message
            }
          ]
        };
      })
    );
    success(message);
  };

  if (!incident) {
    return (
      <AppShell title="SOS detail">
        <PageContainer>
          <EmptyState
            title="Incident not found"
            description="This SOS id is not in the mock dataset."
          />
          <Button asChild variant="outline" className="mt-4">
            <Link href="/admin/safety/incidents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to incidents
            </Link>
          </Button>
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title={`SOS · ${incident.code}`} wideContent>
      <PageContainer>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/safety/incidents">
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
            title="Live location"
            description={incident.location.label}
          >
            <LocationMapPlaceholder location={incident.location} />
          </SectionCard>

          <SectionCard title="Actions" description="Mock ops controls">
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                disabled={incident.status !== "ACTIVE"}
                onClick={() => updateStatus("ACKNOWLEDGED", "SOS acknowledged")}
              >
                Acknowledge
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={incident.status === "RESOLVED" || incident.status === "FALSE_ALARM"}
                onClick={() => updateStatus("RESOLVED", "SOS marked resolved")}
              >
                Resolve
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={incident.status === "FALSE_ALARM"}
                onClick={() => updateStatus("FALSE_ALARM", "Marked as false alarm")}
              >
                False alarm
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  toast("Emergency call simulated — wire telephony API later.")
                }
              >
                <Phone className="mr-2 h-4 w-4" />
                Call emergency
              </Button>
            </div>
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard title="Current trip" description={incident.trip.rideId}>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Rider</dt>
                <dd className="font-medium">
                  {incident.trip.riderName}
                  <span className="block text-xs text-muted-foreground">
                    {incident.trip.riderPhone}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Driver</dt>
                <dd className="font-medium">
                  {incident.trip.driverName}
                  <span className="block text-xs text-muted-foreground">
                    {incident.trip.driverPhone}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Vehicle</dt>
                <dd className="font-medium">{incident.trip.vehiclePlate}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Trip status</dt>
                <dd>
                  <StatusBadge status={incident.trip.status} />
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Route</dt>
                <dd className="font-medium">
                  {incident.trip.pickup} → {incident.trip.dropoff}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Started</dt>
                <dd className="font-medium">
                  {new Date(incident.trip.startedAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fare estimate</dt>
                <dd className="font-medium">PKR {incident.trip.fareEstimate}</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Timeline" description="Event log for this SOS">
            <ol className="space-y-3">
              {incident.timeline
                .slice()
                .reverse()
                .map((evt) => (
                  <li
                    key={evt.id}
                    className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                  >
                    <p className="font-medium">{evt.label}</p>
                    {evt.note && (
                      <p className="text-xs text-muted-foreground">{evt.note}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(evt.at).toLocaleString()}
                    </p>
                  </li>
                ))}
            </ol>
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Emergency contacts"
            description="Linked to rider/driver on this trip (mock)"
          >
            {relatedContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No linked contacts in mock data.</p>
            ) : (
              <ul className="space-y-2">
                {relatedContacts.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {c.name}{" "}
                        {c.isPrimary && (
                          <span className="text-[10px] uppercase text-[#b8860b]">Primary</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.relation} · {c.phone}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => toast(`Mock call to ${c.name}`)}
                    >
                      Call
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Nearby services" description={`City: ${incident.city}`}>
            <ul className="space-y-2">
              {cityServices.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.type} · {s.phone}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => toast(`Mock dispatch: ${s.name}`)}
                  >
                    Notify
                  </Button>
                </li>
              ))}
            </ul>
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
            authors={{
              RIDER: incident.trip.riderName,
              PARTNER: incident.trip.driverName,
              SAFETY_DESK: "Safety Desk"
            }}
            onChange={(caseNotes: SosCaseNote[]) => {
              setIncidents((prev) =>
                prev.map((i) => (i.id === id ? { ...i, caseNotes } : i))
              );
            }}
          />

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
            <Button
              type="button"
              disabled={incident.status !== "ACTIVE"}
              onClick={() => updateStatus("ACKNOWLEDGED", "SOS acknowledged")}
            >
              Acknowledge
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={incident.status === "RESOLVED" || incident.status === "FALSE_ALARM"}
              onClick={() => updateStatus("RESOLVED", "SOS marked resolved")}
            >
              Resolve
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={incident.status === "FALSE_ALARM"}
              onClick={() => updateStatus("FALSE_ALARM", "Marked as false alarm")}
            >
              False alarm
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                toast("Emergency call simulated — wire telephony API later.")
              }
            >
              <Phone className="mr-2 h-4 w-4" />
              Call emergency
            </Button>
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
