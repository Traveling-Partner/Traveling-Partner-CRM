"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBlogById } from "@/services/blog";
import type { BlogApiRecord } from "@/services/blog";
import { useAppSelector } from "@/store/hooks";
import { formatRelativePostTime } from "@/lib/format-relative-post-time";
import "@/components/blog/blog-content.css";
import TPLoader from "@/components/TPLoader";

function formatPreviewDate(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

export default function BlogPreviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const token = useAppSelector((state) => state.auth.token);

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BlogApiRecord | null>(null);

  useEffect(() => {
    const id = Number(slug);
    if (!Number.isFinite(id)) {
      setLoading(false);
      setPost(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await getBlogById(id, token);
        if (!cancelled) setPost(data);
      } catch {
        if (!cancelled) setPost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 text-foreground">
        <div className="flex min-h-screen items-center justify-center">
          <TPLoader variant="inline" size={120} label="Loading…" />
        </div>
      </main>
    );
  }

  if (!post?.mainTitle) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 text-foreground">
        <p className="mx-auto max-w-3xl text-sm text-muted-foreground">
          This post could not be loaded. Open Preview while signed in, or check the link.
        </p>
      </main>
    );
  }

  const title = post.mainTitle;
  const dateLabel = formatPreviewDate(post.date ?? undefined);
  const relativePosted = formatRelativePostTime(post.date ?? undefined);
  const html = post.description2?.trim() ?? "";

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <article className="mx-auto max-w-3xl space-y-4">
        <h1 className="font-heading text-3xl font-bold">{title}</h1>
        {(relativePosted && relativePosted !== "—") || dateLabel ? (
          <p className="text-sm text-muted-foreground" title={dateLabel || undefined}>
            {relativePosted !== "—" ? relativePosted : dateLabel}
            {dateLabel && relativePosted !== "—" ? (
              <span className="text-muted-foreground/70"> · {dateLabel}</span>
            ) : null}
          </p>
        ) : null}
        {post.coverImage?.trim() ? (
          <div className="overflow-hidden rounded-xl border border-border/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={title}
              className="h-64 w-full object-cover"
            />
          </div>
        ) : null}
        {html ? (
          <div
            className="blog-prose max-w-none"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No content.</p>
        )}
      </article>
    </main>
  );
}
