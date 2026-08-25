import { fetcher } from "@/lib/fetcher";
import { apiUrl } from "@/lib/api-base";

/** Payload for POST /blog/create and PUT /blog/update/{id} */
export interface BlogUpsertPayload {
  coverImage: string;
  mainTitle: string;
  seoTitle: string;
  seoDescription: string;
  status: string;
  description1: string | null;
  description2: string | null;
  date: string;
  author: string;
  readTime: string;
  tags: string[];
  categoryId: number;
  categoryName: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  description?: string | null;
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

export async function getAllBlogCategories(token: string | null): Promise<BlogCategory[]> {
  const all: BlogCategory[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const url = `${apiUrl("/blogCategory/getAll")}?page=${page}&size=10`;
    const res = await fetcher<unknown>(url, { token });

    const root = (res ?? {}) as Record<string, unknown>;
    const data =
      root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : root;

    const content = Array.isArray(data.content) ? data.content : [];
    all.push(
      ...content
        .map((item) => item as Record<string, unknown>)
        .filter((item) => typeof item.id === "number" && typeof item.name === "string")
        .map((item) => ({
          id: item.id as number,
          name: item.name as string,
          description:
            typeof item.description === "string" ? item.description : null
        }))
    );

    totalPages =
      typeof data.totalPages === "number" && data.totalPages > 0
        ? data.totalPages
        : 1;
    page += 1;
  }

  return all;
}
