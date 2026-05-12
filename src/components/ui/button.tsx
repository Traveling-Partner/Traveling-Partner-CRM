import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-sm hover:shadow-md hover:brightness-[1.03] active:brightness-95",
        secondary:
          "bg-secondary text-secondary-foreground border border-border/60 hover:bg-secondary/80 hover:border-border",
        outline:
          "border border-border bg-background hover:bg-[var(--brand-light-hover)] hover:text-foreground hover:border-[#fdb813]/30",
        ghost:
          "hover:bg-[var(--brand-light-hover)] hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
        subtle:
          "bg-muted text-muted-foreground hover:bg-muted/80 border border-border/60 hover:border-border"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-sm",
        icon: "h-9 w-9 rounded-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
