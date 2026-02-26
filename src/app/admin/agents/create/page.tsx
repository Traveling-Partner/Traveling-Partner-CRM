"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  commissionRate: z.coerce.number().min(0).max(100),
  status: z.enum(["PENDING", "APPROVED", "RESTRICTED", "SUSPENDED"])
});

type FormValues = z.infer<typeof schema>;

function generatePassword(): string {
  return "Auto-" + Math.random().toString(36).slice(2, 10);
}

export default function AdminCreateAgentPage() {
  const router = useRouter();
  const { success } = useToast();
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      commissionRate: 10,
      status: "PENDING"
    }
  });

  const status = watch("status");

  const onSubmit = (values: FormValues) => {
    setSaving(true);
    const pwd = generatedPassword || generatePassword();
    setGeneratedPassword(pwd);
    setTimeout(() => {
      success("Agent created (mock). Password: " + pwd);
      setSaving(false);
      router.push("/admin/agents");
    }, 600);
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
          description="Add a new agent. Password is auto-generated (mock)."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Name" htmlFor="name" required error={errors.name}>
              <Input id="name" {...register("name")} placeholder="Full name" />
            </FormField>
            <FormField label="Email" htmlFor="email" required error={errors.email}>
              <Input id="email" type="email" {...register("email")} placeholder="agent@example.com" />
            </FormField>
            <FormField label="Phone" htmlFor="phone" required error={errors.phone}>
              <Input id="phone" {...register("phone")} placeholder="+971 50 123 4567" />
            </FormField>
            <FormField label="Commission rate %" htmlFor="commissionRate" required error={errors.commissionRate}>
              <Input id="commissionRate" type="number" {...register("commissionRate")} />
            </FormField>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(v) => setValue("status", v as FormValues["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="RESTRICTED">Restricted</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">Auto-generated password (mock)</p>
              <p className="mt-1 font-mono text-sm">{generatedPassword || "—"}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setGeneratedPassword(generatePassword())}
              >
                Generate
              </Button>
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
