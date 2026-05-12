import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground ring-offset-background transition-colors duration-200",
          "placeholder:text-muted-foreground/70",
          "hover:border-border/80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-focus-ring)] focus-visible:border-[#fdb813]/40",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
