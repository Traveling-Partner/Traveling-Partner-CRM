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
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { CoverImageUploadPanel } from "@/components/common/CoverImageUploadPanel";
import { useAppSelector } from "@/store/hooks";
import {
  createBanner,
  extractBannerFromResponse,
  isBannerOnCarousel
} from "@/services/carousel";
import {
  carouselFormSchema,
  type CarouselFormValues
} from "@/app/admin/carousel/_carousel-form-shared";

export default function AdminCarouselCreatePage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const { success, error: showError, toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<CarouselFormValues>({
    resolver: zodResolver(carouselFormSchema),
    defaultValues: {
      bannerTitle: "",
      bannerImage: "",
      bannerDescription: ""
    }
  });

  const watchedImage = watch("bannerImage");

  const submit = async (values: CarouselFormValues, mode: "draft" | "publish") => {
    setSubmitting(true);
    try {
      const res = await createBanner(values, token);
      const created = extractBannerFromResponse(res);
      if (created) {
        const onCarousel = await isBannerOnCarousel(created.id, token);
        if (onCarousel) {
          success(`Banner saved. It appears in the app carousel (id ${created.id}).`);
        } else {
          success(`Banner saved (id ${created.id}).`);
          toast(
            mode === "publish"
              ? "Saved. Not in app carousel feed yet — create uses the same body for both buttons; backend must publish to carousel or add status."
              : "Saved as draft (not in carousel feed). Status comes from /banners/carousel until backend adds publish/draft fields."
          );
        }
      } else {
        success(`Banner "${values.bannerTitle}" saved.`);
      }
      router.push("/admin/carousel");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to create banner.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = handleSubmit((values) => void submit(values, "draft"));
  const publish = handleSubmit((values) => void submit(values, "publish"));

  return (
    <AppShell title="Create Banner">
      <PageContainer>
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/carousel" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to carousel list
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <SectionCard
            title="Banner details"
            description="Both buttons call the same create API. Published vs Draft on the list is determined by whether the banner appears in GET /banners/carousel — unless backend adds a status or publish endpoint."
          >
            <div className="space-y-4">
              <FormField label="Title" htmlFor="bannerTitle" required error={errors.bannerTitle}>
                <Input
                  id="bannerTitle"
                  placeholder="Ex: Summer Offer"
                  {...register("bannerTitle")}
                />
              </FormField>

              <FormField label="Cover Image URL" htmlFor="bannerImage" required error={errors.bannerImage}>
                <Input
                  id="bannerImage"
                  placeholder="https://example.com/banner.jpg"
                  {...register("bannerImage", {
                    onChange: (event) => setImagePreview(event.target.value.trim())
                  })}
                />
              </FormField>

              <FormField
                label="Description"
                htmlFor="bannerDescription"
                required
                error={errors.bannerDescription}
              >
                <Textarea
                  id="bannerDescription"
                  rows={5}
                  placeholder="Short promotional description"
                  {...register("bannerDescription")}
                />
              </FormField>
            </div>
          </SectionCard>

          <div className="space-y-4">
            <CoverImageUploadPanel
              imageUrl={imagePreview || watchedImage}
              onImageUrlChange={(url) => {
                setValue("bannerImage", url, { shouldValidate: true, shouldDirty: true });
                setImagePreview(url);
              }}
              token={token}
              disabled={submitting}
              onError={showError}
              title="Preview"
              description="Upload an image or paste a URL on the left."
              emptyMessage="Add a cover image URL or upload an image to see a preview."
              previewHeightClassName="h-44"
            />

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => void saveDraft()} disabled={submitting}>
                {submitting ? "Saving..." : "Save Draft"}
              </Button>
              <Button type="button" onClick={() => void publish()} disabled={submitting}>
                {submitting ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
