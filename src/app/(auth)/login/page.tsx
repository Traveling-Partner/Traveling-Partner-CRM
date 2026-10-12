"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthError, loginUserThunk } from "@/store/slices/authSlice";
import { generateAdminOtp, resendAdminOtp } from "@/services/auth";
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

const RESEND_WAIT_SECONDS = 30;

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { success: toastSuccess, error: toastError } = useToast();
  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpGenerating, setOtpGenerating] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [resendWait, setResendWait] = useState(0);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobileNumber: "",
      otp: ""
    }
  });

  const otpValue = watch("otp") ?? "";

  useEffect(() => {
    if (resendWait <= 0) return;
    const timer = window.setInterval(() => {
      setResendWait((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendWait]);

  const clearOtpField = () => {
    setValue("otp", "");
    clearErrors("otp");
  };

  const startResendWait = () => {
    setResendWait(RESEND_WAIT_SECONDS);
  };

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
        startResendWait();
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
      clearOtpField();
      setTimeout(() => otpInputRef.current?.focus(), 0);
    }
  };

  const onChangeNumber = () => {
    setShowOtpField(false);
    clearOtpField();
    setResendWait(0);
    dispatch(clearAuthError());
  };

  const onResendOtp = async () => {
    const mobileNumber = getValues("mobileNumber").trim();
    if (mobileNumber.length < 8) {
      setError("mobileNumber", { type: "manual", message: "Enter a valid mobile number" });
      return;
    }
    setOtpResending(true);
    try {
      await resendAdminOtp({ mobileNumber });
      toastSuccess("A new OTP has been sent.");
      clearOtpField();
      startResendWait();
      setTimeout(() => otpInputRef.current?.focus(), 0);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setOtpResending(false);
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
              readOnly={showOtpField}
              aria-readonly={showOtpField}
              className={showOtpField ? "cursor-not-allowed bg-muted/50" : undefined}
              {...register("mobileNumber")}
            />
          </FormField>
          {showOtpField ? (
            <button
              type="button"
              className="-mt-3 text-sm font-medium text-foreground underline-offset-2 hover:underline"
              onClick={onChangeNumber}
            >
              Change number
            </button>
          ) : null}

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

          {showOtpField ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <button
                type="button"
                className="text-sm font-medium text-foreground underline-offset-2 hover:underline disabled:opacity-60"
                disabled={loading || otpGenerating || otpResending || resendWait > 0}
                onClick={onResendOtp}
              >
                {otpResending ? "Sending OTP..." : "Resend OTP"}
              </button>
              {resendWait > 0 ? (
                <span className="text-sm text-muted-foreground">{resendWait}s</span>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</p>
          ) : null}

          <Button
            type="submit"
            className="mt-2 w-full h-11"
            disabled={
              loading ||
              otpGenerating ||
              (showOtpField && otpValue.replace(/\D/g, "").length < 4)
            }
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
