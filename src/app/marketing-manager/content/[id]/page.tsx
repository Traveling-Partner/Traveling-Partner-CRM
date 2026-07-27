"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { marketingContentRows } from "@/mock-data/role-workspaces";

export default function EditMarketingContentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success } = useToast();
  const item = useMemo(
    () => marketingContentRows.find((row) => row.id === params.id),
    [params.id]
  );
  const [title, setTitle] = useState(item?.title ?? "");

  if (!item) {
    return (
      <AppShell title="Edit content">
        <PageContainer>
          <EmptyState
            title="Content not found"
            description="This content item does not exist in the demo catalog."
            actionLabel="Back to content"
            onActionClick={() => router.push("/marketing-manager/content")}
          />
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit content">
      <PageContainer>
        <SectionCard title={item.title} description={`Category: ${item.category}`}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              success("Content updated (UI).");
              router.push("/marketing-manager/content");
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seo">SEO title</Label>
              <Input id="seo" defaultValue={item.seoTitle} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" rows={6} defaultValue={`Draft for ${item.title}`} />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save changes</Button>
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
