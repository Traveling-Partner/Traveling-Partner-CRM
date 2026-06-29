"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  ChevronRight,
  MapPin,
  Navigation2,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PoolRideBadge,
  poolRideCurrency,
  poolRidePaymentLabel
} from "@/components/pool-rides/PoolRideBadges";
import type { PoolRide, PoolRideSortField } from "@/types/pool-ride";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function shortAddress(address: string) {
  const part = address.split(",")[0]?.trim() ?? address;
  return part.length > 42 ? `${part.slice(0, 40)}…` : part;
}

function SortableHeader({
  label,
  field,
  activeField,
  direction,
  onSort,
  className
}: {
  label: string;
  field: PoolRideSortField;
  activeField: PoolRideSortField;
  direction: "asc" | "desc";
  onSort: (field: PoolRideSortField) => void;
  className?: string;
}) {
  const isActive = activeField === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        "inline-flex w-full items-center gap-1.5 text-left text-[11px] font-semibold uppercase tracking-wider transition-colors hover:text-foreground",
        isActive ? "text-foreground" : "text-muted-foreground",
        className
      )}
    >
      <span className="truncate">{label}</span>
      <ArrowUpDown
        className={cn(
          "h-3 w-3 shrink-0",
          isActive ? "text-[#fdb813]" : "text-muted-foreground/40"
        )}
      />
      {isActive ? <span className="sr-only">Sorted {direction}</span> : null}
    </button>
  );
}

interface PoolRideResponsiveTableProps {
  rides: PoolRide[];
  sortField: PoolRideSortField;
  sortDirection: "asc" | "desc";
  onSort: (field: PoolRideSortField) => void;
}

