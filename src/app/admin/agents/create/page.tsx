"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { useAppSelector } from "@/store/hooks";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Valid email required"),
  username: z.string().trim().min(2, "Username is required"),
  mobileNumber: z.string().trim().min(10, "Valid mobile number required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required" }),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED", "PENDING", "APPROVED"]),
  cnicNumber: z.string().trim().min(13, "CNIC must be 13 digits").max(13, "CNIC must be 13 digits")
});

type FormValues = z.infer<typeof schema>;

export default function AdminCreateAgentPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const token = useAppSelector((state) => state.auth.token);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      mobileNumber: "",
      password: "",
      gender: "Male",
      status: "PENDING",
      cnicNumber: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/sales-agent/create`,
        {
          method: "POST",
          token,
          body: JSON.stringify({
            email: values.email,
            username: values.username,
            mobileNumber: values.mobileNumber,
            password: values.password,
            name: values.name,
            gender: values.gender,
            status: values.status,
            cnicNumber: values.cnicNumber
          })
        }
      );
      success("Agent created successfully.");
      router.push("/admin/agents");
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to create agent.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="Create Agent">
      <PageContainer>
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/agents" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to agents
            </Link>
          </Button>
        </div>
        <SectionCard
          title="New sales agent"
          description="Fill in all fields to register a new agent."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full Name" htmlFor="name" required error={errors.name}>
                <Input id="name" {...register("name")} placeholder="e.g., Zaeem Khan" />
              </FormField>
              <FormField label="Username" htmlFor="username" required error={errors.username}>
                <Input id="username" {...register("username")} placeholder="e.g., agent5" />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email" htmlFor="email" required error={errors.email}>
                <Input id="email" type="email" {...register("email")} placeholder="agent@example.com" />
              </FormField>
              <FormField label="Mobile Number" htmlFor="mobileNumber" required error={errors.mobileNumber}>
                <Input id="mobileNumber" {...register("mobileNumber")} placeholder="03001234567" />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Password" htmlFor="password" required error={errors.password}>
                <Input id="password" type="password" {...register("password")} placeholder="Enter password" />
              </FormField>
              <FormField label="CNIC Number" htmlFor="cnicNumber" required error={errors.cnicNumber}>
                <Input id="cnicNumber" {...register("cnicNumber")} placeholder="4310212345674" maxLength={13} />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Gender" required error={errors.gender}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Status" required error={errors.status}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="BLOCKED">Blocked</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create agent"}
            </Button>
          </form>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
