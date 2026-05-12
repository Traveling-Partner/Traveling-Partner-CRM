import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onActionClick,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/40 px-6 py-10 text-center",
        className
      )}
    >
      {icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#fce001]/80 to-[#fdb813]/80 text-slate-900 shadow-sm">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-sm font-heading font-semibold">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onActionClick && (
        <Button size="sm" onClick={onActionClick}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

