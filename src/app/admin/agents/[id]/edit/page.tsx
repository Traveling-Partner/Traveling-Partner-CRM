"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { apiUrl } from "@/lib/api-base";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import TPLoader from "@/components/TPLoader";
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
import {
  useEmployeeRolesQuery,
  usePortalUserDetailQuery,
  useUpdatePortalUserMutation
} from "@/hooks/queries/use-portal-users";
import { formatPortalRole, primaryRole } from "@/services/portal-users";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Valid email required"),
  mobileNumber: z.string().trim().min(10, "Valid mobile number required"),
  role: z.string().trim().min(1, "Role is required"),
  city: z.string().trim().min(2, "City is required"),
  gender: z.string().trim().min(1, "Gender is required"),
  cnicNumber: z.string().trim().min(13, "CNIC must be 13 digits").max(13, "CNIC must be 13 digits"),
  cnicFront: z.string().trim().url("Valid CNIC front image URL required"),
  cnicBack: z.string().trim().url("Valid CNIC back image URL required")
});

type FormValues = z.infer<typeof schema>;

interface UploadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: string;
}

function normalizeGender(value: string | null): string {
  const trimmed = (value || "").trim();
  const gender = trimmed.toUpperCase();
  if (gender === "MALE") return "Male";
  if (gender === "FEMALE") return "Female";
  if (gender === "OTHER") return "Other";
  return trimmed;
}

export default function AdminEditEmployeePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error } = useToast();
  const token = useAppSelector((state) => state.auth.token);
  const { data: employee, isLoading, isError } = usePortalUserDetailQuery(params.id);
  const updateMutation = useUpdatePortalUserMutation(params.id);
  const rolesQuery = useEmployeeRolesQuery();

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      mobileNumber: "",
      role: "",
      city: "",
      gender: "",
      cnicNumber: "",
      cnicFront: "",
      cnicBack: ""
    }
  });
  const [frontUploading, setFrontUploading] = useState(false);
  const [backUploading, setBackUploading] = useState(false);
  const currentRole = employee ? primaryRole(employee) : "";
  const roleOptions = useMemo(() => {
    if (currentRole && !rolesQuery.roles.some((item) => item.name === currentRole)) {
      return [{ id: -1, name: currentRole, slug: currentRole }, ...rolesQuery.roles];
    }
    return rolesQuery.roles;
  }, [currentRole, rolesQuery.roles]);

  useEffect(() => {
    if (!employee) return;
    reset({
      name: employee.name || "",
      email: employee.email || "",
      mobileNumber: employee.mobileNumber || "",
      role: primaryRole(employee),
      city: employee.city || "",
      gender: normalizeGender(employee.gender),
      cnicNumber: employee.cnicNumber || "",
      cnicFront: employee.cnicFront || "",
      cnicBack: employee.cnicBack || ""
    });
  }, [employee, reset]);

  const uploadCnicImage = async (file: File): Promise<string> => {
    const storageToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const accessToken = token ?? storageToken;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(apiUrl("/documents/cnic"), {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData
    });

    const json: UploadResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.message || "CNIC upload failed.");
    }
    return json.data;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await updateMutation.mutateAsync({
        email: values.email,
        mobileNumber: values.mobileNumber,
        name: values.name,
        role: values.role,
        city: values.city,
        gender: values.gender,
        cnicNumber: values.cnicNumber,
        cnicFront: values.cnicFront,
        cnicBack: values.cnicBack
      });
      success("Employee updated.");
      router.push(`/admin/agents/${params.id}`);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to update employee.");
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Edit employee">
        <PageContainer>
          <div className="flex items-center justify-center py-20">
            <TPLoader variant="inline" size={120} label="Loading…" />
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  if (isError || !employee) {
    return (
      <AppShell title="Edit employee">
        <PageContainer>
          <EmptyState
            title="Employee not found"
            description="This employee does not exist."
            actionLabel="Back to employees"
            onActionClick={() => router.push("/admin/agents")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit employee">
      <PageContainer>
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/agents/${params.id}`} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to employee
            </Link>
          </Button>
        </div>
        <SectionCard
          title="Edit employee"
          description="Update employee details and role."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full Name" htmlFor="name" required error={errors.name}>
                <Input id="name" {...register("name")} placeholder="e.g., Zaeem Khan" />
              </FormField>
              <FormField label="Role" required error={errors.role}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((item) => (
                          <SelectItem key={item.name} value={item.name}>
                            {formatPortalRole(item.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email" htmlFor="email" required error={errors.email}>
                <Input
                  id="email"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  {...register("email")}
                  placeholder="employee@example.com"
                />
              </FormField>
              <FormField label="Mobile Number" htmlFor="mobileNumber" required error={errors.mobileNumber}>
                <Input id="mobileNumber" {...register("mobileNumber")} placeholder="03001234567" />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="City" htmlFor="city" required error={errors.city}>
                <Input id="city" {...register("city")} placeholder="Lahore" />
              </FormField>
              <FormField label="Gender" required error={errors.gender}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
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
            </div>
            <FormField label="CNIC Number" htmlFor="cnicNumber" required error={errors.cnicNumber}>
              <Input id="cnicNumber" {...register("cnicNumber")} placeholder="4310212345674" maxLength={13} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="CNIC Front" required error={errors.cnicFront}>
                <div className="space-y-2">
                  <label
                    htmlFor="cnic-front-upload"
                    className={`flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/60 ${
                      frontUploading ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    {frontUploading ? "Uploading..." : "Upload front image"}
                  </label>
                  <Input
                    id="cnic-front-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={frontUploading}
                    onChange={async (e) => {
                      const inputEl = e.currentTarget;
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setFrontUploading(true);
                      try {
                        const uploadedUrl = await uploadCnicImage(file);
                        setValue("cnicFront", uploadedUrl, { shouldValidate: true, shouldDirty: true });
                      } catch (err) {
                        error(err instanceof Error ? err.message : "Failed to upload CNIC front.");
                      } finally {
                        setFrontUploading(false);
                        inputEl.value = "";
                      }
                    }}
                  />
                  <Input id="cnicFront" {...register("cnicFront")} readOnly placeholder="Uploaded URL appears here" />
                </div>
              </FormField>
              <FormField label="CNIC Back" required error={errors.cnicBack}>
                <div className="space-y-2">
                  <label
                    htmlFor="cnic-back-upload"
                    className={`flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/60 ${
                      backUploading ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    {backUploading ? "Uploading..." : "Upload back image"}
                  </label>
                  <Input
                    id="cnic-back-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={backUploading}
                    onChange={async (e) => {
                      const inputEl = e.currentTarget;
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setBackUploading(true);
                      try {
                        const uploadedUrl = await uploadCnicImage(file);
                        setValue("cnicBack", uploadedUrl, { shouldValidate: true, shouldDirty: true });
                      } catch (err) {
                        error(err instanceof Error ? err.message : "Failed to upload CNIC back.");
                      } finally {
                        setBackUploading(false);
                        inputEl.value = "";
                      }
                    }}
                  />
                  <Input id="cnicBack" {...register("cnicBack")} readOnly placeholder="Uploaded URL appears here" />
                </div>
              </FormField>
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating…" : "Update employee"}
            </Button>
          </form>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
