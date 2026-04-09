"use client";

import { useEffect, useState } from "react";
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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createBlogThunk, clearBlogError } from "@/store/slices/blogSlice";

const schema = z.object({
  coverImage: z.string().url("Cover image must be a valid URL"),
  mainTitle: z.string().min(4, "Main title is required"),
  description1: z.string().min(10, "Description is required"),
  description2: z.string().min(10, "Detailed content is required"),
  date: z.string().min(1, "Date is required"),
  author: z.string().min(2, "Author is required"),
  categoryId: z.coerce.number().int().positive("Category ID must be greater than 0"),
  readTime: z.string().min(3, "Read time is required"),
  tagsText: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"])
});

type FormValues = z.infer<typeof schema>;

export default function AdminBlogCreatePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { success, error: showError } = useToast();
  const { loading, error } = useAppSelector((state) => state.blog);
  const authUser = useAppSelector((state) => state.auth.user);
  const [description2, setDescription2] = useState<string>("");
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
      coverImage: "",
      mainTitle: "",
      description1: "",
      description2: "",
      date: new Date().toISOString().slice(0, 10),
      author: authUser?.name || "Admin",
      categoryId: 1,
      readTime: "5 min read",
      tagsText: "",
      seoTitle: "",
      seoDescription: "",
      status: "DRAFT"
    }
  });

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  useEffect(() => {
    return () => {
      dispatch(clearBlogError());
    };
  }, [dispatch]);

  const status = watch("status");

  const onSubmit = async (values: FormValues) => {
    const tags = (values.tagsText ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      await dispatch(
        createBlogThunk({
          coverImage: values.coverImage,
          mainTitle: values.mainTitle,
          description1: values.description1,
          description2: values.description2,
          date: values.date,
          author: values.author,
          readTime: values.readTime,
          tags,
          categoryId: values.categoryId
        })
      ).unwrap();

      success(`Blog "${values.mainTitle}" created successfully.`);
      router.push("/admin/blog");
    } catch {
      // Error is already stored in redux and displayed through toast.
    }
  };

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
                    placeholder="https://example.com/image.jpg"
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
                    description='Example: "5 min read"'
                  >
                    <Input
                      id="readTime"
                      placeholder="5 min read"
                      {...register("readTime")}
                    />
                  </FormField>
                  <FormField
                    label="Date"
                    htmlFor="date"
                  >
                    <Input
                      id="date"
                      type="date"
                      {...register("date")}
                    />
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
              title="Cover image preview"
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
                disabled={loading}
                onClick={() => setValue("status", "DRAFT")}
              >
                {loading ? "Saving..." : "Save draft"}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                onClick={() => setValue("status", "PUBLISHED")}
              >
                {loading ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </form>
      </PageContainer>
    </AppShell>
  );
}
