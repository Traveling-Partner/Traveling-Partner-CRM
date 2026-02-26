"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
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

export default function AdminBlogCreatePage() {
  const router = useRouter();
  const { success } = useToast();
  const [content, setContent] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
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
      `Blog post "${values.title}" saved as ${values.status.toLowerCase()} (mock).`
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

  return (
    <AppShell title="Create Post">
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
              description="Write and format the article."
            >
              <div className="space-y-4">
                <FormField
                  label="Title"
                  htmlFor="title"
                  required
                  error={errors.title}
                >
                  <Input
                    id="title"
                    placeholder="Post title"
                    {...register("title")}
                  />
                </FormField>
                <FormField
                  label="Excerpt"
                  htmlFor="excerpt"
                  required
                  error={errors.excerpt}
                  description="Short summary shown in the blog list."
                >
                  <Textarea
                    id="excerpt"
                    rows={3}
                    {...register("excerpt")}
                  />
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export default function AdminBlogCreatePage() {
  const { success } = useToast();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p>Start writing…</p>");
  const [published, setPublished] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      success("Post saved (mock).");
      setSaving(false);
    }, 500);
  };

  return (
    <AppShell title="Create post">
      <PageContainer>
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/blog" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
          </Button>
        </div>
        <SectionCard
          title="New blog post"
          description="Rich editor and SEO fields (mock). TipTap can be added separately."
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              <Label htmlFor="published">Published</Label>
              <Switch id="published" checked={published} onCheckedChange={setPublished} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save draft"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/blog">Cancel</Link>
              </Button>
            </div>
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
