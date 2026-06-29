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
      <div className="flex items-center gap-3 p-3.5 sm:p-4">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10",
            iconBg
          )}
        >
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 sm:text-[11px]">
            {label}
          </p>
          {isLoading ? (
            <div className="mt-1.5 h-6 w-12 animate-pulse rounded bg-muted sm:h-7 sm:w-14" />
          ) : (
            <p className="text-xl font-bold tracking-tight text-foreground tabular-nums sm:text-2xl">
              {value.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
