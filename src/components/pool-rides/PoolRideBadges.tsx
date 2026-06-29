import { cn } from "@/lib/utils";
import type { PoolRide } from "@/types/pool-ride";

const rideStatusConfig: Record<
  string,
  { label: string; dot: string; bg: string; text: string }
> = {
  BOOKED: {
    label: "Booked",
    dot: "bg-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400"
  },
  DRIVER_ACCEPTED: {
    label: "Driver Accepted",
    dot: "bg-violet-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-400"
  },
  DRIVER_ARRIVED: {
    label: "Driver Arrived",
    dot: "bg-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    text: "text-indigo-700 dark:text-indigo-400"
  },
  STARTED: {
    label: "Started",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400"
  },
  IN_PROGRESS: {
    label: "In Progress",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400"
  },
  COMPLETED: {
    label: "Completed",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400"
  },
  CANCELLED: {
    label: "Cancelled",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400"
  }
};

const bookingStatusConfig: Record<
  string,
  { label: string; dot: string; bg: string; text: string }
> = {
  PENDING: {
    label: "Pending",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400"
  },
  CONFIRMED: {
    label: "Confirmed",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400"
  },
  COMPLETED: {
    label: "Completed",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400"
  },
  CANCELLED: {
    label: "Cancelled",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400"
  }
};

interface PoolRideBadgeProps {
  status: string;
  variant?: "ride" | "booking";
  className?: string;
}

export function PoolRideBadge({
  status,
  variant = "ride",
  className
}: PoolRideBadgeProps) {
  const configMap = variant === "booking" ? bookingStatusConfig : rideStatusConfig;
  const config = configMap[status] ?? {
    label: status.replace(/_/g, " "),
    dot: "bg-slate-400",
    bg: "bg-muted",
    text: "text-muted-foreground"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

export function poolRidePaymentLabel(method: PoolRide["paymentMethod"]) {
  if (method === "CARD") return "Card";
  if (method === "WALLET") return "Wallet";
  return "Cash";
}

export function poolRideCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(amount);
}
