"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/FormField";
import { BlogRichEditor } from "@/components/blog/BlogRichEditor";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { blogPosts } from "@/mock-data/blog-posts";
import type { BlogPost } from "@/types/domain";

const schema = z.object({
  title: z.string().min(4),
  excerpt: z.string().min(10),
  content: z.string().min(10),
  featuredImageUrl: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"])
});

type FormValues = z.infer<typeof schema>;

export default function AdminBlogEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { success } = useToast();

  const post: BlogPost | undefined = useMemo(
    () => blogPosts.find((p) => p.id === params.id),
    [params.id]
  );

  const [content, setContent] = useState<string>(post?.content ?? "");
  const [imagePreview, setImagePreview] = useState<string>(
    post?.featuredImageUrl ?? ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: post
      ? {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          featuredImageUrl: post.featuredImageUrl ?? "",
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
          status: post.status
        }
      : {
          title: "",
          excerpt: "",
          content: "",
          featuredImageUrl: "",
          seoTitle: "",
          seoDescription: "",
          status: "DRAFT"
        }
  });

  const status = watch("status");

  const onSubmit = (values: FormValues) => {
    success(
      `Blog post "${values.title}" updated as ${values.status.toLowerCase()} (mock).`
    );
    router.push("/admin/blog");
  };

  const onImageChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setValue("featuredImageUrl", url);
  };

  if (!post) {
    return (
      <AppShell title="Edit Post">
        <PageContainer>
          <SectionCard
            title="Post not found"
            description="This blog id does not exist in the mock dataset."
          >
            <Button asChild>
              <Link href="/admin/blog">Back to blog</Link>
            </Button>
          </SectionCard>
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Edit • ${post.title}`}>
      <PageContainer>
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/blog" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
          </Button>
        </div>

        <form
          className="grid gap-6 lg:grid-cols-[2fr,1fr]"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="space-y-4">
            <SectionCard
              title="Post content"
              description="Edit the article body and metadata."
            >
              <div className="space-y-4">
                <FormField
                  label="Title"
                  htmlFor="title"
                  required
                  error={errors.title}
                >
                  <Input id="title" {...register("title")} />
                </FormField>
                <FormField
                  label="Excerpt"
                  htmlFor="excerpt"
                  required
                  error={errors.excerpt}
                >
                  <Textarea id="excerpt" rows={3} {...register("excerpt")} />
                </FormField>
                <FormField
                  label="Body"
                  htmlFor="content"
                  required
                  error={errors.content}
                >
                  <BlogRichEditor
                    value={content}
                    onChange={(html) => {
                      setContent(html);
                      setValue("content", html);
                    }}
                  />
                </FormField>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-4">
            <SectionCard
              title="Meta & publishing"
              description="Visibility and SEO (mock)."
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Publish
                    </p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      Toggle to mark as published.
                    </p>
                  </div>
                  <Switch
                    checked={status === "PUBLISHED"}
                    onCheckedChange={(checked) =>
                      setValue("status", checked ? "PUBLISHED" : "DRAFT")
                    }
                  />
                </div>

                <FormField
                  label="SEO title"
                  htmlFor="seoTitle"
                  error={errors.seoTitle as any}
                >
                  <Input
                    id="seoTitle"
                    placeholder="Custom title for search engines"
                    {...register("seoTitle")}
                  />
                </FormField>
                <FormField
                  label="SEO description"
                  htmlFor="seoDescription"
                  error={errors.seoDescription as any}
                >
                  <Textarea
                    id="seoDescription"
                    rows={2}
                    {...register("seoDescription")}
                  />
                </FormField>
              </div>
            </SectionCard>

            <SectionCard
              title="Featured image"
              description="Upload a hero image (mock preview only)."
            >
              <div className="space-y-3">
                <input type="file" accept="image/*" onChange={onImageChange} />
                {imagePreview && (
                  <div className="overflow-hidden rounded-lg border border-border/60">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-40 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </SectionCard>

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="outline"
                onClick={() => setValue("status", "DRAFT")}
              >
                Save draft
              </Button>
              <Button
                type="submit"
                onClick={() => setValue("status", "PUBLISHED")}
              >
                Publish
              </Button>
            </div>
          </div>
        </form>
      </PageContainer>
    </AppShell>
  );
}

