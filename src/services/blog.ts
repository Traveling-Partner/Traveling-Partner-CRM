import { fetcher } from "@/lib/fetcher";
import { apiUrl } from "@/lib/api-base";

/** Payload for POST /blog/create and PUT /blog/update/{id} */
export interface BlogUpsertPayload {
  coverImage: string;
  mainTitle: string;
  seoTitle: string;
  seoDescription: string;
  status: string;
  description1: string;
  description2: string;
  date: string;
  author: string;
  readTime: string;
  tags: string[];
  categoryId: number;
}

export interface BlogApiRecord {
  id?: number;
  coverImage?: string | null;
  mainTitle?: string | null;
  description1?: string | null;
  description2?: string | null;
  date?: string | null;
  author?: string | null;
  readTime?: string | null;
  tags?: string[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
}

export function unwrapBlogData<T>(res: unknown): T | null {
  if (
    res &&
    typeof res === "object" &&
    "data" in res &&
    (res as { data: T }).data !== undefined &&
    (res as { data: T }).data !== null
  ) {
    return (res as { data: T }).data;
  }
  return res as T | null;
}

export async function createBlog(payload: BlogUpsertPayload, token: string | null) {
  return fetcher(`${apiUrl("/blog/create")}`, {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export async function updateBlog(id: number, payload: BlogUpsertPayload, token: string | null) {
  return fetcher(`${apiUrl(`/blog/update/${id}`)}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload)
  });
}

export async function getBlogById(id: number, token: string | null): Promise<BlogApiRecord | null> {
  const url = `${apiUrl(`/blog/getById/${id}`)}`;
  const res = await fetcher<unknown>(url, { token });
  return unwrapBlogData<BlogApiRecord>(res);
}

export async function deleteBlog(id: number, token: string | null) {
  return fetcher(`${apiUrl(`/blog/delete/${id}`)}`, {
    method: "DELETE",
    token
  });
}
