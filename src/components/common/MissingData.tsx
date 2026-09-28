import { cn } from "@/lib/utils";

export const MISSING_DATA_LABEL = "Missing data";

/** Visible when the live API sent null/empty so admin can see the gap. */
export function MissingData({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300",
        className
      )}
    >
      {MISSING_DATA_LABEL}
    </span>
  );
}

export function isMissingValue(value: unknown): boolean {
  return value == null || value === "";
}
