"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  extractBannerFromResponse,
  getBannerById,
  isBannerOnCarousel,
  updateBanner
} from "@/services/carousel";
import {
  carouselFormSchema,
  type CarouselFormValues
} from "@/app/admin/carousel/_carousel-form-shared";

export default function AdminCarouselEditPage() {
  const params = useParams<{ id: string }>();
  const idNum = Number(params?.id);
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const { success, error: showError, toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    reset,
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

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const record = await getBannerById(idNum, token);
        if (cancelled) return;
        if (!record) {
          setNotFound(true);
          return;
        }
        reset({
          bannerTitle: record.bannerTitle ?? "",
          bannerImage: record.bannerImage ?? "",
          bannerDescription: record.bannerDescription ?? ""
        });
        setImagePreview(record.bannerImage ?? "");
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idNum, token, reset]);

  const submit = async (values: CarouselFormValues, mode: "draft" | "publish") => {
    if (!Number.isFinite(idNum)) return;
    setSubmitting(true);
    try {
      const res = await updateBanner(idNum, values, token);
      extractBannerFromResponse(res);
      const onCarousel = await isBannerOnCarousel(idNum, token);
      success(`Banner "${values.bannerTitle}" updated.`);
      if (onCarousel) {
        toast("This banner appears in the app carousel feed.");
      } else {
        toast(
          mode === "publish"
            ? "Updated. Still not in app carousel feed — update API has no publish flag; backend must expose publish/draft or carousel assignment."
            : "Updated. Not in carousel feed — list status follows /banners/carousel."
        );
      }
      router.push("/admin/carousel");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to update banner.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = handleSubmit((values) => void submit(values, "draft"));
  const publish = handleSubmit((values) => void submit(values, "publish"));

  if (loading) {
    return (
      <AppShell title="Edit Banner">
        <PageContainer>
          <div className="py-10 text-center text-sm text-muted-foreground">Loading banner...</div>
        </PageContainer>
      </AppShell>
    );
  }

  if (notFound || !Number.isFinite(idNum)) {
    return (
      <AppShell title="Edit Banner">
        <PageContainer>
          <SectionCard
            title="Banner not found"
            description="This banner could not be loaded. Please try again from the list."
          >
            <Button asChild>
              <Link href="/admin/carousel">Back to carousel list</Link>
            </Button>
          </SectionCard>
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit Banner">
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
            description="Save Draft and Publish both call PUT /banners/update/{id} with the same fields. Carousel visibility is controlled by backend / carousel assignment."
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
