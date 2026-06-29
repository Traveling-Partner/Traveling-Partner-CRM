"use client";

import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { PoolRideTimelineEvent } from "@/types/pool-ride";

interface PoolRideTimelineProps {
  events: PoolRideTimelineEvent[];
  className?: string;
}

function toneForStage(stage: PoolRideTimelineEvent["stage"], completed: boolean) {
  if (!completed) return "muted";
  if (stage === "COMPLETED") return "success";
  if (stage === "CANCELLED") return "danger";
  if (stage === "STARTED") return "warn";
  return "default";
}

export function PoolRideTimeline({ events, className }: PoolRideTimelineProps) {
  return (
    <ol className={cn("space-y-0", className)}>
      {events.map((event, i) => {
        const tone = toneForStage(event.stage, event.completed);
        return (
          <li key={`${event.stage}-${i}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "mt-1 flex h-3 w-3 shrink-0 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background",
                  tone === "success" && "bg-emerald-500 ring-emerald-500/30",
                  tone === "danger" && "bg-rose-500 ring-rose-500/30",
                  tone === "warn" && "bg-amber-400 ring-amber-400/30",
                  tone === "default" && "bg-primary ring-primary/30",
                  tone === "muted" && "bg-muted-foreground/30 ring-muted-foreground/20"
                )}
              />
              {i < events.length - 1 ? (
                <div
                  className={cn(
                    "mt-1 min-h-[2.5rem] w-0.5 flex-1 rounded-full",
                    event.completed ? "bg-gradient-to-b from-[#fce001] to-[#fdb813]/60" : "bg-border"
                  )}
                />
              ) : null}
            </div>
            <div className="min-w-0 pb-5">
              <p
                className={cn(
                  "text-sm font-semibold",
                  !event.completed && "text-muted-foreground"
                )}
              >
                {event.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {event.timestamp
                  ? format(parseISO(event.timestamp), "MMM d, yyyy · HH:mm")
                  : "Pending"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
