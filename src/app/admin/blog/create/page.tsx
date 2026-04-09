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
  main_title: z.string().min(4, "Main title is required"),
  description1: z.string().min(10, "Description is required"),
  cover_image: z.string().url("Cover image must be a valid URL").optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
  author: z.string().min(2, "Author is required"),
  category: z.string().min(2, "Category is required"),
  readTime: z.string().min(3, "Read time is required"),
  content: z.string().min(10),
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
      main_title: "",
      description1: "",
      cover_image: "",
      date: new Date().toISOString().slice(0, 10),
      author: "",
      category: "",
      readTime: "5 min read",
      content: "",
      seoTitle: "",
      seoDescription: "",
      status: "DRAFT"
    }
  });

  const status = watch("status");

  const onSubmit = (values: FormValues) => {
    success(
      `Blog post "${values.main_title}" saved as ${values.status.toLowerCase()} (mock).`
    );
    router.push("/admin/blog");
  };

  const onImageChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setValue("cover_image", url);
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
                  label="Main Title (main_title)"
                  htmlFor="main_title"
                  required
                  error={errors.main_title}
                >
                  <Input
                    id="main_title"
                    placeholder="Post title"
                    {...register("main_title")}
                  />
                </FormField>
                <FormField
                  label="Description (description1)"
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
                    label="Category"
                    htmlFor="category"
                    required
                    error={errors.category}
                  >
                    <Input
                      id="category"
                      placeholder="Operations"
                      {...register("category")}
                    />
                  </FormField>
                  <FormField
                    label="Author (author)"
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
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Read time"
                    htmlFor="readTime"
                    required
                    error={errors.readTime}
                    description='Example: "5 min read"'
                  >
                    <Input
                      id="readTime"
                      placeholder="5 min read"
                      {...register("readTime")}
                    />
                  </FormField>
                  <FormField
                    label="Date (date)"
                    htmlFor="date"
                    description="Website listing date field."
                  >
                    <Input
                      id="date"
                      type="date"
                      {...register("date")}
                    />
                  </FormField>
                </div>
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
              title="Cover Image (cover_image)"
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