function RideMobileCard({ ride }: { ride: PoolRide }) {
  return (
    <Link
      href={`/admin/pool-rides/${ride.id}`}
      className="group block rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/25 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/30 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-900/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground dark:bg-white/10">
              {ride.id}
            </span>
            <PoolRideBadge status={ride.rideStatus} variant="ride" />
          </div>
          <p className="mt-2 font-heading text-base font-semibold text-foreground">
            {ride.rideType}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(ride.bookingDate)}</p>
        </div>
        <div className="text-right">
          <p className="font-heading text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {poolRideCurrency(ride.finalAmount)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {poolRidePaymentLabel(ride.paymentMethod)}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2 rounded-xl border border-border/40 bg-muted/15 p-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <MapPin className="h-3 w-3" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Pickup
            </p>
            <p className="text-sm leading-snug text-foreground">
              {shortAddress(ride.pickupAddress)}
            </p>
          </div>
        </div>
        <div className="ml-2.5 h-3 border-l-2 border-dashed border-amber-400/50" />
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <Navigation2 className="h-3 w-3" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
              Destination
            </p>
            <p className="text-sm leading-snug text-foreground">
              {shortAddress(ride.destinationAddress)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-background/80 px-2.5 py-2 ring-1 ring-border/50">
          <p className="text-[10px] uppercase text-muted-foreground">Passenger</p>
          <p className="mt-0.5 truncate font-medium">{ride.passenger.name}</p>
        </div>
        <div className="rounded-lg bg-background/80 px-2.5 py-2 ring-1 ring-border/50">
          <p className="text-[10px] uppercase text-muted-foreground">Driver</p>
          <p className="mt-0.5 truncate font-medium">{ride.driver.name}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
        <div className="flex items-center gap-2">
          <PoolRideBadge status={ride.bookingStatus} variant="booking" />
          <span className="text-[11px] text-muted-foreground">{ride.vehicleType}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 transition-colors group-hover:text-amber-600 dark:text-amber-400">
          View detail
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function PoolRideResponsiveTable({
  rides,
  sortField,
  sortDirection,
  onSort
}: PoolRideResponsiveTableProps) {
  const headerProps = useMemo(
    () => ({ activeField: sortField, direction: sortDirection, onSort }),
    [sortField, sortDirection, onSort]
  );

  return (
    <>
      {/* Mobile & small tablet — card list */}
      <div className="space-y-3 md:hidden">
        {rides.map((ride) => (
          <RideMobileCard key={ride.id} ride={ride} />
        ))}
      </div>

      {/* Desktop — premium scrollable table */}
      <div className="relative hidden md:block">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-card to-transparent" />
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm scrollbar-thin">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-gradient-to-r from-muted/60 via-muted/40 to-muted/60">
                <th className="sticky left-0 z-20 min-w-[100px] bg-gradient-to-r from-muted via-muted/95 to-muted/80 px-4 py-3.5 text-left shadow-[4px_0_12px_-4px_rgba(0,0,0,0.08)]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Ride ID
                  </span>
                </th>
                <th className="min-w-[108px] px-3 py-3.5 text-left">
                  <SortableHeader label="Booked" field="bookingDate" {...headerProps} />
                </th>
                <th className="min-w-[130px] px-3 py-3.5 text-left">
                  <SortableHeader label="Passenger" field="passengerName" {...headerProps} />
                </th>
                <th className="hidden min-w-[120px] px-3 py-3.5 text-left lg:table-cell">
                  <SortableHeader label="Driver" field="driverName" {...headerProps} />
                </th>
                <th className="min-w-[110px] px-3 py-3.5 text-left">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Ride type
                  </span>
                </th>
                <th className="hidden min-w-[80px] px-3 py-3.5 text-left xl:table-cell">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Vehicle
                  </span>
                </th>
                <th className="hidden min-w-[140px] px-3 py-3.5 text-left xl:table-cell">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Pickup
                  </span>
                </th>
                <th className="hidden min-w-[140px] px-3 py-3.5 text-left 2xl:table-cell">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Destination
                  </span>
                </th>
                <th className="min-w-[88px] px-3 py-3.5 text-left">
                  <SortableHeader label="Fare" field="fare" {...headerProps} />
                </th>
                <th className="hidden min-w-[80px] px-3 py-3.5 text-left lg:table-cell">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment
                  </span>
                </th>
                <th className="min-w-[120px] px-3 py-3.5 text-left">
                  <SortableHeader label="Status" field="rideStatus" {...headerProps} />
                </th>
                <th className="hidden min-w-[100px] px-3 py-3.5 text-left lg:table-cell">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Booking
                  </span>
                </th>
                <th className="sticky right-0 z-20 min-w-[88px] bg-gradient-to-l from-muted via-muted/95 to-muted/80 px-3 py-3.5 text-right shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.08)]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Action
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride, index) => (
                <tr
                  key={ride.id}
                  className={cn(
                    "group border-b border-border/40 transition-colors last:border-0 hover:bg-amber-500/[0.04]",
                    index % 2 === 1 && "bg-muted/10"
                  )}
                >
                  <td className="sticky left-0 z-10 bg-card px-4 py-3.5 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.06)] group-hover:bg-amber-500/[0.04]">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {ride.id}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-[12px] tabular-nums text-muted-foreground">
                    {formatDate(ride.bookingDate)}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fce001]/40 to-[#fdb813]/30 text-[10px] font-bold text-amber-900">
                        {ride.passenger.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <span className="max-w-[120px] truncate text-sm font-medium">
                        {ride.passenger.name}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3.5 lg:table-cell">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="max-w-[110px] truncate text-sm">
                        {ride.driver.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex rounded-md bg-muted/50 px-2 py-0.5 text-[12px] font-medium">
                      {ride.rideType}
                    </span>
                  </td>
                  <td className="hidden px-3 py-3.5 text-[12px] text-muted-foreground xl:table-cell">
                    {ride.vehicleType}
                  </td>
                  <td className="hidden max-w-[160px] px-3 py-3.5 xl:table-cell">
                    <span className="line-clamp-2 text-[12px] leading-snug text-muted-foreground">
                      {ride.pickupAddress}
                    </span>
                  </td>
                  <td className="hidden max-w-[160px] px-3 py-3.5 2xl:table-cell">
                    <span className="line-clamp-2 text-[12px] leading-snug text-muted-foreground">
                      {ride.destinationAddress}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 font-semibold tabular-nums">
                    {poolRideCurrency(ride.finalAmount)}
                  </td>
                  <td className="hidden px-3 py-3.5 text-[12px] text-muted-foreground lg:table-cell">
                    {poolRidePaymentLabel(ride.paymentMethod)}
                  </td>
                  <td className="px-3 py-3.5">
                    <PoolRideBadge status={ride.rideStatus} variant="ride" />
                  </td>
                  <td className="hidden px-3 py-3.5 lg:table-cell">
                    <PoolRideBadge status={ride.bookingStatus} variant="booking" />
                  </td>
                  <td className="sticky right-0 z-10 bg-card px-3 py-3.5 text-right shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.06)] group-hover:bg-amber-500/[0.04]">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 border-amber-500/30 bg-gradient-to-b from-[#fce001]/10 to-transparent text-xs font-semibold hover:border-amber-500/50 hover:from-[#fce001]/20"
                      asChild
                    >
                      <Link href={`/admin/pool-rides/${ride.id}`}>
                        View
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground lg:hidden">
          <span className="inline-block h-1 w-6 rounded-full bg-gradient-to-r from-[#fce001] to-[#fdb813]" />
          Swipe horizontally for more columns
        </p>
      </div>
    </>
  );
}
