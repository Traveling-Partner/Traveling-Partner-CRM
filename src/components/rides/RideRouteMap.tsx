"use client";

import { useMemo } from "react";
import { MapPin, Navigation } from "lucide-react";

export interface RideRouteMapProps {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  pickupLabel: string;
  dropoffLabel: string;
  className?: string;
}

export function RideRouteMap({
  startLat,
  startLng,
  endLat,
  endLng,
  pickupLabel,
  dropoffLabel,
  className = ""
}: RideRouteMapProps) {
  const { mapUrl } = useMemo(() => {
    const padLat = 0.03;
    const padLng = 0.04;
    const minLat = Math.min(startLat, endLat) - padLat;
    const maxLat = Math.max(startLat, endLat) + padLat;
    const minLng = Math.min(startLng, endLng) - padLng;
    const maxLng = Math.max(startLng, endLng) + padLng;

    const bbox = `${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}`;
    const markerA = `%26marker=${startLat}%2C${startLng}`;
    const markerB = `%26marker=${endLat}%2C${endLng}`;
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}${markerA}${markerB}%26layer=mapnik`;
    return { mapUrl };
  }, [startLat, startLng, endLat, endLng]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl ring-1 ring-amber-500/20 ${className}`}
    >
      <div className="relative flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-amber-200/90">
          <Navigation className="h-3.5 w-3.5 text-amber-400" />
          Live map preview
        </div>
        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${endLat},${endLng}&travelmode=driving`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.7rem] font-medium text-amber-300/90 underline-offset-4 hover:text-amber-200 hover:underline"
        >
          Open in Google Maps
        </a>
      </div>

      <div className="relative z-[1] h-[340px] w-full overflow-hidden">
        <iframe
          title="Ride map"
          src={mapUrl}
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="relative z-[1] grid gap-3 border-t border-white/5 bg-slate-950/60 px-4 py-4 sm:grid-cols-2">
        <div className="flex gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-400/90">
              Pickup
            </p>
            <p className="text-sm font-medium leading-snug text-slate-100">{pickupLabel}</p>
            <p className="mt-0.5 font-mono text-[0.65rem] text-slate-500">
              {startLat.toFixed(5)}, {startLng.toFixed(5)}
            </p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-rose-400/90">
              Drop-off
            </p>
            <p className="text-sm font-medium leading-snug text-slate-100">{dropoffLabel}</p>
            <p className="mt-0.5 font-mono text-[0.65rem] text-slate-500">
              {endLat.toFixed(5)}, {endLng.toFixed(5)}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
