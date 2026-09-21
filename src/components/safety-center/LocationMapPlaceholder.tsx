"use client";

import { CircleDot, Flag, MapPin, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SosMapPointKind = "START" | "SOS" | "END";

export interface SosMapPoint {
  kind: SosMapPointKind;
  label: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  caption?: string | null;
}

const POINT_STYLES: Record<
  SosMapPointKind,
  { icon: typeof MapPin; ring: string; text: string }
> = {
  START: {
    icon: CircleDot,
    ring: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/40 dark:text-emerald-300",
    text: "Ride start"
  },
  SOS: {
    icon: Siren,
    ring: "bg-red-500/15 text-red-700 ring-red-500/40 dark:text-red-300",
    text: "SOS triggered"
  },
  END: {
    icon: Flag,
    ring: "bg-[#fdb813]/20 text-slate-900 ring-[#fdb813]/50 dark:text-amber-100",
    text: "Ride end"
  }
};

function hasCoords(point: SosMapPoint): boolean {
  return typeof point.lat === "number" && typeof point.lng === "number";
}

function coordsOf(point: SosMapPoint): string {
  return `${point.lat},${point.lng}`;
}

/** Directions across the whole ride when possible, otherwise a single pin. */
function buildMapsUrl(points: SosMapPoint[]): string | null {
  const located = points.filter(hasCoords);
  if (located.length === 0) return null;
  if (located.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${coordsOf(located[0])}`;
  }

  const origin = located[0];
  const destination = located[located.length - 1];
  const waypoints = located.slice(1, -1).map(coordsOf).join("|");
  const params = new URLSearchParams({
    api: "1",
    origin: coordsOf(origin),
    destination: coordsOf(destination)
  });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?api=1&${params.toString()}`;
}

/**
 * Ride route for a SOS case: pickup → trigger point → dropoff.
 * Coordinates can be missing, so every point renders defensively.
 */
export function LocationMapPlaceholder({
  points,
  className
}: {
  points: SosMapPoint[];
  className?: string;
}) {
  const mapsUrl = buildMapsUrl(points);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-slate-100 via-slate-50 to-amber-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}
        aria-hidden
      />

      <div className="relative space-y-4 p-4">
        <ol className="space-y-0">
          {points.map((point, index) => {
            const style = POINT_STYLES[point.kind];
            const Icon = style.icon;
            const isLast = index === points.length - 1;

            return (
              <li key={`${point.kind}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2",
                      style.ring
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
                </div>
                <div className={cn("min-w-0 pt-1", !isLast && "pb-4")}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {point.label}
                  </p>
                  <p className="truncate font-heading text-sm font-semibold">
                    {point.address ?? "Address not available"}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {hasCoords(point)
                      ? `${point.lat!.toFixed(5)}, ${point.lng!.toFixed(5)}`
                      : "No coordinates captured"}
                  </p>
                  {point.caption && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{point.caption}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {mapsUrl ? (
          <Button asChild type="button" size="sm" variant="outline">
            <a href={mapsUrl} target="_blank" rel="noreferrer">
              <MapPin className="mr-2 h-4 w-4" />
              Open full route in Maps
            </a>
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            No coordinates were captured for this ride.
          </p>
        )}
      </div>
    </div>
  );
}
