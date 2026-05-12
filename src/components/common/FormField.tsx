import { ReactNode } from "react";
import { FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  description?: string;
  error?: FieldError;
  children: ReactNode;
  className?: string;
  required?: boolean;
}

export function FormField({
  label,
  htmlFor,
  description,
  error,
  children,
  className,
  required
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
      {error?.message && (
        <p className="text-xs font-medium text-red-500 flex items-center gap-1">
          {error.message}
        </p>
      )}
    </div>
  );
}
