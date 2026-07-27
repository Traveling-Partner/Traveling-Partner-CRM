"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export default function CreateMarketingContentPage() {
  const router = useRouter();
  const { success } = useToast();
  const [status, setStatus] = useState("PENDING");

  return (
    <AppShell title="Create content">
      <PageContainer>
        <SectionCard
          title="New content"
          description="UI-ready content editor with SEO fields and scheduling."
        >
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              success("Content saved (UI).");
              router.push("/marketing-manager/content");
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required placeholder="Content title" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select defaultValue="Blog">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blog">Blog</SelectItem>
                    <SelectItem value="Campaign">Campaign</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Newsletter">Newsletter</SelectItem>
                    <SelectItem value="Carousel">Carousel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="UNPUBLISHED">Unpublished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" rows={6} placeholder="Write content…" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seoTitle">SEO title</Label>
              <Input id="seoTitle" placeholder="SEO title" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seoDesc">SEO description</Label>
              <Textarea id="seoDesc" rows={3} placeholder="Meta description" />
            </div>
            {status === "SCHEDULED" ? (
              <div className="space-y-1.5">
                <Label htmlFor="schedule">Schedule at</Label>
                <Input id="schedule" type="datetime-local" />
              </div>
            ) : null}
            <div className="flex gap-2">
              <Button type="submit">Save content</Button>
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
