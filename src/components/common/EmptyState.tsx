import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

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
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60">
        {icon || <Inbox className="h-5 w-5 text-[#fdb813]" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-heading font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mx-auto max-w-xs text-xs text-muted-foreground sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onActionClick && (
        <Button size="sm" onClick={onActionClick} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
