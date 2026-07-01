import type { ComponentType } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PoolRideStatCardProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  accentBorder?: string;
  isLoading?: boolean;
}

export function PoolRideStatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  accentBorder = "border-border/60",
  isLoading
}: PoolRideStatCardProps) {
  return (
    <Card
      className={cn(
        "group border bg-gradient-to-b from-card to-muted/20 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        accentBorder
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3 sm:gap-3.5 sm:px-5 sm:py-3.5">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 sm:h-11 sm:w-11",
            iconBg
          )}
        >
          <Icon className={cn("h-5 w-5 sm:h-5 sm:w-5", iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80 sm:text-xs">
            {label}
          </p>
          {isLoading ? (
            <div className="mt-1 h-6 w-14 animate-pulse rounded bg-muted sm:h-7 sm:w-16" />
          ) : (
            <p className="text-2xl font-bold leading-tight tracking-tight text-foreground tabular-nums sm:text-3xl">
              {value.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
