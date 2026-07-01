"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  CreditCard,
  Hash,
  MapPinned,
  Star,
  Wallet
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
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
      <AppShell title="Ride details">
        <PageContainer>
          <EmptyState
            title="Ride not found"
            description="This ride id does not exist in the mock dataset."
            actionLabel="Back to rides"
            onActionClick={() => router.push("/admin/pool-rides")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  const isCancelled = ride.rideStatus === "CANCELLED";
  const isCompleted = ride.rideStatus === "COMPLETED";
  const PaymentIcon = ride.paymentMethod === "WALLET" ? Wallet : CreditCard;

  return (
    <AppShell title="Ride details" wideContent>
      <PageContainer>
        <div className="mb-2 flex flex-wrap items-center gap-3 px-0 md:px-0">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/pool-rides" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              All rides
            </Link>
          </Button>
        </div>

        {/* Hero — matches portal card styling */}
        <Card className="overflow-hidden border-border/80 bg-gradient-to-b from-card to-muted/30 shadow-sm">
          <div className="h-1 w-full bg-gradient-to-r from-[#fce001] via-[#fdb813] to-[#fce001]/60" />
          <CardContent className="p-5 md:p-6">
            <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <PoolRideBadge status={ride.rideStatus} variant="ride" />
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#fce001] to-[#fdb813] px-2.5 py-1 text-[11px] font-semibold text-slate-900 shadow-sm">
                    {ride.serviceMode === "POOL_RIDE" ? "Pool Ride" : "Taxi Stand Car"}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-semibold text-foreground">
                    {ride.rideType}
                  </span>
                </div>
                <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                  {ride.pickupAddress.split(",")[0]} → {ride.destinationAddress.split(",")[0]}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Booked {format(parseISO(ride.bookingDate), "PPP · p")} ·{" "}
                  {ride.tripType.replace(/_/g, " ")} · {ride.vehicleType} · Booking{" "}
                  <span className="font-medium text-foreground">{ride.bookingStatus.toLowerCase()}</span>
                </p>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground">
                    <Hash className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    {ride.id}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground">
                    <MapPinned className="h-3.5 w-3.5 text-muted-foreground" />
                    {ride.vehicleType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-border/40 pt-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/60 bg-gradient-to-b from-amber-50/80 to-card p-4 dark:from-amber-500/10">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      Final amount
                    </p>
                    <p className="mt-1 font-heading text-xl font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                      {poolRideCurrency(ride.finalAmount)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      {ride.rideStatus === "COMPLETED" ? "Distance" : "Est. distance"}
                    </p>
                    <p className="mt-1 font-heading text-xl font-semibold text-foreground tabular-nums">
                      {ride.actualDistanceKm ?? ride.estimatedDistanceKm} km
                    </p>
                  </div>
                  <div className="col-span-2 rounded-xl border border-border/60 bg-muted/20 p-4 sm:col-span-1">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      {ride.rideStatus === "COMPLETED" ? "Actual time" : "Est. time"}
                    </p>
                    <p className="mt-1 font-heading text-xl font-semibold text-foreground tabular-nums">
                      {ride.actualTimeMinutes ?? ride.estimatedTimeMinutes} min
                    </p>
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>

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

          <SectionCard title="Partner information" description="Partner details for this trip.">
            <PersonCard
              title="Partner"
              name={ride.passenger.name}
              phone={ride.passenger.phone}
              email={ride.passenger.email}
              photoUrl={ride.passenger.photoUrl}
            />
            <Button variant="link" className="mt-2 h-auto px-0 text-xs" asChild>
              <Link href="/admin/partners">Open partner profile</Link>
            </Button>
          </SectionCard>
        </div>

        {/* Map — edge-to-edge within main column */}
        <div className="-mx-3 mt-6 w-[calc(100%+1.5rem)] md:-mx-6 md:w-[calc(100%+3rem)]">
          <PoolRideRouteMap ride={ride} fullWidth />
        </div>

        <SectionCard
          title="Vehicle information"
          description="Fleet details based on vehicle type."
          className="mt-4"
        >
          <VehicleDetailsCard vehicle={ride.vehicle} />
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

        {isCompleted ? (
          <SectionCard
            title="Completion information"
            description="Completion status and rider feedback."
            className="mt-4 border-emerald-500/20"
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <InfoField label="Status" value="Completed" />
              <InfoField
                label="Completion time"
                value={
                  ride.timeline.find((step) => step.stage === "COMPLETED")?.timestamp
                    ? format(
                        parseISO(
                          ride.timeline.find((step) => step.stage === "COMPLETED")!.timestamp!
                        ),
                        "PPp"
                      )
                    : "—"
                }
              />
              <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  Rider rating
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
                  {ride.reviewRating != null ? (
                    <>
                      <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                      {ride.reviewRating.toFixed(1)} / 5
                    </>
                  ) : (
                    "No rating given"
                  )}
                </p>
              </div>
              <InfoField
                label="Review comment"
                value={ride.reviewComment?.trim() ? ride.reviewComment : "No review given"}
              />
            </div>
          </SectionCard>
        ) : !isCancelled ? (
          <SectionCard
            title="Completion information"
            description="Ride is not completed yet."
            className="mt-4"
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <InfoField
                label="Current status"
                value={ride.rideStatus.replace(/_/g, " ")}
              />
              <InfoField label="Rider rating" value="No rating given" />
              <InfoField label="Review comment" value="No review given" />
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
