"use client";

import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import type { ProfileUpdateBody } from "@/services/users";

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Valid email required").or(z.literal("")),
  mobileNumber: z.string().trim().min(10, "Valid mobile number required"),
  whatsApp: z.string().trim(),
  gender: z.string().trim().min(1, "Gender is required"),
  city: z.string().trim(),
  cnicNumber: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{13}$/.test(value), "CNIC must be 13 digits")
});

export type ProfileEditValues = z.infer<typeof schema>;

export function toProfileUpdateBody(values: ProfileEditValues): ProfileUpdateBody {
  const body: ProfileUpdateBody = {
    firstName: values.firstName,
    lastName: values.lastName,
    mobileNumber: values.mobileNumber,
    gender: values.gender
  };
  if (values.email) body.email = values.email;
  if (values.whatsApp) body.whatsApp = values.whatsApp;
  if (values.city) body.city = values.city;
  if (values.cnicNumber) body.cnicNumber = values.cnicNumber;
  return body;
}

export function ProfileEditForm({
  defaultValues,
  saving,
  submitLabel,
  onSubmit
}: {
  defaultValues: ProfileEditValues;
  saving: boolean;
  submitLabel: string;
  onSubmit: (values: ProfileEditValues) => Promise<void> | void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ProfileEditValues>({
    resolver: zodResolver(schema),
    defaultValues
  });

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <FormField label="First name" htmlFor="firstName" required error={errors.firstName}>
        <Input id="firstName" {...register("firstName")} />
      </FormField>
      <FormField label="Last name" htmlFor="lastName" required error={errors.lastName}>
        <Input id="lastName" {...register("lastName")} />
      </FormField>
      <FormField label="Email" htmlFor="email" error={errors.email}>
        <Input id="email" type="email" {...register("email")} />
      </FormField>
      <FormField label="Mobile" htmlFor="mobileNumber" required error={errors.mobileNumber}>
        <Input id="mobileNumber" {...register("mobileNumber")} />
      </FormField>
      <FormField label="WhatsApp" htmlFor="whatsApp" error={errors.whatsApp}>
        <Input id="whatsApp" {...register("whatsApp")} />
      </FormField>
      <FormField label="Gender" required error={errors.gender}>
        <Controller
          control={control}
          name="gender"
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
      <FormField label="City" htmlFor="city" error={errors.city}>
        <Input id="city" {...register("city")} />
      </FormField>
      <FormField label="CNIC number" htmlFor="cnicNumber" error={errors.cnicNumber}>
        <Input id="cnicNumber" inputMode="numeric" maxLength={13} {...register("cnicNumber")} />
      </FormField>
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
