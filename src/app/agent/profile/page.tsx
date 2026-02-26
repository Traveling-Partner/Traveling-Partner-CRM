"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/components/ui/toast";
import { Copy } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number").optional().or(z.literal(""))
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function AgentProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { success } = useToast();
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: ""
    }
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
        phone: ""
      });
    }
  }, [user, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors }
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onProfileSubmit = (values: ProfileFormValues) => {
    setProfileSaving(true);
    setTimeout(() => {
      success("Profile updated successfully (mock).");
      setProfileSaving(false);
    }, 600);
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    setPasswordSaving(true);
    setTimeout(() => {
      success("Password changed successfully (mock).");
      resetPassword();
      setPasswordSaving(false);
    }, 600);
  };

  const referralCode = user
    ? `REF-${user.id.toUpperCase().replace(/-/g, "")}-${user.name.split(" ")[0]?.slice(0, 2).toUpperCase() ?? "AG"}`
    : "";

  const copyReferral = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      success("Referral code copied to clipboard.");
    }
  };

  if (!user) return null;

  return (
    <AppShell title="Profile">
      <PageContainer>
        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard
            title="Profile"
            description="Your account details. Changes are mock and not persisted."
            className="lg:col-span-2"
          >
            <form
              className="space-y-4"
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              noValidate
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#fce001] to-[#fdb813] text-2xl font-heading font-bold text-slate-900 shadow-md">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 space-y-4">
                  <FormField
                    label="Full name"
                    htmlFor="name"
                    required
                    error={profileErrors.name}
                  >
                    <Input
                      id="name"
                      {...registerProfile("name")}
                      placeholder="Your name"
                    />
                  </FormField>
                  <FormField
                    label="Email"
                    htmlFor="email"
                    required
                    error={profileErrors.email}
                  >
                    <Input
                      id="email"
                      type="email"
                      {...registerProfile("email")}
                      placeholder="you@company.com"
                    />
                  </FormField>
                  <FormField
                    label="Phone"
                    htmlFor="phone"
                    error={profileErrors.phone}
                  >
                    <Input
                      id="phone"
                      type="tel"
                      {...registerProfile("phone")}
                      placeholder="+971 50 123 4567"
                    />
                  </FormField>
                </div>
              </div>
              <Button type="submit" disabled={profileSaving}>
                {profileSaving ? "Saving…" : "Save profile"}
              </Button>
            </form>
          </SectionCard>

          <SectionCard
            title="Referral code"
            description="Share this code when onboarding new drivers or partners."
          >
            <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your code
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-background px-3 py-2 font-mono text-sm font-semibold">
                  {referralCode}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyReferral}
                  aria-label="Copy referral code"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-[0.7rem] text-muted-foreground">
                Admins may use this to attribute new signups to you.
              </p>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Change password"
          description="Update your password. This is a mock flow and does not persist."
          className="mt-6"
        >
          <form
            className="max-w-md space-y-4"
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            noValidate
          >
            <FormField
              label="Current password"
              htmlFor="currentPassword"
              required
              error={passwordErrors.currentPassword}
            >
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...registerPassword("currentPassword")}
                placeholder="••••••••"
              />
            </FormField>
            <FormField
              label="New password"
              htmlFor="newPassword"
              required
              error={passwordErrors.newPassword}
            >
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...registerPassword("newPassword")}
                placeholder="At least 8 characters"
              />
            </FormField>
            <FormField
              label="Confirm new password"
              htmlFor="confirmPassword"
              required
              error={passwordErrors.confirmPassword}
            >
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...registerPassword("confirmPassword")}
                placeholder="••••••••"
              />
            </FormField>
            <Button type="submit" disabled={passwordSaving}>
              {passwordSaving ? "Updating…" : "Change password"}
            </Button>
          </form>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
