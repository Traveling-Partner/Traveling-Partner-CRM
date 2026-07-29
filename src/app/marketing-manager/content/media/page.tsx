"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const media = [
  { id: "m1", name: "summer-banner.png", type: "Image", size: "1.2 MB" },
  { id: "m2", name: "driver-tips.jpg", type: "Image", size: "840 KB" },
  { id: "m3", name: "launch-reel.mp4", type: "Video", size: "12.4 MB" },
  { id: "m4", name: "brand-kit.pdf", type: "Document", size: "2.1 MB" }
];

export default function MarketingMediaPage() {
  const { success } = useToast();

  return (
    <AppShell title="Media library">
      <PageContainer>
        <SectionCard
          title="Media library"
          description="Upload and manage marketing assets."
          headerAction={
            <Button size="sm" onClick={() => success("Upload dialog ready (UI).")}>
              Upload
            </Button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {media.map((item) => (
              <div key={item.id} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-[#fce001]/30 to-[#fdb813]/40 text-xs font-semibold text-slate-700">
                  {item.type}
                </div>
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-[11px] text-muted-foreground">{item.size}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
