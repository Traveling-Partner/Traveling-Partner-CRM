"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  CalendarClock,
  CreditCard,
  Hash,
  MapPinned,
  Navigation,
  Route,
  Timer,
  Wallet
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  PoolRideBadge,
  poolRideCurrency,
  poolRidePaymentLabel
} from "@/components/pool-rides/PoolRideBadges";
import { PoolRideRouteMap } from "@/components/pool-rides/PoolRideRouteMap";
import { PoolRideTimeline } from "@/components/pool-rides/PoolRideTimeline";
import { PersonCard } from "@/components/pool-rides/PersonCard";
import { VehicleDetailsCard } from "@/components/pool-rides/VehicleDetailsCard";
import { findPoolRideById } from "@/hooks/pool-rides/usePoolRidesMock";
import { poolRides } from "@/mock-data/pool-rides";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

export default function PoolRideDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const ride = useMemo(
    () => findPoolRideById(params.id, poolRides),
    [params.id]
  );

  if (!ride) {
    return (
      <AppShell title="Pool ride detail">
        <PageContainer>
          <EmptyState
            title="Ride not found"
            description="This pool ride id does not exist in the mock dataset."
            actionLabel="Back to pool rides"
            onActionClick={() => router.push("/admin/pool-rides")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  const isCancelled = ride.rideStatus === "CANCELLED";
  const PaymentIcon = ride.paymentMethod === "WALLET" ? Wallet : CreditCard;

  return (
    <AppShell title={`Pool Ride ${ride.id}`}>
      <PageContainer>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/pool-rides" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              All pool rides
            </Link>
          </Button>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-[#1a1508] via-slate-950 to-slate-900 p-6 text-white shadow-xl ring-1 ring-amber-500/25 md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#fdb813]/25 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <PoolRideBadge
                  status={ride.rideStatus}
                  variant="ride"
                  className="border border-white/10"
                />
                <PoolRideBadge
                  status={ride.bookingStatus}
                  variant="booking"
                  className="border border-white/10"
                />
                <Badge
                  variant="outline"
                  className="border-white/20 bg-white/5 text-[0.65rem] text-white/90"
                >
                  {ride.rideType}
                </Badge>
              </div>
              <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
                {ride.pickupAddress.split(",")[0]} → {ride.destinationAddress.split(",")[0]}
              </h1>
              <p className="max-w-xl text-sm text-white/70">
                Booked {format(parseISO(ride.bookingDate), "PPP · p")} ·{" "}
                {ride.tripType.replace(/_/g, " ")} · {ride.vehicleType}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                  <Hash className="h-3.5 w-3.5 text-amber-300" />
                  {ride.id}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                  <MapPinned className="h-3.5 w-3.5 text-emerald-300" />
                  {ride.vehicleType}
                </span>
              </div>
            </div>
            <div className="grid w-full max-w-sm grid-cols-2 gap-3 lg:w-auto">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/50">
                  Final amount
                </p>
                <p className="mt-1 font-heading text-xl font-semibold text-amber-300">
                  {poolRideCurrency(ride.finalAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/50">
                  Distance
                </p>
                <p className="mt-1 font-heading text-xl font-semibold">
                  {ride.actualDistanceKm ?? ride.estimatedDistanceKm} km
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-6">
          <PoolRideRouteMap ride={ride} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Ride timeline"
            description="Booking through completion or cancellation."
            className="lg:col-span-1"
          >
            <PoolRideTimeline events={ride.timeline} />
          </SectionCard>

          <SectionCard
            title="Ride information"
            description="Core booking and trip metadata."
            className="lg:col-span-2"
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <InfoField label="Ride ID" value={ride.id} />
              <InfoField
                label="Booking date"
                value={format(parseISO(ride.bookingDate), "PPP")}
              />
              <InfoField label="Ride status" value={ride.rideStatus.replace(/_/g, " ")} />
              <InfoField label="Booking status" value={ride.bookingStatus} />
              <InfoField label="Ride type" value={ride.rideType} />
              <InfoField label="Vehicle type" value={ride.vehicleType} />
              <InfoField label="Trip type" value={ride.tripType.replace(/_/g, " ")} />
              <InfoField
                label="Payment method"
                value={poolRidePaymentLabel(ride.paymentMethod)}
              />
              <InfoField label="Total fare" value={poolRideCurrency(ride.fare)} />
              <InfoField label="Discount" value={poolRideCurrency(ride.discount)} />
              <InfoField label="Taxes" value={poolRideCurrency(ride.taxes)} />
              <InfoField label="Final amount" value={poolRideCurrency(ride.finalAmount)} />
              <InfoField
                label="Distance"
                value={`${ride.actualDistanceKm ?? ride.estimatedDistanceKm} km`}
              />
              <InfoField
                label="Duration"
                value={`${ride.actualTimeMinutes ?? ride.estimatedTimeMinutes} min`}
              />
            </div>
          </SectionCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard title="Driver information" description="Assigned operator.">
            <PersonCard
              title="Driver"
              name={ride.driver.name}
              phone={ride.driver.phone}
              email={ride.driver.email}
              photoUrl={ride.driver.photoUrl}
              rating={ride.driver.rating}
              status={ride.driver.status}
              extra={[
                { label: "Vehicle number", value: ride.driver.vehicleNumber }
              ]}
            />
            <Button variant="link" className="mt-2 h-auto px-0 text-xs" asChild>
              <Link href={`/admin/drivers/${ride.driver.id}`}>Open driver profile</Link>
            </Button>
          </SectionCard>

          <SectionCard title="Passenger information" description="Rider on this trip.">
            <PersonCard
              title="Passenger"
              name={ride.passenger.name}
              phone={ride.passenger.phone}
              email={ride.passenger.email}
              photoUrl={ride.passenger.photoUrl}
            />
          </SectionCard>
        </div>

        <SectionCard
          title="Vehicle information"
          description="Fleet details based on vehicle type."
          className="mt-4"
        >
          <VehicleDetailsCard vehicle={ride.vehicle} />
        </SectionCard>

        <SectionCard
          title="Route information"
          description="Pickup, destination, and timing."
          className="mt-4"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
              <Route className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground">
                  Est. distance
                </p>
                <p className="font-medium">{ride.estimatedDistanceKm} km</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
              <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground">
                  Actual distance
                </p>
                <p className="font-medium">
                  {ride.actualDistanceKm != null ? `${ride.actualDistanceKm} km` : "—"}
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
              <Timer className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground">
                  Est. time
                </p>
                <p className="font-medium">{ride.estimatedTimeMinutes} min</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground">
                  Actual time
                </p>
                <p className="font-medium">
                  {ride.actualTimeMinutes != null ? `${ride.actualTimeMinutes} min` : "—"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Pickup address
              </p>
              <p className="mt-2 text-sm leading-relaxed">{ride.pickupAddress}</p>
            </div>
            <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
                Destination address
              </p>
              <p className="mt-2 text-sm leading-relaxed">{ride.destinationAddress}</p>
            </div>
          </div>
        </SectionCard>

        {isCancelled && ride.cancellation ? (
          <SectionCard
            title="Cancellation information"
            description="Reason and refund details for this cancelled ride."
            className="mt-4 border-rose-500/20"
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <InfoField
                label="Cancelled by"
                value={ride.cancellation.cancelledBy}
              />
              <InfoField label="Reason" value={ride.cancellation.reason} />
              <InfoField
                label="Cancellation time"
                value={format(parseISO(ride.cancellation.cancelledAt), "PPp")}
              />
              <InfoField
                label="Refund status"
                value={ride.cancellation.refundStatus.replace(/_/g, " ")}
              />
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          title="Payment information"
          description="Fare breakdown and settlement."
          className="mt-4"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/60 shadow-none">
              <CardContent className="space-y-1 pt-4">
                <p className="text-[0.65rem] font-medium uppercase text-muted-foreground">Fare</p>
                <p className="font-heading text-lg font-semibold">
                  {poolRideCurrency(ride.fare)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-none">
              <CardContent className="space-y-1 pt-4">
                <p className="text-[0.65rem] font-medium uppercase text-muted-foreground">
                  Discount
                </p>
                <p className="font-heading text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  −{poolRideCurrency(ride.discount)}
                </p>
                {ride.promoCode ? (
                  <p className="text-[11px] text-muted-foreground">Code: {ride.promoCode}</p>
                ) : null}
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-none">
              <CardContent className="space-y-1 pt-4">
                <p className="text-[0.65rem] font-medium uppercase text-muted-foreground">Tax</p>
                <p className="font-heading text-lg font-semibold">
                  {poolRideCurrency(ride.taxes)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-none">
              <CardContent className="space-y-1 pt-4">
                <p className="text-[0.65rem] font-medium uppercase text-muted-foreground">
                  Platform fee
                </p>
                <p className="font-heading text-lg font-semibold text-amber-700 dark:text-amber-400">
                  {poolRideCurrency(ride.platformFee)}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <PaymentIcon className="h-3.5 w-3.5" />
                Payment
              </div>
              <p className="mt-2 font-heading text-lg font-semibold">
                {poolRidePaymentLabel(ride.paymentMethod)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Status:{" "}
                <span className="font-medium text-foreground">{ride.paymentStatus}</span>
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Driver earnings
              </p>
              <p className="mt-2 font-heading text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {poolRideCurrency(ride.driverEarnings)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Final passenger charge: {poolRideCurrency(ride.finalAmount)}
              </p>
            </div>
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
