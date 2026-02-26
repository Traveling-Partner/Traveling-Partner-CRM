"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth.store";
import { getDefaultRouteForRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/common/FormField";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const login = useAuthStore((state) => state.login);
  const forcePasswordChange = useAuthStore((state) => state.forcePasswordChange);

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      const user = await login({
        email: values.email,
        password: values.password
      });

      success("Welcome back to Traveling Partner Portal");

      if (user.mustChangePassword || forcePasswordChange) {
        router.replace("/force-change-password");
        return;
      }

      const target = getDefaultRouteForRole(user.role);
      router.replace(target);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to login. Please try again.";
      error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-border/70 bg-background/90 shadow-lg">
      <CardContent className="space-y-6 pt-6">
        <div>
          <h2 className="text-lg font-heading font-semibold">
            Sign in to your workspace
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the demo credentials to explore the Traveling Partner Portal.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField
            label="Email"
            htmlFor="email"
            required
            error={errors.email}
          >
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              {...register("email")}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            required
            error={errors.password}
          >
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
            />
          </FormField>

          <div className="flex items-center justify-between gap-2 text-sm">
            <label className="inline-flex items-center gap-2">
              <Checkbox
                className="mt-[1px]"
                {...register("remember")}
                onCheckedChange={(checked) =>
                  // react-hook-form expects boolean, Radix can send boolean | "indeterminate"
                  (document.activeElement as HTMLElement | null)?.blur() ??
                  undefined
                }
              />
              <span className="text-xs text-muted-foreground">
                Remember this device
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="mt-2 w-full"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="rounded-md bg-muted/40 p-3 text-[0.7rem] text-muted-foreground">
          <p className="font-semibold text-xs text-foreground">
            Demo credentials
          </p>
          <ul className="mt-1 space-y-0.5">
            <li>Admin: admin@demo.com</li>
            <li>Agent: agent@demo.com</li>
            <li>Password: 123456</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-between gap-2 border-t border-border/60 bg-muted/40 py-3 text-xs text-muted-foreground sm:flex-row">
        <span>© {new Date().getFullYear()} Traveling Partner</span>
        <span>Back-office portal for ride-hailing partners.</span>
      </CardFooter>
    </Card>
  );
}

