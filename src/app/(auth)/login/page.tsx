"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthError, loginUserThunk } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const loginSchema = z.object({
  mobileNumber: z.string().min(8, "Enter a valid mobile number"),
  otp: z.string().min(4, "OTP must be at least 4 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobileNumber: "",
      otp: ""
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await dispatch(loginUserThunk(values)).unwrap();
      router.replace("/dashboard");
    } catch {
      // Error state is already handled in Redux.
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
            Use your mobile number and OTP to access the portal.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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

          <FormField
            label="OTP"
            htmlFor="otp"
            required
            error={errors.otp}
          >
            <Input
              id="otp"
              type="text"
              autoComplete="one-time-code"
              placeholder="1234"
              {...register("otp")}
            />
          </FormField>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <Button
            type="submit"
            className="mt-2 w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="rounded-md bg-muted/40 p-3 text-[0.7rem] text-muted-foreground">
          <p className="font-semibold text-xs text-foreground">
            Example
          </p>
          <ul className="mt-1 space-y-0.5">
            <li>Mobile Number: 03002234519</li>
            <li>OTP: 1234</li>
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

