import { apiUrl } from "@/lib/api-base";

export interface CarouselImageUploadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: string;
}

/** POST /documents/Carousel — shared by blog cover images and carousel banners. */
export async function uploadCarouselImage(
  file: File,
  token: string | null
): Promise<string> {
  const storageToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const accessToken = token ?? storageToken;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(apiUrl("/documents/Carousel"), {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: formData
  });

  const json = (await res.json()) as CarouselImageUploadResponse;

  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.message || "Image upload failed.");
  }

  return json.data;
}
