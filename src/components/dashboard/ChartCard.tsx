"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

export function ChartCard({
  title,
  description,
  badge,
  action,
  loading,
  empty,
  className,
  children,
  heightClass = "h-52 sm:h-60"
}: {
  title: string;
  description?: string;
  badge?: ReactNode;
  action?: ReactNode;
  loading?: boolean;
  empty?: boolean;
  className?: string;
  children: ReactNode;
  heightClass?: string;
}) {
  return (
    <section
      className={cn(
        "glass-panel overflow-hidden rounded-[2rem] text-card-foreground",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 px-6 pt-6 sm:px-7 sm:pt-7">
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">{badge}{action}</div>
      </div>
      <div className="px-4 pb-6 pt-4 sm:px-6 sm:pb-7">
        {loading ? (
          <Skeleton className={cn("w-full rounded-3xl", heightClass === "h-auto" ? "h-48" : heightClass)} />
        ) : empty ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-3xl bg-[#f3f4f6] text-center dark:bg-white/5",
              heightClass
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#fce001] to-[#fdb813]">
              <BarChart3 className="h-4 w-4 text-slate-900" />
            </div>
            <p className="text-sm font-medium">No data yet</p>
          </div>
        ) : (
          <div className={heightClass}>{children}</div>
        )}
      </div>
    </section>
  );
}
