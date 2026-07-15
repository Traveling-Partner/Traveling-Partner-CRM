"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthError, loginUserThunk } from "@/store/slices/authSlice";
import { generateAdminOtp } from "@/services/auth";
import { fetchAdminDashboardData } from "@/services/admin-dashboard";
import { DASHBOARD_STALE_TIME_MS } from "@/lib/api/query-config";
import { queryKeys } from "@/lib/api/query-keys";
import { getDefaultRouteForRole, normalizeRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

const loginSchema = z.object({
  mobileNumber: z.string().min(8, "Enter a valid mobile number"),
  otp: z.string().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { success: toastSuccess, error: toastError } = useToast();
  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpGenerating, setOtpGenerating] = useState(false);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobileNumber: "",
      otp: ""
    }
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getDefaultRouteForRole(user.role));
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = async (values: LoginFormValues) => {
    if (!showOtpField) {
      setOtpGenerating(true);
      try {
        await generateAdminOtp({ mobileNumber: values.mobileNumber.trim() });
        toastSuccess("Your OTP is generated successfully.");
        setShowOtpField(true);
        setTimeout(() => otpInputRef.current?.focus(), 0);
      } catch (err) {
        toastError(err instanceof Error ? err.message : "Failed to generate OTP.");
      } finally {
        setOtpGenerating(false);
      }
      return;
    }

    if (!values.otp || values.otp.trim().length < 4) {
      setError("otp", { type: "manual", message: "OTP must be at least 4 characters" });
      return;
    }

    try {
      const { token, user: loggedInUser } = await dispatch(
        loginUserThunk({
          mobileNumber: values.mobileNumber,
          otp: values.otp
        })
      ).unwrap();

      if (normalizeRole(loggedInUser.role) === "ADMIN") {
        await queryClient.prefetchQuery({
          queryKey: queryKeys.dashboard.admin(),
          staleTime: DASHBOARD_STALE_TIME_MS,
          queryFn: ({ signal }) =>
            fetchAdminDashboardData(token, { signal, debugSource: "prefetch" })
        });
      }

      router.replace(getDefaultRouteForRole(loggedInUser.role));
    } catch {
      // Error state is already handled in Redux.
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground">
            Sign in to your workspace
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Use your mobile number and OTP to access the portal.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField
            label="Mobile Number"
            htmlFor="mobileNumber"
            required
            error={errors.mobileNumber}
          >
            <Input
              id="mobileNumber"
              type="text"
              placeholder="03002234519"
              autoComplete="tel"
              {...register("mobileNumber")}
            />
          </FormField>

          {showOtpField ? (
            <FormField
              label="OTP"
              htmlFor="otp"
              required
              error={errors.otp}
            >
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                placeholder="Enter OTP"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                {...register("otp", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  },
                })}
                ref={(el) => {
                  register("otp").ref(el);
                  otpInputRef.current = el;
                }}
              />
            </FormField>
          ) : null}

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</p>
          ) : null}

          <Button
            type="submit"
            className="mt-2 w-full h-11"
            disabled={loading || otpGenerating}
          >
            {showOtpField
              ? loading
                ? "Signing in..."
                : "Login"
              : otpGenerating
                ? "Generating OTP..."
                : "Continue"}
          </Button>
        </form>

        {/* <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-xs text-foreground mb-1.5">
            Example credentials
          </p>
          <ul className="space-y-0.5 text-muted-foreground">
            <li>Mobile Number: <span className="font-medium text-foreground">03002234519</span></li>
            <li>OTP: <span className="font-medium text-foreground">1234</span></li>
          </ul>
        </div> */}
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-between gap-2 border-t border-border bg-muted/30 py-3.5 px-6 text-xs text-muted-foreground sm:flex-row">
        <span>&copy; {new Date().getFullYear()} Traveling Partner</span>
        <span>Back-office portal for ride-hailing partners.</span>
      </CardFooter>
    </Card>
  );
}
