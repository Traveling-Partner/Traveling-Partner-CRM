import { cn } from "@/lib/utils";

export type Status =
  | "PENDING"
  | "APPROVED"
  | "RESTRICTED"
  | "SUSPENDED"
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  APPROVED: {
    label: "Approved",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400"
  },
  ACTIVE: {
    label: "Active",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400"
  },
  PENDING: {
    label: "Pending",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400"
  },
  RESTRICTED: {
    label: "Restricted",
    dot: "bg-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400"
  },
  SUSPENDED: {
    label: "Suspended",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400"
  },
  INACTIVE: {
    label: "Inactive",
    dot: "bg-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-600 dark:text-red-400"
  },
  BLOCKED: {
    label: "Blocked",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400"
  },
  REJECTED: {
    label: "Rejected",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400"
  },
  PAID: {
    label: "Paid",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400"
  },
  OVERDUE: {
    label: "Overdue",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400"
  },
  PUBLISHED: {
    label: "Published",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400"
  },
  SCHEDULED: {
    label: "Scheduled",
    dot: "bg-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400"
  },
  UNPUBLISHED: {
    label: "Unpublished",
    dot: "bg-slate-400",
    bg: "bg-muted",
    text: "text-muted-foreground"
  },
  ACKNOWLEDGED: {
    label: "Acknowledged",
    dot: "bg-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400"
  },
  RESOLVED: {
    label: "Resolved",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400"
  },
  FALSE_ALARM: {
    label: "False alarm",
    dot: "bg-slate-400",
    bg: "bg-muted",
    text: "text-muted-foreground"
  },
  CRITICAL: {
    label: "Critical",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400"
  },
  OPEN: {
    label: "Open",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400"
  },
  UNDER_REVIEW: {
    label: "Under review",
    dot: "bg-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400"
  },
  CLOSED: {
    label: "Closed",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400"
  },
  IN_PROGRESS: {
    label: "In progress",
    dot: "bg-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400"
  },
  COMPLETED: {
    label: "Completed",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400"
  },
  CANCELLED: {
    label: "Cancelled",
    dot: "bg-slate-400",
    bg: "bg-muted",
    text: "text-muted-foreground"
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase();
  const config = statusConfig[normalized] ?? {
    label: status,
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
