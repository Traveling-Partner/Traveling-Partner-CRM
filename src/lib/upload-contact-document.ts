import { apiUrl } from "@/lib/api-base";

export interface ContactDocumentUploadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: string;
}

/** POST /documents/contact-us — shared by newsletter attachments (and similar flows). */
export async function uploadContactDocument(
  file: File,
  token: string | null
): Promise<string> {
  const storageToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const accessToken = token ?? storageToken;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(apiUrl("/documents/contact-us"), {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: formData
  });

  const json = (await res.json()) as ContactDocumentUploadResponse;

  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.message || "File upload failed.");
  }

  return json.data;
}
