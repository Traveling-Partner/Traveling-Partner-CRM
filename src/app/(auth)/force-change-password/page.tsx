"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth.store";
import { getDefaultRouteForRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"]
  });

type FormValues = z.infer<typeof schema>;

function getStrengthLabel(password: string): { label: string; score: number } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", score };
  if (score === 2) return { label: "Fair", score };
  if (score === 3) return { label: "Good", score };
  return { label: "Strong", score };
}

export default function ForceChangePasswordPage() {
  const router = useRouter();
  const { success } = useToast();
  const user = useAuthStore((state) => state.user);
  const forcePasswordChange = useAuthStore((state) => state.forcePasswordChange);
  const setForcePasswordChange = useAuthStore(
    (state) => state.setForcePasswordChange
  );

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const passwordValue = watch("password");
  const strength = useMemo(
    () => getStrengthLabel(passwordValue ?? ""),
    [passwordValue]
  );

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!forcePasswordChange && !user.mustChangePassword) {
      router.replace(getDefaultRouteForRole(user.role));
    }
  }, [user, forcePasswordChange, router]);

  const onSubmit = (values: FormValues) => {
    if (!user) return;
    setSubmitting(true);
    setTimeout(() => {
      setForcePasswordChange(false);
      success("Password updated successfully. Welcome back.");
      const target = getDefaultRouteForRole(user.role);
      router.replace(target);
    }, 800);
  };

  return (
    <Card className="border-border/70 bg-background/90 shadow-lg">
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <h2 className="text-lg font-heading font-semibold">
            Update your password
          </h2>
          <p className="text-sm text-muted-foreground">
            For security reasons, you are required to set a new password before
            accessing the Traveling Partner Portal.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField
            label="New password"
            htmlFor="password"
            required
            error={errors.password}
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              {...register("password")}
            />
          </FormField>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Strength</span>
              <span
                className={
                  strength.score >= 3
                    ? "font-medium text-emerald-600 dark:text-emerald-400"
                    : strength.score === 2
                    ? "font-medium text-amber-600 dark:text-amber-400"
                    : "font-medium text-red-600 dark:text-red-400"
                }
              >
                {strength.label}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i < strength.score
                      ? strength.score >= 3
                        ? "bg-emerald-500"
                        : strength.score === 2
                        ? "bg-amber-500"
                        : "bg-red-500"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <FormField
            label="Confirm password"
            htmlFor="confirmPassword"
            required
            error={errors.confirmPassword}
          >
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              {...register("confirmPassword")}
            />
          </FormField>

          <Button
            type="submit"
            className="mt-2 w-full"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

