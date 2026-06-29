"use client";

import { useMemo, type CSSProperties } from "react";
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

interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

function getBounds(ride: PoolRide): MapBounds {
  const padLat = 0.028;
  const padLng = 0.035;
  return {
    minLat: Math.min(ride.startLat, ride.endLat, ride.driverLat ?? ride.startLat) - padLat,
    maxLat: Math.max(ride.startLat, ride.endLat, ride.driverLat ?? ride.endLat) + padLat,
    minLng: Math.min(ride.startLng, ride.endLng, ride.driverLng ?? ride.startLng) - padLng,
    maxLng: Math.max(ride.startLng, ride.endLng, ride.driverLng ?? ride.endLng) + padLng
  };
}

function latLngToPercent(lat: number, lng: number, bounds: MapBounds) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
  return {
    x: Math.min(96, Math.max(4, x)),
    y: Math.min(92, Math.max(8, y))
  };
}

function MapMarker({
  label,
  sublabel,
  style,
  tone
}: {
  label: string;
  sublabel?: string;
  style: CSSProperties;
  tone: "pickup" | "dropoff" | "driver";
}) {
  const toneStyles = {
    pickup: {
      pin: "bg-emerald-500 shadow-emerald-500/40",
      ring: "ring-emerald-400/50",
      label: "text-emerald-700 dark:text-emerald-300"
    },
    dropoff: {
      pin: "bg-rose-500 shadow-rose-500/40",
      ring: "ring-rose-400/50",
      label: "text-rose-700 dark:text-rose-300"
    },
    driver: {
      pin: "bg-amber-400 shadow-amber-400/50 animate-pulse",
      ring: "ring-amber-300/60",
      label: "text-amber-700 dark:text-amber-300"
    }
  }[tone];

  return (
    <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full" style={style}>
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "mb-1 max-w-[120px] truncate rounded-lg border border-white/20 bg-slate-950/85 px-2 py-1 text-center text-[10px] font-semibold text-white shadow-lg backdrop-blur-md sm:max-w-[160px] sm:text-[11px]",
            tone === "driver" && "border-amber-400/40"
          )}
        >
          {label}
          {sublabel ? (
            <span className={cn("mt-0.5 block text-[9px] font-normal", toneStyles.label)}>
              {sublabel}
            </span>
          ) : null}
        </div>
        <div
          className={cn(
            "h-4 w-4 rounded-full border-2 border-white shadow-lg ring-4",
            toneStyles.pin,
            toneStyles.ring
          )}
        />
        <div className="mt-0.5 h-2 w-0.5 rounded-full bg-white/80" />
      </div>
    </div>
  );
}

export function PoolRideRouteMap({ ride, className, fullWidth }: PoolRideRouteMapProps) {
  const isCompleted = ride.rideStatus === "COMPLETED";
  const isLive =
    ride.rideStatus === "IN_PROGRESS" ||
    ride.rideStatus === "STARTED" ||
    ride.rideStatus === "DRIVER_ARRIVED";

  const bounds = useMemo(() => getBounds(ride), [ride]);

  const pickupPos = useMemo(
    () => latLngToPercent(ride.startLat, ride.startLng, bounds),
    [ride.startLat, ride.startLng, bounds]
  );
  const dropoffPos = useMemo(
    () => latLngToPercent(ride.endLat, ride.endLng, bounds),
    [ride.endLat, ride.endLng, bounds]
  );
  const driverPos = useMemo(() => {
    if (ride.driverLat == null || ride.driverLng == null) return null;
    return latLngToPercent(ride.driverLat, ride.driverLng, bounds);
  }, [ride.driverLat, ride.driverLng, bounds]);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${ride.startLat},${ride.startLng}&destination=${ride.endLat},${ride.endLng}&travelmode=driving`;

  const googleMapsEmbedSimple = `https://maps.google.com/maps?saddr=${ride.startLat},${ride.startLng}&daddr=${ride.endLat},${ride.endLng}&hl=en&z=14&output=embed`;

  const routePath = `M ${pickupPos.x} ${pickupPos.y} Q ${(pickupPos.x + dropoffPos.x) / 2} ${Math.min(pickupPos.y, dropoffPos.y) - 12} ${dropoffPos.x} ${dropoffPos.y}`;

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
                Route map
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

        <div
          className={cn(
            "relative w-full",
            fullWidth
              ? "min-h-[320px] sm:min-h-[400px] lg:min-h-[480px]"
              : "aspect-[4/3] min-h-[280px] sm:min-h-[360px]"
          )}
        >
            <iframe
              title="Pool ride route map"
              src={googleMapsEmbedSimple}
              className="absolute inset-0 h-full w-full border-0 grayscale-[0.15] contrast-[1.05] saturate-[1.1]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />

            {/* Vignette — lighter for portal feel */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/10" />

            {/* SVG route arc */}
            <svg
              className="pointer-events-none absolute inset-0 z-10 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#fdb813" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <path
                d={routePath}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth={isCompleted ? "0.55" : "0.4"}
                strokeDasharray={isCompleted ? "0" : "2 1.5"}
                strokeLinecap="round"
                className="drop-shadow-[0_0_6px_rgba(253,184,19,0.6)]"
              />
            </svg>

            <MapMarker
              label="Pickup"
              sublabel="Start"
              tone="pickup"
              style={{ left: `${pickupPos.x}%`, top: `${pickupPos.y}%` }}
            />
            {driverPos ? (
              <MapMarker
                label="Driver"
                sublabel="Live"
                tone="driver"
                style={{ left: `${driverPos.x}%`, top: `${driverPos.y}%` }}
              />
            ) : null}
            <MapMarker
              label="Drop-off"
              sublabel="End"
              tone="dropoff"
              style={{ left: `${dropoffPos.x}%`, top: `${dropoffPos.y}%` }}
            />

            <div className="absolute bottom-3 right-3 z-20 hidden rounded-xl border border-border/60 bg-card/95 p-2.5 shadow-lg backdrop-blur-md sm:block">
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Legend
              </p>
              <div className="space-y-1">
                {[
                  { color: "bg-emerald-500", label: "Pickup" },
                  { color: "bg-amber-400", label: "Driver" },
                  { color: "bg-rose-500", label: "Drop-off" },
                  {
                    color: isCompleted ? "bg-gradient-to-r from-emerald-500 to-rose-500" : "bg-amber-400/60",
                    label: isCompleted ? "Completed path" : "Est. path"
                  }
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", item.color)} />
                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {isLive ? (
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 shadow-md backdrop-blur-md">
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
