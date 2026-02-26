import { notFound } from "next/navigation";
import { blogPosts } from "@/mock-data/blog-posts";

interface BlogPreviewPageProps {
  params: { slug: string };
}

export default function BlogPreviewPage({ params }: BlogPreviewPageProps) {
  const post =
    blogPosts.find((p) => p.slug === params.slug) ??
    blogPosts.find((p) => p.id === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <article className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-3xl font-heading font-bold">{post.title}</h1>
        <p className="text-sm text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
        {post.featuredImageUrl && (
          <div className="overflow-hidden rounded-xl border border-border/60">
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="h-64 w-full object-cover"
            />
          </div>
        )}
        <div
          className="prose max-w-none prose-sm prose-headings:font-heading dark:prose-invert"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
}

