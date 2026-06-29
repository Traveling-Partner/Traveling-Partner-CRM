"use client";

import { MapPin, Navigation, User } from "lucide-react";
import { RideRouteMap } from "@/components/rides/RideRouteMap";
import { cn } from "@/lib/utils";
import type { PoolRide } from "@/types/pool-ride";

interface PoolRideRouteMapProps {
  ride: PoolRide;
  className?: string;
}

export function PoolRideRouteMap({ ride, className }: PoolRideRouteMapProps) {
  const isCompleted = ride.rideStatus === "COMPLETED";
  const distanceLabel = isCompleted
    ? ride.actualDistanceKm ?? ride.estimatedDistanceKm
    : ride.estimatedDistanceKm;

  return (
    <div className={cn("space-y-0", className)}>
      <RideRouteMap
        startLat={ride.startLat}
        startLng={ride.startLng}
        endLat={ride.endLat}
        endLng={ride.endLng}
        pickupLabel={ride.pickupAddress}
        dropoffLabel={ride.destinationAddress}
      />

      <div className="mt-3 grid gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {isCompleted ? "Actual distance" : "Estimated distance"}
          </p>
          <p className="mt-1 font-heading text-lg font-semibold tabular-nums">
            {distanceLabel} km
          </p>
          {isCompleted && ride.actualDistanceKm ? (
            <p className="text-[11px] text-muted-foreground">
              Est. {ride.estimatedDistanceKm} km
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {isCompleted ? "Actual time" : "Estimated time"}
          </p>
          <p className="mt-1 font-heading text-lg font-semibold tabular-nums">
            {isCompleted && ride.actualTimeMinutes != null
              ? `${ride.actualTimeMinutes} min`
              : `${ride.estimatedTimeMinutes} min`}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Route status
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold",
              isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
            )}
          >
            {isCompleted ? "Completed route" : "Estimated route"}
          </p>
        </div>
        {ride.driverLat != null && ride.driverLng != null ? (
          <div className="flex gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Driver location
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {ride.driverLat.toFixed(5)}, {ride.driverLng.toFixed(5)}
              </p>
              <a
                href={`https://www.google.com/maps?q=${ride.driverLat},${ride.driverLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-300"
              >
                <Navigation className="h-3 w-3" />
                View on map
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Driver location
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Not available</p>
          </div>
        )}
      </div>

      {ride.intermediateStops?.length ? (
        <div className="mt-3 rounded-2xl border border-border/60 bg-card p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Intermediate stops
          </p>
          <ul className="space-y-2">
            {ride.intermediateStops.map((stop, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {idx + 1}
                </span>
                {stop}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
