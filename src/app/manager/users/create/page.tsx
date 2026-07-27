"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export default function CreateManagerUserPage() {
  const router = useRouter();
  const { success } = useToast();

  return (
    <AppShell title="Create user">
      <PageContainer>
        <SectionCard title="Create user" description="UI-ready form. Wire to backend when user APIs are available.">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              success("User create form submitted (UI).");
              router.push("/manager/users");
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required placeholder="Full name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required placeholder="email@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" required placeholder="+92…" />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select defaultValue="AGENT">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="AGENT">Sales Agent</SelectItem>
                    <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
                    <SelectItem value="MARKETING_MANAGER">Marketing Manager</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create user</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
