"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { useAppSelector } from "@/store/hooks";
import { createBlog } from "@/services/blog";
import {
  blogEditorSchema,
  type BlogEditorFormValues,
  buildBlogUpsertPayload
} from "@/app/admin/blog/_blog-form-shared";

export default function AdminBlogCreatePage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const { success, error: showError } = useToast();
  const authUser = useAppSelector((state) => state.auth.user);

  const [description2, setDescription2] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("/mock-images/blog-cover.svg");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BlogEditorFormValues>({
    resolver: zodResolver(blogEditorSchema),
    defaultValues: {
      coverImage: "/mock-images/blog-cover.svg",
      mainTitle: "",
      description1: "",
      description2: "",
      date: new Date().toISOString().slice(0, 10),
      author: authUser?.name || "Admin",
      categoryId: 1,
      readTime: "5 min",
      tagsText: "",
      seoTitle: "",
      seoDescription: "",
      status: "DRAFT"
    }
  });

  const status = watch("status");

  const submitWithStatus = async (values: BlogEditorFormValues, nextStatus: "DRAFT" | "PUBLISHED") => {
    setSubmitting(true);
    try {
      const payload = buildBlogUpsertPayload(values, nextStatus);
      await createBlog(payload, token);
      success(`Blog "${values.mainTitle.trim()}" saved successfully.`);
      router.push("/admin/blog");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to create blog.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = handleSubmit((vals) => void submitWithStatus(vals, "DRAFT"));
  const publish = handleSubmit((vals) => void submitWithStatus(vals, "PUBLISHED"));

  const onImageChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setValue("coverImage", url);
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

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <SectionCard
              title="Post content"
              description="Write and format the article."
            >
              <div className="space-y-4">
                <FormField
                  label="Main Title"
                  htmlFor="mainTitle"
                  required
                  error={errors.mainTitle}
                >
                  <Input
                    id="mainTitle"
                    placeholder="Post title"
                    {...register("mainTitle")}
                  />
                </FormField>
                <FormField
                  label="Cover Image URL"
                  htmlFor="coverImage"
                  required
                  error={errors.coverImage}
                >
                  <Input
                    id="coverImage"
                    placeholder="https://…"
                    {...register("coverImage")}
                  />
                </FormField>
                <FormField
                  label="Description 1 (Short intro)"
                  htmlFor="description1"
                  required
                  error={errors.description1}
                  description="Short summary shown in the blog list."
                >
                  <Textarea
                    id="description1"
                    rows={3}
                    {...register("description1")}
                  />
                </FormField>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Category ID"
                    htmlFor="categoryId"
                    required
                    error={errors.categoryId}
                  >
                    <Input
                      id="categoryId"
                      type="number"
                      min={1}
                      {...register("categoryId")}
                    />
                  </FormField>
                  <FormField
                    label="Author"
                    htmlFor="author"
                    required
                    error={errors.author}
                  >
                    <Input
                      id="author"
                      placeholder="Admin"
                      {...register("author")}
                    />
                  </FormField>
                </div>
                <FormField
                  label="Tags (comma separated)"
                  htmlFor="tagsText"
                  description='Example: "travel, adventure, guide"'
                >
                  <Input id="tagsText" placeholder="travel, adventure, guide" {...register("tagsText")} />
                </FormField>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Read time"
                    htmlFor="readTime"
                    required
                    error={errors.readTime}
                    description='Example: "5 min"'
                  >
                    <Input
                      id="readTime"
                      placeholder="5 min"
                      {...register("readTime")}
                    />
                  </FormField>
                  <FormField label="Date" htmlFor="date">
                    <Input id="date" type="date" {...register("date")} />
                  </FormField>
                </div>
                <FormField
                  label="Description 2 (Detailed content)"
                  htmlFor="description2"
                  required
                  error={errors.description2}
                >
                  <BlogRichEditor
                    value={description2}
                    onChange={(html) => {
                      setDescription2(html);
                      setValue("description2", html);
                    }}
                  />
                </FormField>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-4">
            <SectionCard
              title="Meta & publishing"
              description="SEO and visibility."
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Publish
                    </p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      Toggle to mark as published (same as Publish button).
                    </p>
                  </div>
                  <Switch
                    checked={status === "PUBLISHED"}
                    onCheckedChange={(checked) =>
                      setValue("status", checked ? "PUBLISHED" : "DRAFT")
                    }
                  />
                </div>

                <FormField label="SEO title" htmlFor="seoTitle" error={errors.seoTitle}>
                  <Input
                    id="seoTitle"
                    placeholder="Custom title for search engines"
                    {...register("seoTitle")}
                  />
                </FormField>
                <FormField
                  label="SEO description"
                  htmlFor="seoDescription"
                  error={errors.seoDescription}
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
              title="Cover image preview"
              description="Upload a hero image or paste a public URL above."
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
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => void saveDraft()}
              >
                {submitting ? "Saving..." : "Save draft"}
              </Button>
              <Button type="button" disabled={submitting} onClick={() => void publish()}>
                {submitting ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
