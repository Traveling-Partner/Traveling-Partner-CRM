"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export type ActiveInactiveStatus = "ACTIVE" | "INACTIVE";

interface ActiveInactiveStatusFieldProps {
  value: ActiveInactiveStatus;
  onChange: (value: ActiveInactiveStatus) => void;
  disabled?: boolean;
  className?: string;
  /** "segmented" shows Active/Inactive buttons; "switch" shows a labeled toggle. */
  variant?: "segmented" | "switch";
}

export function ActiveInactiveStatusField({
  value,
  onChange,
  disabled,
  className,
  variant = "segmented"
}: ActiveInactiveStatusFieldProps) {
  if (variant === "switch") {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3",
          className
        )}
      >
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            {value === "ACTIVE" ? "Active" : "Inactive"}
          </p>
          <p className="text-xs text-muted-foreground">
            {value === "ACTIVE" ? "This record is enabled." : "This record is disabled."}
          </p>
        </div>
        <Switch
          checked={value === "ACTIVE"}
          onCheckedChange={(checked) => onChange(checked ? "ACTIVE" : "INACTIVE")}
          disabled={disabled}
          aria-label={value === "ACTIVE" ? "Set inactive" : "Set active"}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex w-full rounded-lg border border-border/60 bg-muted/20 p-1",
        className
      )}
      role="radiogroup"
      aria-label="Status"
    >
      <Button
        type="button"
        variant={value === "ACTIVE" ? "default" : "ghost"}
        size="sm"
        className="h-9 flex-1 rounded-md sm:flex-none sm:px-6"
        onClick={() => onChange("ACTIVE")}
        disabled={disabled}
        role="radio"
        aria-checked={value === "ACTIVE"}
      >
        Active
      </Button>
      <Button
        type="button"
        variant={value === "INACTIVE" ? "default" : "ghost"}
        size="sm"
        className="h-9 flex-1 rounded-md sm:flex-none sm:px-6"
        onClick={() => onChange("INACTIVE")}
        disabled={disabled}
        role="radio"
        aria-checked={value === "INACTIVE"}
      >
        Inactive
      </Button>
    </div>
  );
}
