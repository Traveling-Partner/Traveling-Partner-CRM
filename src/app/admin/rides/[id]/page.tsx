"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Car,
  CreditCard,
  Hash,
  MapPinned,
  Navigation,
  Phone,
  Route,
  Timer,
  User,
  Wallet
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { RideRouteMap } from "@/components/rides/RideRouteMap";
import TPLoader from "@/components/TPLoader";
import { useRideDetailQuery } from "@/hooks/queries/use-ride-detail-query";
import type { RideDetail } from "@/services/rides";

const DASH = "—";

const currency = (n: number | null) => {
  if (n == null || Number.isNaN(n)) return DASH;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(n);
};

function text(value: string | number | null | undefined) {
  if (value == null || value === "") return DASH;
  return String(value);
}

function humanize(value: string | null | undefined) {
  if (!value) return DASH;
  return value.replaceAll("_", " ");
}

function formatWhen(value: string | null | undefined, pattern = "MMM d, yyyy · HH:mm") {
  if (!value) return DASH;
  try {
    const d = parseISO(value);
    if (Number.isNaN(d.getTime())) return DASH;
    return format(d, pattern);
  } catch {
    return DASH;
  }
}

function paymentLabel(method: string | null) {
  if (!method) return DASH;
  if (method === "CARD") return "Card";
  if (method === "WALLET") return "In-app wallet";
  if (method === "CASH") return "Cash";
  return humanize(method);
}

const LIVE_STATUSES = new Set([
  "COUNTER_OFFERED",
  "ACCEPTED",
  "DRIVER_ON_THE_WAY",
  "DRIVER_ARRIVED",
  "PARTNER_COMING"
]);

function buildTimeline(ride: RideDetail) {
  const steps: { title: string; at: string | null; tone: "muted" | "default" | "success" | "danger" | "warn" }[] = [
    { title: "Ride requested", at: ride.requestedAt, tone: "muted" }
  ];

  if (ride.startedAt || ride.status === "RIDE_STARTED") {
    steps.push({ title: "Pickup — trip started", at: ride.startedAt, tone: "default" });
  }

  if (LIVE_STATUSES.has(ride.status)) {
    steps.push({ title: humanize(ride.status), at: null, tone: "warn" });
  }

  if (ride.status === "COMPLETED") {
    steps.push({ title: "Drop-off — completed", at: ride.completedAt, tone: "success" });
  }

  if (ride.status === "CANCELED") {
    steps.push({ title: "Trip canceled", at: ride.completedAt, tone: "danger" });
  }

  if (ride.status === "EXPIRED") {
    steps.push({ title: "Request expired", at: ride.completedAt, tone: "danger" });
  }

  return steps;
}

