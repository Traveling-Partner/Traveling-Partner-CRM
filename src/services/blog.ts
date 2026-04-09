import { fetcher } from "@/lib/fetcher";

export interface CreateBlogPayload {
  coverImage: string;
  mainTitle: string;
  description1: string;
  description2: string;
  date: string;
  author: string;
  readTime: string;
  tags: string[];
  categoryId: number;
}

export async function createBlog(blogData: CreateBlogPayload, token: string) {
  return fetcher(`${process.env.NEXT_PUBLIC_API_URL}/blog/create`, {
    method: "POST",
    body: JSON.stringify(blogData),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
