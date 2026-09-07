"use client";

import {
  ExternalLink,
  MapPin,
  Maximize2,
  Navigation,
  Route
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PoolRide } from "@/types/pool-ride";

interface PoolRideRouteMapProps {
  ride: PoolRide;
  className?: string;
  fullWidth?: boolean;
}

export function PoolRideRouteMap({ ride, className, fullWidth }: PoolRideRouteMapProps) {
  const isCompleted = ride.rideStatus === "COMPLETED";
  const isLive =
    ride.rideStatus === "IN_PROGRESS" ||
    ride.rideStatus === "STARTED" ||
    ride.rideStatus === "DRIVER_ARRIVED";

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${ride.startLat},${ride.startLng}&destination=${ride.endLat},${ride.endLng}&travelmode=driving`;

  const googleMapsEmbedSimple = `https://maps.google.com/maps?saddr=${ride.startLat},${ride.startLng}&daddr=${ride.endLat},${ride.endLng}&hl=en&z=14&output=embed`;
  const actualDistance = ride.actualDistanceKm != null ? `${ride.actualDistanceKm} km` : "—";
  const actualTime = ride.actualTimeMinutes != null ? `${ride.actualTimeMinutes} min` : "—";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Map — full width */}
      <div
        className={cn(
          "relative overflow-hidden bg-card shadow-sm",
          fullWidth ? "rounded-none border-y border-border/60" : "rounded-3xl border border-border/60"
        )}
      >
        <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-border/50 bg-gradient-to-r from-muted/50 via-card to-muted/30 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#fce001] to-[#fdb813] shadow-sm shadow-amber-500/20">
              <Route className="h-4 w-4 text-slate-900" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Route information
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isCompleted ? "Completed journey" : isLive ? "Live tracking" : "Planned route"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              <ExternalLink className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Open in Google Maps</span>
            </a>
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              aria-label="Expand map"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        <div className="grid gap-2 border-b border-border/50 bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-3 md:px-6">
          <div className="rounded-lg border border-border/50 bg-card/80 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Est. distance
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {ride.estimatedDistanceKm} km
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/80 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Actual distance
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">{actualDistance}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/80 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Est. time
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {ride.estimatedTimeMinutes} min
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/80 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Actual time
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">{actualTime}</p>
          </div>
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 sm:col-span-2 lg:col-span-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Pickup address
            </p>
            <p className="mt-0.5 line-clamp-2 text-sm font-medium text-foreground">
              {ride.pickupAddress}
            </p>
          </div>
          <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 px-3 py-2 sm:col-span-2 lg:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
              Destination address
            </p>
            <p className="mt-0.5 line-clamp-2 text-sm font-medium text-foreground">
              {ride.destinationAddress}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "relative w-full",
            fullWidth
              ? "min-h-[320px] sm:min-h-[400px] lg:min-h-[480px]"
              : "aspect-[4/3] min-h-[280px] sm:min-h-[360px]"
          )}
        >
            <iframe
              title="Ride route map"
              src={googleMapsEmbedSimple}
              className="absolute inset-0 h-full w-full border-0 grayscale-[0.15] contrast-[1.05] saturate-[1.1]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />

            {isLive ? (
              <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 shadow-md backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  Live ride
                </span>
              </div>
            ) : null}
          </div>

          <div className="grid gap-0 border-t border-border/50 bg-muted/20 sm:grid-cols-2">
            <div className="flex gap-3 border-b border-border/40 p-4 sm:border-b-0 sm:border-r md:px-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-500">
                  Pickup
                </p>
                <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">
                  {ride.pickupAddress}
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-4 md:px-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <Navigation className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-500">
                  Destination
                </p>
                <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">
                  {ride.destinationAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

      {ride.intermediateStops?.length ? (
        <div
          className={cn(
            "rounded-2xl border border-border/60 bg-card p-4 shadow-sm",
            fullWidth && "mx-3 md:mx-6"
          )}
        >
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Intermediate stops
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ride.intermediateStops.map((stop, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 to-transparent px-3 py-2.5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fce001] to-[#fdb813] text-[11px] font-bold text-slate-900 shadow-sm">
                  {idx + 1}
                </span>
                <span className="text-sm">{stop}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