export default function AdminRideDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: ride, isLoading, isError, error } = useRideDetailQuery(params.id);

  const timeline = useMemo(() => (ride ? buildTimeline(ride) : []), [ride]);

  if (isLoading) {
    return (
      <AppShell title="Ride detail">
        <PageContainer>
          <div className="flex justify-center py-12">
            <TPLoader variant="inline" size={120} label="Loading ride…" />
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  const notFound =
    isError && (error?.message ?? "").toLowerCase().includes("ride not found");

  if (isError || !ride) {
    return (
      <AppShell title="Ride detail">
        <PageContainer>
          <EmptyState
            title={notFound ? "Ride not found" : "Unable to load ride"}
            description={
              notFound
                ? "This ride id does not exist."
                : error?.message || "The ride could not be loaded from the server."
            }
            actionLabel="Back to rides"
            onActionClick={() => router.push("/admin/rides")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  const netToPartner =
    ride.fare != null && ride.commissionAmount != null
      ? Math.max(0, ride.fare - ride.commissionAmount)
      : null;

  return (
    <AppShell title={`Ride ${ride.bookingReference || ride.id}`}>
      <PageContainer>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/rides" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              All rides
            </Link>
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-[#1a1508] via-slate-950 to-slate-900 p-6 text-white shadow-xl ring-1 ring-amber-500/25 md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#fdb813]/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={ride.status} />
                {ride.rideType ? (
                  <Badge variant="outline" className="border-white/20 bg-white/5 text-[0.65rem] text-white/90">
                    {humanize(ride.rideType)}
                  </Badge>
                ) : null}
              </div>
              <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
                {ride.city ? `${ride.city} trip` : "Ride detail"}
              </h1>
              <p className="max-w-xl text-sm text-white/70">
                Booking{" "}
                <span className="font-mono text-amber-200/90">
                  {text(ride.bookingReference)}
                </span>
                {" · "}
                Full operational view — route, parties, timing, and settlement.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                  <Hash className="h-3.5 w-3.5 text-amber-300" />
                  {ride.id}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                  <MapPinned className="h-3.5 w-3.5 text-emerald-300" />
                  {text(ride.city)}
                </span>
              </div>
            </div>
            <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3 lg:w-auto">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/50">
                  Fare
                </p>
                <p className="mt-1 font-heading text-xl font-semibold text-amber-300">
                  {currency(ride.fare)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/50">
                  Distance
                </p>
                <p className="mt-1 font-heading text-xl font-semibold">
                  {ride.distanceKm == null ? DASH : `${ride.distanceKm} km`}
                </p>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:col-span-1">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/50">
                  Duration
                </p>
                <p className="mt-1 font-heading text-xl font-semibold">
                  {ride.durationMinutes == null ? DASH : `${ride.durationMinutes} min`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <RideRouteMap
            startLat={ride.startLat}
            startLng={ride.startLng}
            endLat={ride.endLat}
            endLng={ride.endLng}
            pickupLabel={ride.pickupAddress || "Pickup address unavailable"}
            dropoffLabel={ride.dropoffAddress || "Drop-off address unavailable"}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Trip timeline"
            description="Request through the latest recorded status."
            className="lg:col-span-1"
          >
            <ol className="space-y-4">
              {timeline.map((step, i) => (
                <li key={`${step.title}-${i}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        step.tone === "success"
                          ? "bg-emerald-500"
                          : step.tone === "danger"
                            ? "bg-rose-500"
                            : step.tone === "warn"
                              ? "bg-amber-400"
                              : step.tone === "muted"
                                ? "bg-slate-400"
                                : "bg-primary"
                      }`}
                    />
                    {i < timeline.length - 1 ? (
                      <div className="mt-1 min-h-[2rem] w-px flex-1 bg-border" />
                    ) : null}
                  </div>
                  <div className="min-w-0 pb-2">
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{formatWhen(step.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard
            title="Passenger & payment"
            description="Rider-facing booking details."
            className="lg:col-span-2"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Passenger
                </div>
                <p className="mt-2 font-heading text-lg font-semibold">{text(ride.passengerName)}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {text(ride.passengerPhone)}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {ride.paymentMethod === "WALLET" ? (
                    <Wallet className="h-3.5 w-3.5" />
                  ) : (
                    <CreditCard className="h-3.5 w-3.5" />
                  )}
                  Payment
                </div>
                <p className="mt-2 font-heading text-lg font-semibold">{paymentLabel(ride.paymentMethod)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Service:{" "}
                  <span className="font-medium text-foreground">{humanize(ride.rideType)}</span>
                </p>
                <p className="mt-2 text-sm">
                  Tip:{" "}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {currency(ride.tipAmount)}
                  </span>
                </p>
              </div>
              {ride.cancellationReason ? (
                <div className="sm:col-span-2 rounded-xl border border-rose-500/25 bg-rose-500/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                    Cancellation reason
                  </p>
                  <p className="mt-1 text-sm">{ride.cancellationReason}</p>
                </div>
              ) : null}
            </div>
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard title="Driver" description="Assigned operator for this trip.">
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Car className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Driver
                  </p>
                  <p className="font-heading font-semibold">{text(ride.driverName)}</p>
                  <p className="text-sm text-muted-foreground">{text(ride.driverPhone)}</p>
                  {ride.driverId != null ? (
                    <Button variant="link" className="h-auto px-0 pt-1 text-xs" asChild>
                      <Link href={`/admin/drivers/${ride.driverId}`}>Open driver profile</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                  <p className="text-[0.65rem] uppercase text-muted-foreground">Driver ID</p>
                  <p className="font-mono font-medium">{text(ride.driverId)}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                  <p className="text-[0.65rem] uppercase text-muted-foreground">Class</p>
                  <p className="font-medium">{humanize(ride.rideType)}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Partner & settlement" description="Network partner and platform economics.">
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Partner
                  </p>
                  <p className="font-heading font-semibold">{text(ride.partnerName)}</p>
                  {ride.partnerId != null ? (
                    <Button variant="link" className="h-auto px-0 pt-1 text-xs" asChild>
                      <Link href={`/admin/partners/${ride.partnerId}`}>Open partner</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="border-border/60 shadow-none">
                  <CardContent className="space-y-1 pt-4">
                    <p className="text-[0.65rem] font-medium uppercase text-muted-foreground">Gross fare</p>
                    <p className="font-heading text-lg font-semibold">{currency(ride.fare)}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/60 shadow-none">
                  <CardContent className="space-y-1 pt-4">
                    <p className="text-[0.65rem] font-medium uppercase text-muted-foreground">Commission</p>
                    <p className="font-heading text-lg font-semibold text-amber-700 dark:text-amber-400">
                      {currency(ride.commissionAmount)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border/60 bg-muted/20 shadow-none sm:col-span-1">
                  <CardContent className="space-y-1 pt-4">
                    <p className="text-[0.65rem] font-medium uppercase text-muted-foreground">Net</p>
                    <p className="font-heading text-lg font-semibold">{currency(netToPartner)}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Route & scheduling"
          description="Structured fields for integrations and audits."
          className="mt-4"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
              <Route className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground">Distance</p>
                <p className="font-medium">
                  {ride.distanceKm == null ? DASH : `${ride.distanceKm} km`}
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
              <Timer className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {ride.durationMinutes == null ? DASH : `${ride.durationMinutes} minutes`}
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground">Started</p>
                <p className="text-sm font-medium">{formatWhen(ride.startedAt, "PPp")}</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
              <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground">Ended</p>
                <p className="text-sm font-medium">{formatWhen(ride.completedAt, "PPp")}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Pickup (full address)
              </p>
              <p className="mt-2 text-sm leading-relaxed">{text(ride.pickupAddress)}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                Drop-off (full address)
              </p>
              <p className="mt-2 text-sm leading-relaxed">{text(ride.dropoffAddress)}</p>
            </div>
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
