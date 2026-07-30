"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeoLocation } from "@/types/safety-center";
import { useToast } from "@/components/ui/toast";

export function LocationMapPlaceholder({
  location,
  className
}: {
  location: GeoLocation;
  className?: string;
}) {
  const { toast } = useToast();

  return (
    <div
      className={
        className ??
        "relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-slate-100 via-slate-50 to-amber-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"
      }
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
      <div className="relative flex min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fdb813]/20 text-slate-900 ring-2 ring-[#fdb813]/50 dark:text-amber-100">
          <MapPin className="h-6 w-6" />
        </span>
        <div>
          <p className="font-heading text-sm font-semibold">{location.label}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Updated {new Date(location.updatedAt).toLocaleString()} · Map placeholder (mock)
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => toast("Maps unavailable — mock mode. Connect a maps API later.")}
        >
          Open in maps
        </Button>
      </div>
    </div>
  );
}
