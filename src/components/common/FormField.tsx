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
    <div className={cn("space-y-1.5 text-sm", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        {description && (
          <p className="text-[0.7rem] text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
      {error?.message && (
        <p className="text-[0.7rem] font-medium text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
}

