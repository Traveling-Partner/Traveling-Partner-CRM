"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import TPLoader from "@/components/TPLoader";

const BlogRichEditorInner = dynamic(
  () =>
    import("@/components/blog/BlogRichEditor").then((m) => m.BlogRichEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[480px] items-center justify-center rounded-xl border border-border/60 bg-card">
        <TPLoader variant="inline" size={120} label="Loading…" />
      </div>
    )
  }
);

export function LazyBlogRichEditor(
  props: ComponentProps<typeof BlogRichEditorInner>
) {
  return <BlogRichEditorInner {...props} />;
}
