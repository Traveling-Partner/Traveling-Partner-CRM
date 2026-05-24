import { fetcher } from "@/lib/fetcher";
import { apiUrl } from "@/lib/api-base";
import { unwrapEnvelope } from "@/lib/api/unwrap";
import type { AuthUser } from "@/store/slices/authSlice";

export interface NewsletterUpsertPayload {
  message: string;
  attachedFile: string;
  userName: string;
  userId: number;
  userRole: string;
  status: string;
}

export interface NewsletterRecord {
  id: number;
  message: string | null;
  attachedFile: string | null;
  userId: number | null;
  userName: string | null;
  userRole: string | null;
  status: string | null;
}

export function buildNewsletterAuthFields(user: AuthUser | null): Pick<
  NewsletterUpsertPayload,
  "userName" | "userId" | "userRole"
> {
  if (!user) {
    throw new Error("You must be logged in to save a newsletter.");
  }
  const userId = Number.parseInt(user.id, 10);
  if (!Number.isFinite(userId)) {
    throw new Error("Invalid user session. Please sign in again.");
  }
  return {
    userName: user.name?.trim() || user.email?.trim() || "Admin",
    userId,
    userRole: user.role
  };
}

export async function createNewsletter(
  payload: NewsletterUpsertPayload,
  token: string | null
) {
  return fetcher(apiUrl("/newsletter/create"), {
    method: "POST",
    token,
    body: JSON.stringify(payload),
    debugLabel: "newsletter:create"
  });
}

export async function updateNewsletter(
  id: number,
  payload: NewsletterUpsertPayload,
  token: string | null
) {
  return fetcher(apiUrl(`/newsletter/update/${id}`), {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
    debugLabel: "newsletter:update"
  });
}

export async function getNewsletterById(
  id: number,
  token: string | null
): Promise<NewsletterRecord | null> {
  const res = await fetcher<unknown>(apiUrl(`/newsletter/getById/${id}`), {
    token,
    debugLabel: "newsletter:detail"
  });
  const data = unwrapEnvelope<NewsletterRecord | null>(res);
  return data ?? null;
}

export async function deleteNewsletter(id: number, token: string | null) {
  return fetcher(apiUrl(`/newsletter/delete/${id}`), {
    method: "DELETE",
    token,
    debugLabel: "newsletter:delete"
  });
}
