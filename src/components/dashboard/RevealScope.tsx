"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Wrapper so chart height classes still apply. Bars animate on mount. */
export function RevealScope({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("reveal-scope is-in-view", className)}>{children}</div>;
}

/** Stacked mix bar that grows from 0 to full width (navbar-style track). */
export function MixTrack({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10",
        className
      )}
    >
      <div className="mix-fill flex h-full w-full">{children}</div>
    </div>
  );
}
