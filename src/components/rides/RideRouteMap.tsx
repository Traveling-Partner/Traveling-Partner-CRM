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

const W = 560;
const H = 320;
const PAD = 48;

function project(
  lat: number,
  lng: number,
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number
) {
  const spanLat = Math.max(maxLat - minLat, 1e-6);
  const spanLng = Math.max(maxLng - minLng, 1e-6);
  const x = PAD + ((lng - minLng) / spanLng) * (W - PAD * 2);
  const y = PAD + ((maxLat - lat) / spanLat) * (H - PAD * 2);
  return { x, y };
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
  const { pathD, start, end, midCtrl } = useMemo(() => {
    const pad = 0.008;
    const minLat = Math.min(startLat, endLat) - pad;
    const maxLat = Math.max(startLat, endLat) + pad;
    const minLng = Math.min(startLng, endLng) - pad;
    const maxLng = Math.max(startLng, endLng) + pad;

    const a = project(startLat, startLng, minLat, maxLat, minLng, maxLng);
    const b = project(endLat, endLng, minLat, maxLat, minLng, maxLng);

    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const bend = Math.min(72, len * 0.35);
    const ctrl = { x: mx + nx * bend, y: my + ny * bend };

    const d = `M ${a.x} ${a.y} Q ${ctrl.x} ${ctrl.y} ${b.x} ${b.y}`;
    return { pathD: d, start: a, end: b, midCtrl: ctrl };
  }, [startLat, startLng, endLat, endLng]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl ring-1 ring-amber-500/20 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(253,184,19,0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(253,184,19,0.35) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px"
        }}
      />
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-amber-200/90">
          <Navigation className="h-3.5 w-3.5 text-amber-400" />
          Route preview
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

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="relative z-[1] w-full"
        style={{ maxHeight: 340 }}
        aria-label="Route from pickup to drop-off"
      >
        <defs>
          <linearGradient id="rideRouteStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
            <stop offset="50%" stopColor="#fdb813" stopOpacity="1" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="1" />
          </linearGradient>
          <filter id="rideRouteGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ridePinShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.45" />
          </filter>
        </defs>

        <path
          d={pathD}
          fill="none"
          stroke="url(#rideRouteStroke)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="10 14"
          className="ride-route-path-anim"
          style={{
            filter: "url(#rideRouteGlow)"
          }}
        />
        {/* subtle underlay path */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <g filter="url(#ridePinShadow)">
          <circle cx={start.x} cy={start.y} r="11" fill="#22c55e" stroke="#fff" strokeWidth="2" />
          <text
            x={start.x}
            y={start.y + 4}
            textAnchor="middle"
            className="fill-white text-[11px] font-bold"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            A
          </text>
        </g>
        <g filter="url(#ridePinShadow)">
          <circle cx={end.x} cy={end.y} r="11" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
          <text
            x={end.x}
            y={end.y + 4}
            textAnchor="middle"
            className="fill-white text-[11px] font-bold"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            B
          </text>
        </g>

        <circle cx={midCtrl.x} cy={midCtrl.y} r="4" fill="#fdb813" opacity="0.85" />
      </svg>

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
