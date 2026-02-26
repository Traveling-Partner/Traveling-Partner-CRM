"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  email: z.string().email("Enter a valid email")
});

type ForgotFormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" }
  });

  const onSubmit = (values: ForgotFormValues) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      success(
        "If an account exists for this email, a reset link has been generated (mock)."
      );
    }, 800);
  };

  if (submitted) {
    return (
      <Card className="border-border/70 bg-background/90 shadow-lg">
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2 text-center">
            <h2 className="text-lg font-heading font-semibold">
              Check your inbox
            </h2>
            <p className="text-sm text-muted-foreground">
              We have generated a mock reset link for your account. In a real
              deployment this would arrive via email.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-background/90 shadow-lg">
      <CardContent className="space-y-6 pt-6">
        <div>
          <h2 className="text-lg font-heading font-semibold">
            Reset your password
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the email associated with your Traveling Partner account.
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
              autoComplete="email"
              placeholder="you@company.com"
              {...register("email")}
            />
          </FormField>

          <Button
            type="submit"
            className="mt-2 w-full"
            disabled={submitting}
          >
            {submitting ? "Sending link..." : "Send reset link"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

